import React from 'react';

const StatsCards = ({ products, selectedShopName }) => {
    const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.mrp || 0)), 0);
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const uniqueCategories = new Set(products.map(p => p.category)).size;

    const cards = [
        { label: "Total Products", value: products.length, hint: selectedShopName },
        { label: "Low Stock Items", value: lowStockCount, hint: `${outOfStockCount} out of stock`, color: lowStockCount > 0 ? "text-app-danger" : "text-app-text" },
        { label: "Inventory Value", value: `₹${totalValue.toLocaleString()}`, hint: "at MRP" },
        { label: "Categories", value: uniqueCategories, hint: "unique types" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cards.map((card) => (
                <div key={card.label} className="app-stat-card">
                    <p className="app-stat-label">{card.label}</p>
                    <p className={`app-stat-value ${card.color || "text-app-text"}`}>{card.value}</p>
                    {card.hint && <p className="app-stat-hint">{card.hint}</p>}
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
