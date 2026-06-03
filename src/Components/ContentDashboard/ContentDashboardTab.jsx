// src/Components/ContentDashboard/ContentDashboardTab.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CURRENT_USER, filterByLocation, isAdmin } from "../roles";
import { useGetProductStocksQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetShopsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import NetworkStockPanel from "../shared/NetworkStockPanel";

const StatCard = ({ label, value, sub, color = "text-gray-800", gradient }) => (
    <div className={`rounded-xl p-5 ${gradient || "bg-white border border-gray-100 shadow-sm"}`}>
        <p className={`text-[11px] uppercase tracking-widest font-medium mb-2 ${gradient ? "text-white/70" : "text-gray-400"}`}>{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${gradient ? "text-white" : color}`}>{value}</p>
        {sub && <p className={`text-xs mt-1.5 ${gradient ? "text-white/60" : "text-gray-400"}`}>{sub}</p>}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-2">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
                    {p.name}: <span className="font-semibold ml-1">₹{p.value?.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
};

export default function ContentDashboardTab() {
    const { user } = useSelector((state) => state.auth);
    const [shopFilter, setShopFilter] = useState("all");

    // ── Real API calls ─────────────────────────────────────────────────────────
    const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 100 });
    const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 });

    // Transform stocks to products format
    const allProducts = stocksData?.stocks?.map(s => ({
        id: s.stock_id,
        name: s.variant?.product?.name || "Unknown Product",
        stock: s.quantity || 0,
        lowStockAlert: s.low_stock_threshold || 10,
        mrp: s.variant?.mrp || 0,
        warehouse_id: s.warehouse_id,
        variant_id: s.variant_id,
    })) || [];

    const shops = shopsData?.shops || [];

    // ── Scope products to user's location ──────────────────────────────────────
    const scopedProducts = user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
        ? allProducts
        : filterByLocation(allProducts, 'warehouse_id');

    // Admin can filter by specific shop (for products, we use warehouse filtering)
    const filteredProducts = (isAdmin() && shopFilter !== "all")
        ? scopedProducts.filter(p => p.warehouse_id === shopFilter)
        : scopedProducts;

    // ── Derived stats ─────────────────────────────────────────────────────────
    const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
    const outOfStock = filteredProducts.filter(p => p.stock === 0);
    const totalInventoryValue = filteredProducts.reduce((s, p) => s + ((p.stock || 0) * (p.mrp || 0)), 0);

    // ── Empty chart data (replacing demo data) ─────────────────────────────────
    const chartData = [
        { month: "Jan", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Feb", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Mar", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Apr", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "May", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Jun", Sales: 0, Purchase: 0, Profit: 0 },
    ];

    // Location label for display
    const locationLabel = isAdmin()
        ? "All Locations"
        : user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
            ? `Shop: ${CURRENT_USER.locationName || CURRENT_USER.shop_id}`
            : `Warehouse: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

    return (
        <div className="space-y-6">

            {/* ── Top bar ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Welcome back, manage your business efficiently &nbsp;
                        <span className="font-medium text-blue-600">{locationLabel}</span>
                    </p>
                </div>

                {/* Admin-only shop/warehouse filter */}
                {isAdmin() && shops.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">Filter by location:</span>
                        <select
                            value={shopFilter}
                            onChange={e => setShopFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">All Locations</option>
                            {shops.map(s => (
                                <option key={s.shop_id} value={s.shop_id}>
                                    🏪 {s.shop_name} (Shop)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* ── KPI Cards ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total SKUs"
                    value={filteredProducts.length}
                    sub="active stock entries"
                />
                <StatCard
                    label="Total Units"
                    value={filteredProducts.reduce((s, p) => s + p.stock, 0).toLocaleString()}
                    sub="across all products"
                />
                <StatCard
                    label="Inventory Value"
                    value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`}
                    sub="at MRP"
                />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowStock.length}
                    sub={`${outOfStock.length} out of stock`}
                    color={lowStock.length > 0 ? "text-red-500" : "text-green-600"}
                />
            </div>

            {/* ── Secondary KPIs ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Products in Scope"
                    value={filteredProducts.length}
                    sub={isAdmin() ? `across ${shops.length} locations` : `at your ${CURRENT_USER.locationName || "location"}`}
                />
                <StatCard
                    label="Active Products"
                    value={filteredProducts.filter(p => p.stock > 0).length}
                    sub="with positive stock"
                />
                <StatCard
                    label="Low Stock Items"
                    value={lowStock.length}
                    sub={outOfStock.length > 0 ? `${outOfStock.length} completely out` : "all good"}
                    color={lowStock.length > 0 ? "text-orange-500" : "text-gray-800"}
                />
                <StatCard
                    label={isAdmin() ? "Total Locations" : "Your Location"}
                    value={isAdmin() ? shops.length : "1"}
                    sub={isAdmin() ? `${shops.length} shops` : CURRENT_USER.locationName || CURRENT_USER.locationId}
                />
            </div>

            {/* ── Chart + Network Stock Panel ──────────────────────────────── */}
            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 text-sm">Monthly Sales vs Purchase vs Profit</h3>
                        <span className="text-xs text-gray-400">Last 6 months (data loading...)</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                            <Bar dataKey="Sales" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="Purchase" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
                            <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={28} />
                        </BarChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs text-gray-400 mt-3">Real sales data will appear here once billing is active</p>
                </div>

                {/* NetworkStockPanel — stock-only, visible to ALL roles */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-80">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 text-sm">📦 Network Stock</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All locations</span>
                    </div>
                    <NetworkStockPanel />
                </div>
            </div>

            {/* ── Low stock alerts ─────────────────────────────────────────── */}
            {lowStock.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <h3 className="font-semibold text-orange-800 text-sm">⚠️ Low Stock Alerts ({lowStock.length} items)</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {lowStock.slice(0, 10).map(p => (
                            <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                                {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
                            </span>
                        ))}
                        {lowStock.length > 10 && <span className="text-xs text-orange-600 font-medium">+{lowStock.length - 10} more...</span>}
                    </div>
                </div>
            )}

            {/* ── Out of stock banner ───────────────────────────────────────── */}
            {outOfStock.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-sm text-red-800 font-medium">{outOfStock.length} product(s) completely out of stock</p>
                    </div>
                </div>
            )}

            {/* ── Coming Soon Note ──────────────────────────────────────────── */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-700">
                    📊 Sales bills, transfers, and advanced analytics coming soon.
                    Stock levels are now live from your inventory.
                </p>
            </div>

        </div>
    );
}

// down code is working but upper code have updated ui 
// // src/Components/ContentDashboard/ContentDashboardTab.jsx
// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { DASHBOARD_STATS, MONTHLY_SALES } from "../demoData";
// import { CURRENT_USER, filterByLocation, isAdmin } from "../roles";
// import { useGetProductStocksQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
// import { useGetShopsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
// import NetworkStockPanel from "../shared/NetworkStockPanel";

// const StatCard = ({ label, value, sub, color = "text-gray-800", gradient }) => (
//     <div className={`rounded-xl p-5 shadow-sm ${gradient || "bg-white border border-gray-100"}`}>
//         <p className={`text-xs uppercase tracking-wide mb-2 ${gradient ? "text-white/80" : "text-gray-400"}`}>{label}</p>
//         <p className={`text-2xl font-bold ${gradient ? "text-white" : color}`}>{value}</p>
//         {sub && <p className={`text-xs mt-1 ${gradient ? "text-white/70" : "text-gray-400"}`}>{sub}</p>}
//     </div>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
//             <p className="font-semibold text-gray-700 mb-2">{label}</p>
//             {payload.map((p, i) => (
//                 <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
//                     <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
//                     {p.name}: <span className="font-semibold ml-1">₹{p.value?.toLocaleString()}</span>
//                 </p>
//             ))}
//         </div>
//     );
// };

// export default function ContentDashboardTab() {
//     const { user } = useSelector((state) => state.auth);
//     const [shopFilter, setShopFilter] = useState("all");

//     // ── Real API calls ─────────────────────────────────────────────────────────
//     const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 100 });
//     const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 });

//     // Transform stocks to products format
//     const allProducts = stocksData?.stocks?.map(s => ({
//         id: s.stock_id,
//         name: s.variant?.product?.name || "Unknown Product",
//         stock: s.quantity || 0,
//         lowStockAlert: s.low_stock_threshold || 10,
//         mrp: s.variant?.mrp || 0,
//         warehouse_id: s.warehouse_id,
//         variant_id: s.variant_id,
//     })) || [];

//     const shops = shopsData?.shops || [];

//     // ── Scope products to user's location ──────────────────────────────────────
//     // const scopedProducts = filterByLocation(allProducts, 'warehouse_id');
//     // For SHOP_OWNER, show all products (no warehouse filter)
//     // For WH roles, filter by warehouse_id
//     const scopedProducts = user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
//         ? allProducts
//         : filterByLocation(allProducts, 'warehouse_id');

//     // Admin can filter by specific shop (for products, we use warehouse filtering)
//     const filteredProducts = (isAdmin() && shopFilter !== "all")
//         ? scopedProducts.filter(p => p.warehouse_id === shopFilter)
//         : scopedProducts;

//     // ── Derived stats ─────────────────────────────────────────────────────────
//     const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
//     const outOfStock = filteredProducts.filter(p => p.stock === 0);
//     const totalInventoryValue = filteredProducts.reduce((s, p) => s + ((p.stock || 0) * (p.mrp || 0)), 0);

//     // Chart data from demo (no API yet)
//     const chartData = MONTHLY_SALES.map(m => ({
//         month: m.month,
//         Sales: m.sales,
//         Purchase: m.purchase || Math.round(m.sales * 0.65),
//         Profit: m.profit || Math.round(m.sales * 0.28),
//     }));

//     // Location label for display
//     // const locationLabel = isAdmin()
//     //     ? "All Locations"
//     //     : `${CURRENT_USER.locationName || CURRENT_USER.locationId?.startsWith("WH") ? "Warehouse" : "Shop"}: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;
//     // Location label for display
// const locationLabel = isAdmin()
//     ? "All Locations"
//     : user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
//         ? `Shop: ${CURRENT_USER.locationName || CURRENT_USER.shop_id}`
//         : `Warehouse: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

//     return (
//         <div className="space-y-6">

//             {/* ── Top bar ──────────────────────────────────────────────────── */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-lg font-bold text-gray-800">BizPro Dashboard</h1>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         <span className="font-medium text-blue-600">{locationLabel}</span>
//                     </p>
//                 </div>

//                 {/* Admin-only shop/warehouse filter */}
//                 {isAdmin() && shops.length > 0 && (
//                     <div className="flex items-center gap-3">
//                         <span className="text-xs text-gray-400">Filter by location:</span>
//                         <select
//                             value={shopFilter}
//                             onChange={e => setShopFilter(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
//                         >
//                             <option value="all">All Locations</option>
//                             {shops.map(s => (
//                                 <option key={s.shop_id} value={s.shop_id}>
//                                     🏪 {s.shop_name} (Shop)
//                                 </option>
//                             ))}
//                             {/* Add warehouses here when warehouse API is ready */}
//                         </select>
//                     </div>
//                 )}
//             </div>

//             {/* ── KPI Cards ────────────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard
//                     label="Total SKUs"
//                     value={filteredProducts.length}
//                     sub="active stock entries"
//                     gradient="bg-gradient-to-r from-blue-500 to-blue-600"
//                 />
//                 <StatCard
//                     label="Total Units"
//                     value={filteredProducts.reduce((s, p) => s + p.stock, 0).toLocaleString()}
//                     sub="across all products"
//                     gradient="bg-gradient-to-r from-green-500 to-green-600"
//                 />
//                 <StatCard
//                     label="Inventory Value"
//                     value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`}
//                     sub="at MRP"
//                     gradient="bg-gradient-to-r from-purple-500 to-purple-600"
//                 />
//                 <StatCard
//                     label="Low Stock Alerts"
//                     value={lowStock.length}
//                     sub={`${outOfStock.length} out of stock`}
//                     color={lowStock.length > 0 ? "text-red-500" : "text-green-600"}
//                 />
//             </div>

//             {/* ── Secondary KPIs ───────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard
//                     label="Products in Scope"
//                     value={filteredProducts.length}
//                     sub={isAdmin() ? `across ${shops.length} locations` : `at your ${CURRENT_USER.locationName || "location"}`}
//                 />
//                 <StatCard
//                     label="Active Products"
//                     value={filteredProducts.filter(p => p.stock > 0).length}
//                     sub="with positive stock"
//                 />
//                 <StatCard
//                     label="Low Stock Items"
//                     value={lowStock.length}
//                     sub={outOfStock.length > 0 ? `${outOfStock.length} completely out` : "all good"}
//                     color={lowStock.length > 0 ? "text-orange-500" : "text-gray-800"}
//                 />
//                 <StatCard
//                     label={isAdmin() ? "Total Locations" : "Your Location"}
//                     value={isAdmin() ? shops.length : "1"}
//                     sub={isAdmin() ? `${DASHBOARD_STATS?.totalSuppliers || 0} vendors` : CURRENT_USER.locationName || CURRENT_USER.locationId}
//                 />
//             </div>

//             {/* ── Chart + Network Stock Panel ──────────────────────────────── */}
//             <div className="grid grid-cols-3 gap-5">
//                 <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">Monthly Sales vs Purchase vs Profit</h3>
//                         <span className="text-xs text-gray-400">Last 6 months (demo data)</span>
//                     </div>
//                     <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                             <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
//                             <Bar dataKey="Sales" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Purchase" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* NetworkStockPanel — stock-only, visible to ALL roles */}
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-80">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">📦 Network Stock</h3>
//                         <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All locations</span>
//                     </div>
//                     <NetworkStockPanel />
//                 </div>
//             </div>

//             {/* ── Low stock alerts ─────────────────────────────────────────── */}
//             {lowStock.length > 0 && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-3">
//                         <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//                         <h3 className="font-semibold text-orange-800 text-sm">⚠️ Low Stock Alerts ({lowStock.length} items)</h3>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                         {lowStock.slice(0, 10).map(p => (
//                             <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
//                                 {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
//                             </span>
//                         ))}
//                         {lowStock.length > 10 && <span className="text-xs text-orange-600 font-medium">+{lowStock.length - 10} more...</span>}
//                     </div>
//                 </div>
//             )}

//             {/* ── Out of stock banner ───────────────────────────────────────── */}
//             {outOfStock.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
//                     <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                         <p className="text-sm text-red-800 font-medium">{outOfStock.length} product(s) completely out of stock</p>
//                     </div>
//                 </div>
//             )}

//             {/* ── Coming Soon Note ──────────────────────────────────────────── */}
//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
//                 <p className="text-xs text-blue-700">
//                     📊 Sales bills, transfers, and advanced analytics coming soon.
//                     Stock levels are now live from your inventory.
//                 </p>
//             </div>

//         </div>
//     );
// }

// use upper code 
// // src/Components/ContentDashboard/ContentDashboardTab.jsx
// import React, { useState, useEffect } from "react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { DASHBOARD_STATS, MONTHLY_SALES, INITIAL_BILLS, INITIAL_PRODUCTS, INITIAL_SHOPS, INITIAL_TRANSFERS } from "../demoData";
// import { CURRENT_USER, ROLE_LABELS, filterByLocation, filterLocationList, isAdmin } from "../roles";
// import NetworkStockPanel from "../shared/NetworkStockPanel";

// const SK = { B: "vyapar_bills", P: "vyapar_products", S: "vyapar_shops", T: "vyapar_transfers" };
// const load = (k, d) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch { return d; } };

// const StatCard = ({ label, value, sub, color = "text-gray-800", gradient }) => (
//     <div className={`rounded-xl p-5 shadow-sm ${gradient || "bg-white border border-gray-100"}`}>
//         <p className={`text-xs uppercase tracking-wide mb-2 ${gradient ? "text-white/80" : "text-gray-400"}`}>{label}</p>
//         <p className={`text-2xl font-bold ${gradient ? "text-white" : color}`}>{value}</p>
//         {sub && <p className={`text-xs mt-1 ${gradient ? "text-white/70" : "text-gray-400"}`}>{sub}</p>}
//     </div>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
//             <p className="font-semibold text-gray-700 mb-2">{label}</p>
//             {payload.map((p, i) => (
//                 <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
//                     <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
//                     {p.name}: <span className="font-semibold ml-1">₹{p.value?.toLocaleString()}</span>
//                 </p>
//             ))}
//         </div>
//     );
// };

// export default function ContentDashboardTab() {
//     const [bills, setBills] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [shops, setShops] = useState([]);
//     const [transfers, setTransfers] = useState([]);
//     // shopFilter only active for admins — non-admins are locked to their location
//     const [shopFilter, setShopFilter] = useState("all");

//     useEffect(() => {
//         setBills(load(SK.B, INITIAL_BILLS));
//         setProducts(load(SK.P, INITIAL_PRODUCTS));
//         setShops(load(SK.S, INITIAL_SHOPS));
//         setTransfers(load(SK.T, INITIAL_TRANSFERS));
//     }, []);

//     // ── Scope all data to the current user's location ─────────────────────────
//     const scopedBills      = filterByLocation(bills, 'shopId');
//     const scopedProducts   = filterByLocation(products);
//     const scopedTransfers  = filterByLocation(transfers, 'fromShopId');

//     // Admin can further drill-down with the shop selector
//     const visibleBills = (isAdmin() && shopFilter !== "all")
//         ? scopedBills.filter(b => b.shopId === shopFilter)
//         : scopedBills;

//     // ── Derived stats ─────────────────────────────────────────────────────────
//     const today      = new Date().toISOString().split("T")[0];
//     const todayBills = visibleBills.filter(b => b.date === today);
//     const salesToday = todayBills.reduce((s, b) => s + (b.total || 0), 0);
//     const salesMonth = visibleBills.reduce((s, b) => s + (b.total || 0), 0);
//     const lowStock   = scopedProducts.filter(p => p.stock <= (p.lowStockAlert || 10));
//     const outOfStock = scopedProducts.filter(p => p.stock === 0);
//     const pendingTransfers    = scopedTransfers.filter(t => t.status === "pending_approval" || t.status === "pending");
//     const totalInventoryValue = scopedProducts.reduce((s, p) => s + (p.stock * (p.mrp || 0)), 0);

//     const chartData   = MONTHLY_SALES.map(m => ({
//         month: m.month,
//         Sales: m.sales,
//         Purchase: m.purchase || Math.round(m.sales * 0.65),
//         Profit: m.profit || Math.round(m.sales * 0.28),
//     }));
//     const recentBills = [...visibleBills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

//     const statusColors = {
//         paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700",
//         overdue: "bg-red-100 text-red-600", cash: "bg-gray-100 text-gray-600",
//         upi: "bg-blue-100 text-blue-700", card: "bg-purple-100 text-purple-700",
//     };

//     const locationLabel = isAdmin()
//         ? "All Locations"
//         : `${CURRENT_USER.locationName || CURRENT_USER.locationId.startsWith("WH") ? "Warehouse" : "Shop"}: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

//     return (
//         <div className="space-y-6">

//             {/* ── Top bar ──────────────────────────────────────────────────── */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-lg font-bold text-gray-800">BizPro Dashboard</h1>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         {/* {ROLE_LABELS[CURRENT_USER.role]} ·{" "} */}
//                         <span className="font-medium text-blue-600">{locationLabel}</span>
//                     </p>
//                 </div>

//                 {/* Admin-only shop filter */}
//                 {isAdmin() ? (
//                     <div className="flex items-center gap-3">
//                         <span className="text-xs text-gray-400">Filter by shop:</span>
//                         <select
//                             value={shopFilter}
//                             onChange={e => setShopFilter(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
//                         >
//                             <option value="all">All Shops</option>
//                             {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//                         </select>
//                     </div>
//                 ) : (
//                     <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
//                         📍 {CURRENT_USER.locationName || CURRENT_USER.locationId}
//                     </span>
//                 )}
//             </div>

//             {/* ── KPI Cards ────────────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard label="Sales Today" value={`₹${salesToday.toLocaleString()}`} sub={`${todayBills.length} bills`} gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
//                 <StatCard label="Total Sales" value={`₹${(salesMonth / 1000).toFixed(0)}K`} sub={`${visibleBills.length} invoices`} gradient="bg-gradient-to-r from-green-500 to-green-600" />
//                 <StatCard label="Inventory Value" value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`} sub="at MRP" gradient="bg-gradient-to-r from-purple-500 to-purple-600" />
//                 <StatCard label="Low Stock Alerts" value={lowStock.length} sub={`${outOfStock.length} out of stock`} color={lowStock.length > 0 ? "text-red-500" : "text-green-600"} />
//             </div>

//             {/* ── Secondary KPIs ───────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard label="Products in Scope" value={scopedProducts.length} sub={isAdmin() ? `across ${shops.length} locations` : `at ${CURRENT_USER.locationName || CURRENT_USER.locationId}`} />
//                 <StatCard label="Total Bills" value={visibleBills.length} sub="all time" />
//                 <StatCard label="Pending Transfers" value={pendingTransfers.length} sub="awaiting approval" color={pendingTransfers.length > 0 ? "text-orange-500" : "text-gray-800"} />
//                 <StatCard label={isAdmin() ? "Total Shops" : "Your Location"} value={isAdmin() ? shops.length : "1"} sub={isAdmin() ? `${DASHBOARD_STATS?.totalSuppliers || 8} vendors` : CURRENT_USER.locationName || CURRENT_USER.locationId} />
//             </div>

//             {/* ── Chart + Network Stock Panel ──────────────────────────────── */}
//             <div className="grid grid-cols-3 gap-5">
//                 <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">Monthly Sales vs Purchase vs Profit</h3>
//                         <span className="text-xs text-gray-400">Last 6 months</span>
//                     </div>
//                     <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                             <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
//                             <Bar dataKey="Sales" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Purchase" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* NetworkStockPanel — stock-only, visible to ALL roles */}
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-80">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">📦 Network Stock</h3>
//                         <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All locations</span>
//                     </div>
//                     <NetworkStockPanel />
//                 </div>
//             </div>

//             {/* ── Low stock alerts ─────────────────────────────────────────── */}
//             {lowStock.length > 0 && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-3">
//                         <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//                         <h3 className="font-semibold text-orange-800 text-sm">⚠️ Low Stock Alerts ({lowStock.length} items)</h3>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                         {lowStock.slice(0, 10).map(p => (
//                             <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
//                                 {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
//                             </span>
//                         ))}
//                         {lowStock.length > 10 && <span className="text-xs text-orange-600 font-medium">+{lowStock.length - 10} more...</span>}
//                     </div>
//                 </div>
//             )}

//             {/* ── Pending transfers banner ──────────────────────────────────── */}
//             {pendingTransfers.length > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
//                         <p className="text-sm text-yellow-800 font-medium">{pendingTransfers.length} transfer(s) pending approval</p>
//                     </div>
//                     <span className="text-xs text-yellow-600">Go to Transfers to approve</span>
//                 </div>
//             )}

//             {/* ── Recent bills table ───────────────────────────────────────── */}
//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
//                     <h3 className="font-semibold text-gray-700 text-sm">Recent Bills</h3>
//                     <span className="text-xs text-gray-400">{visibleBills.length} total</span>
//                 </div>
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             {["Bill #", "Customer", "Shop", "Date", "Items", "Total", "Payment"].map(h => (
//                                 <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {recentBills.length === 0 ? (
//                             <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No bills yet for this location.</td></tr>
//                         ) : recentBills.map(b => (
//                             <tr key={b.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer">
//                                 <td className="px-5 py-3 font-mono text-xs text-gray-500">{b.billNumber || b.id}</td>
//                                 <td className="px-5 py-3">
//                                     <p className="font-medium text-gray-700 text-sm">{b.customerName || "Walk-in"}</p>
//                                     <p className="text-xs text-gray-400">{b.customerMobile || "—"}</p>
//                                 </td>
//                                 <td className="px-5 py-3 text-xs text-gray-500">{shops.find(s => s.id === b.shopId)?.name || b.shopId}</td>
//                                 <td className="px-5 py-3 text-xs text-gray-400">{b.date}</td>
//                                 <td className="px-5 py-3 text-gray-500">{b.items?.length || 0}</td>
//                                 <td className="px-5 py-3 font-semibold text-gray-800">₹{(b.total || 0).toFixed(2)}</td>
//                                 <td className="px-5 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
//                                         {(b.paymentMethod || "cash").toUpperCase()}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }