// TABS/TRANSFERS/WHToWHTab.jsx
//
// Warehouse to Warehouse Transfer using real API
// POST /stock-transfer/transfer/wh-to-wh

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useGetWarehousesQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import { useGetProductStocksQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetStockLedgerQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";
import { useWhToWhTransferMutation } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";
import {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    setFromLocation,
    setToLocation,
    setReason,
    setRemarks,
    setShowForm,
    setIsSubmitting,
    setIdempotencyKey,
    resetForm,
    setFormErrors,
    clearFormErrors,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferSlice";
import { CURRENT_USER, isAdmin, isWarehouseRole } from "../../roles";
import TransferCartTable from "./TransferShared/TransferCartTable";
import TransferFormHeader from "./TransferShared/TransferFormHeader";
import TransferStatusBadge from "./TransferShared/TransferStatusBadge";
import { generateIdempotencyKey } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";

export default function WHToWHTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { cart, fromLocation, toLocation, reason, remarks, showForm, isSubmitting, formErrors } = useSelector((state) => state.transfer);
    const fmtDate = (iso) => {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };
    const [searchTerm, setSearchTerm] = useState("");
    // Use transferHistory from the query instead of transfers state
    const { refetch: refetchHistory } = useGetStockLedgerQuery({
        movement_type: "WH_TO_WH",
        from_date: "",
        to_date: "",
        page: 1,
        limit: 50,
    });

    // Then in table, use: transferHistory?.ledger || []

    const { data: warehousesData, refetch: refetchWarehouses } = useGetWarehousesQuery({ page: 1, limit: 100, is_active: "true" });
    const { data: stocksData, refetch: refetchStocks } = useGetProductStocksQuery({ page: 1, limit: 50 });

    const [whToWhTransfer] = useWhToWhTransferMutation();

    const warehouses = warehousesData?.warehouses || [];
    const stocks = stocksData?.stocks || [];

    const fromWarehouseOptions = isAdmin() ? warehouses : warehouses.filter(w => w.warehouse_id === user?.warehouse_id);
    const toWarehouseOptions = warehouses.filter(w => w.warehouse_id !== fromLocation);

    const availableProducts = fromLocation
        ? stocks.filter(s => s.warehouse_id === fromLocation && s.quantity > 0)
        : [];

    const filteredProducts = availableProducts.filter(p =>
        p.variant?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variant?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (!isAdmin() && isWarehouseRole() && user?.warehouse_id) {
            dispatch(setFromLocation(user.warehouse_id));
        }
    }, [user]);

    const { data: transferHistory } = useGetStockLedgerQuery({
        movement_type: "WH_TO_WH",  // or "SHOP_TO_SHOP", "WH_TO_WH"
        from_date: "",
        to_date: "",
        page: 1,
        limit: 50,
    });
    const validateForm = () => {
        const errors = {};
        if (!fromLocation) errors.from = "Source warehouse is required";
        if (!toLocation) errors.to = "Destination warehouse is required";
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
                await whToWhTransfer({
                    idempotencyKey: `${idempotencyKey}_${item.variant_id}`,
                    from_warehouse_id: fromLocation,
                    to_warehouse_id: toLocation,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    batch_number: item.batch_number || "",
                    room_zone: "",
                    rack_shelf: "",
                    position: "",
                    remarks: remarks || reason,
                }).unwrap();
            }

            toast.success(`Transfer completed: ${cart.reduce((s, i) => s + i.quantity, 0)} units transferred`);

            const newTransfer = {
                id: `TR-${Date.now()}`,
                transferNumber: `WTW-${Date.now().toString().slice(-6)}`,
                type: "WH_TO_WH",
                fromWarehouseId: fromLocation,
                fromWarehouseName: warehouses.find(w => w.warehouse_id === fromLocation)?.warehouse_name,
                toWarehouseId: toLocation,
                toWarehouseName: warehouses.find(w => w.warehouse_id === toLocation)?.warehouse_name,
                items: cart,
                status: "completed",
                createdAt: new Date().toISOString().split("T")[0],
                reason: reason,
                remarks: remarks,
            };

            // No localStorage — transfer already in backend, just refetch
            refetchStocks();

            dispatch(resetForm());
            dispatch(setShowForm(false));
            refetchStocks();

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

    const handleAddToCart = (stock) => {
        dispatch(addToCart({
            variant_id: stock.variant_id,
            product_name: stock.variant?.product?.name || "Unknown Product",
            available_stock: stock.quantity,
            batch_number: stock.batch_number,
            unit: "Pcs",
        }));
    };

    const handleCancelForm = () => {
        dispatch(resetForm());
        dispatch(setShowForm(false));
        dispatch(clearFormErrors());
    };

    const getWarehouseName = (id) => warehouses.find(w => w.warehouse_id === id)?.warehouse_name || id;

    return (
        <div className="space-y-5">

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">WH → WH Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Transfer stock between warehouses. Stock is deducted immediately from source.
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
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Request WH → WH Transfer</p>

                    <TransferFormHeader
                        fromLabel="From Warehouse"
                        toLabel="To Warehouse"
                        fromValue={fromLocation}
                        toValue={toLocation}
                        onFromChange={(val) => {
                            dispatch(setFromLocation(val));
                            dispatch(clearCart());
                        }}
                        onToChange={(val) => dispatch(setToLocation(val))}
                        fromOptions={fromWarehouseOptions.map(w => ({ id: w.warehouse_id, name: w.warehouse_name, city: w.city }))}
                        toOptions={toWarehouseOptions.map(w => ({ id: w.warehouse_id, name: w.warehouse_name, city: w.city }))}
                        fromDisabled={!isAdmin() && isWarehouseRole()}
                        toDisabled={false}
                        fromPlaceholder="Select source warehouse"
                        toPlaceholder="Select destination warehouse"
                        showReason={true}
                        reasonValue={reason}
                        onReasonChange={(val) => dispatch(setReason(val))}
                        showRemarks={true}
                        remarksValue={remarks}
                        onRemarksChange={(val) => dispatch(setRemarks(val))}
                        remarksPlaceholder="Additional notes about this transfer"
                        errors={formErrors}
                    />

                    {fromLocation && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Select Products</label>
                            <div className="relative mb-3">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by product name or SKU..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                                {filteredProducts.length === 0 ? (
                                    <p className="col-span-4 text-center text-xs text-gray-400 py-4">No products available in this warehouse</p>
                                ) : (
                                    filteredProducts.map(p => (
                                        <button
                                            key={p.stock_id}
                                            onClick={() => handleAddToCart(p)}
                                            disabled={p.quantity === 0}
                                            className={`text-left p-2 rounded-lg text-xs border transition-colors cursor-pointer ${p.quantity === 0
                                                    ? "opacity-40 bg-gray-100 cursor-not-allowed"
                                                    : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <p className="font-medium text-gray-800 truncate">{p.variant?.product?.name || "Unknown"}</p>
                                            <p className="text-xs text-gray-400 font-mono truncate">{p.variant?.sku}</p>
                                            <p className={`text-xs font-semibold mt-1 ${p.quantity <= 10 ? "text-red-500" : "text-green-600"}`}>
                                                Stock: {p.quantity}
                                            </p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

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

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">WH → WH Transfer Log</h3>
                    <button onClick={() => refetchHistory()} className="text-xs text-gray-500 hover:text-blue-600">
                        <RefreshCw size={14} />
                    </button>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Transfer #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">From WH</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">To WH</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {!transferHistory?.ledger?.length ? (
    <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">No inter-warehouse transfers yet</td></tr>
) : (
    transferHistory.ledger.map((entry, idx) => (
        <tr key={entry.ledger_id || idx} className="hover:bg-gray-50">
            <td className="px-4 py-3 font-mono text-xs text-gray-500">WTW-{entry.created_at?.slice(0,10)}</td>
            <td className="px-4 py-3 font-medium text-gray-700">{getWarehouseName(entry.from_warehouse_id)}</td>
            <td className="px-4 py-3 text-gray-600">{getWarehouseName(entry.to_warehouse_id)}</td>
            <td className="px-4 py-3 text-center text-gray-500">{Math.abs(entry.quantity)}</td>
            <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(entry.created_at)}</td>
            <td className="px-4 py-3"><TransferStatusBadge status="completed" /></td>
        </tr>
    ))
)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}