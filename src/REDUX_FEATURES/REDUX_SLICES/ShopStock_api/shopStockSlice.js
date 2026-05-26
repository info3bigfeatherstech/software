// REDUX_SLICES/ShopStock_api/shopStockSlice.js
//
// UI State for Shop Stock Management
// Manages: filters, pagination, modals, bulk selection
// NEW: Bulk Restock Request Modal & Min-Max Levels Modal

import { createSlice } from "@reduxjs/toolkit";

// ── Empty Form Templates ─────────────────────────────────────────────

const EMPTY_QUANTITY_FORM = {
    variant_id: "",
    product_name: "",
    current_quantity: 0,
    new_quantity: "",
    operation: "set",
    reason: "",
    low_stock_threshold: 10,
    remarks: "",
};

const EMPTY_MINMAX_FORM = {
    variant_id: "",
    product_name: "",
    min_level: 10,
    max_level: 100,
    reorder_qty: "",
};

// ── Initial State ────────────────────────────────────────────────────

const initialState = {
    // ── Filters & Pagination ─────────────────────────────────────────
    search: "",
    lowStockOnly: false,
    currentPage: 1,
    pageSize: 20,

    // ── Modal States ─────────────────────────────────────────────────
    showQuantityModal: false,
    showBulkModal: false,
    showBulkRestockModal: false,
    showMinMaxModal: false,  // NEW
    selectedStock: null,

    // ── Bulk Selection ───────────────────────────────────────────────
    selectedStockIds: [],
    showBulkActionBar: false,

    // ── Form States ──────────────────────────────────────────────────
    quantityForm: { ...EMPTY_QUANTITY_FORM },
    minMaxForm: { ...EMPTY_MINMAX_FORM },  // NEW
    bulkItems: [],
    bulkRestockData: null,

    // ── Validation Errors ────────────────────────────────────────────
    quantityErrors: {},
    bulkErrors: {},
    minMaxErrors: {},  // NEW

    // ── UI State ─────────────────────────────────────────────────────
    isLoading: false,
};

const shopStockSlice = createSlice({
    name: "shopStock",
    initialState,
    reducers: {

        // ── Filters & Pagination ───────────────────────────────────────
        setSearch: (state, action) => {
            state.search = action.payload;
            state.currentPage = 1;
        },
        setLowStockOnly: (state, action) => {
            state.lowStockOnly = action.payload;
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
            state.lowStockOnly = false;
            state.currentPage = 1;
        },

        // ── Quantity Modal ─────────────────────────────────────────────
        openQuantityModal: (state, action) => {
            const stock = action.payload;
            state.showQuantityModal = true;
            state.selectedStock = stock;
            state.quantityForm = {
                variant_id: stock.variant_id,
                product_name: stock.variant?.product?.name || "Unknown Product",
                current_quantity: stock.quantity_available,
                new_quantity: stock.quantity_available.toString(),
                operation: "set",
                reason: "",
                low_stock_threshold: stock.low_stock_threshold || 10,
                remarks: "",
            };
            state.quantityErrors = {};
        },
        closeQuantityModal: (state) => {
            state.showQuantityModal = false;
            state.selectedStock = null;
            state.quantityForm = { ...EMPTY_QUANTITY_FORM };
            state.quantityErrors = {};
        },
        updateQuantityForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.quantityForm = { ...state.quantityForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.quantityErrors[field]) {
                    delete state.quantityErrors[field];
                }
            }
        },
        setQuantityErrors: (state, action) => {
            state.quantityErrors = action.payload;
        },

        // ── Min-Max Levels Modal (NEW) ──────────────────────────────────
        openMinMaxModal: (state, action) => {
            const stock = action.payload;
            state.showMinMaxModal = true;
            state.selectedStock = stock;
            state.minMaxForm = {
                variant_id: stock.variant_id,
                product_name: stock.variant?.product?.name || "Unknown Product",
                min_level: stock.min_level || 10,
                max_level: stock.max_level || 100,
                reorder_qty: stock.reorder_qty || "",
            };
            state.minMaxErrors = {};
        },
        closeMinMaxModal: (state) => {
            state.showMinMaxModal = false;
            state.selectedStock = null;
            state.minMaxForm = { ...EMPTY_MINMAX_FORM };
            state.minMaxErrors = {};
        },
        updateMinMaxForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.minMaxForm = { ...state.minMaxForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.minMaxErrors[field]) {
                    delete state.minMaxErrors[field];
                }
            }
        },
        setMinMaxErrors: (state, action) => {
            state.minMaxErrors = action.payload;
        },

        // ── Bulk Modal (Existing - for quantity update) ─────────────────
        openBulkModal: (state) => {
            state.showBulkModal = true;
            state.bulkItems = [];
            state.bulkErrors = {};
        },
        closeBulkModal: (state) => {
            state.showBulkModal = false;
            state.bulkItems = [];
            state.bulkErrors = {};
        },
        addBulkItem: (state, action) => {
            const item = action.payload;
            const existing = state.bulkItems.find(i => i.variant_id === item.variant_id);
            if (existing) {
                existing.quantity = item.quantity;
                existing.operation = item.operation;
                existing.reason = item.reason;
            } else {
                state.bulkItems.push(item);
            }
        },
        removeBulkItem: (state, action) => {
            const variantId = action.payload;
            state.bulkItems = state.bulkItems.filter(i => i.variant_id !== variantId);
        },
        updateBulkItem: (state, action) => {
            const { index, ...data } = action.payload;
            if (state.bulkItems[index]) {
                state.bulkItems[index] = { ...state.bulkItems[index], ...data };
            }
        },
        clearBulkItems: (state) => {
            state.bulkItems = [];
        },
        setBulkErrors: (state, action) => {
            state.bulkErrors = action.payload;
        },

        // ── Bulk Restock Modal ──────────────────────────────────────────
        openBulkRestockModal: (state) => {
            state.showBulkRestockModal = true;
            state.bulkRestockData = null;
        },
        closeBulkRestockModal: (state) => {
            state.showBulkRestockModal = false;
            state.bulkRestockData = null;
        },
        setBulkRestockData: (state, action) => {
            state.bulkRestockData = action.payload;
        },

        // ── Bulk Selection ────────────────────────────────────────────
        toggleSelectStock: (state, action) => {
            const stockId = action.payload;
            if (state.selectedStockIds.includes(stockId)) {
                state.selectedStockIds = state.selectedStockIds.filter(id => id !== stockId);
            } else {
                state.selectedStockIds.push(stockId);
            }
            state.showBulkActionBar = state.selectedStockIds.length > 0;
        },
        selectAllStocks: (state, action) => {
            const { stockIds, isSelected } = action.payload;
            if (isSelected) {
                state.selectedStockIds = [...stockIds];
            } else {
                state.selectedStockIds = [];
            }
            state.showBulkActionBar = state.selectedStockIds.length > 0;
        },
        clearSelectedStocks: (state) => {
            state.selectedStockIds = [];
            state.showBulkActionBar = false;
        },

        // ── Loading State ──────────────────────────────────────────────
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    // Filters
    setSearch,
    setLowStockOnly,
    setCurrentPage,
    setPageSize,
    resetFilters,
    // Quantity Modal
    openQuantityModal,
    closeQuantityModal,
    updateQuantityForm,
    setQuantityErrors,
    // Min-Max Modal (NEW)
    openMinMaxModal,
    closeMinMaxModal,
    updateMinMaxForm,
    setMinMaxErrors,
    // Bulk Modal (existing)
    openBulkModal,
    closeBulkModal,
    addBulkItem,
    removeBulkItem,
    updateBulkItem,
    clearBulkItems,
    setBulkErrors,
    // Bulk Restock Modal
    openBulkRestockModal,
    closeBulkRestockModal,
    setBulkRestockData,
    // Bulk Selection
    toggleSelectStock,
    selectAllStocks,
    clearSelectedStocks,
    // Loading
    setLoading,
} = shopStockSlice.actions;

export default shopStockSlice.reducer;