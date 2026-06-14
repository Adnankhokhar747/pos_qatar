import { Typography } from "antd";

import { formatCurrency } from "../../utils/currency";
import type { DraftInvoiceTotals, InvoicePaymentInput, SubmittedInvoice } from "../../types";

interface ReceiptProps {
	draft: DraftInvoiceTotals;
	submitted: SubmittedInvoice;
	payments: InvoicePaymentInput[];
	companyName: string;
	customerName: string;
	currency: string;
}

/**
 * 80mm-wide printable receipt. Visibility is controlled by the print media
 * query in `index.css` (`#pos-qatar-receipt` is the only thing shown when
 * printing). Footer message / QR code templating from `POS Qatar Settings`
 * is wired up in the Phase 6 receipt designer.
 */
export default function Receipt({ draft, submitted, payments, companyName, customerName, currency }: ReceiptProps) {
	return (
		<div id="pos-qatar-receipt" style={{ width: "80mm", fontFamily: "monospace", fontSize: 12, padding: 8 }}>
			<Typography.Title level={5} style={{ textAlign: "center", margin: 0 }}>
				{companyName}
			</Typography.Title>
			<p style={{ textAlign: "center", margin: "4px 0" }}>
				Invoice: {submitted.name}
				<br />
				Customer: {customerName}
				<br />
				{new Date().toLocaleString()}
			</p>
			<hr />
			{draft.items.map((item) => (
				<div key={item.item_code} style={{ display: "flex", justifyContent: "space-between" }}>
					<span>
						{item.item_name} x{item.qty}
					</span>
					<span>{formatCurrency(item.rate * item.qty, currency)}</span>
				</div>
			))}
			<hr />
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<span>Net Total</span>
				<span>{formatCurrency(draft.net_total, currency)}</span>
			</div>
			{draft.taxes.map((tax) => (
				<div key={tax.account_head} style={{ display: "flex", justifyContent: "space-between" }}>
					<span>{tax.description}</span>
					<span>{formatCurrency(tax.tax_amount, currency)}</span>
				</div>
			))}
			<div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
				<span>Grand Total</span>
				<span>{formatCurrency(submitted.rounded_total || submitted.grand_total, currency)}</span>
			</div>
			<hr />
			{payments.map((payment) => (
				<div key={payment.mode_of_payment} style={{ display: "flex", justifyContent: "space-between" }}>
					<span>{payment.mode_of_payment}</span>
					<span>{formatCurrency(payment.amount, currency)}</span>
				</div>
			))}
			<p style={{ textAlign: "center", marginTop: 8 }}>Thank you for shopping with us!</p>
		</div>
	);
}
