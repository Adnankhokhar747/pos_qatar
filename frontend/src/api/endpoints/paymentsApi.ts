import { posQatarApi } from "../baseApi";
import type { PaymentMode } from "../../types";

export const paymentsApi = posQatarApi.injectEndpoints({
	endpoints: (builder) => ({
		getModesOfPayment: builder.query<PaymentMode[], { posProfile: string }>({
			query: ({ posProfile }) => ({
				method: "pos_qatar.api.payments.get_modes_of_payment",
				params: { pos_profile: posProfile },
			}),
		}),
	}),
});

export const { useGetModesOfPaymentQuery } = paymentsApi;
