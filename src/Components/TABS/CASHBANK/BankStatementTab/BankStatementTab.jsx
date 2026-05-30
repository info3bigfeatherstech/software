// TABS/CASHBANK/BankStatementTab/BankStatementTab.jsx

import React, { useState } from "react";
import { Eye, Download, RefreshCw } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    Credit: "bg-green-50 text-green-700 border border-green-200",
    Debit: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const TRANSACTIONS = [
    {
        id: "TXN-001",
        date: "26 May 2026",
        description: "Payment received from Metro Wholesale",
        account: "HDFC - ****4521",
        type: "Credit",
        amount: 50000,
        balance: 50000,
    },
    {
        id: "TXN-002",
        date: "27 May 2026",
        description: "Rent payment - Main Warehouse",
        account: "HDFC - ****4521",
        type: "Debit",
        amount: 12000,
        balance: 38000,
    },
];

export default function BankStatementTab() {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [bankAccount, setBankAccount] = useState("HDFC - ****4521");
    const [txnType, setTxnType] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Bank Statement</h2>
                    <p className="text-sm text-gray-400 mt-0.5">View and download bank transaction history</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Transactions</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">this period</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Credits</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(50000)}</p>
                    <p className="text-xs text-gray-400 mt-1">money in</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Debits</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(12000)}</p>
                    <p className="text-xs text-gray-400 mt-1">money out</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Closing Balance</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(38000)}</p>
                    <p className="text-xs text-gray-400 mt-1">as of today</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From Date</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To Date</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Bank Account</label>
                        <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="HDFC - ****4521">HDFC - ****4521</option>
                            <option value="ICICI - ****8832">ICICI - ****8832</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select value={txnType} onChange={(e) => setTxnType(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">All Types</option>
                            <option value="Credit">Credit</option>
                            <option value="Debit">Debit</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transactions</span>
                    <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-400">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Txn ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Description</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Bank Account</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Type</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Balance</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {TRANSACTIONS.map((txn) => (
                            <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">{txn.id}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{txn.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{txn.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{txn.account}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[txn.type]}`}>{txn.type}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(txn.amount)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(txn.balance)}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                            <Eye size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Download">
                                            <Download size={14} />
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
