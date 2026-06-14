import { Form, Input, message, Modal } from "antd";

import { useAppDispatch } from "../../app/hooks";
import { useCreateQuickCustomerMutation } from "../../api/endpoints/customersApi";
import { getErrorMessage } from "../../api/client";
import { setCustomer } from "../cart/cartSlice";

interface QuickCustomerFormValues {
	customer_name: string;
	mobile_no?: string;
}

export default function QuickCustomerModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const dispatch = useAppDispatch();
	const [form] = Form.useForm<QuickCustomerFormValues>();
	const [createQuickCustomer, { isLoading }] = useCreateQuickCustomerMutation();

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			const customer = await createQuickCustomer({
				customerName: values.customer_name,
				mobileNo: values.mobile_no,
			}).unwrap();
			dispatch(setCustomer(customer.name));
			message.success(`Customer "${customer.customer_name}" created`);
			form.resetFields();
			onClose();
		} catch (error) {
			if (error instanceof Error || (error as { data?: unknown })?.data !== undefined) {
				message.error(getErrorMessage(error));
			}
			// validation errors are shown inline by AntD Form
		}
	};

	return (
		<Modal
			title="New Customer"
			open={open}
			onOk={handleOk}
			onCancel={onClose}
			confirmLoading={isLoading}
			okText="Create"
		>
			<Form form={form} layout="vertical" preserve={false}>
				<Form.Item
					name="customer_name"
					label="Customer Name"
					rules={[{ required: true, message: "Customer name is required" }]}
				>
					<Input autoFocus />
				</Form.Item>
				<Form.Item name="mobile_no" label="Mobile Number">
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
}
