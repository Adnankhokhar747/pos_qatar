import { posQatarApi } from "../baseApi";
import type { CartItem, DraftInvoiceTotals, InvoicePaymentInput, SubmittedInvoice } from "../../types";

export const invoiceApi = posQatarApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Creates/updates a draft POS Invoice on the server and returns the
		 * authoritative, recalculated totals (net total, taxes, grand total).
		 * The client never computes tax-inclusive totals itself.
		 */
		createDraftInvoice: builder.mutation<
			DraftInvoiceTotals,
			{
				posInvoiceName?: string | null;
				posProfile: string;
				customer: string;
				items: CartItem[];
				additionalDiscountPercentage?: number;
				additionalDiscountAmount?: number;
			}
		>({
			query: ({
				posInvoiceName,
				posProfile,
				customer,
				items,
				additionalDiscountPercentage,
				additionalDiscountAmount,
			}) => ({
				method: "pos_qatar.api.invoice.create_draft",
				params: {
					pos_invoice_name: posInvoiceName || undefined,
					pos_profile: posProfile,
					customer,
					items,
					additional_discount_percentage: additionalDiscountPercentage || 0,
					discount_amount: additionalDiscountAmount || 0,
				},
			}),
		}),

		submitInvoice: builder.mutation<
			SubmittedInvoice,
			{ posInvoiceName: string; payments: InvoicePaymentInput[] }
		>({
			query: ({ posInvoiceName, payments }) => ({
				method: "pos_qatar.api.invoice.submit_invoice",
				params: { pos_invoice_name: posInvoiceName, payments },
			}),
		}),

		createReturn: builder.mutation<SubmittedInvoice, { posInvoiceName: string; items?: CartItem[] }>({
			query: ({ posInvoiceName, items }) => ({
				method: "pos_qatar.api.invoice.create_return",
				params: { pos_invoice_name: posInvoiceName, items: items || undefined },
			}),
		}),
	}),
});

export const { useCreateDraftInvoiceMutation, useSubmitInvoiceMutation, useCreateReturnMutation } =
	invoiceApi;
