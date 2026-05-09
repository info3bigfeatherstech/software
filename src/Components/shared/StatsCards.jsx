// src/Components/shared/StatsCards.jsx
import React from 'react';

const StatsCards = ({ products, selectedShopName }) => {
    const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.mrp || 0)), 0);
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const uniqueCategories = new Set(products.map(p => p.category)).size;

    return (
        <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-80 uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-xs opacity-70 mt-1">{selectedShopName}</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-80 uppercase tracking-wide">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-100">{lowStockCount}</p>
                <p className="text-xs opacity-70 mt-1">{outOfStockCount} out of stock</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-80 uppercase tracking-wide">Inventory Value</p>
                <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
                <p className="text-xs opacity-70 mt-1">at MRP</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs opacity-80 uppercase tracking-wide">Categories</p>
                <p className="text-2xl font-bold">{uniqueCategories}</p>
                <p className="text-xs opacity-70 mt-1">unique types</p>
            </div>
        </div>
    );
};

export default StatsCards;