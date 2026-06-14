# Copyright (c) 2026, Globcom Qatar and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase


class TestPOSQatarOfflineSyncLog(IntegrationTestCase):
	def test_create_log(self):
		log = frappe.get_doc(
			{
				"doctype": "POS Qatar Offline Sync Log",
				"client_invoice_uuid": frappe.generate_hash(length=10),
				"status": "Pending",
				"payload": "{}",
			}
		).insert()
		self.assertEqual(log.status, "Pending")
