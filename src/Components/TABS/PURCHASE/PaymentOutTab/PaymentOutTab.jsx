// TABS/PURCHASE/PaymentOutTab/PaymentOutTab.jsx

import React, { useState } from "react";
import { Eye, RefreshCw } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    Paid: "bg-green-50 text-green-700 border border-green-200",
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const PAYMENTS = [
    { id: "PAY-001", vendor: "Metro Wholesale", mode: "Bank Transfer", amount: 24500, reference: "REF-4421", date: "26 May 2026", status: "Paid" },
    { id: "PAY-002", vendor: "Sharma Traders", mode: "Cheque", amount: 18000, reference: "CHQ-7712", date: "27 May 2026", status: "Pending" },
];

export default function PaymentOutTab() {
    const [search, setSearch] = useState("");
    const [vendor, setVendor] = useState("");
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Payment Out</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Track outgoing payments made to vendors</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Payments</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">this period</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Paid</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(42500)}</p>
                    <p className="text-xs text-gray-400 mt-1">amount disbursed</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">awaiting payment</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Vendors Paid</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">unique vendors</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..." className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Vendors</option>
                        <option value="metro">Metro Wholesale</option>
                        <option value="sharma">Sharma Traders</option>
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                    </select>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Out</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Payment ID</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Vendor</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Payment Mode</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Reference #</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {PAYMENTS.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-50 border text-gray-600 border-gray-200 px-2 py-0.5 rounded">{row.id}</span></td>
                                <td className="px-4 py-3 text-sm text-gray-700">{row.vendor}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.mode}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(row.amount)}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.reference}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[row.status]}`}>{row.status}</span></td>
                                <td className="px-4 py-3 text-center">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View"><Eye size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
