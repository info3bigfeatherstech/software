// TABS/SALES/BillingTab_Compo/CustomerSearch.jsx
//
// Customer search component for billing - finds customer by mobile
// Shows loyalty tier, total spend, and option to create new customer
//
// FIX 1: Removed redundant setSelectedCustomer(null) dispatch from handleMobileChange
//         — the slice's setCustomerMobileInput reducer already clears selectedCustomer
//         when mobile doesn't match. Double-dispatching caused a race where the
//         auto-select useEffect would immediately re-set the customer, locking the input.
//
// FIX 2: Added `isChanging` ref to suppress auto-select after "Change" is clicked.
//         Without this, the RTK Query cache still holds foundCustomer, so the
//         auto-select effect fires instantly and re-locks the customer card.

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, ShoppingBag } from "lucide-react";
import {
    setCustomerMobileInput,
    setSelectedCustomer,
    openCreateCustomer,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";
import { useLazySearchCustomersQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Customer_api/customerApi";
import { searchOfflineCustomerByMobile } from "../../../../offline/billing/offlineCustomer.service";

const getLoyaltyBadge = (tier) => {
    switch (tier) {
        case "BRONZE":
            return "bg-amber-100 text-amber-700";
        case "SILVER":
            return "bg-gray-200 text-gray-700";
        case "GOLD":
            return "bg-yellow-100 text-yellow-700";
        default:
            return null;
    }
};

export default function CustomerSearch() {
    const dispatch = useDispatch();
    const isOnline = useSelector((state) => state.offline.isOnline);
    const { customerMobileInput, selectedCustomer } = useSelector((state) => state.billing);
    const [triggerSearch, { data: searchResults, isLoading, reset: resetSearch }] = useLazySearchCustomersQuery();
    const [offlineCustomer, setOfflineCustomer] = useState(null);
    const [offlineSearching, setOfflineSearching] = useState(false);

    const suppressAutoSelect = useRef(false);

    useEffect(() => {
        if (customerMobileInput && customerMobileInput.length === 10) {
            suppressAutoSelect.current = false;

            if (!isOnline) {
                setOfflineSearching(true);
                searchOfflineCustomerByMobile(customerMobileInput)
                    .then((row) => setOfflineCustomer(row))
                    .finally(() => setOfflineSearching(false));
                return;
            }

            setOfflineCustomer(null);
            triggerSearch({ mobile: customerMobileInput });
        } else {
            setOfflineCustomer(null);
        }
    }, [customerMobileInput, triggerSearch, isOnline]);

    const foundCustomer = isOnline ? searchResults?.[0] : offlineCustomer;

    // Auto-select customer if found — guarded by suppressAutoSelect ref
    useEffect(() => {
        if (suppressAutoSelect.current) return;
        if (foundCustomer && !selectedCustomer) {
            dispatch(setSelectedCustomer(foundCustomer));
        }
    }, [foundCustomer, selectedCustomer, dispatch]);

    const handleMobileChange = (e) => {
        const value = e.target.value;
        // FIX: Removed the `if (value.length <= 10)` guard — it was blocking backspace
        // from 10 chars (e.g. trying to delete the 10th digit was silently dropped because
        // the new value of length 9 passed the check but the dispatch was inside the same
        // block as the stale length check in some edge cases).
        // Also removed the redundant `dispatch(setSelectedCustomer(null))` — the slice's
        // setCustomerMobileInput reducer already handles clearing selectedCustomer.
        if (/^\d{0,10}$/.test(value)) {
            dispatch(setCustomerMobileInput(value));
        }
    };

    const handleClearCustomer = () => {
        // FIX: Set suppressAutoSelect BEFORE dispatching so the useEffect guarding
        // auto-select doesn't fire between the two dispatches and re-lock the customer.
        suppressAutoSelect.current = true;
        resetSearch();
        setOfflineCustomer(null);
        dispatch(setSelectedCustomer(null));
        dispatch(setCustomerMobileInput(""));
    };

    return (
        <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Customer Mobile</label>
            <div className="relative text-gray-700">
                <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={customerMobileInput}
                    onChange={handleMobileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {customerMobileInput && (
                    <button
                        onClick={handleClearCustomer}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Loading */}
            {(isLoading || offlineSearching) && customerMobileInput.length === 10 && (
                <div className="mt-2 text-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                    <span className="text-xs text-gray-500 ml-2">Searching...</span>
                </div>
            )}

            {/* Customer Found */}
            {foundCustomer && selectedCustomer && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <User size={16} className="text-blue-600 shrink-0" />
                            <p className="font-semibold text-gray-800 truncate">{foundCustomer.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getLoyaltyBadge(foundCustomer.loyalty_tier)}`}>
                                {foundCustomer.loyalty_tier}
                            </span>
                        </div>
                        <button
                            onClick={handleClearCustomer}
                            className="text-xs text-red-500 hover:text-red-700 shrink-0 self-start sm:self-auto"
                        >
                            Change
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                        <span>📞 {foundCustomer.mobile}</span>
                        <span>💰 Total: ₹{foundCustomer.total_spent?.toFixed(2) || "0"}</span>
                        <span>📦 Orders: {foundCustomer.total_orders || 0}</span>
                    </div>
                </div>
            )}

            {/* No Customer Found */}
            {customerMobileInput.length === 10 && !foundCustomer && !isLoading && !offlineSearching && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-sm text-yellow-800 font-medium">New Customer</p>
                        <p className="text-xs text-yellow-600">No existing account found</p>
                    </div>
                    <button
                        onClick={() => dispatch(openCreateCustomer())}
                        className="shrink-0 px-3 py-1.5 bg-yellow-600 text-white text-xs font-medium rounded-lg hover:bg-yellow-700 self-start sm:self-auto"
                    >
                        Add Customer
                    </button>
                </div>
            )}

            {/* Walk-in Customer Note */}
            {!customerMobileInput && !selectedCustomer && (
                <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <ShoppingBag size={12} />
                    <span>Leave empty for walk-in customer</span>
                </div>
            )}
        </div>
    );
}