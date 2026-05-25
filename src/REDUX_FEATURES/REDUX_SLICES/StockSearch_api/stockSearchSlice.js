// REDUX_SLICES/StockSearch_api/stockSearchSlice.js
//
// UI State for Emergency Stock Search

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchParams: {
        searchType: "product_code",
        searchValue: "",
        city: "",
        nearby_only: false,
    },
    searchResults: null,
    isLoading: false,
    error: null,
};

const stockSearchSlice = createSlice({
    name: "stockSearch",
    initialState,
    reducers: {
        setSearchParams: (state, action) => {
            state.searchParams = { ...state.searchParams, ...action.payload };
        },
        setSearchType: (state, action) => {
            state.searchParams.searchType = action.payload;
            state.searchParams.searchValue = "";
        },
        setSearchValue: (state, action) => {
            state.searchParams.searchValue = action.payload;
        },
        setCity: (state, action) => {
            state.searchParams.city = action.payload;
        },
        setNearbyOnly: (state, action) => {
            state.searchParams.nearby_only = action.payload;
        },
        setSearchResults: (state, action) => {
            state.searchResults = action.payload;
        },
        clearSearchResults: (state) => {
            state.searchResults = null;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetSearch: (state) => {
            state.searchParams = initialState.searchParams;
            state.searchResults = null;
            state.error = null;
        },
    },
});

export const {
    setSearchParams,
    setSearchType,
    setSearchValue,
    setCity,
    setNearbyOnly,
    setSearchResults,
    clearSearchResults,
    setLoading,
    setError,
    clearError,
    resetSearch,
} = stockSearchSlice.actions;

export default stockSearchSlice.reducer;