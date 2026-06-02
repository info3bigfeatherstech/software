// TABS/REPORTS/ReportsTab.jsx

import React, { useState } from "react";
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Users,
    Building2,
    Banknote,
    ChevronRight,
    FileText,
    X,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const SALES_TREND_DATA = [
    { month: "Jan", sales: 180000, purchase: 95000 },
    { month: "Feb", sales: 210000, purchase: 110000 },
    { month: "Mar", sales: 195000, purchase: 98000 },
    { month: "Apr", sales: 240000, purchase: 125000 },
    { month: "May", sales: 284500, purchase: 142000 },
];

const CHANNEL_DATA = [
    { channel: "Main Shop", amount: 120000 },
    { channel: "Shop 2", amount: 75000 },
    { channel: "Online", amount: 54500 },
    { channel: "Wholesale", amount: 35000 },
];

const REPORT_CATEGORIES = [
    {
        id: "sales",
        title: "Sales Reports",
        desc: "Billing, invoices, returns and revenue",
        icon: TrendingUp,
        iconClass: "text-blue-500",
        reports: [
            "Sales Summary",
            "Invoice-wise Report",
            "Item-wise Sales",
            "Customer-wise Sales",
            "Salesman-wise Sales",
            "Platform-wise Sales (MHM, OWB, Shop 1, Shop 2)",
            "Sales Return Report",
            "GST Sales Report",
        ],
    },
    {
        id: "purchase",
        title: "Purchase Reports",
        desc: "Vendor bills, payments and returns",
        icon: ShoppingCart,
        iconClass: "text-orange-500",
        reports: [
            "Purchase Summary",
            "Vendor-wise Purchase",
            "Item-wise Purchase",
            "Payment Out Report",
            "Expense Report",
            "Purchase Return Report",
            "GST Purchase Report",
        ],
    },
    {
        id: "inventory",
        title: "Inventory Reports",
        desc: "Stock levels, movement and valuation",
        icon: Package,
        iconClass: "text-purple-500",
        reports: [
            "Stock Summary",
            "Low Stock Alert Report",
            "Out of Stock Report",
            "Stock Movement Report",
            "Warehouse-wise Stock",
            "Shop-wise Stock",
            "Batch & Expiry Report",
            "Item-wise Valuation",
        ],
    },
    {
        id: "staff",
        title: "Staff & Commission",
        desc: "Staff performance and commission tracking",
        icon: Users,
        iconClass: "text-green-500",
        reports: [
            "Staff Sales Report (by SM-001 etc.)",
            "Commission Summary",
            "Staff-wise Order Count",
            "Monthly Performance",
            "Login Activity",
        ],
    },
    {
        id: "party",
        title: "Party Reports",
        desc: "Customer and vendor analysis",
        icon: Building2,
        iconClass: "text-indigo-500",
        reports: [
            "Customer-wise Summary",
            "Vendor-wise Summary",
            "Outstanding Receivables",
            "Outstanding Payables",
            "Loyalty Points Report",
            "New Customer Report",
            "Top Customers by Value",
            "Silver / Gold / Platinum Tier Report",
        ],
    },
    {
        id: "cash",
        title: "Cash & Bank Reports",
        desc: "Financial statements and cash flow",
        icon: Banknote,
        iconClass: "text-emerald-500",
        reports: [
            "Day Book",
            "Cash Flow Report",
            "Bank Statement Report",
            "Cheque Status Report",
            "Loan Repayment Schedule",
            "Profit & Loss Summary",
            "Balance Sheet (simple)",
        ],
    },
];

const RECENT_ACTIVITY = [
    { type: "Sale", ref: "BILL-2301", party: "Amit Sharma", amount: "₹4,500", channel: "Main Shop", staff: "SM-001", date: "28 May 2026", status: "Paid", statusClass: "bg-green-50 text-green-700 border border-green-200" },
    { type: "Purchase", ref: "PB-1003", party: "Kiran Distributors", amount: "₹42,100", channel: "Main WH", staff: "Admin", date: "27 May 2026", status: "Partial", statusClass: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    { type: "Sale", ref: "BILL-2298", party: "Priya Singh", amount: "₹1,200", channel: "Online", staff: "SM-002", date: "26 May 2026", status: "Paid", statusClass: "bg-green-50 text-green-700 border border-green-200" },
    { type: "Expense", ref: "EXP-002", party: "—", amount: "₹2,500", channel: "Delhi WH", staff: "Admin", date: "25 May 2026", status: "Done", statusClass: "bg-green-50 text-green-700 border border-green-200" },
    { type: "Return", ref: "RET-001", party: "Sharma Traders", amount: "₹12,000", channel: "—", staff: "Admin", date: "27 May 2026", status: "Pending", statusClass: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
];

const TYPE_BADGE = {
    Sale: "bg-blue-50 text-blue-700 border border-blue-200",
    Purchase: "bg-orange-50 text-orange-700 border border-orange-200",
    Expense: "bg-red-50 text-red-600 border border-red-200",
    Return: "bg-purple-50 text-purple-700 border border-purple-200",
};

const DATE_RANGE_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "this_week", label: "This Week" },
    { value: "this_month", label: "This Month" },
    { value: "this_year", label: "This Year" },
    { value: "custom", label: "Custom" },
];

export default function ReportsTab() {
    const [dateRange, setDateRange] = useState("this_month");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [activeReport, setActiveReport] = useState(null);

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        All business reports — sales, purchase, inventory, staff, parties and financials
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                    <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex gap-1 flex-wrap">
                        {DATE_RANGE_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setDateRange(opt.value)}
                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${dateRange === opt.value ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {dateRange === "custom" && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            <span className="text-xs text-gray-400">to</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Sales</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">₹2,84,500</p>
                    <p className="text-xs text-gray-400 mt-1">this month</p>
                </div>
                <div className="bg-white rounded-xl border border-red-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-red-400">Total Purchase</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">₹1,42,000</p>
                    <p className="text-xs text-gray-400 mt-1">this month</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Gross Profit</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹1,42,500</p>
                    <p className="text-xs text-gray-400 mt-1">50% margin</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Total Orders</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">128</p>
                    <p className="text-xs text-gray-400 mt-1">bills raised</p>
                </div>
                <div className="bg-white rounded-xl border border-indigo-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-indigo-400">Active Customers</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">47</p>
                    <p className="text-xs text-gray-400 mt-1">unique buyers</p>
                </div>
                <div className="bg-white rounded-xl border border-orange-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-orange-400">Low Stock Items</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">4</p>
                    <p className="text-xs text-gray-400 mt-1">needs restock</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Sales vs Purchase — Monthly Trend</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={SALES_TREND_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="sales" name="Sales" stroke="#6366f1" fill="#ede9fe" fillOpacity={0.5} />
                            <Area type="monotone" dataKey="purchase" name="Purchase" stroke="#f97316" fill="#ffedd5" fillOpacity={0.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Sales by Channel</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={CHANNEL_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                            <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REPORT_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <div
                            key={cat.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <Icon size={22} className={cat.iconClass} />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-800">{cat.title}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                {cat.reports.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => setActiveReport(name)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex justify-between items-center ${activeReport === name ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                                    >
                                        <span>{name}</span>
                                        <ChevronRight size={14} className={activeReport === name ? "text-white" : "text-gray-400"} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeReport !== null && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                        <FileText className="text-indigo-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-semibold text-indigo-700">{activeReport}</p>
                            <p className="text-xs text-indigo-400 mt-0.5">Full report integration coming soon — API to be connected</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Download CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveReport(null)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-600 transition-colors"
                            aria-label="Clear selection"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recent Transactions</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">5 records</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Type", "Reference #", "Party", "Amount", "Channel", "Staff", "Date", "Status"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RECENT_ACTIVITY.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[row.type]}`}>
                                        {row.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-700">
                                        {row.ref}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{row.party}</td>
                                <td className="px-4 py-3 font-semibold text-gray-800">{row.amount}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{row.channel}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.staff}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.statusClass}`}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
