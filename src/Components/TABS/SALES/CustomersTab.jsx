// src/Components/TABS/SALES/CustomersTab.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_BILLS } from '../../demoData';

const STORAGE_KEYS = {
    CUSTOMERS: 'vyapar_customers',
    BILLS: 'vyapar_bills',
    SHOPS: 'vyapar_shops'
};

const getData = (key, initialData) => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

const CustomersTab = () => {
    const [customers, setCustomers] = useState([]);
    const [bills, setBills] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState('all');

    useEffect(() => {
        const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
        const allBills = getData(STORAGE_KEYS.BILLS, INITIAL_BILLS);
        const allShops = getData(STORAGE_KEYS.SHOPS, []);
        
        // Ensure all customers have required fields with defaults
        const safeCustomers = allCustomers.map(c => ({
            ...c,
            totalPurchases: c.totalPurchases || 0,
            lastPurchase: c.lastPurchase || 'No purchases',
            name: c.name || 'Unknown',
            mobile: c.mobile || 'N/A'
        }));
        
        setCustomers(safeCustomers);
        setBills(allBills);
        setShops(allShops);
    }, []);

    // Filter customers based on search and shop
    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.mobile.includes(searchTerm);
        return matchesSearch;
    });

    // Get customer bills
    const getCustomerBills = (mobile) => {
        if (!mobile) return [];
        let filtered = bills.filter(b => b.customerMobile === mobile);
        
        // Apply shop filter
        if (selectedShop !== 'all') {
            filtered = filtered.filter(b => b.shopId === selectedShop);
        }
        
        // Sort by date (newest first)
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    // Calculate customer total spent across all shops
    const getTotalSpent = (mobile) => {
        const customerBills = bills.filter(b => b.customerMobile === mobile);
        return customerBills.reduce((sum, b) => sum + (b.total || 0), 0);
    };

    // Get shop name by ID
    const getShopName = (shopId) => {
        const shop = shops.find(s => s.id === shopId);
        return shop?.name || shopId || 'Unknown Shop';
    };

    // Format currency safely
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹0';
        return `₹${amount.toLocaleString()}`;
    };

    // Get customer stats
    const getCustomerStats = () => {
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => {
            const lastPurchase = c.lastPurchase;
            if (!lastPurchase || lastPurchase === 'No purchases') return false;
            const daysSinceLast = (new Date() - new Date(lastPurchase)) / (1000 * 3600 * 24);
            return daysSinceLast <= 30;
        }).length;
        const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
        
        return { totalCustomers, activeCustomers, totalRevenue };
    };

    const stats = getCustomerStats();

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Total Customers</p>
                    <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Active (Last 30 Days)</p>
                    <p className="text-2xl font-bold">{stats.activeCustomers}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="🔍 Search by name or mobile number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select 
                    value={selectedShop} 
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm bg-white"
                >
                    <option value="all">All Shops</option>
                    {shops.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
            </div>

            {/* Customer Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left: Customer List */}
                <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Customer Directory</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center text-gray-400 py-12">
                                <p className="text-4xl mb-2">👥</p>
                                <p>No customers found</p>
                                <p className="text-xs mt-1">Add customers by creating bills</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredCustomers.map(c => {
                                    const isSelected = selectedCustomer?.mobile === c.mobile;
                                    const totalSpent = getTotalSpent(c.mobile);
                                    return (
                                        <div 
                                            key={c.id || c.mobile}
                                            onClick={() => setSelectedCustomer(c)}
                                            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                                                isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-800">{c.name}</p>
                                                        <span className="text-xs text-gray-400">ID: {c.id?.slice(-6) || 'NEW'}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-0.5">📱 {c.mobile}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">{formatCurrency(totalSpent)}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Total Spent</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                                <span>📅 Last: {c.lastPurchase || 'No purchases'}</span>
                                                <span>🛍️ {getCustomerBills(c.mobile).length} orders</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Purchase History */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden text-gray-700 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-semibold text-gray-700">Purchase History</h3>
                        {selectedCustomer && (
                            <p className="text-xs text-gray-500 mt-1">
                                {selectedCustomer.name} • {selectedCustomer.mobile}
                            </p>
                        )}
                    </div>
                    <div className="max-h-[500px] overflow-y-auto p-4">
                        {!selectedCustomer ? (
                            <div className="text-center text-gray-400 py-12">
                                <p className="text-4xl mb-2">👈</p>
                                <p className="text-sm">Select a customer</p>
                                <p className="text-xs mt-1">to view purchase history</p>
                            </div>
                        ) : (
                            (() => {
                                const customerBills = getCustomerBills(selectedCustomer.mobile);
                                if (customerBills.length === 0) {
                                    return (
                                        <div className="text-center text-gray-400 py-12">
                                            <p className="text-4xl mb-2">🛒</p>
                                            <p className="text-sm">No purchases yet</p>
                                            <p className="text-xs mt-1">Bills will appear here</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="space-y-3">
                                        {customerBills.map(bill => (
                                            <div key={bill.id} className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-mono text-xs text-gray-500">{bill.billNumber}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{bill.date}</p>
                                                    </div>
                                                    <p className="font-bold text-blue-600">{formatCurrency(bill.total)}</p>
                                                </div>
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">Items ({bill.items?.length || 0})</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {bill.items?.slice(0, 3).map((item, idx) => (
                                                            <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                {item.name} x{item.qty}
                                                            </span>
                                                        ))}
                                                        {bill.items?.length > 3 && (
                                                            <span className="text-xs text-gray-400">+{bill.items.length - 3} more</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-gray-50">
                                                    <span className="text-xs text-gray-400">🏪 {getShopName(bill.shopId)}</span>
                                                    <span className="text-xs text-gray-400 ml-3">💳 {bill.paymentMethod?.toUpperCase() || 'CASH'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 text-center">
                    💡 <strong>Note:</strong> Total customer count: {customers.length} | 
                    Total bills in system: {bills.length} | 
                    Filter by shop to see specific location purchases
                </p>
            </div>
        </div>
    );
};

export default CustomersTab;
// // TABS/SALES/CustomersTab.jsx
// import React, { useState } from "react";
// import { CUSTOMERS } from "../../demoData";

// const statusColors = {
//     active: "bg-green-100 text-green-700",
//     inactive: "bg-gray-100 text-gray-500",
// };

// const CustomersTab = () => {
//     const [search, setSearch] = useState("");
//     const [filter, setFilter] = useState("all");
//     const [selected, setSelected] = useState(null);

//     const filtered = CUSTOMERS.filter(c => {
//         const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
//             c.phone.includes(search) ||
//             c.city.toLowerCase().includes(search.toLowerCase());
//         const matchFilter = filter === "all" ? true : c.status === filter;
//         return matchSearch && matchFilter;
//     });

//     return (
//         <div>
//             {/* Stats row */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { label: "Total Customers", value: CUSTOMERS.length, color: "text-blue-600" },
//                     { label: "Active", value: CUSTOMERS.filter(c => c.status === "active").length, color: "text-green-600" },
//                     { label: "Total Business", value: "₹" + (CUSTOMERS.reduce((s, c) => s + c.totalBusiness, 0) / 100000).toFixed(1) + "L", color: "text-purple-600" },
//                     { label: "Outstanding", value: "₹" + (CUSTOMERS.reduce((s, c) => s + c.outstanding, 0) / 1000).toFixed(0) + "K", color: "text-red-500" },
//                 ].map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Filters */}
//             <div className="flex items-center gap-3 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search by name, phone, city..."
//                     value={search}
//                     onChange={e => setSearch(e.target.value)}
//                     className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                 />
//                 <select
//                     value={filter}
//                     onChange={e => setFilter(e.target.value)}
//                     className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
//                 >
//                     <option value="all">All status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                 </select>
//                 <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                     + Add Customer
//                 </button>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             {["Customer", "Phone", "City", "Total Business", "Outstanding", "Last Purchase", "Status"].map(h => (
//                                 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {filtered.map(c => (
//                             <tr
//                                 key={c.id}
//                                 onClick={() => setSelected(selected?.id === c.id ? null : c)}
//                                 className="hover:bg-blue-50/40 cursor-pointer transition-colors"
//                             >
//                                 <td className="px-4 py-3">
//                                     <div className="font-medium text-gray-800">{c.name}</div>
//                                     <div className="text-xs text-gray-400">{c.id}</div>
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-600">{c.phone}</td>
//                                 <td className="px-4 py-3 text-gray-600">{c.city}</td>
//                                 <td className="px-4 py-3 font-medium text-gray-700">₹{c.totalBusiness.toLocaleString()}</td>
//                                 <td className="px-4 py-3">
//                                     {c.outstanding > 0
//                                         ? <span className="text-red-500 font-medium">₹{c.outstanding.toLocaleString()}</span>
//                                         : <span className="text-green-500 text-xs font-medium">Cleared</span>
//                                     }
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-500 text-xs">{c.lastPurchase}</td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
//                                         {c.status}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {filtered.length === 0 && (
//                     <div className="py-12 text-center text-gray-400 text-sm">No customers found</div>
//                 )}
//             </div>

//             {/* Detail panel */}
//             {selected && (
//                 <div className="mt-4 bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
//                     <div className="flex items-center justify-between mb-3">
//                         <h3 className="font-semibold text-gray-800">{selected.name}</h3>
//                         <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs">✕ Close</button>
//                     </div>
//                     <div className="grid grid-cols-3 gap-4 text-sm">
//                         <div><span className="text-gray-400">Phone:</span> <span className="ml-1 text-gray-700">{selected.phone}</span></div>
//                         <div><span className="text-gray-400">Email:</span> <span className="ml-1 text-gray-700">{selected.email}</span></div>
//                         <div><span className="text-gray-400">City:</span> <span className="ml-1 text-gray-700">{selected.city}</span></div>
//                         <div><span className="text-gray-400">GSTIN:</span> <span className="ml-1 text-gray-700">{selected.gstin || "—"}</span></div>
//                         <div><span className="text-gray-400">Total Business:</span> <span className="ml-1 font-medium text-gray-700">₹{selected.totalBusiness.toLocaleString()}</span></div>
//                         <div><span className="text-gray-400">Outstanding:</span> <span className={`ml-1 font-medium ${selected.outstanding > 0 ? "text-red-500" : "text-green-500"}`}>{selected.outstanding > 0 ? "₹" + selected.outstanding.toLocaleString() : "Cleared"}</span></div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CustomersTab;