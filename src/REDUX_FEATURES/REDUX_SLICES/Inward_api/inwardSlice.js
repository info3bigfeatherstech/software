// REDUX_SLICES/Inward_api/inwardSlice.js

import { createSlice } from "@reduxjs/toolkit";

// ── Empty forms ──────────────────────────────────────────────────────────────

const EMPTY_SCHEDULE_FORM = {
    vendor_id: "",
    warehouse_id: "",
    expected_date: "",
    remarks: "",
};

const EMPTY_ARRIVAL_FORM = {
    vendor_invoice_no: "",
    challan_no: "",
    transport_details: "",
    remarks: "",
};

const EMPTY_EDIT_FORM = {
    expected_date: "",
    remarks: "",
};

const EMPTY_ITEM_FORM = {
    item_name: "",
    variant_text: "",
    quantity_received: "",
    purchase_cost: "",
    batch_number: "",
    remarks: "",
};

// ── Initial state ────────────────────────────────────────────────────────────

const initialState = {
    // ── Main table modals
    showAddForm: false,        // InwardAddForm — POST /inwards
    showEditForm: false,       // InwardEditForm — READ-ONLY detail view (FIXED: new flag)
    showArrivalModal: false,   // InwardArrivalModal — PATCH /arrival-details
    showItemsModal: false,     // InwardItemsModal — items CRUD
    showStatusModal: false,    // InwardStatusModal — PATCH /status (MAPPED / CANCELLED)

    // Currently selected inward (for all modals except add)
    selectedInward: null,

    // ── Schedule form (add)
    scheduleForm: { ...EMPTY_SCHEDULE_FORM },
    scheduleErrors: {},

    // ── Edit form (for InwardEditForm — read-only, but holds local data for potential future use)
    editForm: { ...EMPTY_EDIT_FORM },
    editErrors: {},

    // ── Arrival form
    arrivalForm: { ...EMPTY_ARRIVAL_FORM },
    arrivalErrors: {},

    // ── Item form (add or edit inside items modal)
    itemForm: { ...EMPTY_ITEM_FORM },
    itemErrors: {},
    editingItemId: null,   // null = adding new, string = editing existing

    // ── Status form (remarks for MAPPED / CANCELLED)
    statusAction: "",   // 'MAPPED' | 'CANCELLED'
    statusRemarks: "",

    // ── Filters & Pagination
    search: "",
    statusFilter: "",   // '' | 'SCHEDULED' | 'ARRIVED' | 'MAPPED' | 'CANCELLED'
    currentPage: 1,
    pageSize: 20,

    // ── Submitting flags
    isSubmitting: false,
};

// ── Slice ────────────────────────────────────────────────────────────────────

const inwardSlice = createSlice({
    name: "inward",
    initialState,
    reducers: {

        // ── Add / Schedule Form ────────────────────────────────────────────────
        openAddForm: (state) => {
            state.showAddForm = true;
            state.scheduleForm = { ...EMPTY_SCHEDULE_FORM };
            state.scheduleErrors = {};
        },
        closeAddForm: (state) => {
            state.showAddForm = false;
            state.scheduleForm = { ...EMPTY_SCHEDULE_FORM };
            state.scheduleErrors = {};
        },
        updateScheduleForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.scheduleForm = { ...state.scheduleForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.scheduleErrors[field]) {
                    delete state.scheduleErrors[field];
                }
            }
        },
        setScheduleErrors: (state, action) => {
            state.scheduleErrors = action.payload;
        },
        clearScheduleErrors: (state) => {
            state.scheduleErrors = {};
        },

        // ── Edit Form (READ-ONLY detail view) ──────────────────────────────────
        // FIXED: New reducers for dedicated edit form modal
        openEditForm: (state, action) => {
            state.showEditForm = true;
            state.selectedInward = action.payload;
            // Pre-fill edit form with current values (for future edit capability)
            const inward = action.payload;
            state.editForm = {
                expected_date: inward.expected_date || "",
                remarks: inward.remarks || "",
            };
            state.editErrors = {};
        },
        closeEditForm: (state) => {
            state.showEditForm = false;
            state.selectedInward = null;
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
        clearEditErrors: (state) => {
            state.editErrors = {};
        },

        // ── Arrival Modal ──────────────────────────────────────────────────────
        openArrivalModal: (state, action) => {
            state.showArrivalModal = true;
            state.selectedInward = action.payload;
            // Pre-fill if arrival details already exist (re-editing)
            const inward = action.payload;
            state.arrivalForm = {
                vendor_invoice_no: inward.vendor_invoice_no || "",
                challan_no: inward.challan_no || "",
                transport_details: inward.transport_details || "",
                remarks: "",
            };
            state.arrivalErrors = {};
        },
        closeArrivalModal: (state) => {
            state.showArrivalModal = false;
            state.selectedInward = null;
            state.arrivalForm = { ...EMPTY_ARRIVAL_FORM };
            state.arrivalErrors = {};
        },
        updateArrivalForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.arrivalForm = { ...state.arrivalForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.arrivalErrors[field]) {
                    delete state.arrivalErrors[field];
                }
            }
        },
        setArrivalErrors: (state, action) => {
            state.arrivalErrors = action.payload;
        },
        clearArrivalErrors: (state) => {
            state.arrivalErrors = {};
        },

        // ── Items Modal ────────────────────────────────────────────────────────
        openItemsModal: (state, action) => {
            state.showItemsModal = true;
            state.selectedInward = action.payload;
            state.itemForm = { ...EMPTY_ITEM_FORM };
            state.itemErrors = {};
            state.editingItemId = null;
        },
        closeItemsModal: (state) => {
            state.showItemsModal = false;
            state.selectedInward = null;
            state.itemForm = { ...EMPTY_ITEM_FORM };
            state.itemErrors = {};
            state.editingItemId = null;
        },
        startEditItem: (state, action) => {
            const item = action.payload;
            state.editingItemId = item.inward_item_id;
            state.itemForm = {
                item_name: item.item_name || "",
                variant_text: item.variant_text || "",
                quantity_received: item.quantity_received ?? "",
                purchase_cost: item.purchase_cost ?? "",
                batch_number: item.batch_number || "",
                remarks: item.remarks || "",
            };
            state.itemErrors = {};
        },
        cancelEditItem: (state) => {
            state.editingItemId = null;
            state.itemForm = { ...EMPTY_ITEM_FORM };
            state.itemErrors = {};
        },
        updateItemForm: (state, action) => {
            const payload = action.payload;
            if (payload && typeof payload === "object") {
                state.itemForm = { ...state.itemForm, ...payload };
                const field = Object.keys(payload)[0];
                if (field && state.itemErrors[field]) {
                    delete state.itemErrors[field];
                }
            }
        },
        setItemErrors: (state, action) => {
            state.itemErrors = action.payload;
        },
        clearItemErrors: (state) => {
            state.itemErrors = {};
        },

        // ── Status Modal (MAPPED / CANCELLED) ─────────────────────────────────
        openStatusModal: (state, action) => {
            state.showStatusModal = true;
            state.selectedInward = action.payload.inward;
            state.statusAction = action.payload.action;
            state.statusRemarks = "";
        },
        closeStatusModal: (state) => {
            state.showStatusModal = false;
            state.selectedInward = null;
            state.statusAction = "";
            state.statusRemarks = "";
        },
        setStatusRemarks: (state, action) => {
            state.statusRemarks = action.payload;
        },

        // ── Filters & Pagination ───────────────────────────────────────────────
        setSearch: (state, action) => {
            state.search = action.payload;
            state.currentPage = 1;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
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
            state.statusFilter = "";
            state.currentPage = 1;
        },

        // ── Submitting ─────────────────────────────────────────────────────────
        setSubmitting: (state, action) => {
            state.isSubmitting = action.payload;
        },
    },
});

// Export all actions
export const {
    // Add/Schedule
    openAddForm,
    closeAddForm,
    updateScheduleForm,
    setScheduleErrors,
    clearScheduleErrors,

    // Edit Form (FIXED: new exports)
    openEditForm,
    closeEditForm,
    updateEditForm,
    setEditErrors,
    clearEditErrors,

    // Arrival
    openArrivalModal,
    closeArrivalModal,
    updateArrivalForm,
    setArrivalErrors,
    clearArrivalErrors,

    // Items
    openItemsModal,
    closeItemsModal,
    startEditItem,
    cancelEditItem,
    updateItemForm,
    setItemErrors,
    clearItemErrors,

    // Status
    openStatusModal,
    closeStatusModal,
    setStatusRemarks,

    // Filters
    setSearch,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,

    // Global
    setSubmitting,
} = inwardSlice.actions;

export default inwardSlice.reducer;

// // REDUX_SLICES/Inward_api/inwardSlice.js

// import { createSlice } from "@reduxjs/toolkit";

// // ── Empty forms ──────────────────────────────────────────────────────────────

// const EMPTY_SCHEDULE_FORM = {
//     vendor_id: "",
//     warehouse_id: "",
//     expected_date: "",
//     remarks: "",
// };

// const EMPTY_ARRIVAL_FORM = {
//     vendor_invoice_no: "",
//     challan_no: "",
//     transport_details: "",
//     remarks: "",
// };

// const EMPTY_ITEM_FORM = {
//     item_name: "",
//     variant_text: "",
//     quantity_received: "",
//     purchase_cost: "",
//     batch_number: "",
//     remarks: "",
// };

// // ── Initial state ────────────────────────────────────────────────────────────

// const initialState = {
//     // ── Main table modals
//     showAddForm: false,   // InwardAddForm  — POST /inwards
//     showArrivalModal: false,   // ArrivalModal   — PATCH /arrival-details
//     showItemsModal: false,   // InwardItemsModal — items CRUD
//     showStatusModal: false,   // StatusModal    — PATCH /status (MAPPED / CANCELLED)

//     // Currently selected inward (for all modals except add)
//     selectedInward: null,

//     // ── Schedule form (add)
//     scheduleForm: { ...EMPTY_SCHEDULE_FORM },
//     scheduleErrors: {},

//     // ── Arrival form
//     arrivalForm: { ...EMPTY_ARRIVAL_FORM },
//     arrivalErrors: {},

//     // ── Item form (add or edit inside items modal)
//     itemForm: { ...EMPTY_ITEM_FORM },
//     itemErrors: {},
//     editingItemId: null,   // null = adding new, string = editing existing

//     // ── Status form (remarks for MAPPED / CANCELLED)
//     statusAction: "",   // 'MAPPED' | 'CANCELLED'
//     statusRemarks: "",

//     // ── Filters & Pagination
//     search: "",
//     statusFilter: "",   // '' | 'SCHEDULED' | 'ARRIVED' | 'MAPPED' | 'CANCELLED'
//     currentPage: 1,
//     pageSize: 20,

//     // ── Submitting flags
//     isSubmitting: false,
// };

// // ── Slice ────────────────────────────────────────────────────────────────────

// const inwardSlice = createSlice({
//     name: "inward",
//     initialState,
//     reducers: {

//         // ── Add / Schedule Form ────────────────────────────────────────────────
//         openAddForm: (state) => {
//             state.showAddForm = true;
//             state.scheduleForm = { ...EMPTY_SCHEDULE_FORM };
//             state.scheduleErrors = {};
//         },
//         closeAddForm: (state) => {
//             state.showAddForm = false;
//             state.scheduleForm = { ...EMPTY_SCHEDULE_FORM };
//             state.scheduleErrors = {};
//         },
//         updateScheduleForm: (state, action) => {
//             const payload = action.payload;
//             if (payload && typeof payload === "object") {
//                 state.scheduleForm = { ...state.scheduleForm, ...payload };
//                 const field = Object.keys(payload)[0];
//                 if (field && state.scheduleErrors[field]) {
//                     delete state.scheduleErrors[field];
//                 }
//             }
//         },
//         setScheduleErrors: (state, action) => {
//             state.scheduleErrors = action.payload;
//         },
//         clearScheduleErrors: (state) => {
//             state.scheduleErrors = {};
//         },

//         // ── Arrival Modal ──────────────────────────────────────────────────────
//         openArrivalModal: (state, action) => {
//             state.showArrivalModal = true;
//             state.selectedInward = action.payload;
//             // Pre-fill if arrival details already exist (re-editing)
//             const inward = action.payload;
//             state.arrivalForm = {
//                 vendor_invoice_no: inward.vendor_invoice_no || "",
//                 challan_no: inward.challan_no || "",
//                 transport_details: inward.transport_details || "",
//                 remarks: "",
//             };
//             state.arrivalErrors = {};
//         },
//         closeArrivalModal: (state) => {
//             state.showArrivalModal = false;
//             state.selectedInward = null;
//             state.arrivalForm = { ...EMPTY_ARRIVAL_FORM };
//             state.arrivalErrors = {};
//         },
//         updateArrivalForm: (state, action) => {
//             const payload = action.payload;
//             if (payload && typeof payload === "object") {
//                 state.arrivalForm = { ...state.arrivalForm, ...payload };
//                 const field = Object.keys(payload)[0];
//                 if (field && state.arrivalErrors[field]) {
//                     delete state.arrivalErrors[field];
//                 }
//             }
//         },
//         setArrivalErrors: (state, action) => {
//             state.arrivalErrors = action.payload;
//         },
//         clearArrivalErrors: (state) => {
//             state.arrivalErrors = {};
//         },

//         // ── Items Modal ────────────────────────────────────────────────────────
//         openItemsModal: (state, action) => {
//             state.showItemsModal = true;
//             state.selectedInward = action.payload;
//             state.itemForm = { ...EMPTY_ITEM_FORM };
//             state.itemErrors = {};
//             state.editingItemId = null;
//         },
//         closeItemsModal: (state) => {
//             state.showItemsModal = false;
//             state.selectedInward = null;
//             state.itemForm = { ...EMPTY_ITEM_FORM };
//             state.itemErrors = {};
//             state.editingItemId = null;
//         },
//         // Called when user clicks Edit on an existing item row
//         startEditItem: (state, action) => {
//             const item = action.payload;
//             state.editingItemId = item.inward_item_id;
//             state.itemForm = {
//                 item_name: item.item_name || "",
//                 variant_text: item.variant_text || "",
//                 quantity_received: item.quantity_received ?? "",
//                 purchase_cost: item.purchase_cost ?? "",
//                 batch_number: item.batch_number || "",
//                 remarks: item.remarks || "",
//             };
//             state.itemErrors = {};
//         },
//         // Called when user cancels item edit and goes back to add mode
//         cancelEditItem: (state) => {
//             state.editingItemId = null;
//             state.itemForm = { ...EMPTY_ITEM_FORM };
//             state.itemErrors = {};
//         },
//         updateItemForm: (state, action) => {
//             const payload = action.payload;
//             if (payload && typeof payload === "object") {
//                 state.itemForm = { ...state.itemForm, ...payload };
//                 const field = Object.keys(payload)[0];
//                 if (field && state.itemErrors[field]) {
//                     delete state.itemErrors[field];
//                 }
//             }
//         },
//         setItemErrors: (state, action) => {
//             state.itemErrors = action.payload;
//         },
//         clearItemErrors: (state) => {
//             state.itemErrors = {};
//         },

//         // ── Status Modal (MAPPED / CANCELLED) ─────────────────────────────────
//         openStatusModal: (state, action) => {
//             // action.payload = { inward, action: 'MAPPED' | 'CANCELLED' }
//             state.showStatusModal = true;
//             state.selectedInward = action.payload.inward;
//             state.statusAction = action.payload.action;
//             state.statusRemarks = "";
//         },
//         closeStatusModal: (state) => {
//             state.showStatusModal = false;
//             state.selectedInward = null;
//             state.statusAction = "";
//             state.statusRemarks = "";
//         },
//         setStatusRemarks: (state, action) => {
//             state.statusRemarks = action.payload;
//         },

//         // ── Filters & Pagination ───────────────────────────────────────────────
//         setSearch: (state, action) => {
//             state.search = action.payload;
//             state.currentPage = 1;
//         },
//         setStatusFilter: (state, action) => {
//             state.statusFilter = action.payload;
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
//             state.statusFilter = "";
//             state.currentPage = 1;
//         },

//         // ── Submitting ─────────────────────────────────────────────────────────
//         setSubmitting: (state, action) => {
//             state.isSubmitting = action.payload;
//         },
//     },
// });

// export const {
//     openAddForm,
//     closeAddForm,
//     updateScheduleForm,
//     setScheduleErrors,
//     clearScheduleErrors,
//     openArrivalModal,
//     closeArrivalModal,
//     updateArrivalForm,
//     setArrivalErrors,
//     clearArrivalErrors,
//     openItemsModal,
//     closeItemsModal,
//     startEditItem,
//     cancelEditItem,
//     updateItemForm,
//     setItemErrors,
//     clearItemErrors,
//     openStatusModal,
//     closeStatusModal,
//     setStatusRemarks,
//     setSearch,
//     setStatusFilter,
//     setCurrentPage,
//     setPageSize,
//     resetFilters,
//     setSubmitting,
// } = inwardSlice.actions;

// export default inwardSlice.reducer;