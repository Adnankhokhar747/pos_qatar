import { Card, Empty } from "antd";

/**
 * Placeholder for the Phase 4 dashboard (today's sales, top items, sales
 * charts, recent transactions). Kept as a routable page now so navigation
 * and layout can be wired up and tested ahead of that work.
 */
export default function Dashboard() {
	return (
		<Card title="Dashboard">
			<Empty description="The sales dashboard will be available in a future update." />
		</Card>
	);
}
