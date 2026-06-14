import { Col, Empty, Pagination, Row, Skeleton, Table } from "antd";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useSearchItemsQuery } from "../../api/endpoints/itemsApi";
import { formatCurrency } from "../../utils/currency";
import type { POSItem } from "../../types";
import { addItem } from "../cart/cartSlice";
import ProductCard from "./ProductCard";

const PAGE_LENGTH = 40;

export default function ProductGrid() {
	const dispatch = useAppDispatch();
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const searchTerm = useAppSelector((state) => state.session.searchTerm);
	const selectedItemGroup = useAppSelector((state) => state.session.selectedItemGroup);
	const viewMode = useAppSelector((state) => state.session.viewMode);
	const [page, setPage] = useState(1);

	const { data, isLoading, isFetching } = useSearchItemsQuery(
		{
			posProfile: posProfile!,
			searchTerm: searchTerm || undefined,
			itemGroup: selectedItemGroup || undefined,
			start: (page - 1) * PAGE_LENGTH,
			pageLength: PAGE_LENGTH,
		},
		{ skip: !posProfile },
	);

	if (isLoading) {
		return (
			<Row gutter={[12, 12]}>
				{Array.from({ length: 8 }).map((_, index) => (
					<Col key={index} xs={12} sm={8} md={6} lg={4}>
						<Skeleton.Image active style={{ width: "100%", height: 140 }} />
					</Col>
				))}
			</Row>
		);
	}

	if (!data || data.length === 0) {
		return <Empty description="No items found" style={{ marginTop: 64 }} />;
	}

	if (viewMode === "List") {
		return (
			<Table<POSItem>
				rowKey="item_code"
				loading={isFetching}
				dataSource={data}
				pagination={{ current: page, pageSize: PAGE_LENGTH, onChange: setPage, showSizeChanger: false }}
				onRow={(item) => ({ onClick: () => dispatch(addItem(item)), style: { cursor: "pointer" } })}
				columns={[
					{ title: "Item Code", dataIndex: "item_code" },
					{ title: "Item Name", dataIndex: "item_name" },
					{ title: "Group", dataIndex: "item_group" },
					{
						title: "Stock",
						dataIndex: "actual_qty",
						render: (qty, item) => `${qty} ${item.stock_uom}`,
					},
					{
						title: "Rate",
						dataIndex: "price_list_rate",
						align: "right",
						render: (rate, item) => formatCurrency(rate, item.currency),
					},
				]}
			/>
		);
	}

	return (
		<>
			<Row gutter={[12, 12]}>
				{data.map((item) => (
					<Col key={item.item_code} xs={12} sm={8} md={6} lg={4}>
						<ProductCard item={item} />
					</Col>
				))}
			</Row>
			<div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
				<Pagination
					current={page}
					pageSize={PAGE_LENGTH}
					total={page * PAGE_LENGTH + (data.length === PAGE_LENGTH ? PAGE_LENGTH : 0)}
					showSizeChanger={false}
					onChange={setPage}
				/>
			</div>
		</>
	);
}
