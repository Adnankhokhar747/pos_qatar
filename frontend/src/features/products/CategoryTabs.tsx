import { Segmented, Skeleton } from "antd";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetItemGroupsQuery } from "../../api/endpoints/itemsApi";
import { setSelectedItemGroup } from "../session/sessionSlice";

export default function CategoryTabs() {
	const posProfile = useAppSelector((state) => state.session.posProfile);
	const selectedItemGroup = useAppSelector((state) => state.session.selectedItemGroup);
	const dispatch = useAppDispatch();

	const { data: itemGroups, isLoading } = useGetItemGroupsQuery(
		{ posProfile: posProfile! },
		{ skip: !posProfile },
	);

	if (isLoading) return <Skeleton.Button active style={{ width: "100%", height: 40 }} />;

	const options = [
		{ label: "All Items", value: "" },
		...(itemGroups || []).map((group) => ({
			label: group.item_group_name,
			value: group.name,
		})),
	];

	return (
		<Segmented
			options={options}
			value={selectedItemGroup || ""}
			onChange={(value) => dispatch(setSelectedItemGroup((value as string) || null))}
			style={{ overflowX: "auto", maxWidth: "100%" }}
		/>
	);
}
