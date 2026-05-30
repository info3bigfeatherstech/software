// TABS/PURCHASE/ExpensesTab/ExpensesTab.jsx

import React, { useState } from "react";
import { Eye, Edit2, Plus } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const EXPENSES = [
    { id: "EXP-001", category: "Rent", description: "Main Warehouse monthly rent", warehouse: "Main Warehouse", amount: 6000, date: "01 May 2026", recordedBy: "Admin" },
    { id: "EXP-002", category: "Office", description: "Stationery and supplies", warehouse: "Delhi Warehouse", amount: 2500, date: "15 May 2026", recordedBy: "Rahul (SM-001)" },
];

export default function ExpensesTab() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Track operational and business expenses</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                    <Plus size={14} /> Add Expense
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Expenses</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">this period</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Amount</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(8500)}</p>
                    <p className="text-xs text-gray-400 mt-1">amount spent</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">This Month</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(8500)}</p>
                    <p className="text-xs text-gray-400 mt-1">May 2026</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Categories</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">expense types</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Categories</option>
                        <option value="rent">Rent</option>
                        <option value="office">Office</option>
                    </select>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expenses</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Expense ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Category</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Description</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Warehouse</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Recorded By</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {EXPENSES.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-50 border text-gray-600 border-gray-200 px-2 py-0.5 rounded">{row.id}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-700">{row.category}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.warehouse}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(row.amount)}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.recordedBy}</td>
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
