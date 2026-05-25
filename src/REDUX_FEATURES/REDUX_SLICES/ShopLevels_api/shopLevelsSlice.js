// REDUX_SLICES/ShopLevels_api/shopLevelsSlice.js
//
// UI State for Min-Max Levels & Reorder Suggestions

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // For Min-Max Levels form
    showLevelsModal: false,
    levelsForm: {
        items: [],
    },
    levelsErrors: {},
    
    // For Reorder Suggestions
    selectedWarehouseId: "",
    suggestions: null,
    isLoading: false,
};

const shopLevelsSlice = createSlice({
    name: "shopLevels",
    initialState,
    reducers: {
        // ── Levels Modal ──────────────────────────────────────────────────────
        openLevelsModal: (state) => {
            state.showLevelsModal = true;
            state.levelsForm.items = [];
            state.levelsErrors = {};
        },
        closeLevelsModal: (state) => {
            state.showLevelsModal = false;
            state.levelsForm.items = [];
            state.levelsErrors = {};
        },
        addLevelItem: (state, action) => {
            state.levelsForm.items.push(action.payload);
        },
        updateLevelItem: (state, action) => {
            const { index, ...data } = action.payload;
            if (state.levelsForm.items[index]) {
                state.levelsForm.items[index] = { ...state.levelsForm.items[index], ...data };
            }
        },
        removeLevelItem: (state, action) => {
            state.levelsForm.items = state.levelsForm.items.filter((_, i) => i !== action.payload);
        },
        setLevelsErrors: (state, action) => {
            state.levelsErrors = action.payload;
        },
        clearLevelsForm: (state) => {
            state.levelsForm.items = [];
            state.levelsErrors = {};
        },

        // ── Reorder Suggestions ──────────────────────────────────────────────
        setSelectedWarehouseId: (state, action) => {
            state.selectedWarehouseId = action.payload;
        },
        setSuggestions: (state, action) => {
            state.suggestions = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        clearSuggestions: (state) => {
            state.suggestions = null;
        },
    },
});

export const {
    openLevelsModal,
    closeLevelsModal,
    addLevelItem,
    updateLevelItem,
    removeLevelItem,
    setLevelsErrors,
    clearLevelsForm,
    setSelectedWarehouseId,
    setSuggestions,
    setLoading,
    clearSuggestions,
} = shopLevelsSlice.actions;

export default shopLevelsSlice.reducer;