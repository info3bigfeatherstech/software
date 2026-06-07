// TABS/WAREHOUSES/WarehouseStockTab.jsx
// Per-warehouse stock view — product → room → rack → position
import React, { useState, useEffect } from "react";
import { INITIAL_WAREHOUSES, INITIAL_PRODUCTS } from "../../demoData";
import { CURRENT_USER, filterLocationList, isAdmin } from "../../roles";

const SK = { W: "vyapar_warehouses", P: "vyapar_products" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };

export default function WarehouseStockTab() {
    const [warehouses, setWarehouses] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedWH, setSelectedWH] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        const wh = filterLocationList(load(SK.W, INITIAL_WAREHOUSES));
        const p = load(SK.P, INITIAL_PRODUCTS);
        setWarehouses(wh);
        setAllProducts(p);
        if (wh.length > 0) {
            const initialWH = isAdmin() ? wh[0].id : CURRENT_USER.locationId;
            setSelectedWH(initialWH);
        }
    }, []);

    // For demo: assign products to warehouses by cycling through available warehouses
    const whProducts = allProducts.map((p, i) => ({
        ...p,
        warehouseId: p.warehouseId || warehouses[i % warehouses.length]?.id,
        room: p.room || ["Ground Floor", "First Floor", "Cold Storage"][i % 3],
        rack: p.rack || `R${(i % 5) + 1}`,
        position: p.position || `P${(i % 10) + 1}`,
    })).filter(p => p.warehouseId === selectedWH);

    const categories = ["all", ...new Set(whProducts.map(p => p.category).filter(Boolean))];
    const filtered = whProducts.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search) || p.sku?.includes(search);
        const matchCat = categoryFilter === "all" || p.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const lowStockCount = filtered.filter(p => p.stock <= (p.lowStockAlert || 10)).length;
    const totalValue = filtered.reduce((s, p) => s + (p.stock * (p.mrp || 0)), 0);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Warehouse Stock View</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Product locations: Warehouse → Room → Rack → Position</p>
                </div>
                {isAdmin() ? (
                    <select value={selectedWH} onChange={e => setSelectedWH(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700">
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                ) : (
                    <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                        📍 {warehouses[0]?.name || CURRENT_USER.locationId}
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Total Products", value: filtered.length, color: "text-gray-800" },
                    { label: "Low Stock", value: lowStockCount, color: lowStockCount > 0 ? "text-red-500" : "text-green-600" },
                    { label: "Total Value (MRP)", value: `₹${(totalValue / 1000).toFixed(0)}K`, color: "text-blue-600" },
                    { label: "Categories", value: new Set(filtered.map(p => p.category)).size, color: "text-purple-600" },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search + Category filter */}
            <div className="flex items-center gap-3">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, barcode, SKU..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none" />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
                </select>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 text-sm">
                        {warehouses.find(w => w.id === selectedWH)?.name} — Stock
                    </h3>
                </div>
                <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["Product", "Barcode/SKU", "Location (Room → Rack → Pos)", "Stock", "Min Stock", "Prices", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0
                            ? <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No products found</td></tr>
                            : filtered.map(p => {
                                const isLow = p.stock <= (p.lowStockAlert || 10);
                                const isOut = p.stock === 0;
                                return (
                                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-orange-50/30" : ""}`}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.brand} · {p.category}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{p.barcode}</code>
                                            {p.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {p.sku}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs">
                                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{p.room}</span>
                                                <span className="text-gray-400">›</span>
                                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{p.rack}</span>
                                                <span className="text-gray-400">›</span>
                                                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{p.position}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-lg font-bold ${isOut ? "text-red-600" : isLow ? "text-orange-500" : "text-green-600"}`}>{p.stock}</span>
                                            <span className="text-xs text-gray-400 ml-1">{p.unit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{p.lowStockAlert || 10}</td>
                                        <td className="px-4 py-3 text-xs space-y-0.5">
                                            <p>MRP: <span className="font-semibold text-red-600">₹{p.mrp}</span></p>
                                            <p>Retail: <span className="text-blue-600">₹{p.retail || p.mrp}</span></p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isOut ? "bg-red-100 text-red-700" : isLow ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                                                {isOut ? "Out of Stock" : isLow ? "Low Stock" : "OK"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
