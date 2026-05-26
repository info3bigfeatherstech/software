// REDUX_SLICES/Customer_api/customerSlice.js
//
// UI State for Customers Tab (CRUD operations only)
// Not used in BillingTab — that uses billingSlice for customer selection

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Filters & Pagination
    search: "",
    loyaltyFilter: "",
    currentPage: 1,
    pageSize: 20,

    // Modals
    showAddModal: false,
    showEditModal: false,
    showViewModal: false,
    selectedCustomer: null,

    // Form States
    addForm: {
        mobile: "",
        name: "",
        email: "",
        gst_number: "",
        address: "",
        city: "",
        state_code: "",
        remarks: "",
    },
    editForm: {
        mobile: "",
        name: "",
        email: "",
        gst_number: "",
        address: "",
        city: "",
        state_code: "",
        remarks: "",
    },

    // Errors
    formErrors: {},
};

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        // Filters
        setSearch: (state, action) => {
            state.search = action.payload;
            state.currentPage = 1;
        },
        setLoyaltyFilter: (state, action) => {
            state.loyaltyFilter = action.payload;
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
            state.loyaltyFilter = "";
            state.currentPage = 1;
        },

        // Add Modal
        openAddModal: (state) => {
            state.showAddModal = true;
            state.addForm = {
                mobile: "",
                name: "",
                email: "",
                gst_number: "",
                address: "",
                city: "",
                state_code: "",
                remarks: "",
            };
            state.formErrors = {};
        },
        closeAddModal: (state) => {
            state.showAddModal = false;
            state.addForm = initialState.addForm;
            state.formErrors = {};
        },
        updateAddForm: (state, action) => {
            state.addForm = { ...state.addForm, ...action.payload };
            // Clear error for this field if it exists
            const field = Object.keys(action.payload)[0];
            if (field && state.formErrors[field]) {
                delete state.formErrors[field];
            }
        },

        // Edit Modal
        openEditModal: (state, action) => {
            const customer = action.payload;
            state.showEditModal = true;
            state.selectedCustomer = customer;
            state.editForm = {
                mobile: customer.mobile || "",
                name: customer.name || "",
                email: customer.email || "",
                gst_number: customer.gst_number || "",
                address: customer.address || "",
                city: customer.city || "",
                state_code: customer.state_code || "",
                remarks: customer.remarks || "",
            };
            state.formErrors = {};
        },
        closeEditModal: (state) => {
            state.showEditModal = false;
            state.selectedCustomer = null;
            state.editForm = initialState.editForm;
            state.formErrors = {};
        },
        updateEditForm: (state, action) => {
            state.editForm = { ...state.editForm, ...action.payload };
            const field = Object.keys(action.payload)[0];
            if (field && state.formErrors[field]) {
                delete state.formErrors[field];
            }
        },

        // View Modal
        openViewModal: (state, action) => {
            state.showViewModal = true;
            state.selectedCustomer = action.payload;
        },
        closeViewModal: (state) => {
            state.showViewModal = false;
            state.selectedCustomer = null;
        },

        // Errors
        setFormErrors: (state, action) => {
            state.formErrors = action.payload;
        },
        clearFormErrors: (state) => {
            state.formErrors = {};
        },
    },
});

export const {
    setSearch,
    setLoyaltyFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
    openAddModal,
    closeAddModal,
    updateAddForm,
    openEditModal,
    closeEditModal,
    updateEditForm,
    openViewModal,
    closeViewModal,
    setFormErrors,
    clearFormErrors,
} = customerSlice.actions;

export default customerSlice.reducer;