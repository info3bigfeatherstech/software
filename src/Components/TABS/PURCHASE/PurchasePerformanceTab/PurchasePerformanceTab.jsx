// TABS/PURCHASE/PurchasePerformanceTab/PurchasePerformanceTab.jsx

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fmtCurrency = (n) => `₹${n.toLocaleString("en-IN")}`;

const VENDORS = [
    { name: "Metro Wholesale", orders: 5, amount: 142500, avg: 28500, onTime: "90%", lastOrder: "26 May 2026", rating: "⭐⭐⭐⭐⭐" },
    { name: "Sharma Traders", orders: 3, amount: 54000, avg: 18000, onTime: "80%", lastOrder: "27 May 2026", rating: "⭐⭐⭐⭐" },
];

export default function PurchasePerformanceTab() {
    const [vendor, setVendor] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Purchase Performance</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Vendor performance metrics and purchase analytics</p>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-800">8</p>
                    <p className="text-xs text-gray-400 mt-1">all time</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">On-Time Rate</p>
                    <p className="text-3xl font-bold text-gray-800">87%</p>
                    <p className="text-xs text-gray-400 mt-1">delivery accuracy</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Avg Order Val</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(28500)}</p>
                    <p className="text-xs text-gray-400 mt-1">per purchase</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Top Vendor</p>
                    <p className="text-3xl font-bold text-gray-800">Metro</p>
                    <p className="text-xs text-gray-400 mt-1">by volume</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Purchase Volume by Vendor</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                            data={[
                                { vendor: "Metro Wholesale", amount: 142500, orders: 5 },
                                { vendor: "Sharma Traders", amount: 54000, orders: 3 },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="vendor" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#6366f1" />
                            <Bar dataKey="orders" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Monthly Purchase Trend</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart
                            data={[
                                { month: "Jan", totalAmount: 38000 },
                                { month: "Feb", totalAmount: 52000 },
                                { month: "Mar", totalAmount: 45000 },
                                { month: "Apr", totalAmount: 67000 },
                                { month: "May", totalAmount: 196500 },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line dataKey="totalAmount" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                        <option value="">All Vendors</option>
                        <option value="metro">Metro Wholesale</option>
                        <option value="sharma">Sharma Traders</option>
                    </select>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor Performance</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">2 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Vendor</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Total Orders</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Total Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Avg Order Value</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">On-Time %</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Last Order</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">Rating</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {VENDORS.map((row) => (
                            <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.name}</td>
                                <td className="px-4 py-3 text-right text-sm text-gray-500">{row.orders}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(row.amount)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtCurrency(row.avg)}</td>
                                <td className="px-4 py-3 text-right text-sm text-gray-500">{row.onTime}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.lastOrder}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{row.rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
