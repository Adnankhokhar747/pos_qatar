import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// POS Qatar SPA build configuration.
//
// The output is served as static assets by Frappe from
// `/assets/pos_qatar/frontend/`, and the entry HTML is rendered by the
// `pos_qatar/www/pos-qatar.html` Jinja page (not Vite's index.html directly).
// File names are kept stable (no content hashes) so the Jinja template can
// reference them by a fixed path.
export default defineConfig({
	plugins: [react()],
	base: "/assets/pos_qatar/frontend/",
	server: {
		port: 8080,
		proxy: {
			"/api": {
				target: "http://127.0.0.1:8000",
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: "../pos_qatar/public/frontend",
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			output: {
				entryFileNames: "assets/index.js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
});
