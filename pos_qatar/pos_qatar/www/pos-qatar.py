# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe
from frappe import _

no_cache = 1


def get_context(context):
	"""Build the boot context for the POS Qatar single-page application.

	The SPA is a separate React build served from /assets/pos_qatar/frontend/.
	This page only needs to (a) enforce login and (b) hand the SPA the data it
	needs to make its first authenticated API calls.
	"""
	if frappe.session.user == "Guest":
		frappe.throw(_("You need to be logged in to access POS Qatar"), frappe.PermissionError)

	context.no_cache = 1
	context.boot = frappe.as_json(get_boot_info())
	return context


def get_boot_info():
	default_pos_profile = frappe.db.get_value(
		"POS Profile User",
		{"user": frappe.session.user},
		"parent",
	)

	return {
		"user": frappe.session.user,
		"full_name": frappe.utils.get_fullname(frappe.session.user),
		"csrf_token": frappe.sessions.get_csrf_token(),
		"roles": frappe.get_roles(frappe.session.user),
		"default_pos_profile": default_pos_profile,
		"sitename": frappe.local.site,
	}
