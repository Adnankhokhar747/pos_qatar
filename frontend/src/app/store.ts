import { configureStore } from "@reduxjs/toolkit";

import { posQatarApi } from "../api/baseApi";
import cartReducer from "../features/cart/cartSlice";
import sessionReducer from "../features/session/sessionSlice";

export const store = configureStore({
	reducer: {
		cart: cartReducer,
		session: sessionReducer,
		[posQatarApi.reducerPath]: posQatarApi.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(posQatarApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
