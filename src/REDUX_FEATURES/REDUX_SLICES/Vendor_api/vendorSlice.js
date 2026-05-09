// features/vendors/vendorSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // UI State
  showAddForm: false,
  showEditForm: false,
  showDetailsModal: false,
  selectedVendor: null,
  
  // Filters & Pagination
  search: "",
  businessTypeFilter: "",
  cityFilter: "",
  activeFilter: "", // '', 'true', 'false'
  currentPage: 1,
  pageSize: 10,
  
  // Form State
  formData: {
    company_name: "",
    contact_person: "",
    phone: "",
    whatsapp: "",
    email: "",
    gst_number: "",
    vendor_type: "",
    supply_city: "",
    business_type: "",
    city: "",
    address: "",
    is_active: true,
    remarks: ""
  },
  
  // Validation Errors
  formErrors: {},
  
  // Loading States for UI actions
  isSubmitting: false,
};

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    // Modal Controls
    openAddForm: (state) => {
      state.showAddForm = true;
      state.formErrors = {};
      state.formData = initialState.formData;
    },
    closeAddForm: (state) => {
      state.showAddForm = false;
      state.formData = initialState.formData;
      state.formErrors = {};
    },
    openEditForm: (state, action) => {
      const vendor = action.payload;
      state.showEditForm = true;
      state.selectedVendor = vendor;
      state.formData = {
        company_name: vendor.company_name || "",
        contact_person: vendor.contact_person || "",
        phone: vendor.phone || "",
        whatsapp: vendor.whatsapp || "",
        email: vendor.email || "",
        gst_number: vendor.gst_number || "",
        vendor_type: vendor.vendor_type || "",
        supply_city: vendor.supply_city || "",
        business_type: vendor.business_type || "",
        city: vendor.city || "",
        address: vendor.address || "",
        is_active: vendor.is_active ?? true,
        remarks: vendor.remarks || ""
      };
      state.formErrors = {};
    },
    closeEditForm: (state) => {
      state.showEditForm = false;
      state.selectedVendor = null;
      state.formData = initialState.formData;
      state.formErrors = {};
    },
    openDetailsModal: (state, action) => {
      state.showDetailsModal = true;
      state.selectedVendor = action.payload;
    },
    closeDetailsModal: (state) => {
      state.showDetailsModal = false;
      state.selectedVendor = null;
    },
    
    // Form Management
    updateFormData: (state, action) => {
      const payload = action.payload;

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        state.formData = { ...state.formData, ...payload };

        // Clear error for this field when user types
        const fieldName = Object.keys(payload)[0];
        if (fieldName && state.formErrors[fieldName]) {
          delete state.formErrors[fieldName];
        }
      }
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    
    // Filters & Search
    setSearch: (state, action) => {
      state.search = action.payload;
      state.currentPage = 1; // Reset to first page on search
    },
    setBusinessTypeFilter: (state, action) => {
      state.businessTypeFilter = action.payload;
      state.currentPage = 1;
    },
    setCityFilter: (state, action) => {
      state.cityFilter = action.payload;
      state.currentPage = 1;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
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
      state.businessTypeFilter = "";
      state.cityFilter = "";
      state.activeFilter = "";
      state.currentPage = 1;
    },
    
    // Submitting state
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload;
    },
  },
});

export const {
  openAddForm,
  closeAddForm,
  openEditForm,
  closeEditForm,
  openDetailsModal,
  closeDetailsModal,
  updateFormData,
  setFormErrors,
  clearFormErrors,
  setSearch,
  setBusinessTypeFilter,
  setCityFilter,
  setActiveFilter,
  setCurrentPage,
  setPageSize,
  resetFilters,
  setSubmitting,
} = vendorSlice.actions;

export default vendorSlice.reducer;