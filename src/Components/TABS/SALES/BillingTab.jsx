// TABS/SALES/BillingTab.jsx
//
// Main Billing Tab - Thin orchestrator
// Composes ProductPicker, CustomerSearch, CartPanel, CheckoutPanel

import React from "react";
import { useSelector } from "react-redux";
import ProductPicker from "./BillingTab_Compo/ProductPicker";
import CustomerSearch from "./BillingTab_Compo/CustomerSearch";
import CartPanel from "./BillingTab_Compo/CartPanel";
import CheckoutPanel from "./BillingTab_Compo/CheckoutPanel";
import VariantPickerModal from "./BillingTab_Compo/VariantPickerModal";
import CreateCustomerModal from "./BillingTab_Compo/CreateCustomerModal";

export default function BillingTab() {
    const { user } = useSelector((state) => state.auth);
    const shop_id = user?.shop_id || "";

    return (
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
            {/* Left Panel - Product Entry */}
            <div className="col-span-7 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
                <ProductPicker shop_id={shop_id} />
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="col-span-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
                <CustomerSearch />
                <CartPanel />
                <CheckoutPanel shop_id={shop_id} />
            </div>

            {/* Modals */}
            <VariantPickerModal />
            <CreateCustomerModal />
        </div>
    );
}