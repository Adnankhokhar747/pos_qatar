import { posQatarApi } from "../baseApi";
import type { OpeningEntryState, POSProfileConfig } from "../../types";

export const posApi = posQatarApi.injectEndpoints({
	endpoints: (builder) => ({
		getPosProfileConfig: builder.query<POSProfileConfig, { posProfile?: string | null }>({
			query: ({ posProfile }) => ({
				method: "pos_qatar.api.pos.get_pos_profile_config",
				params: { pos_profile: posProfile ?? undefined },
			}),
			providesTags: ["POSProfile"],
		}),

		getOpeningEntryState: builder.query<OpeningEntryState, { posProfile: string }>({
			query: ({ posProfile }) => ({
				method: "pos_qatar.api.pos.get_opening_entry_state",
				params: { pos_profile: posProfile },
			}),
			providesTags: ["OpeningEntry"],
		}),

		createOpeningEntry: builder.mutation<
			OpeningEntryState,
			{ posProfile: string; balanceDetails: { mode_of_payment: string; opening_amount: number }[] }
		>({
			query: ({ posProfile, balanceDetails }) => ({
				method: "pos_qatar.api.pos.create_opening_entry",
				params: { pos_profile: posProfile, balance_details: balanceDetails },
			}),
			invalidatesTags: ["OpeningEntry"],
		}),

		submitClosingEntry: builder.mutation<
			{ name: string },
			{
				openingEntry: string;
				payments: { mode_of_payment: string; closing_amount: number }[];
			}
		>({
			query: ({ openingEntry, payments }) => ({
				method: "pos_qatar.api.pos.submit_closing_entry",
				params: { opening_entry: openingEntry, payments },
			}),
			invalidatesTags: ["OpeningEntry"],
		}),
	}),
});

export const {
	useGetPosProfileConfigQuery,
	useGetOpeningEntryStateQuery,
	useCreateOpeningEntryMutation,
	useSubmitClosingEntryMutation,
} = posApi;
