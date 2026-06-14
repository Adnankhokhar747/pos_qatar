import { posQatarApi } from "../baseApi";
import type { ItemGroupNode, POSItem } from "../../types";

export const itemsApi = posQatarApi.injectEndpoints({
	endpoints: (builder) => ({
		searchItems: builder.query<
			POSItem[],
			{
				posProfile: string;
				searchTerm?: string;
				itemGroup?: string;
				start?: number;
				pageLength?: number;
			}
		>({
			query: ({ posProfile, searchTerm, itemGroup, start = 0, pageLength = 40 }) => ({
				method: "pos_qatar.api.items.search_items",
				params: {
					pos_profile: posProfile,
					search_term: searchTerm || undefined,
					item_group: itemGroup || undefined,
					start,
					page_length: pageLength,
				},
			}),
			providesTags: ["Items"],
		}),

		getItemGroups: builder.query<ItemGroupNode[], { posProfile: string }>({
			query: ({ posProfile }) => ({
				method: "pos_qatar.api.items.get_item_groups",
				params: { pos_profile: posProfile },
			}),
			providesTags: ["ItemGroups"],
		}),

		getItemByBarcode: builder.query<POSItem | null, { barcode: string; posProfile: string }>({
			query: ({ barcode, posProfile }) => ({
				method: "pos_qatar.api.items.get_item_by_barcode",
				params: { barcode, pos_profile: posProfile },
			}),
		}),
	}),
});

export const { useSearchItemsQuery, useGetItemGroupsQuery, useLazyGetItemByBarcodeQuery } = itemsApi;
