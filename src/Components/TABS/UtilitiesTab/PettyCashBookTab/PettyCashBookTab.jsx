// TABS/UtilitiesTab/PettyCashBookTab/PettyCashBookTab.jsx

import React, { useState } from "react";
import { Wallet, Plus, TrendingDown, X, Pencil, Trash2 } from "lucide-react";

const ENTRIES = [
    { id: "PCE-006", date: "28 May 2026", description: "Tea & snacks for staff", category: "Meals", type: "Expense", amount: "₹240", balance: "₹3,660", by: "Rahul", amountClass: "text-red-600" },
    { id: "PCE-005", date: "27 May 2026", description: "Printer paper purchase", category: "Stationery", type: "Expense", amount: "₹800", balance: "₹3,900", by: "Admin", amountClass: "text-red-600" },
    { id: "PCE-004", date: "26 May 2026", description: "Auto fare - delivery", category: "Transport", type: "Expense", amount: "₹350", balance: "₹4,700", by: "Rahul", amountClass: "text-red-600" },
    { id: "PCE-003", date: "25 May 2026", description: "Cash received from owner", category: "—", type: "Receipt", amount: "₹2,500", balance: "₹5,050", by: "Admin", amountClass: "text-green-600" },
    { id: "PCE-002", date: "24 May 2026", description: "Electricity bill advance", category: "Utilities", type: "Expense", amount: "₹2,450", balance: "₹2,550", by: "Admin", amountClass: "text-red-600" },
    { id: "PCE-001", date: "20 May 2026", description: "Opening balance", category: "—", type: "Receipt", amount: "₹5,000", balance: "₹5,000", by: "Admin", amountClass: "text-green-600" },
];

const TYPE_BADGE = {
    Receipt: "bg-green-50 text-green-700 border border-green-200",
    Expense: "bg-red-50 text-red-600 border border-red-200",
};

export default function PettyCashBookTab() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [entryType, setEntryType] = useState("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const inputCls = "bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300";

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-gray-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Petty Cash Book</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Track small day-to-day cash expenses and receipts</p>
                    </div>
                </div>
                <TrendingDown size={18} className="text-gray-300 hidden sm:block" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Opening Balance</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">₹5,000</p>
                    <p className="text-xs text-gray-400 mt-1">this month</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Total Receipts</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">₹2,500</p>
                    <p className="text-xs text-gray-400 mt-1">cash in</p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-red-400">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">₹3,840</p>
                    <p className="text-xs text-gray-400 mt-1">cash out</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Closing Balance</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">₹3,660</p>
                    <p className="text-xs text-gray-400 mt-1">current balance</p>
                </div>
            </div>

            {showAddForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Add Petty Cash Entry</h3>
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex gap-1">
                            <button type="button" onClick={() => setEntryType("receipt")} className={`text-xs px-3 py-1.5 rounded-lg ${entryType === "receipt" ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}>Receipt</button>
                            <button type="button" onClick={() => setEntryType("expense")} className={`text-xs px-3 py-1.5 rounded-lg ${entryType === "expense" ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}>Expense</button>
                        </div>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                            <option value="">Category</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Transport">Transport</option>
                            <option value="Meals">Meals</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Misc">Misc</option>
                        </select>
                        <input type="text" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputCls} w-32`} />
                    </div>
                    <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} w-full`} />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                            Save Entry
                        </button>
                        <button type="button" onClick={() => setShowAddForm(false)} className="bg-white border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search entries…"
                    className={`${inputCls} flex-1 min-w-[200px]`}
                />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputCls}>
                    <option value="">All</option>
                    <option value="Receipt">Receipt</option>
                    <option value="Expense">Expense</option>
                </select>
                <button type="button" onClick={() => { setSearch(""); setTypeFilter(""); }} className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 inline-flex items-center gap-1.5">
                    <X size={14} /> Clear
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Petty Cash Entries</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">6 records</span>
                        <button type="button" onClick={() => setShowAddForm(true)} className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-700 inline-flex items-center gap-1.5">
                            <Plus size={14} /> Add Entry
                        </button>
                    </div>
                </div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Entry ID", "Date", "Description", "Category", "Type", "Amount", "Balance", "Recorded By", "Actions"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {ENTRIES.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3 text-gray-700">{row.description}</td>
                                <td className="px-4 py-3 text-gray-500">{row.category}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[row.type]}`}>{row.type}</span>
                                </td>
                                <td className={`px-4 py-3 font-semibold ${row.amountClass}`}>{row.amount}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.balance}</td>
                                <td className="px-4 py-3 text-gray-600">{row.by}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"><Pencil size={14} /></button>
                                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-600">
                    Petty cash entries are for small operational expenses only. For large purchases, use the Purchase Bills section. All entries are recorded against the logged-in staff member.
                </p>
            </div>
        </div>
    );
}
