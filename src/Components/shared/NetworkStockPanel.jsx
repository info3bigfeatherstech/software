// src/Components/shared/NetworkStockPanel.jsx
//
// READ-ONLY cross-location stock visibility panel.
// Stock counts are intentionally visible to ALL roles — knowing where stock
// exists helps customer service and reorder decisions without exposing
// any financial/sales data.
//
// Usage:
//   <NetworkStockPanel />
//     → Full summary card (dashboard sidebar) — all locations, total SKUs, health badge
//
//   <NetworkStockPanel productName="Maggi Noodles" compact />
//     → Inline mini badges (inventory table row) — stock of ONE product across all locations

import React, { useMemo } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SHOPS, INITIAL_WAREHOUSES } from '../demoData';

const getData = (key, fallback) => {
    try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : fallback;
    } catch { return fallback; }
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const HealthBadge = ({ loc }) => {
    if (loc.outOfStock > 0)
        return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium block whitespace-nowrap">{loc.outOfStock} out</span>;
    if (loc.lowStock > 0)
        return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium block whitespace-nowrap">{loc.lowStock} low</span>;
    return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium block whitespace-nowrap">OK</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function NetworkStockPanel({ productName = null, compact = false, excludeLocationId = null }) {
    const allProducts   = getData('vyapar_products',   INITIAL_PRODUCTS);
    const allShops      = getData('vyapar_shops',      INITIAL_SHOPS);
    const allWarehouses = getData('vyapar_warehouses', INITIAL_WAREHOUSES);

    // Build id → { name, city, type } lookup
    const locationMap = useMemo(() => {
        const map = {};
        allShops.forEach(s => {
            map[s.id] = { name: s.name, city: s.city, type: 'shop' };
        });
        allWarehouses.forEach(w => {
            map[w.id] = { name: w.name, city: w.city, type: 'warehouse' };
        });
        return map;
    }, [allShops, allWarehouses]);

    // Aggregate per-location stock stats
    const locationStats = useMemo(() => {
        const stats = {};

        const toCheck = productName
            ? allProducts.filter(p => p.name === productName)
            : allProducts;

        toCheck.forEach(p => {
            const locId = p.locationId || p.shopId;
            if (!locId) return;
            // Optionally exclude the current user's own location from the list
            if (excludeLocationId && locId === excludeLocationId) return;

            if (!stats[locId]) {
                stats[locId] = {
                    locId,
                    ...(locationMap[locId] || { name: locId, type: 'shop', city: '' }),
                    totalProducts: 0,
                    totalStock:    0,
                    lowStock:      0,
                    outOfStock:    0,
                };
            }
            stats[locId].totalProducts += 1;
            stats[locId].totalStock    += (p.stock || 0);
            if (p.stock === 0) {
                stats[locId].outOfStock += 1;
            } else if (p.stock <= (p.lowStockAlert || 10)) {
                stats[locId].lowStock += 1;
            }
        });

        // Sort: warehouses first, then shops alphabetically
        return Object.values(stats).sort((a, b) => {
            if (a.type !== b.type) return a.type === 'warehouse' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    }, [allProducts, locationMap, productName, excludeLocationId]);

    // ── Compact mode — inline stock badges per location for ONE product ─────────
    if (compact) {
        if (locationStats.length === 0)
            return <span className="text-[10px] text-gray-300 italic">Not elsewhere</span>;

        return (
            <div className="flex flex-wrap gap-1">
                {locationStats.map(loc => (
                    <span
                        key={loc.locId}
                        title={`${loc.name}${loc.city ? ' · ' + loc.city : ''} — ${loc.totalStock} unit${loc.totalStock !== 1 ? 's' : ''}`}
                        className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium cursor-default
                            ${loc.outOfStock > 0
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : loc.lowStock > 0
                                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                                    : 'bg-green-50 border-green-200 text-green-700'
                            }`}
                    >
                        {loc.type === 'warehouse' ? '🏢' : '🏪'}
                        {loc.totalStock}
                    </span>
                ))}
            </div>
        );
    }

    // ── Full mode — summary card list for dashboard sidebar ────────────────────
    return (
        <div className="space-y-2">
            {locationStats.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6 italic">No location data found</p>
            )}
            {locationStats.map(loc => (
                <div
                    key={loc.locId}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {/* Location icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                        ${loc.type === 'warehouse'
                            ? 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}
                    >
                        {loc.type === 'warehouse' ? '🏢' : '🏪'}
                    </div>

                    {/* Name + city */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{loc.name}</p>
                        <p className="text-xs text-gray-400">
                            {loc.city || '—'}
                            <span className="ml-1 opacity-60">· {loc.type === 'warehouse' ? 'Warehouse' : 'Shop'}</span>
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0 space-y-1">
                        <p className="text-xs font-semibold text-gray-600">{loc.totalProducts} SKUs</p>
                        <HealthBadge loc={loc} />
                    </div>
                </div>
            ))}
        </div>
    );
}
