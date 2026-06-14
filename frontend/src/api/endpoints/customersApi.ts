import { posQatarApi } from "../baseApi";
import type { CustomerSummary, POSCustomer } from "../../types";

export const customersApi = posQatarApi.injectEndpoints({
	endpoints: (builder) => ({
		searchCustomers: builder.query<POSCustomer[], { searchTerm: string }>({
			query: ({ searchTerm }) => ({
				method: "pos_qatar.api.customers.search_customers",
				params: { search_term: searchTerm },
			}),
			providesTags: ["Customers"],
		}),

		createQuickCustomer: builder.mutation<
			POSCustomer,
			{ customerName: string; mobileNo?: string; customerGroup?: string }
		>({
			query: ({ customerName, mobileNo, customerGroup }) => ({
				method: "pos_qatar.api.customers.create_quick_customer",
				params: {
					customer_name: customerName,
					mobile_no: mobileNo || undefined,
					customer_group: customerGroup || undefined,
				},
			}),
			invalidatesTags: ["Customers"],
		}),

		getCustomerSummary: builder.query<CustomerSummary, { customer: string }>({
			query: ({ customer }) => ({
				method: "pos_qatar.api.customers.get_customer_summary",
				params: { customer },
			}),
		}),
	}),
});

export const { useSearchCustomersQuery, useCreateQuickCustomerMutation, useGetCustomerSummaryQuery } =
	customersApi;
