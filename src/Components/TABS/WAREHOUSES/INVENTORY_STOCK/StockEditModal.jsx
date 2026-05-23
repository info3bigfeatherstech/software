// TABS/WAREHOUSES/INVENTORY_STOCK/StockEditModal.jsx
//
// Edit stock details: location, batch number, expiry date, threshold, remarks
// Uses PATCH /product-stocks/:stockId

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { usePatchStockMutation } from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import {
    closeEditModal,
    updateEditForm,
    setEditErrors,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockSlice";

export default function StockEditModal({ onSuccess }) {
    const dispatch = useDispatch();
    const { selectedStock, editForm, editErrors } = useSelector((state) => state.stock);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patchStock] = usePatchStockMutation();

    if (!selectedStock) return null;

    const product = selectedStock.variant?.product || {};
    const variant = selectedStock.variant || {};

    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            editErrors[name] ? "border-red-400" : "border-gray-300"
        }`;

    const errorMsg = (name) =>
        editErrors[name] ? (
            <p className="text-xs text-red-500 mt-1">{editErrors[name]}</p>
        ) : null;

    const validate = () => {
        const errors = {};
        if (editForm.low_stock_threshold < 0) {
            errors.low_stock_threshold = "Threshold cannot be negative";
        }
        return errors;
    };

    const handleSave = async () => {
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setEditErrors(errors));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {};
            if (editForm.room_zone !== selectedStock.room_zone) payload.room_zone = editForm.room_zone;
            if (editForm.rack_shelf !== selectedStock.rack_shelf) payload.rack_shelf = editForm.rack_shelf;
            if (editForm.position !== selectedStock.position) payload.position = editForm.position || null;
            if (editForm.batch_number !== selectedStock.batch_number) payload.batch_number = editForm.batch_number || "";
            if (editForm.expiry_date !== (selectedStock.expiry_date?.split("T")[0] || "")) {
                payload.expiry_date = editForm.expiry_date ? new Date(editForm.expiry_date).toISOString() : null;
            }
            if (Number(editForm.low_stock_threshold) !== selectedStock.low_stock_threshold) {
                payload.low_stock_threshold = Number(editForm.low_stock_threshold);
            }
            if (editForm.remarks !== selectedStock.remarks) payload.remarks = editForm.remarks || null;

            if (Object.keys(payload).length === 0) {
                toast.info("No changes to save");
                dispatch(closeEditModal());
                return;
            }

            await patchStock({ stockId: selectedStock.stock_id, ...payload }).unwrap();
            toast.success("Stock updated successfully");
            dispatch(closeEditModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setEditErrors(be));
            } else {
                toast.error(err?.data?.message || "Failed to update stock");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Edit Stock</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {product.name} — {variant.sku || variant.system_barcode || "Variant"}
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(closeEditModal())}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5">
                    
                    {/* Current Stock Info */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Current Stock</p>
                        <p className="text-2xl font-bold text-blue-700">{selectedStock.quantity} units</p>
                        <p className="text-xs text-blue-500 mt-1">
                            ⚠️ To change quantity, use the "Adjust Quantity" button
                        </p>
                    </div>

                    {/* Location Fields */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Location</label>
                        <div className="grid grid-cols-3 gap-3 text-gray-700">
                            <div>
                                <input
                                    value={editForm.room_zone}
                                    onChange={(e) => dispatch(updateEditForm({ room_zone: e.target.value }))}
                                    placeholder="Zone (e.g., A)"
                                    className={inputCls("room_zone")}
                                />
                                {errorMsg("room_zone")}
                            </div>
                            <div>
                                <input
                                    value={editForm.rack_shelf}
                                    onChange={(e) => dispatch(updateEditForm({ rack_shelf: e.target.value }))}
                                    placeholder="Rack/Shelf"
                                    className={inputCls("rack_shelf")}
                                />
                                {errorMsg("rack_shelf")}
                            </div>
                            <div>
                                <input
                                    value={editForm.position}
                                    onChange={(e) => dispatch(updateEditForm({ position: e.target.value }))}
                                    placeholder="Position"
                                    className={inputCls("position")}
                                />
                                {errorMsg("position")}
                            </div>
                        </div>
                    </div>

                    {/* Batch Number */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Batch Number</label>
                        <input
                            value={editForm.batch_number}
                            onChange={(e) => dispatch(updateEditForm({ batch_number: e.target.value }))}
                            placeholder="e.g., BATCH-001"
                            className={inputCls("batch_number")}
                        />
                        {errorMsg("batch_number")}
                        <p className="text-xs text-gray-400 mt-1">
                            ⚠️ Batch number is unique per variant+warehouse combination
                        </p>
                    </div>

                    {/* Expiry Date */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                        <input
                            type="date"
                            value={editForm.expiry_date}
                            onChange={(e) => dispatch(updateEditForm({ expiry_date: e.target.value }))}
                            className={inputCls("expiry_date")}
                        />
                        {errorMsg("expiry_date")}
                    </div>

                    {/* Low Stock Threshold */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                        <input
                            type="number"
                            min="0"
                            value={editForm.low_stock_threshold}
                            onChange={(e) => dispatch(updateEditForm({ low_stock_threshold: parseInt(e.target.value) || 0 }))}
                            className={inputCls("low_stock_threshold")}
                        />
                        {errorMsg("low_stock_threshold")}
                        <p className="text-xs text-gray-400 mt-1">
                            Stock will show "Low Stock" warning when quantity falls below this number
                        </p>
                    </div>

                    {/* Remarks */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                            value={editForm.remarks}
                            onChange={(e) => dispatch(updateEditForm({ remarks: e.target.value }))}
                            rows={2}
                            placeholder="Optional notes about this stock"
                            className={`${inputCls("remarks")} resize-none`}
                        />
                        {errorMsg("remarks")}
                    </div>

                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={() => dispatch(closeEditModal())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>

            </div>
        </div>
    );
}