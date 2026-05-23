// REDUX_SLICES/Purchase_api/purchaseSlice.js
//
// Redux state for Purchase Tab (read-only purchase history)

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Modals
    showDetailModal: false,
    selectedPurchase: null,

    // Filters & Pagination
    search: "",
    vendorFilter: "",
    warehouseFilter: "",
    statusFilter: "",
    fromDate: "",
    toDate: "",
    currentPage: 1,
    pageSize: 20,

    // UI State
    isLoading: false,
};

const purchaseSlice = createSlice({
    name: "purchase",
    initialState,
    reducers: {

        // ── Detail Modal ────────────────────────────────────────────────────────
        openDetailModal: (state, action) => {
            state.showDetailModal = true;
            state.selectedPurchase = action.payload;
        },
        closeDetailModal: (state) => {
            state.showDetailModal = false;
            state.selectedPurchase = null;
        },

        // ── Filters & Pagination ────────────────────────────────────────────────
        setSearch: (state, action) => {
            state.search = action.payload;
            state.currentPage = 1;
        },
        setVendorFilter: (state, action) => {
            state.vendorFilter = action.payload;
            state.currentPage = 1;
        },
        setWarehouseFilter: (state, action) => {
            state.warehouseFilter = action.payload;
            state.currentPage = 1;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
            state.currentPage = 1;
        },
        setFromDate: (state, action) => {
            state.fromDate = action.payload;
            state.currentPage = 1;
        },
        setToDate: (state, action) => {
            state.toDate = action.payload;
            state.currentPage = 1;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action) => {
            state.pageSize = action.payload;
            state.currentPage = 1;
        },
        resetFilters: (state) => {
            state.search = "";
            state.vendorFilter = "";
            state.warehouseFilter = "";
            state.statusFilter = "";
            state.fromDate = "";
            state.toDate = "";
            state.currentPage = 1;
        },

        // ── Loading ─────────────────────────────────────────────────────────────
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    openDetailModal,
    closeDetailModal,
    setSearch,
    setVendorFilter,
    setWarehouseFilter,
    setStatusFilter,
    setFromDate,
    setToDate,
    setCurrentPage,
    setPageSize,
    resetFilters,
    setLoading,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;