// TABS/PARTIES/PartyDetailsTab/PartyDetailsTab.jsx

import React, { useState } from "react";
import { RefreshCw, Eye, X } from "lucide-react";
import { useGetVendorsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
import {
    useGetCustomersQuery,
    useDeleteCustomerMutation,
    useUpdateCustomerMutation,
    useCreateCustomerMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Customer_api/customerApi";

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const filterBySearch = (items, search, fields) => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((item) =>
        fields.some((f) => String(item[f] ?? "").toLowerCase().includes(term))
    );
};

export default function PartyDetailsTab() {
    const [activeView, setActiveView] = useState("customers");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    useDeleteCustomerMutation();
    useUpdateCustomerMutation();
    useCreateCustomerMutation();

    const { data: customersData, isLoading: custLoading, isFetching: custFetching, refetch: refetchCustomers } = useGetCustomersQuery({
        page: currentPage,
        limit: pageSize,
        search,
    });
    const { data: vendorsData, isLoading: vendLoading, isFetching: vendFetching, refetch: refetchVendors } = useGetVendorsQuery({
        page: currentPage,
        limit: pageSize,
        search,
    });

    const customers = customersData?.customers || [];
    const vendors = vendorsData?.vendors || [];
    const customerMeta = customersData?.meta || { total: 0, totalPages: 1 };
    const vendorMeta = vendorsData?.meta || { total: 0, totalPages: 1 };
    const meta = activeView === "customers" ? customerMeta : vendorMeta;
    const isLoading = activeView === "customers" ? custLoading : vendLoading;
    const isFetching = activeView === "customers" ? custFetching : vendFetching;

    const displayCustomers = filterBySearch(customers, search, ["name", "mobile", "email", "city", "customer_id"]);
    const displayVendors = vendors;

    const handleRefresh = () => {
        if (activeView === "customers") refetchCustomers();
        else refetchVendors();
    };

    const handleClear = () => {
        setSearch("");
        setCurrentPage(1);
    };

    const switchView = (view) => {
        setActiveView(view);
        setCurrentPage(1);
    };

    const colSpan = activeView === "customers" ? 9 : 9; // customers: 9 cols, vendors: 9 cols

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Party Details</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Manage your customers and vendors — buyers and sellers</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="bg-white border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    {activeView === "customers" ? (
                        <button
                            type="button"
                            onClick={() => {}}
                            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                            + Add Customer
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {}}
                            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                            + Add Vendor
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex gap-1">
                <button
                    type="button"
                    onClick={() => switchView("customers")}
                    className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${activeView === "customers" ? "bg-blue-600 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    Customers
                </button>
                <button
                    type="button"
                    onClick={() => switchView("vendors")}
                    className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${activeView === "vendors" ? "bg-blue-600 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}
                >
                    Vendors
                </button>
            </div>

            {activeView === "customers" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-blue-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Customers</p>
                        <p className="text-3xl font-bold text-blue-700">{customerMeta.total}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-green-500">Active</p>
                        <p className="text-3xl font-bold text-green-600">{customers.filter((c) => c.is_active !== false).length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-purple-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-purple-400">This Page</p>
                        <p className="text-3xl font-bold text-purple-600">{customers.length}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-blue-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Vendors</p>
                        <p className="text-3xl font-bold text-blue-700">{vendorMeta.total}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-green-500">Active</p>
                        <p className="text-3xl font-bold text-green-600">{vendors.filter((v) => v.is_active !== false).length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-purple-100 p-4">
                        <p className="text-xs uppercase tracking-wide font-medium text-purple-400">This Page</p>
                        <p className="text-3xl font-bold text-purple-600">{vendors.length}</p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder={activeView === "customers" ? "Search customers…" : "Search vendors…"}
                    className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                    {[10, 20, 50].map((s) => (
                        <option key={s} value={s}>{s} per page</option>
                    ))}
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
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {activeView === "customers" ? "Customers" : "Vendors"}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        {activeView === "customers" ? customerMeta.total : vendorMeta.total} records
                    </span>
                </div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        {activeView === "customers" ? (
                            <tr>
                                {["Avatar+Name", "Phone", "Email", "City", "Total Orders", "Total Spent", "Status", "Created", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                        {h === "Avatar+Name" ? "Customer" : h}
                                    </th>
                                ))}
                            </tr>
                        ) : (
                            <tr>
                                {["Vendor", "Phone", "Company", "Business Type", "City", "Supply City", "Status", "Created", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                        )}

                        {!isLoading && !isFetching && activeView === "customers" && displayCustomers.length === 0 && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-400">
                                    No customers found
                                </td>
                            </tr>
                        )}

                        {!isLoading && !isFetching && activeView === "vendors" && displayVendors.length === 0 && (
                            <tr>
                                <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-400">
                                    No vendors found
                                </td>
                            </tr>
                        )}

                        {!isLoading && !isFetching && activeView === "customers" && displayCustomers.map((customer) => (
                            <tr key={customer.customer_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                                            <p className="font-mono text-xs text-gray-400">{customer.customer_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{customer.mobile || customer.phone || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{customer.email || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{customer.city || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 font-medium">{customer.total_orders ?? "—"}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                    {customer.total_spent != null ? `₹${Number(customer.total_spent).toLocaleString("en-IN")}` : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${customer.is_active !== false ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                                        {customer.is_active !== false ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(customer.created_at)}</td>
                                <td className="px-4 py-3">
                                    <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="View">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!isLoading && !isFetching && activeView === "vendors" && displayVendors.map((vendor) => (
                            <tr key={vendor.vendor_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                            {vendor.company_name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{vendor.company_name}</p>
                                            <p className="font-mono text-xs text-gray-400">{vendor.vendor_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{vendor.phone || "—"}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">{vendor.company_name || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                        {vendor.business_type || "—"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">{vendor.city || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{vendor.supply_city || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vendor.is_active !== false ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                                        {vendor.is_active !== false ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(vendor.created_at)}</td>
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

            {meta.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-xs text-gray-400">
                        Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}
                    </p>
                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-500">
                            {currentPage} / {meta.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                            disabled={currentPage === meta.totalPages}
                            className="text-xs border border-gray-200 rounded-lg px-3 py-1 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
