// TABS/TRANSFERS/ReorderSuggestionsTab.jsx
//
// View reorder suggestions based on min-max levels
// Create bulk transfer requests from suggestions

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Package, TrendingUp, ShoppingCart, AlertTriangle, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useGetReorderSuggestionsQuery, useSetProductLevelsMutation } from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopLevels_api/shopLevelsApi";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import { setSelectedWarehouseId, openLevelsModal, addLevelItem } from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopLevels_api/shopLevelsSlice";
import { openCreateModal, updateCreateForm } from "../../../../REDUX_FEATURES/REDUX_SLICES/TransferRequest_api/transferRequestSlice";
import { CURRENT_USER } from "../../../roles";

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function ReorderSuggestionsTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { selectedWarehouseId } = useSelector((state) => state.shopLevels);
    
    const userShopId = user?.shop_id || "";
    const isShopOwner = user?.role === "SHOP_OWNER";
    
    const { data: suggestionsData, isLoading, refetch } = useGetReorderSuggestionsQuery({
        shop_id: userShopId,
        warehouse_id: selectedWarehouseId,
    });
    
    const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 100, is_active: "true" });
    
    const [setProductLevels] = useSetProductLevelsMutation();
    
    const suggestions = suggestionsData;
    const warehouses = warehousesData?.warehouses || [];
    const items = suggestions?.items || [];
    const summary = suggestions?.summary || { total_items_below_min: 0, total_suggested_quantity: 0 };
    
    const handleCreateBulkRequest = () => {
        if (!items.length) {
            toast.error("No items to reorder");
            return;
        }
        
        const bulkItems = items.map(item => ({
            variant_id: item.variant_id,
            quantity: item.suggested_quantity,
        }));
        
        // This will be handled by bulk transfer API (next phase)
        toast.info("Bulk transfer creation coming soon. Use individual requests for now.");
        
        // For now, create individual request for first item
        if (items[0]) {
            dispatch(updateCreateForm({
                request_type: "WH_TO_SHOP",
                from_warehouse_id: suggestions?.source_warehouse_id || selectedWarehouseId || warehouses[0]?.warehouse_id,
                to_shop_id: userShopId,
                variant_id: items[0].variant_id,
                quantity: items[0].suggested_quantity,
                request_remarks: `Auto-generated from reorder suggestions - ${items[0].product_name} below min level`,
            }));
            dispatch(openCreateModal());
        }
    };
    
    const handleSetLevels = () => {
        // Open levels modal to set min-max for products
        dispatch(openLevelsModal());
    };
    
    const getStatusBadge = (status) => {
        if (status === "BELOW_MIN") return { label: "Below Minimum", color: "bg-red-100 text-red-700", icon: "🔴" };
        if (status === "ABOVE_MAX") return { label: "Above Maximum", color: "bg-yellow-100 text-yellow-700", icon: "⚠️" };
        return { label: "Normal", color: "bg-green-100 text-green-700", icon: "✅" };
    };
    
    return (
        <div className="space-y-5">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Reorder Suggestions</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Products below minimum level — suggested quantities based on max levels
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleSetLevels}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                    >
                        <Plus size={16} /> Set Min-Max Levels
                    </button>
                    <button onClick={() => refetch()} className="px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75">Items Below Minimum</p>
                        <AlertTriangle size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{summary.total_items_below_min}</p>
                    <p className="text-xs opacity-60 mt-1">need restocking</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75">Suggested Quantity</p>
                        <ShoppingCart size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{summary.total_suggested_quantity}</p>
                    <p className="text-xs opacity-60 mt-1">total units to order</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75">Shop</p>
                        <Package size={16} className="opacity-60" />
                    </div>
                    <p className="text-xl font-bold truncate">{suggestions?.shop_name || userShopId}</p>
                </div>
            </div>
            
            {/* Warehouse Filter */}
            {warehouses.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Source Warehouse (for suggestions)</label>
                    <select
                        value={selectedWarehouseId}
                        onChange={(e) => dispatch(setSelectedWarehouseId(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
                    >
                        <option value="">— Select Warehouse —</option>
                        {warehouses.map(w => (
                            <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name} — {w.city}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Suggested quantities based on available stock in selected warehouse</p>
                </div>
            )}
            
            {/* Suggestions Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">Products Requiring Reorder</h3>
                    <span className="text-xs text-gray-400">{items.length} items</span>
                </div>
                
                {(isLoading) && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                
                {!isLoading && items.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        No items below minimum level. All stock levels are optimal.
                    </div>
                )}
                
                {!isLoading && items.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Current Stock</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Min Level</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Max Level</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Suggested Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, idx) => {
                                const status = getStatusBadge(item.status);
                                return (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{item.product_name}</p>
                                            <p className="text-xs text-gray-400">{item.variant_id}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{item.sku}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{item.current_stock}</td>
                                        <td className="px-4 py-3 text-right text-red-600 font-medium">{item.min_level}</td>
                                        <td className="px-4 py-3 text-right text-green-600">{item.max_level}</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600">{item.suggested_quantity}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    dispatch(updateCreateForm({
                                                        request_type: "WH_TO_SHOP",
                                                        from_warehouse_id: suggestions?.source_warehouse_id || selectedWarehouseId,
                                                        to_shop_id: userShopId,
                                                        variant_id: item.variant_id,
                                                        quantity: item.suggested_quantity,
                                                        request_remarks: `Reorder from suggestions - ${item.product_name} below min level`,
                                                    }));
                                                    dispatch(openCreateModal());
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                            >
                                                Create Request
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Min-Max Levels Modal */}
            {/* This will be implemented in next phase */}
            
        </div>
    );
}