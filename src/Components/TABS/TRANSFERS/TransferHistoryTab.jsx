// TABS/TRANSFERS/TransferHistoryTab.jsx
// Full audit log of all stock movements — PURCHASE, SALE, WH_TO_SHOP, SHOP_TO_SHOP, WH_TO_WH, RETURN
import React, { useState, useEffect } from "react";
import { INITIAL_TRANSFERS, INITIAL_STOCK_LEDGER } from "../../demoData";

const SK = { T: "vyapar_transfers", L: "vyapar_ledger" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };

const TYPE_CLS = {
    WH_TO_SHOP: "bg-blue-100 text-blue-700",
    SHOP_TO_SHOP: "bg-purple-100 text-purple-700",
    WH_TO_WH: "bg-indigo-100 text-indigo-700",
    PURCHASE: "bg-green-100 text-green-700",
    SALE: "bg-orange-100 text-orange-700",
    RETURN: "bg-red-100 text-red-600",
    pending_approval: "bg-yellow-100 text-yellow-700",
};

export default function TransferHistoryTab() {
    const [transfers, setTransfers] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [activeView, setActiveView] = useState("transfers");

    useEffect(() => {
        setTransfers(load(SK.T, INITIAL_TRANSFERS));
        setLedger(load(SK.L, INITIAL_STOCK_LEDGER));
    }, []);

    const filteredTransfers = transfers.filter(t => {
        const matchSearch = !search ||
            (t.transferNumber || t.id)?.toLowerCase().includes(search.toLowerCase()) ||
            t.reason?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || t.type === typeFilter || t.movementType === typeFilter;
        return matchSearch && matchType;
    });

    const filteredLedger = ledger.filter(l => {
        const matchSearch = !search || l.productId?.toLowerCase().includes(search.toLowerCase()) || l.referenceId?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || l.movementType === typeFilter;
        return matchSearch && matchType;
    });

    const allTypes = ["all", "WH_TO_SHOP", "SHOP_TO_SHOP", "WH_TO_WH", "PURCHASE", "SALE", "RETURN"];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Transfer & Movement History</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Complete audit trail of all stock movements</p>
                </div>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 border-b border-gray-200 pb-0">
                {[{ id: "transfers", label: "Transfer Records" }, { id: "ledger", label: "Stock Ledger" }].map(v => (
                    <button key={v.id} onClick={() => setActiveView(v.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all cursor-pointer ${activeView === v.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        {v.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, reason..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700">
                    {allTypes.map(t => <option key={t} value={t}>{t === "all" ? "All Types" : t.replace(/_/g, " ")}</option>)}
                </select>
            </div>

            {/* Transfers Table */}
            {activeView === "transfers" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 text-sm">All Transfer Records</h3>
                        <span className="text-xs text-gray-400">{filteredTransfers.length} records</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            {["Ref #", "Type", "From", "To", "Items", "Date", "Status", "By"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransfers.length === 0
                                ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No records match</td></tr>
                                : filteredTransfers.map(t => {
                                    const from = t.fromWarehouseName || t.fromShopName || t.fromShopId || t.fromWarehouseId || "—";
                                    const to = t.toShopName || t.toWarehouseName || t.toShopId || t.toWarehouseId || "—";
                                    const type = t.type || t.movementType || "TRANSFER";
                                    return (
                                        <tr key={t.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.transferNumber || t.id}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CLS[type] || "bg-gray-100 text-gray-600"}`}>{type.replace(/_/g, " ")}</span></td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{from}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs">{to}</td>
                                            <td className="px-4 py-3 text-gray-500">{Array.isArray(t.items) ? t.items.length : "—"}</td>
                                            <td className="px-4 py-3 text-xs text-gray-400">{t.createdAt || t.date}</td>
                                            <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CLS[t.status] || "bg-gray-100 text-gray-600"}`}>{(t.status || "completed").replace(/_/g, " ")}</span></td>
                                            <td className="px-4 py-3 text-xs text-gray-400">{t.requestedBy || "—"}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stock Ledger */}
            {activeView === "ledger" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 text-sm">Stock Ledger (Movement Log)</h3>
                        <span className="text-xs text-gray-400">{filteredLedger.length} entries</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            {["Entry ID", "Product ID", "Movement", "From", "To", "Qty", "Batch", "Date", "Reference"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredLedger.length === 0
                                ? <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">No ledger entries</td></tr>
                                : filteredLedger.map(l => (
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.id}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{l.productId}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_CLS[l.movementType] || "bg-gray-100 text-gray-600"}`}>{l.movementType}</span></td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{l.fromLocation || "—"}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{l.toLocation || "—"}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{l.quantity}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{l.batchNumber || "—"}</td>
                                        <td className="px-4 py-3 text-xs text-gray-400">{l.createdAt}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.referenceId || "—"}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
