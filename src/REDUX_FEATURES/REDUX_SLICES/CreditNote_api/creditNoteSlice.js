// REDUX_SLICES/CreditNote_api/creditNoteSlice.js
//
// UI State for Credit Notes Tab

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Filters & Pagination
    statusFilter: "",
    shopFilter: "",
    fromDate: "",
    toDate: "",
    currentPage: 1,
    pageSize: 20,

    // Modals
    showCreateModal: false,
    showViewModal: false,
    showRedeemModal: false,
    showRefundModal: false,
    showCancelModal: false,
    selectedCreditNote: null,
    selectedBillForCreditNote: null,

    // Create Form
    createForm: {
        original_bill_id: "",
        items: [],
        reason: "",
        restore_stock: true,
    },

    // Redeem Form
    redeemForm: {
        redeemed_amount: "",
        against_bill_id: "",
    },

    // Refund Form
    refundForm: {
        refund_amount: "",
        refund_method: "CASH",
        reference_no: "",
    },

    // Cancel Form
    cancelForm: {
        cancel_reason: "",
    },

    // Errors
    createErrors: {},
    actionErrors: {},

    isLoading: false,
};

const creditNoteSlice = createSlice({
    name: "creditNote",
    initialState,
    reducers: {
        // Filters
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
            state.currentPage = 1;
        },
        setShopFilter: (state, action) => {
            state.shopFilter = action.payload;
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
            state.statusFilter = "";
            state.shopFilter = "";
            state.fromDate = "";
            state.toDate = "";
            state.currentPage = 1;
        },

        // Create Modal
        openCreateModal: (state, action) => {
            state.showCreateModal = true;
            state.selectedBillForCreditNote = action.payload || null;
            state.createForm = {
                original_bill_id: action.payload?.bill_id || "",
                items: [],
                reason: "",
                restore_stock: true,
            };
            state.createErrors = {};
        },
        closeCreateModal: (state) => {
            state.showCreateModal = false;
            state.selectedBillForCreditNote = null;
            state.createForm = initialState.createForm;
            state.createErrors = {};
        },
        updateCreateForm: (state, action) => {
            state.createForm = { ...state.createForm, ...action.payload };
            const field = Object.keys(action.payload)[0];
            if (field && state.createErrors[field]) {
                delete state.createErrors[field];
            }
        },
        addCreateItem: (state, action) => {
            const existing = state.createForm.items.find(i => i.variant_id === action.payload.variant_id);
            if (existing) {
                existing.quantity = action.payload.quantity;
            } else {
                state.createForm.items.push(action.payload);
            }
        },
        removeCreateItem: (state, action) => {
            state.createForm.items = state.createForm.items.filter(i => i.variant_id !== action.payload);
        },
        setCreateErrors: (state, action) => {
            state.createErrors = action.payload;
        },
        clearCreateErrors: (state) => {
            state.createErrors = {};
        },

        // View Modal
        openViewModal: (state, action) => {
            state.showViewModal = true;
            state.selectedCreditNote = action.payload;
        },
        closeViewModal: (state) => {
            state.showViewModal = false;
            state.selectedCreditNote = null;
        },

        // Redeem Modal
        openRedeemModal: (state, action) => {
            state.showRedeemModal = true;
            state.selectedCreditNote = action.payload;
            state.redeemForm = {
                redeemed_amount: action.payload.remaining_amount?.toString() || action.payload.amount?.toString() || "",
                against_bill_id: "",
            };
            state.actionErrors = {};
        },
        closeRedeemModal: (state) => {
            state.showRedeemModal = false;
            state.selectedCreditNote = null;
            state.redeemForm = initialState.redeemForm;
            state.actionErrors = {};
        },
        updateRedeemForm: (state, action) => {
            state.redeemForm = { ...state.redeemForm, ...action.payload };
            if (state.actionErrors.redeemed_amount) {
                delete state.actionErrors.redeemed_amount;
            }
        },

        // Refund Modal
        openRefundModal: (state, action) => {
            state.showRefundModal = true;
            state.selectedCreditNote = action.payload;
            state.refundForm = {
                refund_amount: action.payload.remaining_amount?.toString() || action.payload.amount?.toString() || "",
                refund_method: "CASH",
                reference_no: "",
            };
            state.actionErrors = {};
        },
        closeRefundModal: (state) => {
            state.showRefundModal = false;
            state.selectedCreditNote = null;
            state.refundForm = initialState.refundForm;
            state.actionErrors = {};
        },
        updateRefundForm: (state, action) => {
            state.refundForm = { ...state.refundForm, ...action.payload };
            if (state.actionErrors.refund_amount) {
                delete state.actionErrors.refund_amount;
            }
        },

        // Cancel Modal
        openCancelModal: (state, action) => {
            state.showCancelModal = true;
            state.selectedCreditNote = action.payload;
            state.cancelForm = { cancel_reason: "" };
            state.actionErrors = {};
        },
        closeCancelModal: (state) => {
            state.showCancelModal = false;
            state.selectedCreditNote = null;
            state.cancelForm = initialState.cancelForm;
            state.actionErrors = {};
        },
        updateCancelForm: (state, action) => {
            state.cancelForm = { ...state.cancelForm, ...action.payload };
            if (state.actionErrors.cancel_reason) {
                delete state.actionErrors.cancel_reason;
            }
        },

        // Action Errors
        setActionErrors: (state, action) => {
            state.actionErrors = action.payload;
        },
        clearActionErrors: (state) => {
            state.actionErrors = {};
        },

        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setStatusFilter,
    setShopFilter,
    setFromDate,
    setToDate,
    setCurrentPage,
    setPageSize,
    resetFilters,
    openCreateModal,
    closeCreateModal,
    updateCreateForm,
    addCreateItem,
    removeCreateItem,
    setCreateErrors,
    clearCreateErrors,
    openViewModal,
    closeViewModal,
    openRedeemModal,
    closeRedeemModal,
    updateRedeemForm,
    openRefundModal,
    closeRefundModal,
    updateRefundForm,
    openCancelModal,
    closeCancelModal,
    updateCancelForm,
    setActionErrors,
    clearActionErrors,
    setLoading,
} = creditNoteSlice.actions;

export default creditNoteSlice.reducer;