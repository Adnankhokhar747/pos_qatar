import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "Light" | "Dark";
export type ViewMode = "Grid" | "List";

export interface SessionState {
	posProfile: string | null;
	theme: ThemeMode;
	viewMode: ViewMode;
	selectedItemGroup: string | null;
	searchTerm: string;
}

const initialState: SessionState = {
	posProfile: window.pos_qatar?.default_pos_profile ?? null,
	theme: "Light",
	viewMode: "Grid",
	selectedItemGroup: null,
	searchTerm: "",
};

const sessionSlice = createSlice({
	name: "session",
	initialState,
	reducers: {
		setPosProfile(state, action: PayloadAction<string>) {
			state.posProfile = action.payload;
		},
		setTheme(state, action: PayloadAction<ThemeMode>) {
			state.theme = action.payload;
		},
		toggleTheme(state) {
			state.theme = state.theme === "Light" ? "Dark" : "Light";
		},
		setViewMode(state, action: PayloadAction<ViewMode>) {
			state.viewMode = action.payload;
		},
		setSelectedItemGroup(state, action: PayloadAction<string | null>) {
			state.selectedItemGroup = action.payload;
		},
		setSearchTerm(state, action: PayloadAction<string>) {
			state.searchTerm = action.payload;
		},
	},
});

export const {
	setPosProfile,
	setTheme,
	toggleTheme,
	setViewMode,
	setSelectedItemGroup,
	setSearchTerm,
} = sessionSlice.actions;

export default sessionSlice.reducer;
