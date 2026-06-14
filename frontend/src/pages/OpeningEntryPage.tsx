import { Button, Card, Form, InputNumber, message, Space, Typography } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../app/hooks";
import {
	useCreateOpeningEntryMutation,
	useGetOpeningEntryStateQuery,
} from "../api/endpoints/posApi";
import { useGetModesOfPaymentQuery } from "../api/endpoints/paymentsApi";
import { getErrorMessage } from "../api/client";

interface OpeningFormValues {
	balances: Record<string, number>;
}

export default function OpeningEntryPage() {
	const navigate = useNavigate();
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const [form] = Form.useForm<OpeningFormValues>();

	const { data: openingState } = useGetOpeningEntryStateQuery(
		{ posProfile: posProfile! },
		{ skip: !posProfile },
	);
	const { data: modes } = useGetModesOfPaymentQuery({ posProfile: posProfile! }, { skip: !posProfile });
	const [createOpeningEntry, { isLoading }] = useCreateOpeningEntryMutation();

	useEffect(() => {
		if (openingState?.status === "Open") {
			message.info("Shift is already open");
			navigate("/");
		}
	}, [openingState, navigate]);

	const handleSubmit = async (values: OpeningFormValues) => {
		if (!posProfile) return;
		try {
			await createOpeningEntry({
				posProfile,
				balanceDetails: Object.entries(values.balances || {}).map(([mode, amount]) => ({
					mode_of_payment: mode,
					opening_amount: Number(amount) || 0,
				})),
			}).unwrap();
			message.success("Shift opened successfully");
			navigate("/");
		} catch (error) {
			message.error(getErrorMessage(error));
		}
	};

	return (
		<Card title="Open Shift" style={{ maxWidth: 480, margin: "32px auto" }}>
			<Typography.Paragraph type="secondary">
				Enter the opening cash/balance for each payment method to start your POS session.
			</Typography.Paragraph>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				{(modes || []).map((mode) => (
					<Form.Item
						key={mode.mode_of_payment}
						name={["balances", mode.mode_of_payment]}
						label={mode.mode_of_payment}
						initialValue={0}
					>
						<InputNumber min={0} style={{ width: "100%" }} />
					</Form.Item>
				))}
				<Space style={{ width: "100%", justifyContent: "flex-end" }}>
					<Button type="primary" htmlType="submit" loading={isLoading}>
						Open Shift
					</Button>
				</Space>
			</Form>
		</Card>
	);
}
