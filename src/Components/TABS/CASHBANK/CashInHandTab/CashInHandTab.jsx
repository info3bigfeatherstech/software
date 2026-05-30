// TABS/CASHBANK/CashInHandTab/CashInHandTab.jsx

import React, { useState } from "react";
import { Eye, Edit2, RefreshCw, Plus } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    "Cash In": "bg-green-50 text-green-700 border border-green-200",
    "Cash Out": "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const ENTRIES = [
    {
        id: "CH-001",
        date: "26 May 2026",
        description: "Daily sales collection",
        type: "Cash In",
        amount: 25000,
        recordedBy: "Rahul (SM-001)",
    },
    {
        id: "CH-002",
        date: "26 May 2026",
        description: "Petty cash - office supplies",
        type: "Cash Out",
        amount: 8500,
        recordedBy: "Admin",
    },
];

export default function CashInHandTab() {
    const [date, setDate] = useState("");
    const [branch, setBranch] = useState("Main Shop");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cash In Hand</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Track daily cash collections and petty cash expenses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                        <Plus size={14} /> Add Entry
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Opening Balance</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(10000)}</p>
                    <p className="text-xs text-gray-400 mt-1">start of day</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Cash In</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(25000)}</p>
                    <p className="text-xs text-gray-400 mt-1">collected today</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Cash Out</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(8500)}</p>
                    <p className="text-xs text-gray-400 mt-1">spent today</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Closing Balance</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(26500)}</p>
                    <p className="text-xs text-gray-400 mt-1">end of day</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Branch / Shop</label>
                        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="Main Shop">Main Shop</option>
                            <option value="Branch - Andheri">Branch - Andheri</option>
                            <option value="Branch - Bandra">Branch - Bandra</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cash Entries</span>
                    <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-400">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Entry ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Description</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Type</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Recorded By</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {ENTRIES.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">{entry.id}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{entry.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{entry.description}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[entry.type]}`}>{entry.type}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(entry.amount)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{entry.recordedBy}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                            <Eye size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
