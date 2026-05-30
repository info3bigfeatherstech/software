// TABS/WAREHOUSES/INVENTORY_STOCK/InventoryStockTab.jsx
//
// Complete stock management with:
// - Read-only view (default)
// - Edit stock (location, batch, expiry, threshold)
// - Adjust quantity (with reason, auto ledger entry)
// - Delete stock (hard delete with confirmation)
// - Bulk select + bulk update location + bulk delete
// - Manual stock creation (POST /product-stocks)

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
    X, Package, TrendingUp, AlertTriangle, Box, Calendar, 
    MapPin, Hash, Layers, Edit2, Trash2, Plus, CheckSquare, 
    Square, Move, AlertCircle 
} from "lucide-react";
import { toast } from "react-toastify";
import { 
    useGetProductStocksQuery, 
    useGetAllProductStocksQuery,
    useDeleteStockMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetCategoriesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categoryApi";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import {
    setSearch,
    setWarehouseFilter,
    setCategoryFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
    openEditModal,
    openQuantityModal,
    openManualAddModal,
    toggleSelectStock,
    selectAllStocks,
    clearSelectedStocks,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockSlice";
import { CURRENT_USER } from "../../../roles";
import StockEditModal from "./StockEditModal";
import StockQuantityModal from "./StockQuantityModal";
import StockManualAddModal from "./StockManualAddModal";
import StockBulkActionBar from "./StockBulkActionBar";

// ── Helper Functions ───────────────────────────────────────────────────

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
    });
};

const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { label: "Out of stock", color: "bg-red-50 text-red-600 border border-red-200", icon: "🔴" };
    if (quantity <= threshold) return { label: "Low stock", color: "bg-orange-50 text-orange-700 border border-orange-200", icon: "⚠️" };
    return { label: "In stock", color: "bg-green-50 text-green-700 border border-green-200", icon: "✅" };
};

const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

export default function InventoryStockTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const {
        search,
        warehouseFilter,
        categoryFilter,
        currentPage,
        pageSize,
        selectedStockIds,
        showEditModal,
        showQuantityModal,
        showManualAddModal,
    } = useSelector((state) => state.stock);

    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isWHRole = ["WH_MANAGER", "WH_STOCK_LISTER"].includes(user?.role);
    const userWarehouseId = user?.warehouse_id || "";

    // Effective warehouse filter
    const effectiveWarehouseId = isSuperAdmin ? warehouseFilter : userWarehouseId;

    // ── Queries ─────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, refetch } = useGetProductStocksQuery({
        page: currentPage,
        limit: pageSize,
        search,
        warehouse_id: effectiveWarehouseId,
    });

    const { data: allStocks, refetch: refetchAll } = useGetAllProductStocksQuery({
        warehouse_id: effectiveWarehouseId,
    });

    const { data: categoriesData } = useGetCategoriesQuery({ is_active: true, limit: 100 });
    const { data: warehousesData } = useGetWarehousesQuery(
        { page: 1, limit: 100, is_active: "true" },
        { skip: !isSuperAdmin }
    );

    const [deleteStock] = useDeleteStockMutation();

    const stocks = data?.stocks || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    const categories = categoriesData?.categories || [];
    const warehouses = warehousesData?.warehouses || [];
    const allStockList = allStocks || [];

    // ── Stats Calculations ──────────────────────────────────────────────
    const totalSKUs = allStockList.length;
    const totalUnits = allStockList.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const lowStockCount = allStockList.filter(s => s.quantity > 0 && s.quantity <= (s.low_stock_threshold || 10)).length;
    const outOfStockCount = allStockList.filter(s => s.quantity === 0).length;

    // ── Check if all stocks on current page are selected ────────────────
    const allSelectedOnPage = stocks.length > 0 && 
        stocks.every(s => selectedStockIds.includes(s.stock_id));
    const someSelected = stocks.some(s => selectedStockIds.includes(s.stock_id));

    // ── Handle Select All ───────────────────────────────────────────────
    const handleSelectAll = () => {
        const currentStockIds = stocks.map(s => s.stock_id);
        if (allSelectedOnPage) {
            // Deselect all on current page
            const remainingIds = selectedStockIds.filter(id => !currentStockIds.includes(id));
            dispatch(selectAllStocks({ stockIds: remainingIds, isSelected: false }));
        } else {
            // Select all on current page (merge with existing selections)
            const newIds = [...new Set([...selectedStockIds, ...currentStockIds])];
            dispatch(selectAllStocks({ stockIds: newIds, isSelected: true }));
        }
    };

    // ── Handle Individual Delete ────────────────────────────────────────
    const handleDeleteStock = async (stockId, productName) => {
        if (!window.confirm(`⚠️ Delete stock for "${productName}"?\n\nThis is a HARD DELETE. The stock record will be permanently removed. Stock ledger entry will be created automatically.\n\nThis action cannot be undone.`)) {
            return;
        }
        
        try {
            await deleteStock(stockId).unwrap();
            toast.success(`Stock for "${productName}" deleted successfully`);
            refetch();
            refetchAll();
            dispatch(clearSelectedStocks());
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete stock");
        }
    };

    // ── Handle Refresh ──────────────────────────────────────────────────
    const handleRefresh = () => {
        refetch();
        refetchAll();
        dispatch(clearSelectedStocks());
    };

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Current Stock Levels</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Manage warehouse stock — edit location, adjust quantity, or delete stock records
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => dispatch(openManualAddModal())}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Plus size={14} /> Add Stock
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total SKUs</p>
                    <p className="text-3xl font-bold text-gray-800">{totalSKUs}</p>
                    <p className="text-xs text-gray-400 mt-1">unique variant+warehouse combos</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Units</p>
                    <p className="text-3xl font-bold text-gray-800">{totalUnits.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">across all SKUs</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Low Stock</p>
                    <p className="text-3xl font-bold text-gray-800">{lowStockCount}</p>
                    <p className="text-xs text-gray-400 mt-1">below threshold</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Out of Stock</p>
                    <p className="text-3xl font-bold text-gray-800">{outOfStockCount}</p>
                    <p className="text-xs text-gray-400 mt-1">zero quantity</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-3">
                    <input
                        value={search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        placeholder="Search product, SKU, barcode, batch, location..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                    <button
                        onClick={() => dispatch(resetFilters())}
                        className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={14} /> Clear
                    </button>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {/* Warehouse Filter - SUPER_ADMIN only */}
                    {isSuperAdmin && (
                        <select
                            value={warehouseFilter}
                            onChange={(e) => dispatch(setWarehouseFilter(e.target.value))}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                    {w.warehouse_name} — {w.city}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Category Filter */}
                    <select
                        value={categoryFilter}
                        onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Page Size */}
                    <select
                        value={pageSize}
                        onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 ml-auto focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                    >
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
                    </select>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedStockIds.length > 0 && (
                <StockBulkActionBar
                    selectedCount={selectedStockIds.length}
                    selectedStockIds={selectedStockIds}
                    onClearSelection={() => dispatch(clearSelectedStocks())}
                    onSuccess={() => {
                        refetch();
                        refetchAll();
                        dispatch(clearSelectedStocks());
                    }}
                />
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inventory Stock</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{meta.total} records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {/* Checkbox column */}
                            <th className="px-4 py-3 w-10">
                                {stocks.length > 0 && (
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        {allSelectedOnPage ? (
                                            <CheckSquare size={18} />
                                        ) : someSelected ? (
                                            <Square size={18} className="text-blue-500" />
                                        ) : (
                                            <Square size={18} />
                                        )}
                                    </button>
                                )}
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Product</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Variant</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Qty</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Batch</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Expiry</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Location</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Last Inward</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">

                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={10} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    </div>
                                 </td>
                            </tr>
                        )}

                        {!isLoading && !isFetching && stocks.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-14 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package size={32} className="text-gray-300" />
                                        <p className="text-sm text-gray-400">No stock records found</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Stock is created automatically when inwards are marked MAPPED,
                                            or you can manually add stock using the "Add Stock" button.
                                        </p>
                                    </div>
                                 </td>
                            </tr>
                        )}

                        {!isLoading && stocks.map((stock) => {
                            const product = stock.variant?.product || {};
                            const variant = stock.variant || {};
                            const status = getStockStatus(stock.quantity, stock.low_stock_threshold);
                            const location = [stock.room_zone, stock.rack_shelf, stock.position]
                                .filter(Boolean).join(" / ") || "—";
                            const variantAttr = variant.attributes
                                ? Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")
                                : variant.sku || variant.system_barcode || "—";
                            const expiringSoon = isExpiringSoon(stock.expiry_date);
                            const isSelected = selectedStockIds.includes(stock.stock_id);

                            return (
                                <tr key={stock.stock_id} className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                                    {/* Checkbox */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => dispatch(toggleSelectStock(stock.stock_id))}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={18} className="text-blue-600" />
                                            ) : (
                                                <Square size={18} />
                                            )}
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{product.name || "—"}</p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">{product.product_code || "—"}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-xs text-gray-700">{variantAttr}</p>
                                            {variant.sku && (
                                                <p className="text-xs font-mono text-gray-500 mt-0.5">SKU: {variant.sku}</p>
                                            )}
                                            {variant.system_barcode && !variant.sku && (
                                                <p className="text-xs font-mono text-gray-500 mt-0.5">Barcode: {variant.system_barcode}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-bold text-gray-800">{stock.quantity}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                            <span>{status.icon}</span> {status.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-500">
                                            {stock.batch_number || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {stock.expiry_date ? (
                                            <div className="flex items-center gap-1">
                                                <span className={`text-xs ${expiringSoon ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
                                                    {fmtDate(stock.expiry_date)}
                                                </span>
                                                {expiringSoon && (
                                                    <AlertCircle size={12} className="text-orange-500" />
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                     </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <MapPin size={12} />
                                            <span title={stock.position || ""}>{location}</span>
                                        </div>
                                     </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Calendar size={12} />
                                            <span>{fmtDate(stock.last_purchase_date)}</span>
                                        </div>
                                     </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => dispatch(openEditModal(stock))}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Edit Stock Details"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                onClick={() => dispatch(openQuantityModal(stock))}
                                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Adjust Quantity"
                                            >
                                                <Move size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStock(stock.stock_id, product.name)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Delete Stock (Hard Delete)"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
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
                    <p className="text-xs text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">{currentPage} / {meta.totalPages}</span>
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                            disabled={currentPage === meta.totalPages}
                            className="px-3 py-1 text-xs text-gray-500 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showEditModal && <StockEditModal onSuccess={handleRefresh} />}
            {showQuantityModal && <StockQuantityModal onSuccess={handleRefresh} />}
            {showManualAddModal && <StockManualAddModal onSuccess={handleRefresh} />}

        </div>
    );
}

// use upper code which is updated 
// // TABS/WAREHOUSES/INVENTORY_STOCK/InventoryStockTab.jsx
// //
// // Read-only stock levels view
// // Data source: GET /product-stocks
// // Stock is only added via inward MAPPED - no edit buttons here

// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { X, Package, TrendingUp, AlertTriangle, Box, Calendar, MapPin, Hash, Layers } from "lucide-react";
// import { useGetProductStocksQuery, useGetAllProductStocksQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
// import { useGetCategoriesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categoryApi";
// import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
// import {
//     setSearch,
//     setWarehouseFilter,
//     setCategoryFilter,
//     setStockStatusFilter,
//     setCurrentPage,
//     setPageSize,
//     resetFilters,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockSlice";
// import { CURRENT_USER } from "../../../roles";

// const fmtDate = (iso) => {
//     if (!iso) return "—";
//     return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };

// const getStockStatus = (quantity, threshold) => {
//     if (quantity === 0) return { label: "Out of stock", color: "bg-red-100 text-red-700", icon: "🔴" };
//     if (quantity <= threshold) return { label: "Low stock", color: "bg-orange-100 text-orange-700", icon: "⚠️" };
//     return { label: "In stock", color: "bg-green-100 text-green-700", icon: "✅" };
// };

// export default function InventoryStockTab() {
//     const dispatch = useDispatch();
//     const { user } = useSelector((state) => state.auth);

//     const {
//         search,
//         warehouseFilter,
//         categoryFilter,
//         stockStatusFilter,
//         currentPage,
//         pageSize,
//     } = useSelector((state) => state.stock);

//     const isSuperAdmin = user?.role === "SUPER_ADMIN";
//     const isWHRole = ["WH_MANAGER", "WH_STOCK_LISTER"].includes(user?.role);
//     const userWarehouseId = user?.warehouse_id || "";

//     // Effective warehouse filter: WH roles get their warehouse, SUPER_ADMIN can select
//     const effectiveWarehouseId = isSuperAdmin ? warehouseFilter : userWarehouseId;

//     // ── Queries ───────────────────────────────────────────────────────────────
//     const { data, isLoading, isFetching, refetch } = useGetProductStocksQuery({
//         page: currentPage,
//         limit: pageSize,
//         search,
//         warehouse_id: effectiveWarehouseId,
//         stock_status: stockStatusFilter,
//         category_id: categoryFilter,
//     });

//     // For stats - get all records
//     const { data: allStocks } = useGetAllProductStocksQuery({
//         warehouse_id: effectiveWarehouseId,
//     });

//     const { data: categoriesData } = useGetCategoriesQuery({ is_active: true, limit: 100 });
//     const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 100, is_active: "true" }, { skip: !isSuperAdmin });

//     const stocks = data?.stocks || [];
//     const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
//     const categories = categoriesData?.categories || [];
//     const warehouses = warehousesData?.warehouses || [];

//     // ── Stats Calculations ────────────────────────────────────────────────────
//     const allStockList = allStocks || [];
//     const totalSKUs = allStockList.length;
//     const totalUnits = allStockList.reduce((sum, s) => sum + (s.quantity || 0), 0);
//     const lowStockCount = allStockList.filter(s => s.quantity > 0 && s.quantity <= (s.low_stock_threshold || 10)).length;
//     const outOfStockCount = allStockList.filter(s => s.quantity === 0).length;

//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
//                 <div>
//                     <h2 className="text-xl font-bold text-gray-900 tracking-tight">Current Stock Levels</h2>
//                     <p className="text-sm text-gray-500 mt-1">
//                         Read-only view — stock updates automatically when inwards are marked MAPPED
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2.5">
//                     <button
//                         onClick={() => refetch()}
//                         className="px-3 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg"
//                     >
//                         Refresh
//                     </button>
//                 </div>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
//                     <div className="flex items-center justify-between mb-2">
//                         <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total SKUs</p>
//                         <Layers size={16} className="opacity-60" />
//                     </div>
//                     <p className="text-3xl font-bold">{totalSKUs}</p>
//                     <p className="text-xs opacity-60 mt-1">unique variant+warehouse combos</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
//                     <div className="flex items-center justify-between mb-2">
//                         <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total Units</p>
//                         <Package size={16} className="opacity-60" />
//                     </div>
//                     <p className="text-3xl font-bold">{totalUnits.toLocaleString()}</p>
//                     <p className="text-xs opacity-60 mt-1">across all SKUs</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md">
//                     <div className="flex items-center justify-between mb-2">
//                         <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Low Stock</p>
//                         <AlertTriangle size={16} className="opacity-60" />
//                     </div>
//                     <p className="text-3xl font-bold">{lowStockCount}</p>
//                     <p className="text-xs opacity-60 mt-1">below threshold</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-md">
//                     <div className="flex items-center justify-between mb-2">
//                         <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Out of Stock</p>
//                         <Box size={16} className="opacity-60" />
//                     </div>
//                     <p className="text-3xl font-bold">{outOfStockCount}</p>
//                     <p className="text-xs opacity-60 mt-1">zero quantity</p>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
//                 <div className="flex gap-3">
//                     <input
//                         value={search}
//                         onChange={(e) => dispatch(setSearch(e.target.value))}
//                         placeholder="Search product, SKU, barcode..."
//                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                         onClick={() => dispatch(resetFilters())}
//                         className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                     >
//                         <X size={14} /> Clear
//                     </button>
//                 </div>
//                 <div className="flex gap-3 flex-wrap">
//                     {/* Warehouse Filter - SUPER_ADMIN only */}
//                     {isSuperAdmin && (
//                         <select
//                             value={warehouseFilter}
//                             onChange={(e) => dispatch(setWarehouseFilter(e.target.value))}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
//                         >
//                             <option value="">All Warehouses</option>
//                             {warehouses.map(w => (
//                                 <option key={w.warehouse_id} value={w.warehouse_id}>
//                                     {w.warehouse_name} — {w.city}
//                                 </option>
//                             ))}
//                         </select>
//                     )}

//                     {/* Category Filter */}
//                     <select
//                         value={categoryFilter}
//                         onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
//                     >
//                         <option value="">All Categories</option>
//                         {categories.map(c => (
//                             <option key={c.category_id} value={c.category_id}>{c.name}</option>
//                         ))}
//                     </select>

//                     {/* Stock Status Filter */}
//                     <select
//                         value={stockStatusFilter}
//                         onChange={(e) => dispatch(setStockStatusFilter(e.target.value))}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
//                     >
//                         <option value="all">All Stock Levels</option>
//                         <option value="low">Low Stock Only</option>
//                         <option value="out">Out of Stock Only</option>
//                     </select>

//                     {/* Page Size */}
//                     <select
//                         value={pageSize}
//                         onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
//                         className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer"
//                     >
//                         {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
//                     </select>
//                 </div>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Variant</th>
//                             <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch</th>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
//                             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Inward</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">

//                         {(isLoading || isFetching) && (
//                             <tr>
//                                 <td colSpan={7} className="px-4 py-10 text-center">
//                                     <div className="flex justify-center">
//                                         <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                                     </div>
//                                  </td>
//                             </tr>
//                         )}

//                         {!isLoading && !isFetching && stocks.length === 0 && (
//                             <tr>
//                                 <td colSpan={7} className="px-4 py-14 text-center">
//                                     <div className="flex flex-col items-center gap-2">
//                                         <Package size={32} className="text-gray-300" />
//                                         <p className="text-gray-400 text-sm">No stock records found</p>
//                                         <p className="text-xs text-gray-400">
//                                             Stock is created automatically when inwards are marked MAPPED
//                                         </p>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}

//                         {!isLoading && stocks.map((stock) => {
//                             const product = stock.variant?.product || {};
//                             const variant = stock.variant || {};
//                             const status = getStockStatus(stock.quantity, stock.low_stock_threshold);
//                             const location = [stock.room_zone, stock.rack_shelf].filter(Boolean).join(" / ") || "—";
//                             const variantAttr = variant.attributes
//                                 ? Object.entries(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")
//                                 : variant.sku || variant.system_barcode || "—";

//                             return (
//                                 <tr key={stock.stock_id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-4 py-3">
//                                         <div>
//                                             <p className="font-semibold text-gray-800 text-sm">{product.name || "—"}</p>
//                                             <p className="text-xs font-mono text-gray-400 mt-0.5">{product.product_code || "—"}</p>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div>
//                                             <p className="text-xs text-gray-700">{variantAttr}</p>
//                                             {variant.sku && (
//                                                 <p className="text-xs font-mono text-gray-400 mt-0.5">SKU: {variant.sku}</p>
//                                             )}
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3 text-right">
//                                         <span className="font-bold text-gray-800">{stock.quantity}</span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
//                                             <span>{status.icon}</span> {status.label}
//                                         </span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <span className="text-xs font-mono text-gray-500">
//                                             {stock.batch_number || "—"}
//                                         </span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-1 text-xs text-gray-500">
//                                             <MapPin size={12} />
//                                             <span>{location}</span>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-1 text-xs text-gray-500">
//                                             <Calendar size={12} />
//                                             <span>{fmtDate(stock.last_purchase_date)}</span>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             {meta.totalPages > 1 && (
//                 <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
//                     <p className="text-sm text-gray-500">
//                         Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}
//                     </p>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => dispatch(setCurrentPage(currentPage - 1))}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
//                         >
//                             Previous
//                         </button>
//                         <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {meta.totalPages}</span>
//                         <button
//                             onClick={() => dispatch(setCurrentPage(currentPage + 1))}
//                             disabled={currentPage === meta.totalPages}
//                             className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Read-only note */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
//                 <p className="text-xs text-blue-700">
//                     📌 Stock quantities here are read-only. To add stock → create a new inward receipt and mark it MAPPED.
//                     To adjust stock → use manual stock adjustment (future feature).
//                 </p>
//             </div>

//         </div>
//     );
// }