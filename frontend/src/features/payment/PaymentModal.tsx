import { PrinterOutlined } from "@ant-design/icons";
import { Button, Descriptions, message, Modal, Result, Space } from "antd";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetModesOfPaymentQuery } from "../../api/endpoints/paymentsApi";
import { useSubmitInvoiceMutation } from "../../api/endpoints/invoiceApi";
import { useSearchCustomersQuery } from "../../api/endpoints/customersApi";
import { getErrorMessage } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import type { InvoicePaymentInput, SubmittedInvoice } from "../../types";
import { clearCart } from "../cart/cartSlice";
import Receipt from "../receipt/Receipt";
import SplitPaymentTable from "./SplitPaymentTable";

interface PaymentModalProps {
	open: boolean;
	onClose: () => void;
	companyName: string;
	currency: string;
}

export default function PaymentModal({ open, onClose, companyName, currency }: PaymentModalProps) {
	const dispatch = useAppDispatch();
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const customer = useAppSelector((state) => state.cart.customer);
	const draft = useAppSelector((state) => state.cart.draft);

	const { data: modes } = useGetModesOfPaymentQuery({ posProfile: posProfile! }, { skip: !posProfile });
	const [submitInvoice, { isLoading: submitting }] = useSubmitInvoiceMutation();
	const [payments, setPayments] = useState<InvoicePaymentInput[]>([]);
	const [submitted, setSubmitted] = useState<SubmittedInvoice | null>(null);

	// `customer` is a Link (name); fetch its display label for the receipt.
	const { data: customerOptions } = useSearchCustomersQuery({ searchTerm: customer || "" }, { skip: !customer });
	const customerName = customerOptions?.[0]?.customer_name || customer || "Walk-in Customer";

	useEffect(() => {
		if (open && draft && modes && modes.length) {
			const defaultMode = modes.find((mode) => mode.default) || modes[0];
			setPayments([{ mode_of_payment: defaultMode.mode_of_payment, amount: draft.rounded_total }]);
			setSubmitted(null);
		}
	}, [open, draft, modes]);

	const grandTotal = draft?.rounded_total ?? draft?.grand_total ?? 0;
	const totalEntered = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

	const handleConfirm = async () => {
		if (!draft) return;
		try {
			const result = await submitInvoice({ posInvoiceName: draft.name, payments }).unwrap();
			setSubmitted(result);
			message.success(`Invoice ${result.name} submitted`);
		} catch (error) {
			message.error(getErrorMessage(error));
		}
	};

	const handleNewSale = () => {
		dispatch(clearCart());
		setSubmitted(null);
		onClose();
	};

	return (
		<Modal
			title="Payment"
			open={open}
			onCancel={submitted ? handleNewSale : onClose}
			footer={null}
			width={480}
			destroyOnClose
		>
			{!draft ? null : submitted ? (
				<>
					<Result
						status="success"
						title={`Invoice ${submitted.name} Submitted`}
						subTitle={`Total: ${formatCurrency(submitted.rounded_total || submitted.grand_total, currency)}`}
					/>
					<Receipt
						draft={draft}
						submitted={submitted}
						payments={payments}
						companyName={companyName}
						customerName={customerName}
						currency={currency}
					/>
					<Space style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
						<Button icon={<PrinterOutlined />} onClick={() => window.print()}>
							Print Receipt
						</Button>
						<Button type="primary" onClick={handleNewSale}>
							New Sale
						</Button>
					</Space>
				</>
			) : (
				<>
					<Descriptions size="small" column={1} bordered style={{ marginBottom: 16 }}>
						<Descriptions.Item label="Net Total">
							{formatCurrency(draft.net_total, currency)}
						</Descriptions.Item>
						<Descriptions.Item label="Taxes">
							{formatCurrency(draft.total_taxes_and_charges, currency)}
						</Descriptions.Item>
						<Descriptions.Item label="Grand Total">
							<strong>{formatCurrency(grandTotal, currency)}</strong>
						</Descriptions.Item>
					</Descriptions>

					{modes && (
						<SplitPaymentTable
							modes={modes}
							values={payments}
							grandTotal={grandTotal}
							currency={currency}
							onChange={setPayments}
						/>
					)}

					<Button
						type="primary"
						block
						size="large"
						style={{ marginTop: 16 }}
						loading={submitting}
						disabled={totalEntered < grandTotal}
						onClick={handleConfirm}
					>
						Confirm &amp; Submit
					</Button>
				</>
			)}
		</Modal>
	);
}
