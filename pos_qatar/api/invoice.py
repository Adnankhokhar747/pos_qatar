# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt


@frappe.whitelist()
def create_draft(
	pos_profile: str,
	customer: str,
	items: list[dict],
	pos_invoice_name: str | None = None,
	additional_discount_percentage: float = 0,
	discount_amount: float = 0,
) -> dict:
	"""Create or update a draft POS Invoice and return server-recalculated
	totals/taxes. The frontend never computes tax-inclusive totals itself —
	this endpoint is the single source of truth before payment.
	"""
	frappe.has_permission("POS Invoice", "create", throw=True)

	if not items:
		frappe.throw(_("Cannot create an invoice with no items"))

	profile = frappe.get_cached_doc("POS Profile", pos_profile)

	if pos_invoice_name:
		doc = frappe.get_doc("POS Invoice", pos_invoice_name)
		if doc.docstatus != 0:
			frappe.throw(_("Cannot modify a submitted invoice"))
		_check_owner(doc)
		doc.set("items", [])
		doc.set("taxes", [])
	else:
		doc = frappe.new_doc("POS Invoice")
		doc.pos_profile = pos_profile
		doc.company = profile.company
		doc.is_pos = 1
		doc.naming_series = profile.get("naming_series") or doc.naming_series

	doc.customer = customer
	doc.selling_price_list = profile.selling_price_list
	doc.set_warehouse = profile.warehouse
	doc.currency = profile.currency

	for row in items:
		doc.append(
			"items",
			{
				"item_code": row.get("item_code"),
				"qty": flt(row.get("qty")) or 1,
				"rate": flt(row.get("rate")) or None,
				"discount_percentage": flt(row.get("discount_percentage")),
				"warehouse": profile.warehouse,
			},
		)

	if profile.taxes_and_charges:
		doc.taxes_and_charges = profile.taxes_and_charges
		_apply_tax_template(doc, profile.taxes_and_charges)

	doc.apply_discount_on = "Grand Total"
	doc.additional_discount_percentage = flt(additional_discount_percentage)
	doc.discount_amount = flt(discount_amount)

	doc.set_missing_values()
	doc.calculate_taxes_and_totals()
	doc.save()

	return _serialize_draft(doc)


@frappe.whitelist()
def submit_invoice(pos_invoice_name: str, payments: list[dict]) -> dict:
	"""Record the cashier's payment split and submit the POS Invoice.

	Submitting a POS Invoice triggers ERPNext's own stock and (eventually,
	via POS Invoice Merge Log) accounting entries - POS Qatar does not
	duplicate that logic.
	"""
	frappe.has_permission("POS Invoice", "submit", throw=True)

	doc = frappe.get_doc("POS Invoice", pos_invoice_name)
	if doc.docstatus != 0:
		frappe.throw(_("Invoice has already been submitted"))
	_check_owner(doc)

	if not payments:
		frappe.throw(_("At least one payment is required"))

	total_paid = sum(flt(payment.get("amount")) for payment in payments)
	invoice_total = flt(doc.rounded_total or doc.grand_total)
	if total_paid + 0.5 < invoice_total:
		frappe.throw(_("Payment amount ({0}) is less than the invoice total ({1})").format(total_paid, invoice_total))

	doc.set("payments", [])
	for payment in payments:
		doc.append(
			"payments",
			{
				"mode_of_payment": payment.get("mode_of_payment"),
				"amount": flt(payment.get("amount")),
			},
		)

	doc.paid_amount = total_paid
	doc.calculate_taxes_and_totals()
	doc.save()
	doc.submit()

	return _serialize_submitted(doc)


@frappe.whitelist()
def create_return(pos_invoice_name: str, items: list[dict] | None = None) -> dict:
	"""Create and submit a return (credit note) POS Invoice against a
	submitted invoice, using ERPNext's standard return helper so stock and
	accounting reversals follow the normal return logic.
	"""
	frappe.has_permission("POS Invoice", "create", throw=True)

	from erpnext.controllers.sales_and_purchase_return import make_return_doc

	original = frappe.get_doc("POS Invoice", pos_invoice_name)
	if original.docstatus != 1:
		frappe.throw(_("Only submitted invoices can be returned"))
	_check_owner(original, allow_supervisor=True)

	return_doc = make_return_doc("POS Invoice", pos_invoice_name)

	if items:
		requested_qty = {row["item_code"]: flt(row.get("qty")) for row in items if row.get("item_code")}
		filtered = [row for row in return_doc.items if row.item_code in requested_qty]
		for row in filtered:
			row.qty = -abs(requested_qty[row.item_code])
			row.stock_qty = row.qty * (row.conversion_factor or 1)
		return_doc.items = filtered

	return_doc.calculate_taxes_and_totals()
	return_doc.insert()
	return_doc.submit()

	return _serialize_submitted(return_doc)


def _check_owner(doc, allow_supervisor: bool = False) -> None:
	roles = frappe.get_roles()
	if "POS Manager" in roles or "System Manager" in roles:
		return
	if allow_supervisor and "POS Supervisor" in roles:
		return
	if doc.owner != frappe.session.user:
		frappe.throw(_("You are not permitted to modify this invoice"), frappe.PermissionError)


def _apply_tax_template(doc, taxes_and_charges: str) -> None:
	from erpnext.controllers.accounts_controller import get_taxes_and_charges

	for tax in get_taxes_and_charges("Sales Taxes and Charges Template", taxes_and_charges):
		doc.append("taxes", tax)


def _serialize_draft(doc) -> dict:
	return {
		"name": doc.name,
		"net_total": flt(doc.net_total),
		"total_taxes_and_charges": flt(doc.total_taxes_and_charges),
		"grand_total": flt(doc.grand_total),
		"rounded_total": flt(doc.rounded_total or doc.grand_total),
		"taxes": [
			{
				"account_head": tax.account_head,
				"description": tax.description,
				"rate": flt(tax.rate),
				"tax_amount": flt(tax.tax_amount),
				"total": flt(tax.total),
			}
			for tax in doc.get("taxes", [])
		],
		"items": [
			{
				"item_code": item.item_code,
				"item_name": item.item_name,
				"uom": item.uom,
				"qty": flt(item.qty),
				"rate": flt(item.rate),
				"price_list_rate": flt(item.price_list_rate),
				"discount_percentage": flt(item.discount_percentage),
				"discount_amount": flt(item.discount_amount),
			}
			for item in doc.items
		],
	}


def _serialize_submitted(doc) -> dict:
	return {
		"name": doc.name,
		"grand_total": flt(doc.grand_total),
		"rounded_total": flt(doc.rounded_total or doc.grand_total),
		"status": doc.status,
	}
