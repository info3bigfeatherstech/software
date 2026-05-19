import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showModal: false,
    editingCategory: null,
    formData: {
        name: "",
        description: "",
        parent_id: null,
        remarks: ""
    },
    formErrors: {},
    isSubmitting: false,
    search: "",
    statusFilter: "all", // all, active, inactive
    currentPage: 1,
    pageSize: 20
};

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        // Modal actions
        openModal: (state) => {
            state.showModal = true;
            state.editingCategory = null;
            state.formData = { name: "", description: "", parent_id: null, remarks: "" };
            state.formErrors = {};
        },
        closeModal: (state) => {
            state.showModal = false;
            state.editingCategory = null;
            state.formData = { name: "", description: "", parent_id: null, remarks: "" };
            state.formErrors = {};
        },
        openEditModal: (state, action) => {
            const category = action.payload;
            state.showModal = true;
            state.editingCategory = category;
            state.formData = {
                name: category.name || "",
                description: category.description || "",
                parent_id: category.parent_id || null,
                remarks: category.remarks || ""
            };
            state.formErrors = {};
        },

        // Form actions
        updateForm: (state, action) => {
            state.formData = { ...state.formData, ...action.payload };
            // Clear error for the field being updated
            const field = Object.keys(action.payload)[0];
            if (field && state.formErrors[field]) {
                delete state.formErrors[field];
            }
        },
        setFormErrors: (state, action) => {
            state.formErrors = action.payload;
        },
        clearFormErrors: (state) => {
            state.formErrors = {};
        },

        // UI filters
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

        // Submitting state
        setSubmitting: (state, action) => {
            state.isSubmitting = action.payload;
        },

        // Reset all
        resetFilters: (state) => {
            state.search = "";
            state.statusFilter = "all";
            state.currentPage = 1;
        }
    }
});

export const {
    openModal,
    closeModal,
    openEditModal,
    updateForm,
    setFormErrors,
    clearFormErrors,
    setSearch,
    setStatusFilter,
    setCurrentPage,
    setSubmitting,
    resetFilters
} = categorySlice.actions;

export default categorySlice.reducer;