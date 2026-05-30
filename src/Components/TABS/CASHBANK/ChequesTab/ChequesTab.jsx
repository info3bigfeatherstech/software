// TABS/CASHBANK/ChequesTab/ChequesTab.jsx

import React, { useState } from "react";
import { Eye, CheckCircle, XCircle, RefreshCw, Plus } from "lucide-react";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const BADGE = {
    Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Cleared: "bg-green-50 text-green-700 border border-green-200",
    Bounced: "bg-red-50 text-red-600 border border-red-200",
};

const CHEQUES = [
    {
        id: "CHQ-4521",
        date: "26 May 2026",
        party: "Sharma Traders",
        bank: "ICICI Bank",
        amount: 15000,
        issueDate: "20 May 2026",
        dueDate: "30 May 2026",
        status: "Pending",
    },
    {
        id: "CHQ-4520",
        date: "24 May 2026",
        party: "Metro Wholesale",
        bank: "HDFC Bank",
        amount: 42000,
        issueDate: "18 May 2026",
        dueDate: "28 May 2026",
        status: "Cleared",
    },
];

export default function ChequesTab() {
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");
    const [partySearch, setPartySearch] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cheques</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Manage issued and received cheques, track clearance status</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
                        <Plus size={14} /> Add Cheque
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Cheques</p>
                    <p className="text-3xl font-bold text-gray-800">2</p>
                    <p className="text-xs text-gray-400 mt-1">all time</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Pending Clearance</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">awaiting bank</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Cleared</p>
                    <p className="text-3xl font-bold text-gray-800">1</p>
                    <p className="text-xs text-gray-400 mt-1">successfully cleared</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Bounced</p>
                    <p className="text-3xl font-bold text-gray-800">0</p>
                    <p className="text-xs text-gray-400 mt-1">returned cheques</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Cleared">Cleared</option>
                            <option value="Bounced">Bounced</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 mb-1">Party Name</label>
                        <input type="text" value={partySearch} onChange={(e) => setPartySearch(e.target.value)} placeholder="Search party..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cheque Register</span>
                    <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-400">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Cheque #</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Party</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Bank</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Issue Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Due Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {CHEQUES.map((cheque) => (
                            <tr key={cheque.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">{cheque.id}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{cheque.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{cheque.party}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{cheque.bank}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(cheque.amount)}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{cheque.issueDate}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{cheque.dueDate}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[cheque.status]}`}>{cheque.status}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                            <Eye size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors" title="Mark Cleared">
                                            <CheckCircle size={14} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors" title="Mark Bounced">
                                            <XCircle size={14} />
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
