import axios, { type AxiosError } from "axios";

// All POS Qatar backend calls go through Frappe's RPC-style
// `/api/method/<dotted.path>` endpoint. Session auth (cookie) + CSRF token
// (provided via window.pos_qatar.csrf_token, injected by the www page) are
// attached to every request.
export const httpClient = axios.create({
	baseURL: "/",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

httpClient.interceptors.request.use((config) => {
	const csrfToken = window.pos_qatar?.csrf_token;
	if (csrfToken) {
		config.headers["X-Frappe-CSRF-Token"] = csrfToken;
	}
	return config;
});

export interface FrappeErrorShape {
	message?: string;
	exc_type?: string;
	exc?: string;
	_server_messages?: string;
}

export function getErrorMessage(error: unknown): string {
	const axiosError = error as AxiosError<FrappeErrorShape>;
	const data = axiosError?.response?.data;

	if (data?._server_messages) {
		try {
			const messages = JSON.parse(data._server_messages) as string[];
			const first = JSON.parse(messages[0]) as { message?: string };
			if (first?.message) return first.message;
		} catch {
			// fall through to other handlers
		}
	}

	if (data?.message) return data.message;
	if (axiosError?.message) return axiosError.message;
	return "Something went wrong. Please try again.";
}

/**
 * Calls a whitelisted Python method under `pos_qatar.api.*` and returns the
 * `message` payload (Frappe's convention for whitelisted return values).
 */
export async function callMethod<T>(method: string, params: Record<string, unknown> = {}): Promise<T> {
	const { data } = await httpClient.post<{ message: T }>(`/api/method/${method}`, params);
	return data.message;
}
