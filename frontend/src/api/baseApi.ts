import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

import { callMethod, getErrorMessage } from "./client";

interface RpcArgs {
	method: string;
	params?: Record<string, unknown>;
}

interface RpcError {
	status?: number;
	message: string;
}

const rpcBaseQuery: BaseQueryFn<RpcArgs, unknown, RpcError> = async ({ method, params }) => {
	try {
		const data = await callMethod(method, params);
		return { data };
	} catch (error) {
		return {
			error: {
				status: (error as { response?: { status?: number } })?.response?.status,
				message: getErrorMessage(error),
			},
		};
	}
};

/**
 * Root RTK Query API. Feature-specific endpoint files use
 * `posQatarApi.injectEndpoints` to keep each domain (items, customers,
 * invoices, ...) in its own module.
 */
export const posQatarApi = createApi({
	reducerPath: "posQatarApi",
	baseQuery: rpcBaseQuery,
	tagTypes: ["POSProfile", "OpeningEntry", "Items", "ItemGroups", "Customers"],
	endpoints: () => ({}),
});
