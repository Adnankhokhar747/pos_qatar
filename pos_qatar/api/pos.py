# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt, now_datetime, nowdate


@frappe.whitelist()
def get_pos_profile_config(pos_profile: str | None = None) -> dict:
	"""Return the POS Profile (resolved for the current user if not given)
	plus the fields the POS Qatar frontend needs to boot: company,
	warehouse, price list, tax template, payment modes and UI prefs.
	"""
	profile_name = pos_profile or get_default_pos_profile()
	if not profile_name:
		frappe.throw(_("No POS Profile is assigned to your user. Please contact your administrator."))

	if not frappe.db.exists("POS Profile", profile_name):
		frappe.throw(_("POS Profile {0} does not exist").format(profile_name))

	frappe.has_permission("POS Profile", "read", throw=True)

	profile = frappe.get_cached_doc("POS Profile", profile_name)

	return {
		"name": profile.name,
		"company": profile.company,
		"currency": profile.currency,
		"warehouse": profile.warehouse,
		"selling_price_list": profile.selling_price_list,
		"customer_group": getattr(profile, "customer_group", None),
		"taxes_and_charges": getattr(profile, "taxes_and_charges", None),
		"print_format": profile.print_format,
		"pq_default_view": getattr(profile, "pq_default_view", None) or "Grid",
		"pq_color_theme": getattr(profile, "pq_color_theme", None) or "Light",
		"pq_enable_offline": int(getattr(profile, "pq_enable_offline", 0) or 0),
		"payments": [
			{
				"mode_of_payment": payment.mode_of_payment,
				"default": payment.default,
				"account": payment.account,
			}
			for payment in profile.payments
		],
	}


def get_default_pos_profile() -> str | None:
	user = frappe.session.user

	profile = frappe.db.get_value("POS Profile User", {"user": user}, "parent")
	if profile:
		return profile

	default_company = frappe.defaults.get_user_default("Company")
	filters = {"disabled": 0}
	if default_company:
		filters["company"] = default_company

	return frappe.db.get_value("POS Profile", filters, "name")


@frappe.whitelist()
def get_opening_entry_state(pos_profile: str) -> dict:
	"""Return the current user's open POS Opening Entry for this profile, if any."""
	frappe.has_permission("POS Opening Entry", "read", throw=True)

	opening = frappe.db.get_value(
		"POS Opening Entry",
		{
			"user": frappe.session.user,
			"pos_profile": pos_profile,
			"docstatus": 1,
			"status": "Open",
		},
		["name", "period_start_date"],
		as_dict=True,
	)

	if not opening:
		return {"pos_opening_entry": None, "status": None}

	balance_details = frappe.get_all(
		"POS Opening Entry Detail",
		filters={"parent": opening.name},
		fields=["mode_of_payment", "opening_amount"],
	)

	return {
		"pos_opening_entry": opening.name,
		"status": "Open",
		"period_start_date": opening.period_start_date,
		"balance_details": balance_details,
	}


@frappe.whitelist()
def create_opening_entry(pos_profile: str, balance_details: list[dict]) -> dict:
	"""Open a new POS shift for the current user with the given opening cash balances."""
	frappe.has_permission("POS Opening Entry", "create", throw=True)

	profile = frappe.get_cached_doc("POS Profile", pos_profile)

	already_open = frappe.db.exists(
		"POS Opening Entry",
		{
			"user": frappe.session.user,
			"pos_profile": pos_profile,
			"docstatus": 1,
			"status": "Open",
		},
	)
	if already_open:
		frappe.throw(_("A POS shift is already open for this profile"))

	entry = frappe.new_doc("POS Opening Entry")
	entry.user = frappe.session.user
	entry.pos_profile = pos_profile
	entry.company = profile.company
	entry.period_start_date = now_datetime()

	for row in balance_details or []:
		entry.append(
			"balance_details",
			{
				"mode_of_payment": row.get("mode_of_payment"),
				"opening_amount": flt(row.get("opening_amount")),
			},
		)

	entry.insert()
	entry.submit()

	return get_opening_entry_state(pos_profile)


@frappe.whitelist()
def submit_closing_entry(opening_entry: str, payments: list[dict]) -> dict:
	"""Close the given POS Opening Entry, reconciling counted closing balances."""
	frappe.has_permission("POS Closing Entry", "create", throw=True)

	opening = frappe.get_doc("POS Opening Entry", opening_entry)
	if opening.user != frappe.session.user and "POS Manager" not in frappe.get_roles():
		frappe.throw(_("You are not allowed to close this shift"), frappe.PermissionError)

	closing_amounts = {row.get("mode_of_payment"): flt(row.get("closing_amount")) for row in payments or []}

	closing = frappe.new_doc("POS Closing Entry")
	closing.pos_opening_entry = opening.name
	closing.user = opening.user
	closing.pos_profile = opening.pos_profile
	closing.company = opening.company
	closing.period_start_date = opening.period_start_date
	closing.period_end_date = now_datetime()
	closing.posting_date = nowdate()

	for balance in opening.balance_details:
		closing.append(
			"payment_reconciliation",
			{
				"mode_of_payment": balance.mode_of_payment,
				"opening_amount": balance.opening_amount,
				"closing_amount": closing_amounts.get(balance.mode_of_payment, 0),
			},
		)

	if hasattr(closing, "set_pos_invoices"):
		closing.set_pos_invoices()

	closing.insert()
	closing.submit()

	return {"name": closing.name}
