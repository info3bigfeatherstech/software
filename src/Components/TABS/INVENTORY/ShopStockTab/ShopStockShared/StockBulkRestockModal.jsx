// TABS/INVENTORY/ShopStockShared/StockBulkRestockModal.jsx
//
// Bulk Restock Request Modal - Create bulk transfer request from selected products
// FIXED: Only shows selected products, refetches when warehouse changes

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle, Truck, Warehouse, Package, RefreshCw, Edit2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useGetReorderSuggestionsQuery } from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
import { useCreateBulkTransferRequestMutation, generateBulkIdempotencyKey } from "../../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferApi";
import { closeBulkRestockModal, clearSelectedStocks } from "../../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockSlice";
import { CURRENT_USER } from "../../../../roles";

export default function StockBulkRestockModal({ onSuccess, stocks, selectedStockIds }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
    const [requestRemarks, setRequestRemarks] = useState("");
    const [items, setItems] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Get selected stock objects (ONLY the ones user selected)
    // useMemo so the reference is stable between renders — prevents useEffect infinite loops
    const selectedStocks = useMemo(
        () => stocks.filter(s => selectedStockIds?.includes(s.shop_stock_id)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stocks, selectedStockIds]
    );
    const selectedVariants = useMemo(
        () => selectedStocks.map(s => s.variant_id),
        [selectedStocks]
    );

    // Fetch reorder suggestions - with warehouse filter when warehouse selected
    const { data: suggestionsData, isLoading: isLoadingSuggestions, refetch } = useGetReorderSuggestionsQuery({
        shop_id: user?.shop_id,
        warehouse_id: selectedWarehouseId || undefined,
        variant_ids: selectedVariants,
    }, {
        skip: selectedVariants.length === 0,
    });

    const [createBulkRequest] = useCreateBulkTransferRequestMutation();

    // Create a map of selected variants for quick lookup — also stable
    const selectedVariantsMap = useMemo(
        () => new Set(selectedVariants),
        [selectedVariants]
    );

    // Initialize items when suggestions data loads - ONLY for selected variants
    useEffect(() => {
        if (suggestionsData?.items && suggestionsData.items.length > 0) {
            // Filter to ONLY selected variants
            const filteredItems = suggestionsData.items
                .filter(item => selectedVariantsMap.has(item.variant_id))
                .map(item => {
                    // Find the original selected stock to get current stock
                    const selectedStock = selectedStocks.find(s => s.variant_id === item.variant_id);
                    return {
                        variant_id: item.variant_id,
                        product_name: item.product_name,
                        sku: item.sku,
                        current_stock: selectedStock?.quantity_available || item.current_stock,
                        suggested_quantity: item.suggested_quantity,
                        quantity: item.suggested_quantity,
                        available_in_warehouse: item.available_in_warehouse,
                        min_level: item.min_level,
                        max_level: item.max_level,
                    };
                });
            setItems(filteredItems);

            // Set default warehouse from API response if not already set
            if (suggestionsData.source_warehouse_id && !selectedWarehouseId) {
                setSelectedWarehouseId(suggestionsData.source_warehouse_id);
            }
        } else if (suggestionsData?.items === undefined && selectedVariants.length > 0 && items.length === 0) {
            // Only create fallback items when items state is genuinely empty —
            // guards against re-running while the user is editing quantities
            const fallbackItems = selectedStocks.map(stock => ({
                variant_id: stock.variant_id,
                product_name: stock.variant?.product?.name || "Unknown",
                sku: stock.variant?.sku || "—",
                current_stock: stock.quantity_available,
                suggested_quantity: 0,
                quantity: "",
                available_in_warehouse: 0,
                min_level: null,
                max_level: null,
            }));
            setItems(fallbackItems);
        }
    // suggestionsData, selectedVariants, selectedStocks, selectedVariantsMap are all now
    // stable references thanks to useMemo — safe to include without looping
    }, [suggestionsData, selectedVariants, selectedStocks, selectedVariantsMap]);
    
    // Refetch when warehouse changes
    useEffect(() => {
        if (selectedWarehouseId && selectedVariants.length > 0) {
            refetch();
        }
    }, [selectedWarehouseId]);
    
    const warehouses = suggestionsData?.warehouses || [];
    
    const handleQuantityChange = (variantId, newQuantity) => {
        // console.log("Changing quantity for:", variantId, "to:", newQuantity); 
        const qty = parseInt(newQuantity) || 0;
        setItems(prev => prev.map(item => 
            item.variant_id === variantId 
                ? { ...item, quantity: qty }
                : item
        ));
    };

    
    
    const handleSubmit = async () => {
        const validItems = items.filter(item => item.quantity > 0);
        if (validItems.length === 0) {
            toast.error("Please enter valid quantity for at least one product");
            return;
        }
        
        if (!selectedWarehouseId) {
            toast.error("Please select a source warehouse");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const payload = {
                to_shop_id: user?.shop_id,
                from_warehouse_id: selectedWarehouseId,
                request_type: "WH_TO_SHOP",
                request_remarks: requestRemarks.trim() || `Bulk restock request - ${new Date().toLocaleDateString()}`,
                items: validItems.map(item => ({
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                })),
            };
            
            await createBulkRequest({
                idempotencyKey: generateBulkIdempotencyKey(),
                ...payload,
            }).unwrap();
            
            toast.success(`Bulk restock request created with ${validItems.length} items`);
            dispatch(closeBulkRestockModal());
            dispatch(clearSelectedStocks());
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Bulk request error:", err);
            toast.error(err?.data?.message || "Failed to create bulk request");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalItems = items.filter(item => item.quantity > 0).length;
    
    if (selectedVariants.length === 0) {
        return null;
    }
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <Package size={18} className="text-indigo-600" />
                            Create Bulk Restock Request
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {selectedVariants.length} product(s) selected for restock
                        </p>
                    </div>
                    <button 
                        onClick={() => dispatch(closeBulkRestockModal())} 
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-gray-700">
                    {/* Loading State */}
                    {isLoadingSuggestions && (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-500">Fetching reorder suggestions...</p>
                        </div>
                    )}
                    
                    {!isLoadingSuggestions && (
                        <>
                            {/* Warehouse Selection */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Warehouse size={16} className="text-blue-600" />
                                    <p className="text-sm font-medium text-blue-800">Select Source Warehouse</p>
                                </div>
                                <select
                                    value={selectedWarehouseId}
                                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Select a warehouse...</option>
                                    {warehouses.map(wh => (
                                        <option key={wh.warehouse_id} value={wh.warehouse_id}>
                                            {wh.warehouse_name} — {wh.city} {wh.is_default ? "(Default)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    ⚡ Stock availability will be checked from selected warehouse
                                </p>
                            </div>
                            
                            {/* Items Table - ONLY SELECTED PRODUCTS */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-medium text-gray-700">Products to Restock ({items.length} selected)</p>
                                    <p className="text-xs text-gray-500">
                                        {totalItems} item(s) • Total: {totalQuantity} units
                                    </p>
                                </div>
                                
                                {items.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500">No products selected</p>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Current Stock</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Min/Max</th>
                                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Request Qty</th>
                                                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {items.map((item) => {
                                                    const isAvailable = item.available_in_warehouse >= item.quantity;
                                                    const hasStockIssue = item.quantity > item.available_in_warehouse;
                                                    
                                                    return (
                                                        <tr key={item.variant_id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-gray-800">{item.product_name}</p>
                                                                <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                                                             </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className={`font-semibold ${item.current_stock <= (item.min_level || 0) ? 'text-red-600' : 'text-gray-700'}`}>
                                                                    {item.current_stock}
                                                                </span>
                                                                {item.min_level && (
                                                                    <p className="text-xs text-gray-400">Min: {item.min_level}</p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-xs text-gray-500">
                                                                {item.min_level && item.max_level ? `${item.min_level} / ${item.max_level}` : 'Not set'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.available_in_warehouse || 999999}
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleQuantityChange(item.variant_id, e.target.value)}
                                                                    className={`w-24 px-2 py-1 border rounded text-right text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                                        hasStockIssue ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                                                    }`}
                                                                    placeholder="Qty"
                                                                />
                                                                {item.available_in_warehouse > 0 && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        Available: {item.available_in_warehouse}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {item.quantity > 0 && !hasStockIssue ? (
                                                                    <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                                        <CheckCircle size={12} /> OK
                                                                    </span>
                                                                ) : hasStockIssue ? (
                                                                    <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                                                        <AlertTriangle size={12} /> Low Stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">Not requested</span>
                                                                )}
                                                            </td>
                                                         </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            
                            {/* Remarks */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Request Remarks</label>
                                <textarea
                                    value={requestRemarks}
                                    onChange={(e) => setRequestRemarks(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g., Monthly restock - May 2026"
                                />
                            </div>
                            
                            {/* Warning for low stock items */}
                            {items.some(item => item.quantity > item.available_in_warehouse && item.available_in_warehouse > 0) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-red-700">
                                        Some products have requested quantity exceeding available warehouse stock. 
                                        Please reduce the quantity or select a different warehouse.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button 
                        onClick={() => dispatch(closeBulkRestockModal())} 
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || totalItems === 0 || !selectedWarehouseId || isLoadingSuggestions}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Truck size={14} />
                                Create Bulk Restock Request
                            </>
                        )}
                    </button>
                </div>
            </div>
    </div>
</div>
    );
}