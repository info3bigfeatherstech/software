// TABS/SALES/BillingTab.jsx
//
// Main Billing Tab - Thin orchestrator
// Composes ProductPicker, CustomerSearch, CartPanel, CheckoutPanel

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyShopQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import { setBillingShopContext, recalculateCartGst } from "../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";
import ProductPicker from "./BillingTab_Compo/ProductPicker";
import CustomerSearch from "./BillingTab_Compo/CustomerSearch";
import CartPanel from "./BillingTab_Compo/CartPanel";
import CheckoutPanel from "./BillingTab_Compo/CheckoutPanel";
import VariantPickerModal from "./BillingTab_Compo/VariantPickerModal";
import CreateCustomerModal from "./BillingTab_Compo/CreateCustomerModal";

export default function BillingTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const shop_id = user?.shop_id || "";
    const { data: myShop } = useGetMyShopQuery(undefined, { skip: !shop_id });

    useEffect(() => {
        if (myShop) {
            dispatch(setBillingShopContext({ shop_name: myShop.shop_name }));
        }
    }, [myShop, dispatch]);

    useEffect(() => {
        dispatch(recalculateCartGst());
    }, [dispatch]);

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