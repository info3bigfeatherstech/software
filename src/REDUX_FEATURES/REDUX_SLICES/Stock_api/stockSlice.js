// REDUX_SLICES/Stock_api/stockSlice.js
//
// Redux state for Inventory Stock Tab
// Manages: filters, pagination, modals, selection state

import { createSlice } from "@reduxjs/toolkit";

// ── Empty Form Templates ─────────────────────────────────────────────

const EMPTY_EDIT_FORM = {
    room_zone: "",
    rack_shelf: "",
    position: "",
    batch_number: "",
    expiry_date: "",
    low_stock_threshold: 10,
    remarks: "",
};

const EMPTY_QUANTITY_FORM = {
    new_quantity: "",
    reason: "",
};

const EMPTY_MANUAL_FORM = {
    variant_id: "",
    warehouse_id: "",
    quantity: "",
    room_zone: "",
    rack_shelf: "",
    position: "",
    batch_number: "",
    expiry_date: "",
    low_stock_threshold: 10,
    remarks: "",
};

// ── Initial State ────────────────────────────────────────────────────

const initialState = {
    // ── Filters & Pagination ─────────────────────────────────────────
    search: "",
    warehouseFilter: "",      // For SUPER_ADMIN
    categoryFilter: "",       // From product's category
    currentPage: 1,
    pageSize: 20,

    // ── Modal States ─────────────────────────────────────────────────
    showEditModal: false,
    showQuantityModal: false,
    showManualAddModal: false,
    selectedStock: null,

    // ── Bulk Selection ───────────────────────────────────────────────
    selectedStockIds: [],
    showBulkActionBar: false,

    // ── Form States ──────────────────────────────────────────────────
    editForm: { ...EMPTY_EDIT_FORM },
    quantityForm: { ...EMPTY_QUANTITY_FORM },
    manualForm: { ...EMPTY_MANUAL_FORM },

    // ── Validation Errors ────────────────────────────────────────────
    editErrors: {},
    quantityErrors: {},
    manualErrors: {},

    // ── UI State ─────────────────────────────────────────────────────
    isLoading: false,
};

const stockSlice = createSlice({
    name: "stock",
    initialState,
    reducers: {

        // ── Filters & Pagination ───────────────────────────────────────
        setSearch: (state, action) => {
            state.search = action.payload;
            state.currentPage = 1;
        },
        setWarehouseFilter: (state, action) => {
            state.warehouseFilter = action.payload;
            state.currentPage = 1;
        },
        setCategoryFilter: (state, action) => {
            state.categoryFilter = action.payload;
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
            state.warehouseFilter = "";
            state.categoryFilter = "";
            state.currentPage = 1;
        },

        // ── Edit Modal ─────────────────────────────────────────────────
        openEditModal: (state, action) => {
            const stock = action.payload;
            state.showEditModal = true;
            state.selectedStock = stock;
            state.editForm = {
                room_zone: stock.room_zone || "",
                rack_shelf: stock.rack_shelf || "",
                position: stock.position || "",
                batch_number: stock.batch_number || "",
                expiry_date: stock.expiry_date ? stock.expiry_date.split("T")[0] : "",
                low_stock_threshold: stock.low_stock_threshold ?? 10,
                remarks: stock.remarks || "",
            };
            state.editErrors = {};
        },
        closeEditModal: (state) => {
            state.showEditModal = false;
            state.selectedStock = null;
            state.editForm = { ...EMPTY_EDIT_FORM };
            state.editErrors = {};
        },
        updateEditForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.editForm = { ...state.editForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.editErrors[field]) {
                    delete state.editErrors[field];
                }
            }
        },
        setEditErrors: (state, action) => {
            state.editErrors = action.payload;
        },

        // ── Quantity Adjustment Modal ──────────────────────────────────
        openQuantityModal: (state, action) => {
            const stock = action.payload;
            state.showQuantityModal = true;
            state.selectedStock = stock;
            state.quantityForm = {
                new_quantity: stock.quantity.toString(),
                reason: "",
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

        // ── Manual Add Modal ───────────────────────────────────────────
        openManualAddModal: (state) => {
            state.showManualAddModal = true;
            state.manualForm = { ...EMPTY_MANUAL_FORM };
            state.manualErrors = {};
        },
        closeManualAddModal: (state) => {
            state.showManualAddModal = false;
            state.manualForm = { ...EMPTY_MANUAL_FORM };
            state.manualErrors = {};
        },
        updateManualForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.manualForm = { ...state.manualForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.manualErrors[field]) {
                    delete state.manualErrors[field];
                }
            }
        },
        setManualErrors: (state, action) => {
            state.manualErrors = action.payload;
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

        // ── Bulk Update Location Modal ─────────────────────────────────
        openBulkLocationModal: (state) => {
            // This will be handled by StockBulkActionBar component
            state.showBulkLocationModal = true;
        },
        closeBulkLocationModal: (state) => {
            state.showBulkLocationModal = false;
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
    setWarehouseFilter,
    setCategoryFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
    // Edit Modal
    openEditModal,
    closeEditModal,
    updateEditForm,
    setEditErrors,
    // Quantity Modal
    openQuantityModal,
    closeQuantityModal,
    updateQuantityForm,
    setQuantityErrors,
    // Manual Add Modal
    openManualAddModal,
    closeManualAddModal,
    updateManualForm,
    setManualErrors,
    // Bulk Selection
    toggleSelectStock,
    selectAllStocks,
    clearSelectedStocks,
    // Loading
    setLoading,
} = stockSlice.actions;

export default stockSlice.reducer;
// use upper code which is updated 
// // REDUX_SLICES/Stock_api/stockSlice.js
// //
// // Redux state for Inventory Stock Tab (read-only stock view)

// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     // Filters & Pagination
//     search: "",
//     warehouseFilter: "",      // For SUPER_ADMIN
//     categoryFilter: "",
//     stockStatusFilter: "all", // 'all', 'low', 'out'
//     currentPage: 1,
//     pageSize: 20,

//     // UI State
//     isLoading: false,
// };

// const stockSlice = createSlice({
//     name: "stock",
//     initialState,
//     reducers: {

//         setSearch: (state, action) => {
//             state.search = action.payload;
//             state.currentPage = 1;
//         },

//         setWarehouseFilter: (state, action) => {
//             state.warehouseFilter = action.payload;
//             state.currentPage = 1;
//         },

//         setCategoryFilter: (state, action) => {
//             state.categoryFilter = action.payload;
//             state.currentPage = 1;
//         },

//         setStockStatusFilter: (state, action) => {
//             state.stockStatusFilter = action.payload;
//             state.currentPage = 1;
//         },

//         setCurrentPage: (state, action) => {
//             state.currentPage = action.payload;
//         },

//         setPageSize: (state, action) => {
//             state.pageSize = action.payload;
//             state.currentPage = 1;
//         },

//         resetFilters: (state) => {
//             state.search = "";
//             state.warehouseFilter = "";
//             state.categoryFilter = "";
//             state.stockStatusFilter = "all";
//             state.currentPage = 1;
//         },

//         setLoading: (state, action) => {
//             state.isLoading = action.payload;
//         },
//     },
// });

// export const {
//     setSearch,
//     setWarehouseFilter,
//     setCategoryFilter,
//     setStockStatusFilter,
//     setCurrentPage,
//     setPageSize,
//     resetFilters,
//     setLoading,
// } = stockSlice.actions;

// export default stockSlice.reducer;