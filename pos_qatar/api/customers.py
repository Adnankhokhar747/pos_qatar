# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt


@frappe.whitelist()
def search_customers(search_term: str) -> list[dict]:
	frappe.has_permission("Customer", "read", throw=True)

	if not search_term:
		return []

	return frappe.get_list(
		"Customer",
		filters={"disabled": 0},
		or_filters=[
			["customer_name", "like", f"%{search_term}%"],
			["name", "like", f"%{search_term}%"],
			["mobile_no", "like", f"%{search_term}%"],
		],
		fields=["name", "customer_name", "mobile_no", "email_id", "customer_group"],
		page_length=20,
		order_by="customer_name asc",
	)


@frappe.whitelist()
def create_quick_customer(
	customer_name: str, mobile_no: str | None = None, customer_group: str | None = None
) -> dict:
	frappe.has_permission("Customer", "create", throw=True)

	customer_name = (customer_name or "").strip()
	if not customer_name:
		frappe.throw(_("Customer Name is required"))

	customer = frappe.new_doc("Customer")
	customer.customer_name = customer_name
	customer.customer_type = "Individual"
	customer.customer_group = customer_group or frappe.db.get_single_value(
		"Selling Settings", "customer_group"
	)
	customer.territory = frappe.db.get_single_value("Selling Settings", "territory")

	if mobile_no:
		customer.mobile_no = mobile_no

	customer.insert()

	return {
		"name": customer.name,
		"customer_name": customer.customer_name,
		"mobile_no": customer.mobile_no,
		"customer_group": customer.customer_group,
	}


@frappe.whitelist()
def get_customer_summary(customer: str) -> dict:
	frappe.has_permission("Customer", "read", throw=True)

	from erpnext.accounts.utils import get_balance_on

	customer_doc = frappe.get_cached_doc("Customer", customer)
	company = frappe.defaults.get_user_default("Company") or frappe.db.get_single_value(
		"Global Defaults", "default_company"
	)

	outstanding = 0
	if company:
		outstanding = (
			get_balance_on(party_type="Customer", party=customer, company=company) or 0
		)

	credit_limit = 0
	credit_days = 0
	for row in customer_doc.get("credit_limits", []) or []:
		if row.company == company:
			credit_limit = flt(row.credit_limit)
			credit_days = row.get("credit_days") or 0
			break

	return {
		"customer": customer,
		"credit_limit": flt(credit_limit),
		"outstanding_amount": flt(outstanding),
		"credit_days": credit_days,
	}
