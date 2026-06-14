// Shared types mirroring the response shapes returned by the
// pos_qatar.api.* whitelisted Python endpoints.

export interface PaymentMode {
	mode_of_payment: string;
	default: 0 | 1;
	account?: string;
}

export interface POSProfileConfig {
	name: string;
	company: string;
	currency: string;
	warehouse: string;
	selling_price_list: string;
	customer_group?: string;
	taxes_and_charges?: string;
	print_format?: string;
	pq_default_view: "Grid" | "List";
	pq_color_theme: "Light" | "Dark" | "System";
	pq_enable_offline: 0 | 1;
	payments: PaymentMode[];
}

export interface OpeningEntryState {
	pos_opening_entry: string | null;
	status: "Open" | "Closed" | null;
	period_start_date?: string;
	balance_details?: { mode_of_payment: string; opening_amount: number }[];
}

export interface ItemGroupNode {
	name: string;
	item_group_name: string;
}

export interface POSItem {
	item_code: string;
	item_name: string;
	item_group: string;
	stock_uom: string;
	image: string | null;
	rate: number;
	price_list_rate: number;
	currency: string;
	actual_qty: number;
	has_batch_no: 0 | 1;
	has_serial_no: 0 | 1;
	barcode?: string | null;
}

export interface POSCustomer {
	name: string;
	customer_name: string;
	mobile_no?: string;
	email_id?: string;
	customer_group?: string;
}

export interface CustomerSummary {
	customer: string;
	credit_limit: number;
	outstanding_amount: number;
	credit_days: number;
}

export interface CartItem {
	item_code: string;
	item_name: string;
	uom: string;
	qty: number;
	rate: number;
	price_list_rate: number;
	discount_percentage: number;
	discount_amount: number;
	image?: string | null;
	batch_no?: string;
	serial_no?: string;
}

export interface TaxRow {
	account_head: string;
	description: string;
	rate: number;
	tax_amount: number;
	total: number;
}

export interface DraftInvoiceTotals {
	name: string;
	net_total: number;
	total_taxes_and_charges: number;
	grand_total: number;
	rounded_total: number;
	taxes: TaxRow[];
	items: CartItem[];
}

export interface InvoicePaymentInput {
	mode_of_payment: string;
	amount: number;
}

export interface SubmittedInvoice {
	name: string;
	grand_total: number;
	rounded_total: number;
	status: string;
}
