// TABS/PARTIES/LoyaltyPointsTab/LoyaltyPointsTab.jsx

import React, { useState } from "react";
import { Eye, X } from "lucide-react";

const TIER_BADGE = {
    Silver: "bg-gray-100 text-gray-600 border border-gray-200",
    Gold: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    Platinum: "bg-purple-50 text-purple-700 border border-purple-200",
};

const MEMBERS = [
    {
        id: 1,
        name: "Amit Sharma",
        phone: "9876543210",
        tier: "Gold",
        balance: "1,850 pts",
        earned: "2,400",
        redeemed: "550",
        lastPurchase: "26 May 2026",
    },
    {
        id: 2,
        name: "Priya Singh",
        phone: "9812345678",
        tier: "Silver",
        balance: "320 pts",
        earned: "320",
        redeemed: "0",
        lastPurchase: "20 May 2026",
    },
    {
        id: 3,
        name: "Rahul Verma",
        phone: "9898989898",
        tier: "Platinum",
        balance: "6,200 pts",
        earned: "8,280",
        redeemed: "2,080",
        lastPurchase: "28 May 2026",
    },
];

const REDEMPTIONS = [
    { customer: "Amit Sharma", points: "550 pts", value: "₹55", bill: "BILL-2245", date: "26 May 2026" },
    { customer: "Rahul Verma", points: "2,080 pts", value: "₹208", bill: "BILL-2198", date: "22 May 2026" },
];

export default function LoyaltyPointsTab() {
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("");

    const handleClear = () => {
        setSearch("");
        setTierFilter("");
    };

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="pb-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Loyalty Points</h2>
                <p className="text-sm text-gray-400 mt-0.5">Track customer loyalty tiers, points balance, and redemption history</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Members</p>
                    <p className="text-3xl font-bold text-blue-700">3</p>
                    <p className="text-xs text-gray-400 mt-1">enrolled customers</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Points Issued</p>
                    <p className="text-3xl font-bold text-green-600">12,450</p>
                    <p className="text-xs text-gray-400 mt-1">total points given</p>
                </div>
                <div className="bg-white rounded-xl border border-orange-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-orange-500">Points Redeemed</p>
                    <p className="text-3xl font-bold text-orange-600">3,200</p>
                    <p className="text-xs text-gray-400 mt-1">total points used</p>
                </div>
                <div className="bg-white rounded-xl border border-yellow-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-yellow-600">Active Gold+</p>
                    <p className="text-3xl font-bold text-yellow-700">1</p>
                    <p className="text-xs text-gray-400 mt-1">Gold &amp; Platinum members</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex flex-wrap items-center gap-4">
                <span className="text-xs text-gray-400">Tiers:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE.Silver}`}>
                    Silver <span className="text-gray-400 font-normal">· 0–999 pts</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE.Gold}`}>
                    Gold <span className="text-yellow-600/70 font-normal">· 1000–4999 pts</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE.Platinum}`}>
                    Platinum <span className="text-purple-600/70 font-normal">· 5000+ pts</span>
                </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search members…"
                    className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    <option value="">All Tiers</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                </select>
                <button
                    type="button"
                    onClick={handleClear}
                    className="bg-gray-50 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 inline-flex items-center gap-1.5 transition-colors"
                >
                    <X size={14} /> Clear
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loyalty Members</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">3 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Customer", "Phone", "Tier", "Points Balance", "Points Earned", "Points Redeemed", "Last Purchase", "Actions"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {MEMBERS.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">{m.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{m.phone}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_BADGE[m.tier]}`}>
                                        {m.tier}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-700">{m.balance}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{m.earned}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{m.redeemed}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{m.lastPurchase}</td>
                                <td className="px-4 py-3">
                                    <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Recent Redemptions</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Customer", "Points Used", "Value (₹)", "Bill #", "Date"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {REDEMPTIONS.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.customer}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.points}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">{row.value}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.bill}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-600">
                    Loyalty points are auto-awarded at checkout — 1 point per ₹10 spent. Redemption value: ₹0.10 per point. Tier upgrades are calculated monthly.
                </p>
            </div>
        </div>
    );
}
