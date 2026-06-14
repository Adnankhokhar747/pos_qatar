import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CartItem, DraftInvoiceTotals, POSItem } from "../../types";

export interface CartState {
	items: CartItem[];
	customer: string | null;
	additionalDiscountPercentage: number;
	additionalDiscountAmount: number;
	/** Last server-calculated totals from `invoice.create_draft`. Cleared whenever the cart changes. */
	draft: DraftInvoiceTotals | null;
}

const initialState: CartState = {
	items: [],
	customer: null,
	additionalDiscountPercentage: 0,
	additionalDiscountAmount: 0,
	draft: null,
};

const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addItem(state, action: PayloadAction<POSItem>) {
			const item = action.payload;
			const existing = state.items.find((row) => row.item_code === item.item_code);
			if (existing) {
				existing.qty += 1;
			} else {
				state.items.push({
					item_code: item.item_code,
					item_name: item.item_name,
					uom: item.stock_uom,
					qty: 1,
					rate: item.price_list_rate,
					price_list_rate: item.price_list_rate,
					discount_percentage: 0,
					discount_amount: 0,
					image: item.image,
				});
			}
			state.draft = null;
		},

		setQty(state, action: PayloadAction<{ itemCode: string; qty: number }>) {
			const { itemCode, qty } = action.payload;
			const row = state.items.find((item) => item.item_code === itemCode);
			if (!row) return;
			if (qty <= 0) {
				state.items = state.items.filter((item) => item.item_code !== itemCode);
			} else {
				row.qty = qty;
			}
			state.draft = null;
		},

		incrementQty(state, action: PayloadAction<string>) {
			const row = state.items.find((item) => item.item_code === action.payload);
			if (row) row.qty += 1;
			state.draft = null;
		},

		decrementQty(state, action: PayloadAction<string>) {
			const row = state.items.find((item) => item.item_code === action.payload);
			if (!row) return;
			if (row.qty <= 1) {
				state.items = state.items.filter((item) => item.item_code !== action.payload);
			} else {
				row.qty -= 1;
			}
			state.draft = null;
		},

		removeItem(state, action: PayloadAction<string>) {
			state.items = state.items.filter((item) => item.item_code !== action.payload);
			state.draft = null;
		},

		setItemDiscountPercentage(state, action: PayloadAction<{ itemCode: string; value: number }>) {
			const row = state.items.find((item) => item.item_code === action.payload.itemCode);
			if (!row) return;
			const pct = Math.min(100, Math.max(0, action.payload.value));
			row.discount_percentage = pct;
			row.discount_amount = 0;
			row.rate = round2(row.price_list_rate * (1 - pct / 100));
			state.draft = null;
		},

		setItemDiscountAmount(state, action: PayloadAction<{ itemCode: string; value: number }>) {
			const row = state.items.find((item) => item.item_code === action.payload.itemCode);
			if (!row) return;
			const amount = Math.min(row.price_list_rate, Math.max(0, action.payload.value));
			row.discount_amount = amount;
			row.discount_percentage = 0;
			row.rate = round2(row.price_list_rate - amount);
			state.draft = null;
		},

		setCustomer(state, action: PayloadAction<string | null>) {
			state.customer = action.payload;
			state.draft = null;
		},

		setAdditionalDiscountPercentage(state, action: PayloadAction<number>) {
			state.additionalDiscountPercentage = Math.min(100, Math.max(0, action.payload));
			state.additionalDiscountAmount = 0;
			state.draft = null;
		},

		setAdditionalDiscountAmount(state, action: PayloadAction<number>) {
			state.additionalDiscountAmount = Math.max(0, action.payload);
			state.additionalDiscountPercentage = 0;
			state.draft = null;
		},

		setDraft(state, action: PayloadAction<DraftInvoiceTotals>) {
			state.draft = action.payload;
		},

		clearCart(state) {
			state.items = [];
			state.customer = null;
			state.additionalDiscountPercentage = 0;
			state.additionalDiscountAmount = 0;
			state.draft = null;
		},
	},
});

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

export const {
	addItem,
	setQty,
	incrementQty,
	decrementQty,
	removeItem,
	setItemDiscountPercentage,
	setItemDiscountAmount,
	setCustomer,
	setAdditionalDiscountPercentage,
	setAdditionalDiscountAmount,
	setDraft,
	clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

/** Quick client-side estimate (pre-tax) used for instant UI feedback before the server recalculates totals. */
export function estimateNetTotal(state: CartState): number {
	return round2(state.items.reduce((sum, item) => sum + item.rate * item.qty, 0));
}
