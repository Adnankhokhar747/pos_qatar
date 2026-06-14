import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Select, Space, Tag, Tooltip, Typography } from "antd";
import { useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetCustomerSummaryQuery, useSearchCustomersQuery } from "../../api/endpoints/customersApi";
import { formatCurrency } from "../../utils/currency";
import { setCustomer } from "../cart/cartSlice";
import QuickCustomerModal from "./QuickCustomerModal";

export default function CustomerPanel() {
	const dispatch = useAppDispatch();
	const customer = useAppSelector((state) => state.cart.customer);
	const [search, setSearch] = useState("");
	const [modalOpen, setModalOpen] = useState(false);

	const { data: customers, isFetching } = useSearchCustomersQuery({ searchTerm: search }, { skip: !search });
	const { data: summary } = useGetCustomerSummaryQuery({ customer: customer! }, { skip: !customer });

	const options = useMemo(
		() => (customers || []).map((c) => ({ value: c.name, label: c.customer_name })),
		[customers],
	);

	return (
		<>
			<Space.Compact style={{ width: "100%" }}>
				<Select
					showSearch
					allowClear
					value={customer || undefined}
					placeholder="Walk-in Customer"
					prefix={<UserOutlined />}
					style={{ width: "100%" }}
					filterOption={false}
					notFoundContent={isFetching ? "Searching..." : "No customers"}
					options={options}
					onSearch={setSearch}
					onChange={(value) => dispatch(setCustomer(value || null))}
				/>
				<Tooltip title="New customer">
					<Button icon={<PlusOutlined />} onClick={() => setModalOpen(true)} />
				</Tooltip>
			</Space.Compact>

			{summary && (
				<Space size="small" style={{ marginTop: 6 }} wrap>
					<Tag color={summary.outstanding_amount > 0 ? "orange" : "green"}>
						Outstanding: {formatCurrency(summary.outstanding_amount)}
					</Tag>
					{summary.credit_limit > 0 && (
						<Tag color="blue">Credit Limit: {formatCurrency(summary.credit_limit)}</Tag>
					)}
				</Space>
			)}
			{!customer && (
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					No customer selected — sale will be recorded against the POS Profile's default customer.
				</Typography.Text>
			)}

			<QuickCustomerModal open={modalOpen} onClose={() => setModalOpen(false)} />
		</>
	);
}
