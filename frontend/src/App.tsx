import { ConfigProvider, theme as antdTheme } from "antd";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAppSelector } from "./app/hooks";
import AppLayout from "./layouts/AppLayout";
import ClosingEntryPage from "./pages/ClosingEntryPage";
import Dashboard from "./pages/Dashboard";
import OpeningEntryPage from "./pages/OpeningEntryPage";
import PosScreen from "./pages/PosScreen";

export default function App() {
	const themeMode = useAppSelector((state) => state.session.theme);

	return (
		<ConfigProvider
			theme={{
				algorithm: themeMode === "Dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
				token: {
					colorPrimary: "#7c3aed",
					borderRadius: 8,
				},
			}}
		>
			<AppLayout>
				<Routes>
					<Route path="/" element={<PosScreen />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/opening" element={<OpeningEntryPage />} />
					<Route path="/closing" element={<ClosingEntryPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AppLayout>
		</ConfigProvider>
	);
}
