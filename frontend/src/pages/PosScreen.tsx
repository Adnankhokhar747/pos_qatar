import { Alert, Button, Col, Row, Spin } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useGetOpeningEntryStateQuery, useGetPosProfileConfigQuery } from "../api/endpoints/posApi";
import Cart from "../features/cart/Cart";
import CategoryTabs from "../features/products/CategoryTabs";
import ProductGrid from "../features/products/ProductGrid";
import SearchBar from "../features/products/SearchBar";
import { setPosProfile } from "../features/session/sessionSlice";

export default function PosScreen() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const posProfile = useAppSelector((state) => state.session.posProfile);

	const { data: profileConfig, isLoading: loadingProfile, error: profileError } = useGetPosProfileConfigQuery({
		posProfile,
	});

	useEffect(() => {
		if (profileConfig?.name && profileConfig.name !== posProfile) {
			dispatch(setPosProfile(profileConfig.name));
		}
	}, [profileConfig, posProfile, dispatch]);

	const { data: openingState, isLoading: loadingOpeningState } = useGetOpeningEntryStateQuery(
		{ posProfile: posProfile! },
		{ skip: !posProfile },
	);

	if (loadingProfile) {
		return <Spin style={{ display: "flex", justifyContent: "center", marginTop: 64 }} />;
	}

	if (profileError || !posProfile) {
		return (
			<Alert
				type="error"
				showIcon
				message="No POS Profile available"
				description="No POS Profile is configured for your user. Ask a System Manager to assign one in ERPNext (Selling > POS Profile)."
			/>
		);
	}

	if (!loadingOpeningState && openingState?.status !== "Open") {
		return (
			<Alert
				type="warning"
				showIcon
				message="No Open Shift"
				description="You need to open a POS shift (cash balance) before you can start selling."
				action={
					<Button type="primary" onClick={() => navigate("/opening")}>
						Open Shift
					</Button>
				}
			/>
		);
	}

	return (
		<Row gutter={16} style={{ height: "100%" }}>
			<Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
				<SearchBar />
				<CategoryTabs />
				<div style={{ flex: 1, overflow: "auto" }}>
					<ProductGrid />
				</div>
			</Col>
			<Col
				xs={24}
				lg={8}
				style={{
					height: "100%",
					background: "var(--ant-color-bg-container, #fff)",
					borderRadius: 8,
					padding: 12,
					border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
				}}
			>
				<Cart />
			</Col>
		</Row>
	);
}
