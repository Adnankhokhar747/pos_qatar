import {
	BarChartOutlined,
	LockOutlined,
	MoonOutlined,
	ShopOutlined,
	SunOutlined,
	UnlockOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Space, Switch, Typography } from "antd";
import { type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleTheme } from "../features/session/sessionSlice";

const { Header, Sider, Content } = Layout;

const NAV_ITEMS = [
	{ key: "/", icon: <ShopOutlined />, label: "POS" },
	{ key: "/dashboard", icon: <BarChartOutlined />, label: "Dashboard" },
	{ key: "/opening", icon: <UnlockOutlined />, label: "Open Shift" },
	{ key: "/closing", icon: <LockOutlined />, label: "Close Shift" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useAppSelector((state) => state.session.theme);
	const posProfile = useAppSelector((state) => state.session.posProfile);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider breakpoint="lg" collapsedWidth={0} theme={theme === "Dark" ? "dark" : "light"}>
				<div
					style={{
						height: 48,
						margin: 12,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: 700,
						fontSize: 18,
						color: theme === "Dark" ? "#fff" : "#7c3aed",
					}}
				>
					POS Qatar
				</div>
				<Menu
					mode="inline"
					theme={theme === "Dark" ? "dark" : "light"}
					selectedKeys={[location.pathname]}
					items={NAV_ITEMS}
					onClick={({ key }) => navigate(key)}
				/>
			</Sider>
			<Layout>
				<Header
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "0 16px",
						background: theme === "Dark" ? "#1f1f1f" : "#fff",
					}}
				>
					<Typography.Text strong>{posProfile || "No POS Profile Selected"}</Typography.Text>
					<Space size="middle">
						<Switch
							checkedChildren={<MoonOutlined />}
							unCheckedChildren={<SunOutlined />}
							checked={theme === "Dark"}
							onChange={() => dispatch(toggleTheme())}
						/>
						<Space>
							<Avatar style={{ backgroundColor: "#7c3aed" }}>
								{(window.pos_qatar?.full_name || "U").charAt(0).toUpperCase()}
							</Avatar>
							<Typography.Text>{window.pos_qatar?.full_name}</Typography.Text>
						</Space>
					</Space>
				</Header>
				<Content style={{ padding: 16, overflow: "auto" }}>{children}</Content>
			</Layout>
		</Layout>
	);
}
