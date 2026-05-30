// TABS/CASHBANK/LoanAccountTab/LoanAccountTab.jsx

import React, { useState } from "react";
import { Eye, Edit2, Plus, RefreshCw } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    Active: "bg-blue-50 text-blue-700 border border-blue-200",
    Closed: "bg-green-50 text-green-700 border border-green-200",
    Overdue: "bg-red-50 text-red-600 border border-red-200",
};

const LOANS = [
    {
        id: "LOAN-001",
        lender: "SBI Bank",
        account: "ACC-****7821",
        amount: 500000,
        emi: "₹18,500/mo",
        nextDue: "05 Jun 2026",
        repaid: 120000,
        outstanding: 380000,
        status: "Active",
    },
];

export default function LoanAccountTab() {
    const [lenderSearch, setLenderSearch] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Loan Account</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Track business loans, EMIs, and outstanding balances</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                        <Plus size={14} /> Add Loan
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Loans</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">active accounts</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Borrowed</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(500000)}</p>
                    <p className="text-xs text-gray-400 mt-1">principal amount</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Repaid</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(120000)}</p>
                    <p className="text-xs text-gray-400 mt-1">paid so far</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Outstanding</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(380000)}</p>
                    <p className="text-xs text-gray-400 mt-1">remaining balance</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs text-gray-500 mb-1">Lender / Bank</label>
                        <input type="text" value={lenderSearch} onChange={(e) => setLenderSearch(e.target.value)} placeholder="Search lender..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Closed">Closed</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loan Accounts</span>
                    <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-400">1 record</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Loan ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Lender</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Account #</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">EMI</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Next Due</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Repaid</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Outstanding</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {LOANS.map((loan) => (
                            <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">{loan.id}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{loan.lender}</td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded">{loan.account}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(loan.amount)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{loan.emi}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{loan.nextDue}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(loan.repaid)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(loan.outstanding)}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[loan.status]}`}>{loan.status}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                            <Eye size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Add Payment">
                                            <Plus size={14} />
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
