// REDUX_SLICES/Billing_api/billingSlice.js
//
// UI State for Billing Tab
// Manages: cart, customer selection, bill type, payment method
// UPDATED: Bill type values to match backend enum (GST_INVOICE | NON_GST_INVOICE)

import { createSlice } from "@reduxjs/toolkit";

// Helper: calculate line total
const calculateLineTotal = (unit_price, quantity) => unit_price * quantity;

// Helper: calculate GST for an item (0 if billType is NON_GST_INVOICE)
const calculateItemGst = (lineTotal, gstPercent, billType) => {
    if (billType !== "GST_INVOICE") return 0;
    return (lineTotal * gstPercent) / 100;
};

const initialState = {
    // Cart items
    cart: [],

    // Customer selection
    selectedCustomer: null,
    customerMobileInput: "",

    // Bill settings - UPDATED: "NON_GST_INVOICE" instead of "ESTIMATE"
    billType: "GST_INVOICE",     // "GST_INVOICE" | "NON_GST_INVOICE"
    paymentMethod: "CASH",       // "CASH" | "UPI" | "CARD"
    salesChannel: "WALK_IN",

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
                existing.gst_amount = calculateItemGst(existing.line_total, existing.gst_percent, state.billType);
            } else {
                state.cart.push({
                    variant_id: variant.variant_id,
                    product_name: variant.product_name,
                    system_barcode: variant.system_barcode,
                    quantity: 1,
                    price_type: variant.price_type || "SPECIAL", // UPDATED: default to SPECIAL
                    unit_price: variant.unit_price,
                    retail_price: variant.retail_price,
                    wholesale_price: variant.wholesale_price,
                    special_price: variant.special_price,
                    mrp: variant.mrp,
                    online_price: variant.online_price,
                    gst_percent: variant.gst_percent,
                    quantity_available: variant.quantity_available,
                    line_total: variant.unit_price,
                    gst_amount: calculateItemGst(variant.unit_price, variant.gst_percent, state.billType),
                });
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
                    item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
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
                item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
            }
        },

        clearCart: (state) => {
            state.cart = [];
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
            // Recalculate GST for all items when bill type changes
            state.cart.forEach(item => {
                item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
            });
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
    if (state.billing.billType !== "GST_INVOICE") return 0;
    return state.billing.cart.reduce((sum, item) => sum + (item.gst_amount || 0), 0);
};

export const selectCartTotal = (state) => {
    return selectCartSubtotal(state) + selectCartGst(state);
};

export const selectCartItemCount = (state) => {
    return state.billing.cart.reduce((sum, item) => sum + item.quantity, 0);
};

export const {
    addToCart,
    removeFromCart,
    updateCartQty,
    updatePriceType,
    clearCart,
    setSelectedCustomer,
    clearSelectedCustomer,
    setCustomerMobileInput,
    setBillType,
    setPaymentMethod,
    openVariantPicker,
    closeVariantPicker,
    openCreateCustomer,
    closeCreateCustomer,
    setLastCreatedBill,
    clearLastCreatedBill,
} = billingSlice.actions;

export default billingSlice.reducer;

// // REDUX_SLICES/Billing_api/billingSlice.js
// //
// // UI State for Billing Tab
// // Manages: cart, customer selection, bill type, payment method

// import { createSlice } from "@reduxjs/toolkit";

// // Helper: calculate line total
// const calculateLineTotal = (unit_price, quantity) => unit_price * quantity;

// // Helper: calculate GST for an item (0 if billType is ESTIMATE)
// const calculateItemGst = (lineTotal, gstPercent, billType) => {
//     if (billType !== "GST_INVOICE") return 0;
//     return (lineTotal * gstPercent) / 100;
// };

// const initialState = {
//     // Cart items
//     cart: [],

//     // Customer selection
//     selectedCustomer: null,
//     customerMobileInput: "",

//     // Bill settings
//     billType: "GST_INVOICE",     // "GST_INVOICE" | "ESTIMATE"
//     paymentMethod: "CASH",       // "CASH" | "UPI" | "CARD"
//     salesChannel: "WALK_IN",

//     // UI state
//     showVariantPicker: false,
//     variantPickerTarget: null,
//     showCreateCustomer: false,
//     lastCreatedBill: null,
// };

// const billingSlice = createSlice({
//     name: "billing",
//     initialState,
//     reducers: {
//         // ── Cart Actions ─────────────────────────────────────────────
//         addToCart: (state, action) => {
//             const variant = action.payload;
//             const existing = state.cart.find(item => item.variant_id === variant.variant_id);

//             // Check stock limit
//             const currentQty = existing ? existing.quantity : 0;
//             if (currentQty + 1 > variant.quantity_available) {
//                 // Will be handled by component with toast
//                 return;
//             }

//             if (existing) {
//                 existing.quantity += 1;
//                 existing.line_total = calculateLineTotal(existing.unit_price, existing.quantity);
//                 existing.gst_amount = calculateItemGst(existing.line_total, existing.gst_percent, state.billType);
//             } else {
//                 state.cart.push({
//                     variant_id: variant.variant_id,
//                     product_name: variant.product_name,
//                     system_barcode: variant.system_barcode,
//                     quantity: 1,
//                     price_type: variant.price_type || "RETAIL",
//                     unit_price: variant.unit_price,
//                     retail_price: variant.retail_price,
//                     wholesale_price: variant.wholesale_price,
//                     mrp: variant.mrp,
//                     online_price: variant.online_price,
//                     gst_percent: variant.gst_percent,
//                     quantity_available: variant.quantity_available,
//                     line_total: variant.unit_price,
//                     gst_amount: calculateItemGst(variant.unit_price, variant.gst_percent, state.billType),
//                 });
//             }
//         },

//         removeFromCart: (state, action) => {
//             const variantId = action.payload;
//             state.cart = state.cart.filter(item => item.variant_id !== variantId);
//         },

//         updateCartQty: (state, action) => {
//             const { variant_id, quantity } = action.payload;
//             const item = state.cart.find(i => i.variant_id === variant_id);
//             if (item) {
//                 const newQty = Math.max(0, quantity);
//                 if (newQty === 0) {
//                     state.cart = state.cart.filter(i => i.variant_id !== variant_id);
//                 } else if (newQty <= item.quantity_available) {
//                     item.quantity = newQty;
//                     item.line_total = calculateLineTotal(item.unit_price, item.quantity);
//                     item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
//                 }
//             }
//         },

//         updatePriceType: (state, action) => {
//             const { variant_id, price_type } = action.payload;
//             const item = state.cart.find(i => i.variant_id === variant_id);
//             if (item) {
//                 let newPrice = 0;
//                 switch (price_type) {
//                     case "RETAIL":
//                         newPrice = item.retail_price;
//                         break;
//                     case "WHOLESALE":
//                         newPrice = item.wholesale_price;
//                         break;
//                     case "MRP":
//                         newPrice = item.mrp;
//                         break;
//                     case "ONLINE":
//                         newPrice = item.online_price;
//                         break;
//                     default:
//                         newPrice = item.retail_price;
//                 }
//                 item.price_type = price_type;
//                 item.unit_price = newPrice;
//                 item.line_total = calculateLineTotal(item.unit_price, item.quantity);
//                 item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
//             }
//         },

//         clearCart: (state) => {
//             state.cart = [];
//         },

//         // ── Customer Actions ─────────────────────────────────────────
//         setSelectedCustomer: (state, action) => {
//             state.selectedCustomer = action.payload;
//             if (action.payload) {
//                 state.customerMobileInput = action.payload.mobile || "";
//             }
//         },

//         clearSelectedCustomer: (state) => {
//             state.selectedCustomer = null;
//             state.customerMobileInput = "";
//         },

//         setCustomerMobileInput: (state, action) => {
//             state.customerMobileInput = action.payload;
//             // Clear selected customer when mobile changes
//             if (state.selectedCustomer && state.selectedCustomer.mobile !== action.payload) {
//                 state.selectedCustomer = null;
//             }
//         },

//         // ── Bill Settings ────────────────────────────────────────────
//         setBillType: (state, action) => {
//             state.billType = action.payload;
//             // Recalculate GST for all items when bill type changes
//             state.cart.forEach(item => {
//                 item.gst_amount = calculateItemGst(item.line_total, item.gst_percent, state.billType);
//             });
//         },

//         setPaymentMethod: (state, action) => {
//             state.paymentMethod = action.payload;
//         },

//         // ── UI State ─────────────────────────────────────────────────
//         openVariantPicker: (state, action) => {
//             state.showVariantPicker = true;
//             state.variantPickerTarget = action.payload;
//         },

//         closeVariantPicker: (state) => {
//             state.showVariantPicker = false;
//             state.variantPickerTarget = null;
//         },

//         openCreateCustomer: (state) => {
//             state.showCreateCustomer = true;
//         },

//         closeCreateCustomer: (state) => {
//             state.showCreateCustomer = false;
//         },

//         setLastCreatedBill: (state, action) => {
//             state.lastCreatedBill = action.payload;
//         },

//         clearLastCreatedBill: (state) => {
//             state.lastCreatedBill = null;
//         },
//     },
// });

// // ── Selectors (computed values) ─────────────────────────────────────
// export const selectCartSubtotal = (state) => {
//     return state.billing.cart.reduce((sum, item) => sum + item.line_total, 0);
// };

// export const selectCartGst = (state) => {
//     if (state.billing.billType !== "GST_INVOICE") return 0;
//     return state.billing.cart.reduce((sum, item) => sum + (item.gst_amount || 0), 0);
// };

// export const selectCartTotal = (state) => {
//     return selectCartSubtotal(state) + selectCartGst(state);
// };

// export const selectCartItemCount = (state) => {
//     return state.billing.cart.reduce((sum, item) => sum + item.quantity, 0);
// };

// export const {
//     addToCart,
//     removeFromCart,
//     updateCartQty,
//     updatePriceType,
//     clearCart,
//     setSelectedCustomer,
//     clearSelectedCustomer,
//     setCustomerMobileInput,
//     setBillType,
//     setPaymentMethod,
//     openVariantPicker,
//     closeVariantPicker,
//     openCreateCustomer,
//     closeCreateCustomer,
//     setLastCreatedBill,
//     clearLastCreatedBill,
// } = billingSlice.actions;

// export default billingSlice.reducer;