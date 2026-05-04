// TABS/PARTIES/PartiesTab.jsx
import React, { useState } from "react";
import { INITIAL_CUSTOMERS, INITIAL_VENDORS } from "../../demoData";

const PartiesTab = () => {
    const [activeType, setActiveType] = useState("all");
    const [search, setSearch] = useState("");

    const all = [
        ...INITIAL_CUSTOMERS.map(c => ({ ...c, type: "customer" })),
        ...INITIAL_VENDORS.map(v => ({ ...v, type: "vendor" })),
    ];

    const filtered = all.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.city.toLowerCase().includes(search.toLowerCase());
        const matchType = activeType === "all" || p.type === activeType;
        return matchSearch && matchType;
    });

    return (
        <div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Parties", value: all.length },
                    { label: "Customers", value: INITIAL_CUSTOMERS.length, color: "text-blue-600" },
                    { label: "Suppliers", value: INITIAL_VENDORS.length, color: "text-purple-600" },
                    { label: "Total Outstanding", value: "₹" + ((INITIAL_CUSTOMERS.reduce((s, c) => s + c.outstanding, 0) + INITIAL_VENDORS.reduce((s, v) => s + v.outstanding, 0)) / 1000).toFixed(0) + "K", color: "text-red-500" },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-2xl font-semibold ${s.color || "text-gray-800"}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-4">
                {["all", "customer", "vendor"].map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveType(t)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer capitalize ${activeType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {t === "all" ? "All Parties" : t + "s"}
                    </button>
                ))}

                <input
                    type="text"
                    placeholder="Search parties..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="ml-auto px-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                />
                <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    + Add Party
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Name", "Type", "Phone", "City", "Total Business", "Outstanding", "GSTIN", "Status"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(p => (
                            <tr key={`${p.type}-${p.id}`} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-800">{p.name}</div>
                                    <div className="text-xs text-gray-400">{p.id}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.type === "customer" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                        }`}>
                                        {p.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                                <td className="px-4 py-3 text-gray-600">{p.city}</td>
                                <td className="px-4 py-3 font-medium text-gray-700">
                                    ₹{(p.totalBusiness || p.totalPurchased || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                    {p.outstanding > 0
                                        ? <span className="text-red-500 font-medium">₹{p.outstanding.toLocaleString()}</span>
                                        : <span className="text-green-500 text-xs">Cleared</span>
                                    }
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.gstin || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-12 text-center text-gray-400 text-sm">No parties found</div>
                )}
            </div>
        </div>
    );
};

export default PartiesTab;