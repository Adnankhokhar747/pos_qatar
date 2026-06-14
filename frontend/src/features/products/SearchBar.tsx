import { AppstoreOutlined, BarcodeOutlined, BarsOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, message, Segmented, Space } from "antd";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useLazyGetItemByBarcodeQuery } from "../../api/endpoints/itemsApi";
import { getErrorMessage } from "../../api/client";
import { addItem } from "../cart/cartSlice";
import { setSearchTerm, setViewMode } from "../session/sessionSlice";

export default function SearchBar() {
	const dispatch = useAppDispatch();
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const viewMode = useAppSelector((state) => state.session.viewMode);
	const [value, setValue] = useState("");
	const [fetchByBarcode] = useLazyGetItemByBarcodeQuery();

	const handleSearch = async (term: string) => {
		const trimmed = term.trim();
		if (!trimmed) {
			dispatch(setSearchTerm(""));
			return;
		}

		// Barcode scanners type the code followed by Enter — try an exact
		// barcode match first so a scan adds straight to the cart.
		if (posProfile && /^\d{6,}$/.test(trimmed)) {
			try {
				const item = await fetchByBarcode({ barcode: trimmed, posProfile }).unwrap();
				if (item) {
					dispatch(addItem(item));
					setValue("");
					dispatch(setSearchTerm(""));
					return;
				}
			} catch (error) {
				message.error(getErrorMessage(error));
				return;
			}
		}

		dispatch(setSearchTerm(trimmed));
	};

	return (
		<Space.Compact style={{ width: "100%" }}>
			<Input
				size="large"
				placeholder="Search by item name, code or scan barcode"
				prefix={<SearchOutlined />}
				suffix={<BarcodeOutlined />}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				onPressEnter={(event) => handleSearch((event.target as HTMLInputElement).value)}
				allowClear
				onClear={() => {
					setValue("");
					dispatch(setSearchTerm(""));
				}}
			/>
			<Segmented
				size="large"
				value={viewMode}
				onChange={(value) => dispatch(setViewMode(value as "Grid" | "List"))}
				options={[
					{ value: "Grid", icon: <AppstoreOutlined /> },
					{ value: "List", icon: <BarsOutlined /> },
				]}
			/>
		</Space.Compact>
	);
}
