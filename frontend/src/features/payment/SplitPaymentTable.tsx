import { Button, InputNumber, Space, Tag, Typography } from "antd";

import { formatCurrency } from "../../utils/currency";
import type { InvoicePaymentInput, PaymentMode } from "../../types";

interface SplitPaymentTableProps {
	modes: PaymentMode[];
	values: InvoicePaymentInput[];
	grandTotal: number;
	currency: string;
	onChange: (values: InvoicePaymentInput[]) => void;
}

export default function SplitPaymentTable({
	modes,
	values,
	grandTotal,
	currency,
	onChange,
}: SplitPaymentTableProps) {
	const totalEntered = values.reduce((sum, payment) => sum + (payment.amount || 0), 0);
	const balance = round2(grandTotal - totalEntered);

	const setAmount = (mode: string, amount: number) => {
		const next = values.filter((payment) => payment.mode_of_payment !== mode);
		if (amount > 0) next.push({ mode_of_payment: mode, amount });
		onChange(next);
	};

	const fillRemaining = (mode: string) => {
		const current = values.find((payment) => payment.mode_of_payment === mode)?.amount || 0;
		setAmount(mode, round2(Math.max(0, current + balance)));
	};

	return (
		<div>
			{modes.map((mode) => {
				const value = values.find((payment) => payment.mode_of_payment === mode.mode_of_payment)?.amount || 0;
				return (
					<div
						key={mode.mode_of_payment}
						style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
					>
						<Typography.Text style={{ flex: 1 }}>{mode.mode_of_payment}</Typography.Text>
						<InputNumber
							min={0}
							value={value}
							onChange={(val) => setAmount(mode.mode_of_payment, Number(val) || 0)}
							style={{ width: 160 }}
							prefix={currency}
						/>
						<Button size="small" onClick={() => fillRemaining(mode.mode_of_payment)}>
							Exact
						</Button>
					</div>
				);
			})}

			<Space style={{ marginTop: 12 }}>
				<Typography.Text>Total Entered: {formatCurrency(totalEntered, currency)}</Typography.Text>
				<Tag color={balance === 0 ? "green" : balance > 0 ? "orange" : "red"}>
					{balance === 0
						? "Fully Paid"
						: balance > 0
							? `Balance Due: ${formatCurrency(balance, currency)}`
							: `Change: ${formatCurrency(-balance, currency)}`}
				</Tag>
			</Space>
		</div>
	);
}

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}
