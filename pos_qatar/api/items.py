# Copyright (c) 2026, Globcom Qatar and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import flt

ITEM_FIELDS = [
	"item_code",
	"item_name",
	"item_group",
	"stock_uom",
	"image",
	"has_batch_no",
	"has_serial_no",
]


@frappe.whitelist()
def search_items(
	pos_profile: str,
	search_term: str | None = None,
	item_group: str | None = None,
	start: int = 0,
	page_length: int = 40,
) -> list[dict]:
	"""Paginated item search for the POS product grid, with price (from the
	POS Profile's price list) and live stock (from Bin) resolved in two bulk
	queries to avoid N+1 lookups.
	"""
	frappe.has_permission("Item", "read", throw=True)

	profile = frappe.get_cached_doc("POS Profile", pos_profile)

	filters = {"disabled": 0, "is_sales_item": 1}
	if item_group:
		filters["item_group"] = item_group

	or_filters = None
	if search_term:
		or_filters = [
			["item_name", "like", f"%{search_term}%"],
			["item_code", "like", f"%{search_term}%"],
		]

	items = frappe.get_list(
		"Item",
		filters=filters,
		or_filters=or_filters,
		fields=ITEM_FIELDS,
		start=int(start),
		page_length=int(page_length),
		order_by="item_name asc",
	)

	return _attach_price_and_stock(items, profile)


@frappe.whitelist()
def get_item_groups(pos_profile: str | None = None) -> list[dict]:
	frappe.has_permission("Item Group", "read", throw=True)

	return frappe.get_all(
		"Item Group",
		filters={"is_group": 0},
		fields=["name", "item_group_name"],
		order_by="item_group_name asc",
	)


@frappe.whitelist()
def get_item_by_barcode(barcode: str, pos_profile: str) -> dict | None:
	frappe.has_permission("Item", "read", throw=True)

	item_code = frappe.db.get_value("Item Barcode", {"barcode": barcode}, "parent")
	if not item_code:
		return None

	profile = frappe.get_cached_doc("POS Profile", pos_profile)
	items = frappe.get_list(
		"Item",
		filters={"name": item_code},
		fields=ITEM_FIELDS,
		page_length=1,
	)
	if not items:
		return None

	result = _attach_price_and_stock(items, profile)
	result[0]["barcode"] = barcode
	return result[0]


def _attach_price_and_stock(items: list[dict], profile) -> list[dict]:
	if not items:
		return []

	item_codes = [item.item_code for item in items]
	prices = _get_price_map(item_codes, profile.selling_price_list)
	stock_qty = _get_stock_map(item_codes, profile.warehouse)
	currency = frappe.db.get_value("Price List", profile.selling_price_list, "currency") or profile.currency

	result = []
	for item in items:
		rate = prices.get(item.item_code, 0)
		result.append(
			{
				"item_code": item.item_code,
				"item_name": item.item_name,
				"item_group": item.item_group,
				"stock_uom": item.stock_uom,
				"image": item.image,
				"rate": rate,
				"price_list_rate": rate,
				"currency": currency,
				"actual_qty": stock_qty.get(item.item_code, 0),
				"has_batch_no": item.has_batch_no,
				"has_serial_no": item.has_serial_no,
			}
		)

	return result


def _get_price_map(item_codes: list[str], price_list: str | None) -> dict[str, float]:
	if not item_codes or not price_list:
		return {}

	rows = frappe.get_all(
		"Item Price",
		filters={
			"price_list": price_list,
			"item_code": ["in", item_codes],
			"selling": 1,
		},
		fields=["item_code", "price_list_rate"],
	)
	return {row.item_code: flt(row.price_list_rate) for row in rows}


def _get_stock_map(item_codes: list[str], warehouse: str | None) -> dict[str, float]:
	if not item_codes or not warehouse:
		return {}

	rows = frappe.get_all(
		"Bin",
		filters={"warehouse": warehouse, "item_code": ["in", item_codes]},
		fields=["item_code", "actual_qty"],
	)
	return {row.item_code: flt(row.actual_qty) for row in rows}
