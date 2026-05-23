// TABS/TRANSFERS/ShopToShopTab.jsx
//
// Shop to Shop Transfer using real API
// POST /stock-transfer/transfer/shop-to-shop
// Only SHOP_OWNER can transfer from their own shop

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useGetShopsQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import { useGetProductStocksQuery  } from "../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetStockLedgerQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";
import { useShopToShopTransferMutation } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";
import {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setFromLocation,
    setToLocation,
    setReason,
    setShowForm,
    setIsSubmitting,
    setIdempotencyKey,
    resetForm,
    setFormErrors,
    clearFormErrors,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferSlice";
import { CURRENT_USER, isAdmin, isWarehouseRole } from "../../../Components/roles";
import TransferCartTable from "./TransferShared/TransferCartTable";
import TransferFormHeader from "./TransferShared/TransferFormHeader";
import TransferStatusBadge from "./TransferShared/TransferStatusBadge";
import { generateIdempotencyKey } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";

export default function ShopToShopTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { cart, fromLocation, toLocation, reason, showForm, isSubmitting, formErrors } = useSelector((state) => state.transfer);

    const [searchTerm, setSearchTerm] = useState("");
    // Use transferHistory from the query instead of transfers state
    const [transfers, setTransfers] = useState([]);
    const { refetch: refetchHistory } = useGetStockLedgerQuery({
        movement_type: "SHOP_TO_SHOP",
        from_date: "",
        to_date: "",
        page: 1,
        limit: 50,
    });

    // Then in table, use: transferHistory?.ledger || []

    // ── Queries ─────────────────────────────────────────────────────────────
    const { data: shopsData, refetch: refetchShops } = useGetShopsQuery({ page: 1, limit: 100, is_active: "true" });
    // Note: Shop stocks API not ready yet — using product-stocks as fallback (shows warehouse stock, not shop stock)
    const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 50 });

    const [shopToShopTransfer] = useShopToShopTransferMutation();

    const shops = shopsData?.shops || [];
    const allStocks = stocksData?.stocks || [];

    // Get user's shop ID for SHOP_OWNER role
    const userShopId = user?.shop_id || "";
    const isShopOwner = user?.role === "SHOP_OWNER";

    // Filter shops (exclude self for destination)
    const fromShopOptions = isAdmin() ? shops : shops.filter(s => s.shop_id === userShopId);
    const toShopOptions = shops.filter(s => s.shop_id !== fromLocation);

    // Auto-select for SHOP_OWNER
    useEffect(() => {
        if (isShopOwner && userShopId) {
            dispatch(setFromLocation(userShopId));
        }
    }, [isShopOwner, userShopId]);

    // Fetch transfer history
    const { data: transferHistory } = useGetStockLedgerQuery({
        movement_type: "SHOP_TO_SHOP",  // or "SHOP_TO_SHOP", "WH_TO_WH"
        from_date: "",
        to_date: "",
        page: 1,
        limit: 50,
    });

    const validateForm = () => {
        const errors = {};
        if (!fromLocation) errors.from = "Source shop is required";
        if (!toLocation) errors.to = "Destination shop is required";
        if (fromLocation === toLocation) errors.to = "Source and destination cannot be the same";
        if (!reason?.trim()) errors.reason = "Reason is required";
        if (cart.length === 0) errors.cart = "At least one item is required";
        return errors;
    };

    const handleSubmitTransfer = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            dispatch(setFormErrors(errors));
            toast.error("Please fix the errors before submitting");
            return;
        }

        dispatch(setIsSubmitting(true));
        dispatch(clearFormErrors());

        const idempotencyKey = generateIdempotencyKey();
        dispatch(setIdempotencyKey(idempotencyKey));

        try {
            for (const item of cart) {
                await shopToShopTransfer({
                    idempotencyKey: `${idempotencyKey}_${item.variant_id}`,
                    from_shop_id: fromLocation,
                    to_shop_id: toLocation,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    remarks: reason,
                }).unwrap();
            }

            toast.success(`Transfer completed: ${cart.reduce((s, i) => s + i.quantity, 0)} units transferred`);

            const newTransfer = {
                id: `TR-${Date.now()}`,
                transferNumber: `STS-${Date.now().toString().slice(-6)}`,
                type: "SHOP_TO_SHOP",
                fromShopId: fromLocation,
                fromShopName: shops.find(s => s.shop_id === fromLocation)?.shop_name,
                toShopId: toLocation,
                toShopName: shops.find(s => s.shop_id === toLocation)?.shop_name,
                items: cart,
                status: "completed",
                createdAt: new Date().toISOString().split("T")[0],
                reason: reason,
            };

            // No localStorage — transfer already in backend, just refetch
            refetchStocks();

            dispatch(resetForm());
            dispatch(setShowForm(false));

        } catch (err) {
            toast.error(err?.data?.message || "Transfer failed. Please try again.");
            if (err?.data?.errors?.length) {
                const backendErrors = {};
                err.data.errors.forEach(({ field, message }) => {
                    backendErrors[field] = message;
                });
                dispatch(setFormErrors(backendErrors));
            }
        } finally {
            dispatch(setIsSubmitting(false));
        }
    };

    // Note: Shop stocks API not ready — showing placeholder
    const handleAddToCart = (product) => {
        dispatch(addToCart({
            variant_id: product.id,
            product_name: product.name,
            available_stock: product.availableStock || 100,
            batch_number: "",
            unit: "Pcs",
        }));
    };

    const handleCancelForm = () => {
        dispatch(resetForm());
        dispatch(setShowForm(false));
        dispatch(clearFormErrors());
    };

    const getShopName = (id) => shops.find(s => s.shop_id === id)?.shop_name || id;

    return (
        <div className="space-y-5">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Shop → Shop Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Transfer stock between shops. Stock is deducted immediately.
                    </p>
                </div>
                <button
                    onClick={() => {
                        dispatch(resetForm());
                        dispatch(setShowForm(!showForm));
                        dispatch(clearFormErrors());
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                >
                    <Plus size={16} /> New Transfer
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm text-gray-700">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Create Shop Transfer</p>

                    <TransferFormHeader
                        fromLabel="From Shop"
                        toLabel="To Shop"
                        fromValue={fromLocation}
                        toValue={toLocation}
                        onFromChange={(val) => {
                            dispatch(setFromLocation(val));
                            dispatch(clearCart());
                        }}
                        onToChange={(val) => dispatch(setToLocation(val))}
                        fromOptions={fromShopOptions.map(s => ({ id: s.shop_id, name: s.shop_name, city: s.city }))}
                        toOptions={toShopOptions.map(s => ({ id: s.shop_id, name: s.shop_name, city: s.city }))}
                        fromDisabled={isShopOwner}
                        toDisabled={false}
                        fromPlaceholder="Select source shop"
                        toPlaceholder="Select destination shop"
                        showReason={true}
                        reasonValue={reason}
                        onReasonChange={(val) => dispatch(setReason(val))}
                        errors={formErrors}
                    />

                    {/* Note about shop stocks API */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-700">
                            ⚠️ Shop stock API is under development. Please use warehouse transfer for now.
                        </p>
                    </div>

                    <TransferCartTable
                        cart={cart}
                        onUpdateQuantity={(id, qty) => dispatch(updateCartQuantity({ variant_id: id, quantity: qty }))}
                        onRemoveItem={(id) => dispatch(removeFromCart(id))}
                    />

                    {formErrors.cart && <p className="text-xs text-red-500">{formErrors.cart}</p>}

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={handleCancelForm} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitTransfer}
                            disabled={isSubmitting || cart.length === 0}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? "Processing..." : "Submit Transfer"}
                        </button>
                    </div>
                </div>
            )}

            {/* Transfer History */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">Shop-to-Shop Transfers</h3>
                    <button onClick={() => {
                        const stored = localStorage.getItem("vyapar_shop_to_shop_transfers");
                        setTransfers(stored ? JSON.parse(stored) : []);
                    }} className="text-xs text-gray-500 hover:text-blue-600">
                        <RefreshCw size={14} />
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Transfer #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">From Shop</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">To Shop</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transfers.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No transfers yet</td></tr>
                        ) : (
                            transfers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.transferNumber}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{t.fromShopName || getShopName(t.fromShopId)}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.toShopName || getShopName(t.toShopId)}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">{t.items?.length || 0}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.createdAt}</td>
                                    <td className="px-4 py-3"><TransferStatusBadge status={t.status} /></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}