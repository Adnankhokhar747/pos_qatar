import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";

import App from "./App";
import { store } from "./app/store";

import "./index.css";

// `/pos-qatar` is served as a single Frappe www page, so we use hash-based
// routing (`/pos-qatar#/dashboard`) to avoid relying on server-side routes
// for SPA sub-pages.
ReactDOM.createRoot(document.getElementById("pos-qatar-root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<HashRouter>
				<App />
			</HashRouter>
		</Provider>
	</React.StrictMode>,
);
