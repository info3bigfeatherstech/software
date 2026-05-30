// TABS/PURCHASE/PurchaseReturnsTab/PurchaseReturnsTab.jsx

import React, { useState } from "react";
import { Eye, Edit2, Plus } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const RETURNS = [
    {
        id: "RET-001",
        vendor: "Sharma Traders",
        bill: "INV-7712",
        items: "3 units",
        value: 12000,
        reason: "Damaged goods received",
        status: "Pending",
        date: "27 May 2026",
    },
];

export default function PurchaseReturnsTab() {
    const [search, setSearch] = useState("");
    const [vendor, setVendor] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Purchase Return / Dr. Note</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Manage returned goods and debit notes raised against vendors</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                    <Plus size={14} /> New Return
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Returns</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">all time</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Value</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(12000)}</p>
                    <p className="text-xs text-gray-400 mt-1">returned amount</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Pending Credit</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(12000)}</p>
                    <p className="text-xs text-gray-400 mt-1">awaiting credit note</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Vendors</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">with returns</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search returns..." className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Vendors</option>
                        <option value="sharma">Sharma Traders</option>
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Purchase Returns</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">1 record</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Return ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Vendor</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Original Bill</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Items</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Return Value</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Reason</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RETURNS.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-50 border text-gray-600 border-gray-200 px-2 py-0.5 rounded">{row.id}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-700">{row.vendor}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.bill}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.items}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(row.value)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.reason}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[row.status]}`}>{row.status}</span></td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3 text-center">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors mr-0.5" title="View"><Eye size={14} /></button>
                                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit"><Edit2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
