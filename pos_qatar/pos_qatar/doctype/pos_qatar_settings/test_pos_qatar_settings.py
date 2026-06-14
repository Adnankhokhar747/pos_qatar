# Copyright (c) 2026, Globcom Qatar and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase


class TestPOSQatarSettings(IntegrationTestCase):
	def test_defaults(self):
		settings = frappe.get_single("POS Qatar Settings")
		self.assertEqual(settings.default_theme or "Light", "Light")
