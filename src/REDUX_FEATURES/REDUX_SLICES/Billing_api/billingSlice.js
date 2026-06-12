// REDUX_SLICES/Billing_api/billingSlice.js
//
// UI State for Billing Tab
// Manages: cart, customer selection, bill type, payment method
// UPDATED: Bill type values to match backend enum (GST_INVOICE | NON_GST_INVOICE)

import { createSlice } from "@reduxjs/toolkit";
import { aggregateCartTax } from "../../../utils/billingTax";
import { BILL_TYPES } from "../../../constants/billingBillTypes";
import { calculateGstOnAmount } from "../../../utils/billingCart.utils";

// Helper: calculate line total
const calculateLineTotal = (unit_price, quantity) => unit_price * quantity;

const applyLineGst = (item, billType) => {
    if (
        billType !== BILL_TYPES.WITH_GST ||
        billType === BILL_TYPES.ESTIMATE ||
        item.gst_type === "EXEMPT"
    ) {
        item.gst_amount = 0;
        return;
    }
    item.gst_amount = calculateGstOnAmount(item.line_total, item.gst_percent);
};

const initialState = {
    // Cart items
    cart: [],

    // Customer selection
    selectedCustomer: null,
    customerMobileInput: "",

    billType: BILL_TYPES.WITHOUT_GST,
    paymentMethod: "CASH",
    salesChannel: "WALK_IN",

    shopName: "",

    // UI state
    showVariantPicker: false,
    variantPickerTarget: null,
    showCreateCustomer: false,
    lastCreatedBill: null,
};

const billingSlice = createSlice({
    name: "billing",
    initialState,
    reducers: {
        // ── Cart Actions ─────────────────────────────────────────────
        addToCart: (state, action) => {
            const variant = action.payload;
            const existing = state.cart.find(item => item.variant_id === variant.variant_id);

            // Check stock limit
            const currentQty = existing ? existing.quantity : 0;
            if (currentQty + 1 > variant.quantity_available) {
                // Will be handled by component with toast
                return;
            }

            if (existing) {
                existing.quantity += 1;
                existing.line_total = calculateLineTotal(existing.unit_price, existing.quantity);
                applyLineGst(existing, state.billType);
            } else {
                const newItem = {
                    variant_id: variant.variant_id,
                    product_name: variant.product_name,
                    system_barcode: variant.system_barcode,
                    quantity: 1,
                    price_type: variant.price_type || "SPECIAL",
                    unit_price: variant.unit_price,
                    retail_price: variant.retail_price,
                    wholesale_price: variant.wholesale_price,
                    special_price: variant.special_price,
                    mrp: variant.mrp,
                    online_price: variant.online_price,
                    gst_percent: variant.gst_percent,
                    gst_type: variant.gst_type || "CGST_SGST",
                    hsn_code: variant.hsn_code ?? variant.product?.hsn_code ?? null,
                    quantity_available: variant.quantity_available,
                    line_total: variant.unit_price,
                    gst_amount: 0,
                };
                applyLineGst(newItem, state.billType);
                state.cart.push(newItem);
            }
        },

        removeFromCart: (state, action) => {
            const variantId = action.payload;
            state.cart = state.cart.filter(item => item.variant_id !== variantId);
        },

        updateCartQty: (state, action) => {
            const { variant_id, quantity } = action.payload;
            const item = state.cart.find(i => i.variant_id === variant_id);
            if (item) {
                const newQty = Math.max(0, quantity);
                if (newQty === 0) {
                    state.cart = state.cart.filter(i => i.variant_id !== variant_id);
                } else if (newQty <= item.quantity_available) {
                    item.quantity = newQty;
                    item.line_total = calculateLineTotal(item.unit_price, item.quantity);
                    applyLineGst(item, state.billType);
                }
            }
        },

        updatePriceType: (state, action) => {
            const { variant_id, price_type } = action.payload;
            const item = state.cart.find(i => i.variant_id === variant_id);
            if (item) {
                let newPrice = 0;
                switch (price_type) {
                    case "SPECIAL":
                        newPrice = item.special_price ?? item.retail_price;
                        break;
                    case "RETAIL":
                        newPrice = item.retail_price;
                        break;
                    case "WHOLESALE":
                        newPrice = item.wholesale_price;
                        break;
                    case "MRP":
                        newPrice = item.mrp;
                        break;
                    case "ONLINE":
                        newPrice = item.online_price;
                        break;
                    default:
                        newPrice = item.special_price ?? item.retail_price;
                }
                item.price_type = price_type;
                item.unit_price = newPrice;
                item.line_total = calculateLineTotal(item.unit_price, item.quantity);
                applyLineGst(item, state.billType);
            }
        },

        clearCart: (state) => {
            state.cart = [];
        },

        /** Re-apply GST math on all lines (e.g. after formula fix or page reload). */
        recalculateCartGst: (state) => {
            state.cart.forEach((item) => applyLineGst(item, state.billType));
        },

        // ── Customer Actions ─────────────────────────────────────────
        setSelectedCustomer: (state, action) => {
            state.selectedCustomer = action.payload;
            if (action.payload) {
                state.customerMobileInput = action.payload.mobile || "";
            }
        },

        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
            state.customerMobileInput = "";
        },

        setCustomerMobileInput: (state, action) => {
            state.customerMobileInput = action.payload;
            // Clear selected customer when mobile changes
            if (state.selectedCustomer && state.selectedCustomer.mobile !== action.payload) {
                state.selectedCustomer = null;
            }
        },

        // ── Bill Settings ────────────────────────────────────────────
        setBillType: (state, action) => {
            state.billType = action.payload;
            state.cart.forEach((item) => applyLineGst(item, state.billType));
        },

        setBillingShopContext: (state, action) => {
            state.shopName = action.payload?.shop_name || "";
        },

        setPaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
        },

        // ── UI State ─────────────────────────────────────────────────
        openVariantPicker: (state, action) => {
            state.showVariantPicker = true;
            state.variantPickerTarget = action.payload;
        },

        closeVariantPicker: (state) => {
            state.showVariantPicker = false;
            state.variantPickerTarget = null;
        },

        openCreateCustomer: (state) => {
            state.showCreateCustomer = true;
        },

        closeCreateCustomer: (state) => {
            state.showCreateCustomer = false;
        },

        setLastCreatedBill: (state, action) => {
            state.lastCreatedBill = action.payload;
        },

        clearLastCreatedBill: (state) => {
            state.lastCreatedBill = null;
        },
    },
});

// ── Selectors (computed values) ─────────────────────────────────────
export const selectCartSubtotal = (state) => {
    return state.billing.cart.reduce((sum, item) => sum + item.line_total, 0);
};

export const selectCartGst = (state) => {
    if (state.billing.billType !== BILL_TYPES.WITH_GST) return 0;
    return state.billing.cart.reduce((sum, item) => sum + (item.gst_amount || 0), 0);
};

export const selectCartTotal = (state) => {
    return selectCartSubtotal(state) + selectCartGst(state);
};

export const selectCartItemCount = (state) => {
    return state.billing.cart.reduce((sum, item) => sum + item.quantity, 0);
};

export const selectCartTaxSummary = (state) => {
    const { cart, billType } = state.billing;
    return aggregateCartTax(cart, billType);
};

export const {
    addToCart,
    removeFromCart,
    updateCartQty,
    updatePriceType,
    clearCart,
    recalculateCartGst,
    setSelectedCustomer,
    clearSelectedCustomer,
    setCustomerMobileInput,
    setBillType,
    setBillingShopContext,
    setPaymentMethod,
    openVariantPicker,
    closeVariantPicker,
    openCreateCustomer,
    closeCreateCustomer,
    setLastCreatedBill,
    clearLastCreatedBill,
} = billingSlice.actions;

export default billingSlice.reducer;