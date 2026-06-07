// src/Components/ContentDashboard/ContentDashboardTab.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CURRENT_USER, filterByLocation, isAdmin } from "../roles";
import { useGetProductStocksQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetShopsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import NetworkStockPanel from "../shared/NetworkStockPanel";

const StatCard = ({ label, value, sub, color = "text-app-text" }) => (
    <div className="app-stat-card">
        <p className="app-stat-label">{label}</p>
        <p className={`app-stat-value ${color}`}>{value}</p>
        {sub && <p className="app-stat-hint">{sub}</p>}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="app-card app-card-body text-sm">
            <p className="font-semibold text-app-text mb-2">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="text-app-text-secondary">
                    {p.name}: <span className="font-semibold text-app-text ml-1">₹{p.value?.toLocaleString()}</span>
                </p>
            ))}
        </div>
    );
};

export default function ContentDashboardTab() {
    const { user } = useSelector((state) => state.auth);
    const [shopFilter, setShopFilter] = useState("all");

    const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 100 });
    const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 });

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

    const scopedProducts = user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
        ? allProducts
        : filterByLocation(allProducts, 'warehouse_id');

    const filteredProducts = (isAdmin() && shopFilter !== "all")
        ? scopedProducts.filter(p => p.warehouse_id === shopFilter)
        : scopedProducts;

    const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
    const outOfStock = filteredProducts.filter(p => p.stock === 0);
    const totalInventoryValue = filteredProducts.reduce((s, p) => s + ((p.stock || 0) * (p.mrp || 0)), 0);

    const chartData = [
        { month: "Jan", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Feb", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Mar", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Apr", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "May", Sales: 0, Purchase: 0, Profit: 0 },
        { month: "Jun", Sales: 0, Purchase: 0, Profit: 0 },
    ];

    const locationLabel = isAdmin()
        ? "All Locations"
        : user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
            ? `Shop: ${CURRENT_USER.locationName || CURRENT_USER.shop_id}`
            : `Warehouse: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

    return (
        <div className="app-page">

            <div className="app-page-header">
                <div>
                    <h1 className="app-page-title">Dashboard</h1>
                    <p className="app-page-subtitle">
                        Overview for <span className="text-app-accent font-medium">{locationLabel}</span>
                    </p>
                </div>

                {isAdmin() && shops.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-app-text-muted">Location:</span>
                        <select
                            value={shopFilter}
                            onChange={e => setShopFilter(e.target.value)}
                            className="app-select w-auto min-w-[160px]"
                        >
                            <option value="all">All Locations</option>
                            {shops.map(s => (
                                <option key={s.shop_id} value={s.shop_id}>
                                    {s.shop_name} (Shop)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total SKUs" value={filteredProducts.length} sub="active stock entries" />
                <StatCard label="Total Units" value={filteredProducts.reduce((s, p) => s + p.stock, 0).toLocaleString()} sub="across all products" />
                <StatCard label="Inventory Value" value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`} sub="at MRP" />
                <StatCard
                    label="Low Stock Alerts"
                    value={lowStock.length}
                    sub={`${outOfStock.length} out of stock`}
                    color={lowStock.length > 0 ? "text-app-danger" : "text-app-success"}
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Products in Scope" value={filteredProducts.length} sub={isAdmin() ? `across ${shops.length} locations` : `at your ${CURRENT_USER.locationName || "location"}`} />
                <StatCard label="Active Products" value={filteredProducts.filter(p => p.stock > 0).length} sub="with positive stock" />
                <StatCard
                    label="Low Stock Items"
                    value={lowStock.length}
                    sub={outOfStock.length > 0 ? `${outOfStock.length} completely out` : "all good"}
                    color={lowStock.length > 0 ? "text-app-warning" : "text-app-text"}
                />
                <StatCard
                    label={isAdmin() ? "Total Locations" : "Your Location"}
                    value={isAdmin() ? shops.length : "1"}
                    sub={isAdmin() ? `${shops.length} shops` : CURRENT_USER.locationName || CURRENT_USER.locationId}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 app-card">
                    <div className="app-card-header">
                        <h3 className="text-sm font-semibold text-app-text">Monthly Sales vs Purchase vs Profit</h3>
                        <span className="text-xs text-app-text-muted">Last 6 months</span>
                    </div>
                    <div className="app-card-body">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                                <Bar dataKey="Sales" fill="#1d4ed8" maxBarSize={28} />
                                <Bar dataKey="Purchase" fill="#15803d" maxBarSize={28} />
                                <Bar dataKey="Profit" fill="#4b5563" maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                        <p className="text-center text-xs text-app-text-muted mt-2">Sales data will appear once billing is active</p>
                    </div>
                </div>

                <div className="app-card overflow-hidden">
                    <div className="app-card-header">
                        <h3 className="text-sm font-semibold text-app-text">Network Stock</h3>
                        <span className="app-badge-gray">All locations</span>
                    </div>
                    <div className="app-card-body overflow-y-auto max-h-80 p-0">
                        <NetworkStockPanel />
                    </div>
                </div>
            </div>

            {lowStock.length > 0 && (
                <div className="app-alert-warning">
                    <p className="font-medium mb-2">Low Stock Alerts ({lowStock.length} items)</p>
                    <div className="flex flex-wrap gap-1.5">
                        {lowStock.slice(0, 10).map(p => (
                            <span key={p.id} className={p.stock === 0 ? "app-badge-red" : "app-badge-amber"}>
                                {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
                            </span>
                        ))}
                        {lowStock.length > 10 && <span className="text-xs text-app-text-muted">+{lowStock.length - 10} more</span>}
                    </div>
                </div>
            )}

            {outOfStock.length > 0 && (
                <div className="app-alert-danger">
                    {outOfStock.length} product(s) completely out of stock
                </div>
            )}

            <div className="app-alert-info text-center text-xs">
                Sales bills, transfers, and advanced analytics coming soon. Stock levels are live from inventory.
            </div>
        </div>
    );
}
