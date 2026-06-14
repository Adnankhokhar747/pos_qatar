import { ShoppingOutlined } from "@ant-design/icons";
import { Badge, Card, Typography } from "antd";

import { useAppDispatch } from "../../app/hooks";
import { formatCurrency } from "../../utils/currency";
import type { POSItem } from "../../types";
import { addItem } from "../cart/cartSlice";

export default function ProductCard({ item }: { item: POSItem }) {
	const dispatch = useAppDispatch();
	const outOfStock = item.actual_qty <= 0;

	return (
		<Badge.Ribbon text="Out of stock" color="red" style={{ display: outOfStock ? "block" : "none" }}>
			<Card
				hoverable
				size="small"
				style={{ width: "100%", cursor: "pointer" }}
				cover={
					item.image ? (
						<img src={item.image} alt={item.item_name} style={{ height: 100, objectFit: "cover" }} />
					) : (
						<div
							style={{
								height: 100,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								background: "#f5f5f5",
								fontSize: 32,
								color: "#bbb",
							}}
						>
							<ShoppingOutlined />
						</div>
					)
				}
				onClick={() => dispatch(addItem(item))}
			>
				<Typography.Text strong ellipsis style={{ display: "block" }}>
					{item.item_name}
				</Typography.Text>
				<Typography.Text type="secondary" style={{ fontSize: 12 }}>
					Qty: {item.actual_qty} {item.stock_uom}
				</Typography.Text>
				<div>
					<Typography.Text strong>{formatCurrency(item.price_list_rate, item.currency || "QAR")}</Typography.Text>
				</div>
			</Card>
		</Badge.Ribbon>
	);
}
