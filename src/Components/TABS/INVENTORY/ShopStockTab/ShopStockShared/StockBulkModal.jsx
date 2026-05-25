// TABS/INVENTORY/ShopStockShared/StockBulkModal.jsx
//
// Bulk update multiple shop stocks
// Supports: set, increment, decrement operations for multiple variants

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useBulkUpdateShopStocksMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
import {
    closeBulkModal,
    addBulkItem,
    removeBulkItem,
    updateBulkItem,
    clearBulkItems,
    setBulkErrors,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockSlice";
import { CURRENT_USER } from "../../../../roles";

export default function StockBulkModal({ onSuccess, stocks: propStocks, selectedStockIds: propSelectedStockIds }) {
    const dispatch = useDispatch();
    const { stocks, bulkItems, bulkErrors } = useSelector((state) => state.shopStock);
    const { user } = useSelector((state) => state.auth);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bulkUpdate] = useBulkUpdateShopStocksMutation();


    
    // Use passed stocks, or fallback to selected stocks from current page
    const availableStocks = (propStocks || []).filter(s => 
        propSelectedStockIds?.includes(s.shop_stock_id) && 
        !(bulkItems || []).find(i => i.variant_id === s.variant_id)
    );


    const handleAddItem = (stock) => {
        dispatch(addBulkItem({
            variant_id: stock.variant_id,
            product_name: stock.variant?.product?.name || "Unknown",
            quantity: "",
            operation: "set",
            reason: "",
        }));
    };

    const handleRemoveItem = (index) => {
        dispatch(removeBulkItem(bulkItems[index].variant_id));
    };

    const handleSubmit = async () => {
        const items = bulkItems.map(item => ({
            variant_id: item.variant_id,
            quantity: parseInt(item.quantity) || 0,
            operation: item.operation,
            reason: item.reason?.trim() || "Bulk update",
        }));

        const invalidItems = items.filter(i => i.quantity <= 0);
        if (invalidItems.length > 0) {
            toast.error("Please enter valid quantity for all items");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await bulkUpdate({
                shop_id: user?.shop_id,
                items,
            }).unwrap();

            if (result.failed?.length > 0) {
                toast.warning(`${result.updated} updated, ${result.failed.length} failed`);
                dispatch(setBulkErrors(result.failed));
            } else {
                toast.success(`${result.updated} stock records updated successfully`);
                dispatch(closeBulkModal());
                dispatch(clearBulkItems());
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            toast.error(err?.data?.message || "Bulk update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Bulk Stock Update</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Update multiple products at once</p>
                    </div>
                    <button onClick={() => { dispatch(closeBulkModal()); dispatch(clearBulkItems()); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-gray-700">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-700">Select products to update. Each product will be updated with its own operation and quantity.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Add Products</label>
                        <select onChange={(e) => {
                            const stock = availableStocks.find(s => s.variant_id === e.target.value);
                            if (stock) handleAddItem(stock);
                            e.target.value = "";
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">— Select a product —</option>
                            {availableStocks.map(s => (
                                <option key={s.variant_id} value={s.variant_id}>{s.variant?.product?.name} ({s.variant?.sku || "No SKU"}) - Current: {s.quantity_available}</option>
                            ))}
                        </select>
                    </div>
                    {bulkItems.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Items to Update ({bulkItems.length})</p>
                            {bulkItems.map((item, idx) => (
                                <div key={item.variant_id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                                        <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <select value={item.operation} onChange={(e) => dispatch(updateBulkItem({ index: idx, operation: e.target.value }))} className="px-2 py-1 border rounded text-sm">
                                            <option value="set">Set to</option>
                                            <option value="increment">Add (+)</option>
                                            <option value="decrement">Remove (-)</option>
                                        </select>
                                        <input type="number" min="1" value={item.quantity} onChange={(e) => dispatch(updateBulkItem({ index: idx, quantity: e.target.value }))} placeholder="Quantity" className="px-2 py-1 border rounded text-sm" />
                                        <input type="text" value={item.reason} onChange={(e) => dispatch(updateBulkItem({ index: idx, reason: e.target.value }))} placeholder="Reason" className="px-2 py-1 border rounded text-sm col-span-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {bulkErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-xs text-red-600 font-medium mb-1">Failed updates:</p>
                            {bulkErrors.map((err, i) => (
                                <p key={i} className="text-xs text-red-500">{err.variant_id}: {err.message}</p>
                            ))}
                        </div>
                    )}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">Each update will create a separate stock ledger entry. Please ensure quantities are correct.</p>
                    </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button onClick={() => { dispatch(closeBulkModal()); dispatch(clearBulkItems()); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || bulkItems.length === 0} className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? "Updating..." : "Update All"}</button>
                </div>
            </div>
        </div>
    );
}