import { DeleteOutlined } from "@ant-design/icons";
import { Button, Divider, Empty, InputNumber, message, Space, Typography } from "antd";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetPosProfileConfigQuery } from "../../api/endpoints/posApi";
import { useCreateDraftInvoiceMutation } from "../../api/endpoints/invoiceApi";
import { getErrorMessage } from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import CustomerPanel from "../customer/CustomerPanel";
import PaymentModal from "../payment/PaymentModal";
import {
	clearCart,
	estimateNetTotal,
	setAdditionalDiscountAmount,
	setAdditionalDiscountPercentage,
	setDraft,
} from "./cartSlice";
import CartItemRow from "./CartItemRow";

export default function Cart() {
	const dispatch = useAppDispatch();
	const cart = useAppSelector((state) => state.cart);
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const { data: profileConfig } = useGetPosProfileConfigQuery(
		{ posProfile },
		{ skip: !posProfile },
	);
	const [createDraft, { isLoading: preparingPayment }] = useCreateDraftInvoiceMutation();
	const [paymentOpen, setPaymentOpen] = useState(false);

	const currency = profileConfig?.currency || "QAR";

	const handleCharge = async () => {
		if (!posProfile || !cart.items.length) return;
		if (!cart.customer) {
			message.warning("Please select a customer before charging");
			return;
		}
		try {
			const draft = await createDraft({
				posInvoiceName: cart.draft?.name,
				posProfile,
				customer: cart.customer,
				items: cart.items,
				additionalDiscountPercentage: cart.additionalDiscountPercentage,
				additionalDiscountAmount: cart.additionalDiscountAmount,
			}).unwrap();
			dispatch(setDraft(draft));
			setPaymentOpen(true);
		} catch (error) {
			message.error(getErrorMessage(error));
		}
	};

	const estimate = estimateNetTotal(cart);

	return (
		<div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
			<CustomerPanel />

			<Divider style={{ margin: "12px 0" }} />

			<div style={{ flex: 1, overflow: "auto" }}>
				{cart.items.length === 0 ? (
					<Empty description="Cart is empty" style={{ marginTop: 48 }} />
				) : (
					cart.items.map((item) => (
						<CartItemRow key={item.item_code} item={item} currency={currency} />
					))
				)}
			</div>

			{cart.items.length > 0 && (
				<>
					<Divider style={{ margin: "12px 0" }} />

					<Space style={{ width: "100%", justifyContent: "space-between" }}>
						<Typography.Text>Additional Discount (%)</Typography.Text>
						<InputNumber
							size="small"
							min={0}
							max={100}
							value={cart.additionalDiscountPercentage}
							onChange={(value) => dispatch(setAdditionalDiscountPercentage(Number(value) || 0))}
						/>
					</Space>
					<Space style={{ width: "100%", justifyContent: "space-between", marginTop: 4 }}>
						<Typography.Text>Additional Discount ({currency})</Typography.Text>
						<InputNumber
							size="small"
							min={0}
							value={cart.additionalDiscountAmount}
							onChange={(value) => dispatch(setAdditionalDiscountAmount(Number(value) || 0))}
						/>
					</Space>

					<Divider style={{ margin: "12px 0" }} />

					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<Typography.Text strong>Estimated Total</Typography.Text>
						<Typography.Title level={4} style={{ margin: 0 }}>
							{formatCurrency(estimate, currency)}
						</Typography.Title>
					</div>
					<Typography.Text type="secondary" style={{ fontSize: 12 }}>
						Final taxes &amp; totals are calculated by ERPNext when you charge.
					</Typography.Text>

					<Space style={{ width: "100%", marginTop: 12 }}>
						<Button danger icon={<DeleteOutlined />} onClick={() => dispatch(clearCart())}>
							Clear
						</Button>
						<Button
							type="primary"
							size="large"
							block
							loading={preparingPayment}
							onClick={handleCharge}
						>
							Charge
						</Button>
					</Space>
				</>
			)}

			<PaymentModal
				open={paymentOpen}
				onClose={() => setPaymentOpen(false)}
				companyName={profileConfig?.company || ""}
				currency={currency}
			/>
		</div>
	);
}
