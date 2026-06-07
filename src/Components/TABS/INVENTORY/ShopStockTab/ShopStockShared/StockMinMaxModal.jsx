// TABS/INVENTORY/ShopStockShared/StockMinMaxModal.jsx
//
// Min-Max Levels Modal - Set minimum and maximum stock levels for products
// This is the FIRST STEP in the bulk restock flow

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle, Save } from "lucide-react";
import { toast } from "../../../../shared/ToastConfig";
import { useSetProductLevelsMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
import {
    closeMinMaxModal,
    updateMinMaxForm,
    setMinMaxErrors,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockSlice";
import { CURRENT_USER } from "../../../../roles";

export default function StockMinMaxModal({ onSuccess }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { minMaxForm, selectedStock, minMaxErrors } = useSelector((state) => state.shopStock);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [setProductLevels] = useSetProductLevelsMutation();

    const validateForm = () => {
        const errors = {};
        const minLevel = parseInt(minMaxForm.min_level);
        const maxLevel = parseInt(minMaxForm.max_level);
        
        if (isNaN(minLevel) || minLevel < 0) {
            errors.min_level = "Minimum level must be a positive number";
        }
        if (isNaN(maxLevel) || maxLevel < 0) {
            errors.max_level = "Maximum level must be a positive number";
        }
        if (minLevel > maxLevel) {
            errors.max_level = "Maximum level must be greater than minimum level";
        }
        if (minMaxForm.reorder_qty && parseInt(minMaxForm.reorder_qty) < 0) {
            errors.reorder_qty = "Reorder quantity must be positive";
        }
        
        return errors;
    };

    const handleSubmit = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            dispatch(setMinMaxErrors(errors));
            toast.error("Please fix the errors");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const payload = {
                shop_id: user?.shop_id,
                items: [{
                    variant_id: minMaxForm.variant_id,
                    min_level: parseInt(minMaxForm.min_level),
                    max_level: parseInt(minMaxForm.max_level),
                    reorder_qty: minMaxForm.reorder_qty ? parseInt(minMaxForm.reorder_qty) : undefined,
                }],
            };
            
            await setProductLevels(payload).unwrap();
            toast.success(`Min-Max levels set for ${minMaxForm.product_name}`);
            dispatch(closeMinMaxModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Set levels error:", err);
            toast.error(err?.data?.message || "Failed to set min-max levels");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedStock) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Set Min-Max Levels</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Configure reorder thresholds for automatic suggestions
                        </p>
                    </div>
                    <button onClick={() => dispatch(closeMinMaxModal())} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="p-6 space-y-4 text-gray-700">
                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Product</p>
                        <p className="font-semibold text-gray-800">{minMaxForm.product_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Current Stock: {selectedStock.quantity_available} units</p>
                    </div>
                    
                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            💡 <strong>How it works:</strong> When stock falls below Min Level, 
                            system suggests ordering up to Max Level. Reorder Qty overrides this calculation.
                        </p>
                    </div>
                    
                    {/* Min Level */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Minimum Level <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minMaxForm.min_level}
                            onChange={(e) => dispatch(updateMinMaxForm({ min_level: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                minMaxErrors.min_level ? "border-red-400" : "border-gray-300"
                            }`}
                            placeholder="e.g., 50"
                        />
                        {minMaxErrors.min_level && (
                            <p className="text-xs text-red-500 mt-1">{minMaxErrors.min_level}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">⚠️ Alert triggers when stock goes below this level</p>
                    </div>
                    
                    {/* Max Level */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Maximum Level <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minMaxForm.max_level}
                            onChange={(e) => dispatch(updateMinMaxForm({ max_level: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                minMaxErrors.max_level ? "border-red-400" : "border-gray-300"
                            }`}
                            placeholder="e.g., 200"
                        />
                        {minMaxErrors.max_level && (
                            <p className="text-xs text-red-500 mt-1">{minMaxErrors.max_level}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">🎯 Target stock level to maintain</p>
                    </div>
                    
                    {/* Reorder Qty (Optional) */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Fixed Reorder Quantity (Optional)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={minMaxForm.reorder_qty}
                            onChange={(e) => dispatch(updateMinMaxForm({ reorder_qty: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Leave empty to use Max - Current calculation"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            If set, this quantity will be suggested instead of Max - Current
                        </p>
                    </div>
                    
                    {/* Recommended Values */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Recommended Values:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-gray-500">Fast moving:</span> <span className="font-medium">Min 50 / Max 200</span></div>
                            <div><span className="text-gray-500">Slow moving:</span> <span className="font-medium">Min 10 / Max 50</span></div>
                            <div><span className="text-gray-500">Seasonal:</span> <span className="font-medium">Min 20 / Max 100</span></div>
                            <div><span className="text-gray-500">Essential:</span> <span className="font-medium">Min 30 / Max 150</span></div>
                        </div>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button 
                        onClick={() => dispatch(closeMinMaxModal())} 
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                Save Min-Max Levels
                            </>
                        )}
                    </button>
                </div>
            </div>
    </div>
</div>
    );
}