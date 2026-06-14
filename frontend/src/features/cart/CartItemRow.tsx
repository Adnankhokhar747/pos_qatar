import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, InputNumber, Space, Typography } from "antd";

import { useAppDispatch } from "../../app/hooks";
import { formatCurrency } from "../../utils/currency";
import type { CartItem } from "../../types";
import {
	decrementQty,
	incrementQty,
	removeItem,
	setItemDiscountPercentage,
	setQty,
} from "./cartSlice";

export default function CartItemRow({ item, currency }: { item: CartItem; currency: string }) {
	const dispatch = useAppDispatch();
	const amount = item.rate * item.qty;

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 8,
				padding: "8px 0",
				borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
			}}
		>
			<div style={{ flex: 1, minWidth: 0 }}>
				<Typography.Text strong ellipsis style={{ display: "block" }}>
					{item.item_name}
				</Typography.Text>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					{formatCurrency(item.rate, currency)} x {item.qty} {item.uom}
				</Typography.Text>
			</div>

			<Space size={4}>
				<Button
					size="small"
					icon={<MinusOutlined />}
					onClick={() => dispatch(decrementQty(item.item_code))}
				/>
				<InputNumber
					size="small"
					min={0}
					value={item.qty}
					onChange={(value) => dispatch(setQty({ itemCode: item.item_code, qty: Number(value) || 0 }))}
					style={{ width: 56 }}
				/>
				<Button
					size="small"
					icon={<PlusOutlined />}
					onClick={() => dispatch(incrementQty(item.item_code))}
				/>
			</Space>

			<InputNumber
				size="small"
				min={0}
				max={100}
				value={item.discount_percentage}
				addonAfter="%"
				style={{ width: 80 }}
				onChange={(value) =>
					dispatch(setItemDiscountPercentage({ itemCode: item.item_code, value: Number(value) || 0 }))
				}
			/>

			<Typography.Text strong style={{ width: 90, textAlign: "right" }}>
				{formatCurrency(amount, currency)}
			</Typography.Text>

			<Button
				size="small"
				danger
				type="text"
				icon={<DeleteOutlined />}
				onClick={() => dispatch(removeItem(item.item_code))}
			/>
		</div>
	);
}
