// TABS/INVENTORY/ShopStockTab.jsx
//
// Shop Stock Management for SHOP_OWNER / SHOP_STOCK_LISTER
// Features: View stock, adjust quantity, bulk update, low stock alerts

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Package, AlertTriangle, TrendingUp, Layers, Edit2, CheckSquare, Square, RefreshCw, Bell } from "lucide-react";
import { toast } from "react-toastify";
import { useGetShopStocksQuery, useGetLowStockAlertsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
import {
    setSearch,
    setLowStockOnly,
    setCurrentPage,
    setPageSize,
    resetFilters,
    openQuantityModal,
    openBulkModal,
    toggleSelectStock,
    selectAllStocks,
    clearSelectedStocks,
    setLoading,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockSlice";
import { CURRENT_USER, isAdmin } from "../../../roles";
import StockQuantityModal from "./ShopStockShared/StockQuantityModal";
import StockBulkModal from "./ShopStockShared/StockBulkModal";

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { label: "Out of stock", color: "bg-red-100 text-red-700", icon: "🔴" };
    if (quantity <= threshold) return { label: "Low stock", color: "bg-orange-100 text-orange-700", icon: "⚠️" };
    return { label: "In stock", color: "bg-green-100 text-green-700", icon: "✅" };
};

export default function ShopStockTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        search,
        lowStockOnly,
        currentPage,
        pageSize,
        selectedStockIds,
        showQuantityModal,
        showBulkModal,
    } = useSelector((state) => state.shopStock);

    const isShopOwner = user?.role === "SHOP_OWNER";
    const isShopLister = user?.role === "SHOP_STOCK_LISTER";
    const canEdit = isAdmin() || isShopOwner || isShopLister;

    // Get user's shop ID
    const userShopId = user?.shop_id || "";

    // ── Queries ─────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, refetch } = useGetShopStocksQuery({
        page: currentPage,
        limit: pageSize,
        search,
        low_stock_only: lowStockOnly,
        shop_id: userShopId,
    });

    const { data: lowStockAlerts, refetch: refetchAlerts } = useGetLowStockAlertsQuery({
        shop_id: userShopId,
    });

    const stocks = data?.stocks || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    const alerts = lowStockAlerts?.alerts || [];
    const alertCount = lowStockAlerts?.count || 0;

    // ── Stats ───────────────────────────────────────────────────────────
    const totalSKUs = stocks.length;
    const totalUnits = stocks.reduce((sum, s) => sum + (s.quantity_available || 0), 0);
    const lowStockCount = stocks.filter(s => s.quantity_available > 0 && s.quantity_available <= (s.low_stock_threshold || 10)).length;
    const outOfStockCount = stocks.filter(s => s.quantity_available === 0).length;

    // ── Selection ───────────────────────────────────────────────────────
    const allSelectedOnPage = stocks.length > 0 && stocks.every(s => selectedStockIds.includes(s.shop_stock_id));
    const someSelected = stocks.some(s => selectedStockIds.includes(s.shop_stock_id));

    const handleSelectAll = () => {
        const currentStockIds = stocks.map(s => s.shop_stock_id);
        if (allSelectedOnPage) {
            const remainingIds = selectedStockIds.filter(id => !currentStockIds.includes(id));
            dispatch(selectAllStocks({ stockIds: remainingIds, isSelected: false }));
        } else {
            const newIds = [...new Set([...selectedStockIds, ...currentStockIds])];
            dispatch(selectAllStocks({ stockIds: newIds, isSelected: true }));
        }
    };

    const handleRefresh = () => {
        refetch();
        refetchAlerts();
        dispatch(clearSelectedStocks());
    };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shop Stock Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage stock levels for your shop — adjust quantities, track low stock, and bulk update
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    {canEdit && (
                        <button
                            onClick={() => dispatch(openBulkModal())}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                            disabled={stocks.length === 0}
                        >
                            <Layers size={16} /> Bulk Update
                        </button>
                    )}
                    <button
                        onClick={handleRefresh}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg cursor-pointer"
                    >
                        <RefreshCw size={14} className="inline mr-1" /> Refresh
                    </button>
                </div>
            </div>

            {/* Low Stock Alert Banner */}
            {alertCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-orange-500" />
                        <p className="text-sm text-orange-800 font-medium">
                            {alertCount} low stock alert(s) — {alerts.map(a => a.variant?.product?.name).join(", ")}
                        </p>
                    </div>
                    <button onClick={() => dispatch(setLowStockOnly(true))} className="text-xs text-orange-600 hover:underline">
                        View all →
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total SKUs</p>
                        <Package size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{totalSKUs}</p>
                    <p className="text-xs opacity-60 mt-1">in your shop</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total Units</p>
                        <TrendingUp size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{totalUnits.toLocaleString()}</p>
                    <p className="text-xs opacity-60 mt-1">available for sale</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Low Stock</p>
                        <AlertTriangle size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{lowStockCount}</p>
                    <p className="text-xs opacity-60 mt-1">below threshold</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Out of Stock</p>
                        <AlertTriangle size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{outOfStockCount}</p>
                    <p className="text-xs opacity-60 mt-1">needs restock</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-3">
                    <input
                        value={search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        placeholder="Search by product name, SKU, or barcode..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => dispatch(resetFilters())}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        <X size={14} /> Clear
                    </button>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={lowStockOnly}
                            onChange={(e) => dispatch(setLowStockOnly(e.target.checked))}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show low stock only</span>
                    </label>
                    <select
                        value={pageSize}
                        onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer"
                    >
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
                    </select>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedStockIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
                        <span className="text-sm font-medium">{selectedStockIds.length} item(s) selected</span>
                        <div className="w-px h-6 bg-gray-600" />
                        <button
                            onClick={() => dispatch(openBulkModal())}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-full text-sm font-medium transition-colors"
                        >
                            <Layers size={14} /> Bulk Update
                        </button>
                        <button
                            onClick={() => dispatch(clearSelectedStocks())}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                        >
                            <X size={14} /> Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                {stocks.length > 0 && (
                                    <button onClick={handleSelectAll} className="text-gray-500 hover:text-blue-600">
                                        {allSelectedOnPage ? <CheckSquare size={18} /> : someSelected ? <Square size={18} className="text-blue-500" /> : <Square size={18} />}
                                    </button>
                                )}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Variant</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Available</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Reserved</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">In Transit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Threshold</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Updated</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={10} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && !isFetching && stocks.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-14 text-center">
                                    <Package size={32} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">No stock records found for your shop</p>
                                </td>
                            </tr>
                        )}
                        {!isLoading && stocks.map((stock) => {
                            const product = stock.variant?.product || {};
                            const variant = stock.variant || {};
                            const status = getStockStatus(stock.quantity_available, stock.low_stock_threshold);
                            const variantAttr = variant.sku || variant.product_code || variant.system_barcode || "—";
                            const isSelected = selectedStockIds.includes(stock.shop_stock_id);

                            return (
                                <tr key={stock.shop_stock_id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                                    <td className="px-4 py-3">
                                        <button onClick={() => dispatch(toggleSelectStock(stock.shop_stock_id))} className="text-gray-400 hover:text-blue-600">
                                            {isSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-gray-800">{product.name || "—"}</p>
                                        <p className="text-xs font-mono text-gray-400">{product.product_code || "—"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs text-gray-700">{variantAttr}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-800">{stock.quantity_available}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{stock.quantity_reserved || 0}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{stock.quantity_in_transit || 0}</td>
                                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.icon} {status.label}</span></td>
                                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{stock.low_stock_threshold || 10}</span></td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(stock.updated_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        {canEdit && (
                                            <button onClick={() => dispatch(openQuantityModal(stock))} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Adjust Quantity">
                                                <Edit2 size={15} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}</p>
                    <div className="flex gap-2">
                        <button onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
                        <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {meta.totalPages}</span>
                        <button onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={currentPage === meta.totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showQuantityModal && <StockQuantityModal onSuccess={handleRefresh} />}
            {showBulkModal && <StockBulkModal onSuccess={handleRefresh} stocks={stocks} selectedStockIds={selectedStockIds} />}

        </div>
    );
}