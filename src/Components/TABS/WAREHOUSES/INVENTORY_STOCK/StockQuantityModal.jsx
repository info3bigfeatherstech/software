// TABS/WAREHOUSES/INVENTORY_STOCK/StockQuantityModal.jsx
//
// Adjust stock quantity with reason
// Uses PATCH /product-stocks/:stockId with quantity field
// Backend automatically creates stock ledger entry

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { usePatchStockMutation } from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import {
    closeQuantityModal,
    updateQuantityForm,
    setQuantityErrors,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockSlice";

export default function StockQuantityModal({ onSuccess }) {
    const dispatch = useDispatch();
    const { selectedStock, quantityForm, quantityErrors } = useSelector((state) => state.stock);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [patchStock] = usePatchStockMutation();

    if (!selectedStock) return null;

    const product = selectedStock.variant?.product || {};
    const currentQuantity = selectedStock.quantity;
    const newQuantity = parseInt(quantityForm.new_quantity) || 0;
    const quantityDiff = newQuantity - currentQuantity;
    const isIncrease = quantityDiff > 0;
    const isDecrease = quantityDiff < 0;

    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            quantityErrors[name] ? "border-red-400" : "border-gray-300"
        }`;

    const errorMsg = (name) =>
        quantityErrors[name] ? (
            <p className="text-xs text-red-500 mt-1">{quantityErrors[name]}</p>
        ) : null;

    const validate = () => {
        const errors = {};
        if (!quantityForm.new_quantity) {
            errors.new_quantity = "New quantity is required";
        } else if (newQuantity < 0) {
            errors.new_quantity = "Quantity cannot be negative";
        }
        if (!quantityForm.reason?.trim()) {
            errors.reason = "Reason is required for quantity adjustment";
        }
        return errors;
    };

    const handleSave = async () => {
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setQuantityErrors(errors));
            return;
        }

        setIsSubmitting(true);
        try {
            await patchStock({
                stockId: selectedStock.stock_id,
                quantity: newQuantity,
                remarks: quantityForm.reason.trim(),
            }).unwrap();
            
            toast.success(`Quantity adjusted: ${currentQuantity} → ${newQuantity} units`);
            dispatch(closeQuantityModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setQuantityErrors(be));
            } else {
                toast.error(err?.data?.message || "Failed to adjust quantity");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                
                {/* Header */}
                <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Adjust Quantity</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {product.name}
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(closeQuantityModal())}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5">
                    
                    {/* Current Quantity Display */}
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Current Quantity</p>
                        <p className="text-2xl font-bold text-gray-800">{currentQuantity} units</p>
                    </div>

                    {/* New Quantity Input */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            New Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={quantityForm.new_quantity}
                            onChange={(e) => dispatch(updateQuantityForm({ new_quantity: e.target.value }))}
                            placeholder="Enter new quantity"
                            className={inputCls("new_quantity")}
                            autoFocus
                        />
                        {errorMsg("new_quantity")}
                        
                        {/* Show difference warning */}
                        {quantityForm.new_quantity && newQuantity !== currentQuantity && (
                            <div className={`mt-2 text-xs ${isIncrease ? "text-emerald-600" : "text-red-600"}`}>
                                {isIncrease ? `📈 +${quantityDiff} units will be added` : `📉 ${quantityDiff} units will be removed`}
                            </div>
                        )}
                    </div>

                    {/* Reason Input - REQUIRED */}
                    <div className="text-gray-700">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Reason for Adjustment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={quantityForm.reason}
                            onChange={(e) => dispatch(updateQuantityForm({ reason: e.target.value }))}
                            rows={3}
                            placeholder="e.g., 20 pieces damaged - removed from inventory"
                            className={`${inputCls("reason")} resize-none`}
                        />
                        {errorMsg("reason")}
                    </div>

                    {/* Warning Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">
                            ⚠️ Stock ledger entry will be automatically created for this adjustment.
                            This change is permanent and tracked in audit trail.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={() => dispatch(closeQuantityModal())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                    >
                        {isSubmitting ? "Updating..." : "Update Quantity"}
                    </button>
                </div>

            </div>
        </div>
    );
}