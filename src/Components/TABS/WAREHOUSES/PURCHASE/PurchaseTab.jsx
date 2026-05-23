// TABS/WAREHOUSES/PURCHASE/PurchaseTab.jsx
//
// Read-only purchase history view
// Purchase entries are automatically created when inward is marked MAPPED
// This tab shows all purchases with filtering by vendor, warehouse, date range

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Eye, Package, TrendingUp, Building2, Calendar, FileText, Download } from "lucide-react";
import {
    useGetPurchaseEntriesQuery,
    useGetVendorPurchaseSummaryQuery,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseApi";
import { useGetVendorsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import {
    openDetailModal,
    setSearch,
    setVendorFilter,
    setWarehouseFilter,
    setStatusFilter,
    setFromDate,
    setToDate,
    setCurrentPage,
    setPageSize,
    resetFilters,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseSlice";
import PurchaseDetailModal from "./PurchaseDetailModal";
import { CURRENT_USER } from "../../../roles";

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const STATUS_BADGE = {
    RECEIVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-600",
};

export default function PurchaseTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const {
        showDetailModal,
        selectedPurchase,
        search,
        vendorFilter,
        warehouseFilter,
        statusFilter,
        fromDate,
        toDate,
        currentPage,
        pageSize,
    } = useSelector((state) => state.purchase);

    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isWHRole = ["WH_MANAGER", "WH_STOCK_LISTER"].includes(user?.role);
    const userWarehouseId = user?.warehouse_id || "";

    // Effective warehouse filter: WH roles get their warehouse, SUPER_ADMIN can select
    const effectiveWarehouseId = isSuperAdmin ? warehouseFilter : userWarehouseId;

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, refetch } = useGetPurchaseEntriesQuery({
        page: currentPage,
        limit: pageSize,
        search,
        vendor_id: vendorFilter,
        warehouse_id: effectiveWarehouseId,
        status: statusFilter,
        from_date: fromDate,
        to_date: toDate,
    });

    const { data: summaryData } = useGetVendorPurchaseSummaryQuery({
        from_date: fromDate,
        to_date: toDate,
    });

    const { data: vendorsData } = useGetVendorsQuery({ page: 1, limit: 100 });
    const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 100, is_active: "true" }, { skip: !isSuperAdmin });

    const purchases = data?.purchases || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    const vendors = vendorsData?.vendors || [];
    const warehouses = warehousesData?.warehouses || [];
    const summary = summaryData || [];

    // Calculate totals from summary
    const totalPurchases = summary.reduce((sum, v) => sum + v.total_purchases, 0);
    const totalAmount = summary.reduce((sum, v) => sum + v.total_amount, 0);

    // Status options
    const statusOptions = ["", "RECEIVED", "PENDING", "CANCELLED"];
    const statusLabels = { "": "All Status", RECEIVED: "Received", PENDING: "Pending", CANCELLED: "Cancelled" };

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Purchase History</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Purchase entries are automatically created when inwards are marked MAPPED
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => refetch()}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total Purchases</p>
                        <FileText size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{meta.total}</p>
                    <p className="text-xs opacity-60 mt-1">in selected period</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total Value</p>
                        <TrendingUp size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">₹{totalAmount.toLocaleString()}</p>
                    <p className="text-xs opacity-60 mt-1">across all purchases</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Unique Vendors</p>
                        <Building2 size={16} className="opacity-60" />
                    </div>
                    <p className="text-3xl font-bold">{summary.length}</p>
                    <p className="text-xs opacity-60 mt-1">suppliers</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Date Range</p>
                        <Calendar size={16} className="opacity-60" />
                    </div>
                    <p className="text-lg font-bold">
                        {fromDate ? fmtDate(fromDate) : "All"} - {toDate ? fmtDate(toDate) : "Present"}
                    </p>
                    <p className="text-xs opacity-60 mt-1">filter applied</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-3">
                    <input
                        value={search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        placeholder="Search by PO number, invoice, vendor name..."
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
                    {/* Vendor Filter */}
                    <select
                        value={vendorFilter}
                        onChange={(e) => dispatch(setVendorFilter(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map(v => (
                            <option key={v.vendor_id} value={v.vendor_id}>
                                {v.company_name}
                            </option>
                        ))}
                    </select>

                    {/* Warehouse Filter - SUPER_ADMIN only */}
                    {isSuperAdmin && (
                        <select
                            value={warehouseFilter}
                            onChange={(e) => dispatch(setWarehouseFilter(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map(w => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                    {w.warehouse_name} — {w.city}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => dispatch(setStatusFilter(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                    >
                        {statusOptions.map(s => (
                            <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                    </select>

                    {/* From Date */}
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => dispatch(setFromDate(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
                        placeholder="From Date"
                    />

                    {/* To Date */}
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => dispatch(setToDate(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
                        placeholder="To Date"
                    />

                    {/* Page Size */}
                    <select
                        value={pageSize}
                        onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer"
                    >
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
                    </select>
                </div>
            </div>

            {/* Vendor Summary Section */}
            {summary.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700">Vendor-wise Summary</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Vendor</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Total Purchases</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {summary.map((v) => (
                                    <tr key={v.vendor_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-700">{v.vendor_name}</td>
                                        <td className="px-4 py-2 text-right text-sm text-gray-600">{v.total_purchases}</td>
                                        <td className="px-4 py-2 text-right text-sm font-semibold text-gray-800">
                                            ₹{v.total_amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                </div>
            )}

            {/* Purchase Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Purchase #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Warehouse</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice #</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Received Date</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">

                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                 </td>
                            </tr>
                        )}

                        {!isLoading && !isFetching && purchases.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-14 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Package size={32} className="text-gray-300" />
                                        <p className="text-gray-400 text-sm">No purchase entries found</p>
                                        <p className="text-xs text-gray-400">
                                            Purchase entries are created automatically when inwards are marked MAPPED
                                        </p>
                                    </div>
                                 </td>
                            </tr>
                        )}

                        {!isLoading && purchases.map((purchase) => (
                            <tr key={purchase.purchase_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-mono text-xs font-semibold text-gray-800">{purchase.purchase_number}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(purchase.created_at)}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 font-medium">{purchase.vendor?.company_name || "—"}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700">{purchase.warehouse?.warehouse_name || "—"}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-xs font-mono text-gray-600">{purchase.vendor_invoice_no || "—"}</p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="font-semibold text-gray-800">₹{purchase.total_amount?.toLocaleString()}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[purchase.status] || "bg-gray-100 text-gray-500"}`}>
                                        {purchase.status || "RECEIVED"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-xs text-gray-500">{fmtDateTime(purchase.received_at)}</p>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => dispatch(openDetailModal(purchase))}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {meta.totalPages}</span>
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                            disabled={currentPage === meta.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Purchase Detail Modal */}
            {showDetailModal && selectedPurchase && (
                <PurchaseDetailModal
                    purchase={selectedPurchase}
                    onClose={() => dispatch(closeDetailModal())}
                />
            )}

            {/* Read-only note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-center">
                <p className="text-xs text-blue-700">
                    📌 Purchase entries are read-only. They are automatically created when inwards are marked MAPPED.
                    Each purchase entry links to the original inward receipt and stock addition.
                </p>
            </div>

        </div>
    );
}