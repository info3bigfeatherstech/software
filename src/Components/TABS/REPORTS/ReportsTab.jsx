// TABS/REPORTS/ReportsTab.jsx
import React, { useState } from "react";
import { MONTHLY_SALES, CATEGORY_SALES, PROFIT_LOSS, GST_SUMMARY } from "../../demoData";

const ReportsTab = () => {
    const [activeSection, setActiveSection] = useState("pl");
    const [selectedLocation, setSelectedLocation] = useState("all");
    const [selectedPlatform, setSelectedPlatform] = useState("all");

    const sections = [
        { id: "pl", label: "Profit & Loss" },
        { id: "sales", label: "Sales Summary" },
        { id: "gst", label: "GST Summary" },
    ];

    return (
        <div className="space-y-6">
            {/* Centralized Filters */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800">📊 Reports & Analytics</h2>
                <div className="flex gap-3">
                    <select 
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    >
                        <option value="all">All Shops & Warehouses</option>
                        <option value="SHP-001">Karol Bagh Shop</option>
                        <option value="SHP-002">Connaught Place Shop</option>
                        <option value="WH-001">Delhi Warehouse</option>
                    </select>
                    <select 
                        value={selectedPlatform} 
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                    >
                        <option value="all">All Platforms</option>
                        <option value="offline">In-Store (POS)</option>
                        <option value="online">Online (Website/App)</option>
                    </select>
                </div>
            </div>
            {/* Section toggle */}
            <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-all cursor-pointer ${activeSection === s.id
                                ? "border-blue-500 text-blue-600 bg-blue-50"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* P&L */}
            {activeSection === "pl" && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">April 2025 — Profit & Loss</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Revenue (Sales)</span>
                                <span className="font-semibold text-gray-800">₹{PROFIT_LOSS.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Cost of Goods Sold</span>
                                <span className="font-semibold text-red-500">– ₹{PROFIT_LOSS.cogs.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-green-50/50 px-3 rounded-lg">
                                <span className="font-medium text-gray-700">Gross Profit</span>
                                <span className="font-bold text-green-600">₹{PROFIT_LOSS.grossProfit.toLocaleString()}</span>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Expenses</p>
                                {PROFIT_LOSS.expenses.map(e => (
                                    <div key={e.label} className="flex justify-between items-center py-1.5">
                                        <span className="text-sm text-gray-500 ml-4">→ {e.label}</span>
                                        <span className="text-sm text-red-400">– ₹{e.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-1">
                                    <span className="text-gray-600">Total Expenses</span>
                                    <span className="font-semibold text-red-500">– ₹{PROFIT_LOSS.totalExpenses.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-3 bg-blue-50 px-4 rounded-xl">
                                <span className="font-bold text-gray-800">Net Profit</span>
                                <span className="font-bold text-blue-600 text-xl">₹{PROFIT_LOSS.netProfit.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sales Summary */}
            {activeSection === "sales" && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Monthly trend */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Monthly trend</h3>
                        <div className="space-y-3">
                            {MONTHLY_SALES.map(m => (
                                <div key={m.month} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 w-8">{m.month}</span>
                                    <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden flex">
                                        <div
                                            className="bg-blue-400 h-full flex items-center pl-2"
                                            style={{ width: `${(m.sales / 400000) * 100}%` }}
                                        >
                                            <span className="text-xs text-blue-900 font-medium whitespace-nowrap">₹{(m.sales / 1000).toFixed(0)}K</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium w-16 text-right ${m.profit > 80000 ? "text-green-600" : "text-gray-500"}`}>
                                        +{(m.profit / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Category breakdown */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">By category</h3>
                        <div className="space-y-3">
                            {CATEGORY_SALES.map(c => (
                                <div key={c.category}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-gray-600">{c.category}</span>
                                        <span className="text-sm font-medium text-gray-700">₹{(c.amount / 1000).toFixed(0)}K <span className="text-gray-400 text-xs">({c.percent}%)</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${c.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* GST */}
            {activeSection === "gst" && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
                    <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">GST Summary — {GST_SUMMARY.period}</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-2 text-left text-xs text-gray-400 uppercase">Tax Rate</th>
                                <th className="py-2 text-right text-xs text-gray-400 uppercase">Tax Collected (Sales)</th>
                                <th className="py-2 text-right text-xs text-gray-400 uppercase">ITC (Purchase)</th>
                                <th className="py-2 text-right text-xs text-gray-400 uppercase">Net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {Object.keys(GST_SUMMARY.salesTaxCollected).map(rate => {
                                const collected = GST_SUMMARY.salesTaxCollected[rate];
                                const itc = GST_SUMMARY.purchaseTaxPaid[rate];
                                const net = collected - itc;
                                return (
                                    <tr key={rate}>
                                        <td className="py-3 font-medium text-gray-700">{rate}</td>
                                        <td className="py-3 text-right text-green-600">₹{collected.toLocaleString()}</td>
                                        <td className="py-3 text-right text-blue-500">₹{itc.toLocaleString()}</td>
                                        <td className="py-3 text-right font-semibold text-gray-800">₹{net.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200">
                            <tr>
                                <td className="py-3 font-bold text-gray-800">Total</td>
                                <td className="py-3 text-right font-bold text-green-600">₹{Object.values(GST_SUMMARY.salesTaxCollected).reduce((s, v) => s + v, 0).toLocaleString()}</td>
                                <td className="py-3 text-right font-bold text-blue-500">₹{GST_SUMMARY.itcAvailable.toLocaleString()}</td>
                                <td className="py-3 text-right font-bold text-blue-700">₹{GST_SUMMARY.gstPayable.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReportsTab;