// TABS/TRANSFERS/TransferHistoryTab.jsx
//
// Complete audit trail of all stock movements
// Uses REAL API: GET /stock-ledger

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Eye, X, Download } from "lucide-react";
import { useGetStockLedgerQuery, useGetVariantLedgerQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferApi";
import {
    setLedgerMovementType,
    setLedgerDateRange,
    setLedgerVariantId,
    setLedgerProductId,
    setLedgerCurrentPage,
    setLedgerPageSize,
    resetLedgerFilters,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Transfer_api/transferSlice";

const MOVEMENT_TYPES = [
    { value: "", label: "All Types" },
    { value: "PURCHASE", label: "Purchase" },
    { value: "WH_TO_SHOP", label: "WH → Shop" },
    { value: "WH_TO_WH", label: "WH → WH" },
    { value: "SHOP_TO_SHOP", label: "Shop → Shop" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "SALES", label: "Sales" },
    { value: "RETURN", label: "Return" },
];

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric",
        hour: "2-digit", 
        minute: "2-digit" 
    });
};

const getMovementTypeBadge = (type) => {
    const config = {
        PURCHASE: "bg-green-100 text-green-700",
        WH_TO_SHOP: "bg-blue-100 text-blue-700",
        WH_TO_WH: "bg-indigo-100 text-indigo-700",
        SHOP_TO_SHOP: "bg-purple-100 text-purple-700",
        ADJUSTMENT: "bg-orange-100 text-orange-700",
        SALES: "bg-emerald-100 text-emerald-700",
        RETURN: "bg-red-100 text-red-600",
    };
    return config[type] || "bg-gray-100 text-gray-600";
};

export default function TransferHistoryTab() {
    const dispatch = useDispatch();
    const {
        ledgerFilters,
        ledgerCurrentPage,
        ledgerPageSize,
    } = useSelector((state) => state.transfer);
    
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState("");
    
    // ── Queries ─────────────────────────────────────────────────────────────
    const { data, isLoading, isFetching, refetch } = useGetStockLedgerQuery({
        page: ledgerCurrentPage,
        limit: ledgerPageSize,
        movement_type: ledgerFilters.movement_type,
        variant_id: ledgerFilters.variant_id,
        product_id: ledgerFilters.product_id,
        from_date: ledgerFilters.from_date,
        to_date: ledgerFilters.to_date,
    });
    
    const { data: variantLedger, refetch: refetchVariant } = useGetVariantLedgerQuery(
        { variantId: selectedVariantId, page: 1, limit: 100 },
        { skip: !selectedVariantId || !showVariantModal }
    );
    
    const ledger = data?.ledger || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    
    const handleFilterChange = (key, value) => {
        if (key === "movement_type") dispatch(setLedgerMovementType(value));
        if (key === "from_date") dispatch(setLedgerDateRange({ from_date: value, to_date: ledgerFilters.to_date }));
        if (key === "to_date") dispatch(setLedgerDateRange({ from_date: ledgerFilters.from_date, to_date: value }));
        if (key === "variant_id") dispatch(setLedgerVariantId(value));
        if (key === "product_id") dispatch(setLedgerProductId(value));
    };
    
    const handleResetFilters = () => {
        dispatch(resetLedgerFilters());
    };
    
    const handleViewVariantLedger = (variantId) => {
        setSelectedVariantId(variantId);
        setShowVariantModal(true);
        refetchVariant();
    };
    
    const handleExportCSV = () => {
        // Simple CSV export
        const headers = ["Ledger ID", "Movement Type", "Product ID", "Variant ID", "Quantity", "From", "To", "Reference Type", "Reference ID", "Date", "Remarks"];
        const rows = ledger.map(entry => [
            entry.ledger_id,
            entry.movement_type,
            entry.product_id,
            entry.variant_id,
            entry.quantity,
            entry.from_warehouse_id || entry.from_shop_id || "",
            entry.to_warehouse_id || entry.to_shop_id || "",
            entry.reference_type || "",
            entry.reference_id || "",
            entry.created_at,
            entry.remarks || "",
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stock_ledger_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Transfer & Movement History</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Complete audit trail of all stock movements</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportCSV} 
                        disabled={ledger.length === 0}
                        className="px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <button 
                        onClick={() => refetch()} 
                        className="px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 text-gray-700">
                <div className="flex gap-3 flex-wrap items-end">
                    <div className="min-w-[150px]">
                        <label className="block text-xs text-gray-500 mb-1">Movement Type</label>
                        <select
                            value={ledgerFilters.movement_type}
                            onChange={(e) => handleFilterChange("movement_type", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
                        >
                            {MOVEMENT_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                        <input
                            type="date"
                            value={ledgerFilters.from_date}
                            onChange={(e) => handleFilterChange("from_date", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                        <input
                            type="date"
                            value={ledgerFilters.to_date}
                            onChange={(e) => handleFilterChange("to_date", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Variant ID</label>
                        <input
                            type="text"
                            value={ledgerFilters.variant_id}
                            onChange={(e) => handleFilterChange("variant_id", e.target.value)}
                            placeholder="Filter by variant"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Product ID</label>
                        <input
                            type="text"
                            value={ledgerFilters.product_id}
                            onChange={(e) => handleFilterChange("product_id", e.target.value)}
                            placeholder="Filter by product"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40"
                        />
                    </div>
                    
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            
            {/* Stock Ledger Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">Stock Ledger (Movement Log)</h3>
                    <span className="text-xs text-gray-400">{meta.total} entries</span>
                </div>
                
                {(isLoading || isFetching) && (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                
                {!isLoading && !isFetching && ledger.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        No ledger entries found. Try adjusting your filters.
                    </div>
                )}
                
                {!isLoading && !isFetching && ledger.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product / Variant</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Qty</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">From</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">To</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ledger.map((entry) => (
                                <tr key={entry.ledger_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMovementTypeBadge(entry.movement_type)}`}>
                                            {entry.movement_type?.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-mono text-xs text-gray-500">{entry.product_id?.slice(-8)}</p>
                                        <p className="font-mono text-xs text-gray-400 mt-0.5">{entry.variant_id?.slice(-8)}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`font-semibold ${entry.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                                            {entry.quantity > 0 ? `+${entry.quantity}` : entry.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {entry.from_warehouse_id?.slice(-8) || entry.from_shop_id?.slice(-8) || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        {entry.to_warehouse_id?.slice(-8) || entry.to_shop_id?.slice(-8) || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-400">{entry.reference_type || "—"}</span>
                                        {entry.reference_id && (
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{entry.reference_id?.slice(-8)}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">
                                        {fmtDate(entry.created_at)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleViewVariantLedger(entry.variant_id)}
                                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Variant Ledger"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Showing {((ledgerCurrentPage - 1) * ledgerPageSize) + 1}–{Math.min(ledgerCurrentPage * ledgerPageSize, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => dispatch(setLedgerCurrentPage(ledgerCurrentPage - 1))}
                            disabled={ledgerCurrentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">{ledgerCurrentPage} / {meta.totalPages}</span>
                        <button
                            onClick={() => dispatch(setLedgerCurrentPage(ledgerCurrentPage + 1))}
                            disabled={ledgerCurrentPage === meta.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
            
            {/* Variant Ledger Modal */}
            {showVariantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">Variant Ledger</h3>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedVariantId}</p>
                            </div>
                            <button
                                onClick={() => setShowVariantModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {!variantLedger?.ledger?.length ? (
                                <div className="text-center py-12 text-gray-400 text-sm">
                                    No ledger entries for this variant
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">From</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">To</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {variantLedger.ledger.map((entry) => (
                                            <tr key={entry.ledger_id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMovementTypeBadge(entry.movement_type)}`}>
                                                        {entry.movement_type?.replace(/_/g, " ")}
                                                    </span>
                                                 </td>
                                                <td className="px-3 py-2 text-right font-semibold">
                                                    {entry.quantity}
                                                 </td>
                                                <td className="px-3 py-2 text-xs text-gray-500">
                                                    {entry.from_warehouse_id?.slice(-8) || entry.from_shop_id?.slice(-8) || "—"}
                                                 </td>
                                                <td className="px-3 py-2 text-xs text-gray-500">
                                                    {entry.to_warehouse_id?.slice(-8) || entry.to_shop_id?.slice(-8) || "—"}
                                                 </td>
                                                <td className="px-3 py-2 text-xs text-gray-400">
                                                    {fmtDate(entry.created_at)}
                                                 </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 p-4 flex justify-end">
                            <button
                                onClick={() => setShowVariantModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}