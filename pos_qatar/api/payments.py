# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe


@frappe.whitelist()
def get_modes_of_payment(pos_profile: str) -> list[dict]:
	frappe.has_permission("POS Profile", "read", throw=True)

	profile = frappe.get_cached_doc("POS Profile", pos_profile)

	return [
		{
			"mode_of_payment": row.mode_of_payment,
			"default": row.default,
			"account": row.account,
		}
		for row in profile.payments
	]
