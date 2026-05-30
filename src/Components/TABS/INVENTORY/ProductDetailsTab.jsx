// ProductDetailsTab.jsx

import React, { useState } from "react";

const PRODUCTS = [
    {
        id: "PRD-001",
        name: "iPhone 15",
        sku: "APL-IP15",
        stock: 24,
        price: 79999,
        category: "Mobiles",
        warehouse: "Main WH",
        status: "active",
    },

    {
        id: "PRD-002",
        name: "Samsung S24",
        sku: "SMS-S24",
        stock: 12,
        price: 68999,
        category: "Mobiles",
        warehouse: "Delhi WH",
        status: "inactive",
    },

    {
        id: "PRD-003",
        name: "OnePlus 12",
        sku: "ONE-12",
        stock: 0,
        price: 59999,
        category: "Mobiles",
        warehouse: "Mumbai WH",
        status: "archived",
    },

    {
        id: "PRD-004",
        name: "Macbook Air M3",
        sku: "APL-MBA-M3",
        stock: 9,
        price: 124999,
        category: "Laptops",
        warehouse: "Main WH",
        status: "active",
    },
];

const ProductDetailsTab = () => {

    const [search, setSearch] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);

    const filteredProducts = PRODUCTS.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const toggleProductSelection = (id) => {
        setSelectedProducts((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const toggleAllProducts = () => {

        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map((p) => p.id));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

            {/* HEADER */}
            <div className="flex items-center text-zinc-800 justify-between flex-wrap gap-3">

                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Product Details
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage inventory products, stock, categories and bulk updates
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                    <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium transition-colors">
                        Export CSV
                    </button>

                    <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium transition-colors">
                        Import Products
                    </button>

                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
                        + Add Product
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

                {[
                    {
                        label: "Total Products",
                        value: "2,431",
                    },

                    {
                        label: "Active",
                        value: "2,120",
                    },

                    {
                        label: "Inactive",
                        value: "211",
                    },

                    {
                        label: "Archived",
                        value: "100",
                    },

                    {
                        label: "Low Stock",
                        value: "42",
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white border border-gray-200 rounded p-4"
                    >
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {item.label}
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {item.value}
                        </h3>
                    </div>
                ))}
            </div>

            {/* FILTER BAR */}
            <div className="bg-white text-zinc-800 border border-gray-200 rounded p-4 flex items-center justify-between gap-3 flex-wrap">

                <div className="flex items-center gap-2 flex-wrap">

                    <input
                        type="text"
                        placeholder="Search product, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-72 border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-gray-500"
                    />

                    <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                        <option>All Categories</option>
                        <option>Mobiles</option>
                        <option>Laptops</option>
                        <option>Accessories</option>
                    </select>

                    <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                        <option>All Warehouses</option>
                        <option>Main WH</option>
                        <option>Delhi WH</option>
                        <option>Mumbai WH</option>
                    </select>

                    <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Archived</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                    <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors">
                        Bulk Price Update
                    </button>

                    <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors">
                        Bulk Stock Update
                    </button>
                </div>
            </div>

            {/* BULK ACTION BAR */}
            {selectedProducts.length > 0 && (

                <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-center justify-between flex-wrap gap-3">

                    <div className="flex items-center gap-3 flex-wrap">

                        <span className="text-sm font-semibold text-blue-700">
                            {selectedProducts.length} products selected
                        </span>

                        <button className="text-sm border border-green-200 bg-white hover:bg-green-50 text-green-700 px-4 py-2 rounded transition-colors">
                            Activate
                        </button>

                        <button className="text-sm border border-yellow-200 bg-white hover:bg-yellow-50 text-yellow-700 px-4 py-2 rounded transition-colors">
                            Deactivate
                        </button>

                        <button className="text-sm border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded transition-colors">
                            Archive
                        </button>

                        <button className="text-sm border border-red-200 bg-white hover:bg-red-50 text-red-600 px-4 py-2 rounded transition-colors">
                            Delete
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedProducts([])}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear Selection
                    </button>
                </div>
            )}

            {/* TABLE */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">

                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">

                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                        Product Inventory
                    </h3>

                    <span className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-2.5 py-1 bg-white">
                        {filteredProducts.length} products
                    </span>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-gray-50 border-b border-gray-200">

                            <tr>

                                <th className="px-5 py-3">

                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedProducts.length ===
                                                filteredProducts.length &&
                                            filteredProducts.length > 0
                                        }
                                        onChange={toggleAllProducts}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>

                                {[
                                    "Product ID",
                                    "Product",
                                    "SKU",
                                    "Category",
                                    "Stock",
                                    "Warehouse",
                                    "Price",
                                ].map((head) => (
                                    <th
                                        key={head}
                                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {filteredProducts.map((product) => (

                                <tr
                                    key={product.id}
                                    className={`transition-colors ${
                                        selectedProducts.includes(product.id)
                                            ? "bg-blue-50"
                                            : "hover:bg-gray-50"
                                    }`}
                                >

                                    {/* CHECKBOX */}
                                    <td className="px-5 py-4">

                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(
                                                product.id
                                            )}
                                            onChange={() =>
                                                toggleProductSelection(
                                                    product.id
                                                )
                                            }
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>

                                    {/* PRODUCT ID */}
                                    <td className="px-5 py-4">

                                        <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                                            {product.id}
                                        </span>
                                    </td>

                                    {/* PRODUCT */}
                                    <td className="px-5 py-4">

                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {product.name}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Inventory Product
                                            </p>
                                        </div>
                                    </td>

                                    {/* SKU */}
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.sku}
                                    </td>

                                    {/* CATEGORY */}
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.category}
                                    </td>

                                    {/* STOCK */}
                                    <td className="px-5 py-4">

                                        <div className="flex items-center gap-2 flex-wrap">

                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                                                    product.stock > 15
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : product.stock > 0
                                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                }`}
                                            >
                                                {product.stock} units
                                            </span>

                                            {product.status === "active" && (
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-green-50 text-green-700 border-green-200">
                                                    Active
                                                </span>
                                            )}

                                            {product.status === "inactive" && (
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
                                                    Deactivated
                                                </span>
                                            )}

                                            {product.status === "archived" && (
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-gray-100 text-gray-600 border-gray-300">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* WAREHOUSE */}
                                    <td className="px-5 py-4 text-gray-600">
                                        {product.warehouse}
                                    </td>

                                    {/* PRICE */}
                                    <td className="px-5 py-4 font-bold text-gray-900">
                                        ₹{product.price.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsTab;