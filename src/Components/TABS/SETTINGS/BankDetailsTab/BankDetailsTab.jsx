// TABS/SETTINGS/BankDetailsTab/BankDetailsTab.jsx

import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const ACCOUNTS = [
    {
        num: 1,
        bank: "HDFC Bank",
        holder: "OfferWale Baba Pvt Ltd",
        account: "****4521",
        ifsc: "HDFC0001234",
        branch: "Karol Bagh, Delhi",
        type: "Current",
        primary: true,
    },
    {
        num: 2,
        bank: "ICICI Bank",
        holder: "OfferWale Baba Pvt Ltd",
        account: "****7832",
        ifsc: "ICIC0005678",
        branch: "Connaught Place, Delhi",
        type: "Savings",
        primary: false,
    },
];

export default function BankDetailsTab() {
    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Bank Details</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Manage bank accounts used for payments and receipts</p>
                </div>
                <button
                    type="button"
                    className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
                >
                    + Add Bank Account
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Accounts</p>
                    <p className="text-3xl font-bold text-blue-700">2</p>
                    <p className="text-xs text-gray-400 mt-1">linked accounts</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Primary Account</p>
                    <p className="text-3xl font-bold text-green-600">HDFC</p>
                    <p className="text-xs text-gray-400 mt-1">default for payments</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Total Balance</p>
                    <p className="text-3xl font-bold text-purple-600">₹—</p>
                    <p className="text-xs text-gray-400 mt-1">balance not synced</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank Accounts</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["#", "Bank Name", "Account Holder", "Account #", "IFSC", "Branch", "Type", "Primary", "Actions"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {ACCOUNTS.map((row) => (
                            <tr key={row.num} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-500">{row.num}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.bank}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{row.holder}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.account}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.ifsc}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.branch}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{row.type}</td>
                                <td className="px-4 py-3">
                                    {row.primary ? (
                                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                            Yes
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                            No
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" aria-label="Edit">
                                            <Pencil size={14} />
                                        </button>
                                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" aria-label="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-700">
                    Bank account details are used in invoice generation and payment tracking. The primary account appears as default on all bills.
                </p>
            </div>
        </div>
    );
}
