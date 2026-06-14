import { Alert, Button, Card, Form, InputNumber, message, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../app/hooks";
import {
	useGetOpeningEntryStateQuery,
	useSubmitClosingEntryMutation,
} from "../api/endpoints/posApi";
import { getErrorMessage } from "../api/client";

interface ClosingFormValues {
	balances: Record<string, number>;
}

export default function ClosingEntryPage() {
	const navigate = useNavigate();
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const [form] = Form.useForm<ClosingFormValues>();

	const { data: openingState } = useGetOpeningEntryStateQuery(
		{ posProfile: posProfile! },
		{ skip: !posProfile },
	);
	const [submitClosingEntry, { isLoading }] = useSubmitClosingEntryMutation();

	if (!openingState || openingState.status !== "Open") {
		return (
			<Alert
				type="info"
				showIcon
				message="No Open Shift"
				description="There is no open POS shift to close."
			/>
		);
	}

	const handleSubmit = async (values: ClosingFormValues) => {
		if (!openingState.pos_opening_entry) return;
		try {
			await submitClosingEntry({
				openingEntry: openingState.pos_opening_entry,
				payments: Object.entries(values.balances || {}).map(([mode, amount]) => ({
					mode_of_payment: mode,
					closing_amount: Number(amount) || 0,
				})),
			}).unwrap();
			message.success("Shift closed successfully");
			navigate("/opening");
		} catch (error) {
			message.error(getErrorMessage(error));
		}
	};

	return (
		<Card title="Close Shift" style={{ maxWidth: 480, margin: "32px auto" }}>
			<Typography.Paragraph type="secondary">
				Enter the counted closing balance for each payment method to close your POS session.
			</Typography.Paragraph>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				{(openingState.balance_details || []).map((balance) => (
					<Form.Item
						key={balance.mode_of_payment}
						name={["balances", balance.mode_of_payment]}
						label={`${balance.mode_of_payment} (opened with ${balance.opening_amount})`}
						initialValue={balance.opening_amount}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
				))}
				<Space style={{ width: "100%", justifyContent: "flex-end" }}>
					<Button type="primary" danger htmlType="submit" loading={isLoading}>
						Close Shift
					</Button>
				</Space>
			</Form>
		</Card>
	);
}
