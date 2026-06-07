// TABS/SALES/ReportsTab.jsx
//
// Sales Reports Tab
// Features: Daily Summary, GST Report by HSN
// Uses existing billingApi endpoints

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
    Calendar,
    Download,
    TrendingUp,
    Wallet,
    FileText,
    PieChart,
    IndianRupee,
    Receipt,
    Building2,
    Loader2
} from "lucide-react";
import { toast } from "../../../shared/ToastConfig";
import { RefreshCw } from "lucide-react";
import {
    useGetDailySummaryQuery,
    useGetGSTReportQuery
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingApi";
import { CURRENT_USER } from "../../../roles";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

export default function ShopReportTab() {
    const { user } = useSelector((state) => state.auth);
    const [reportType, setReportType] = useState("daily"); // "daily" or "gst"

    // Daily Summary state
    const [dailyDate, setDailyDate] = useState(formatDate(new Date()));

    // GST Report state
    const [fromDate, setFromDate] = useState(formatDate(new Date()));
    const [toDate, setToDate] = useState(formatDate(new Date()));

    const shopId = user?.shop_id || "";

    // Queries
    const {
        data: dailyData,
        isLoading: dailyLoading,
        isError: dailyError,
        refetch: refetchDaily
    } = useGetDailySummaryQuery(
        { shop_id: shopId, date: dailyDate },
        { skip: !shopId || reportType !== "daily" }
    );

    const {
        data: gstData,
        isLoading: gstLoading,
        isError: gstError,
        refetch: refetchGST
    } = useGetGSTReportQuery(
        { shop_id: shopId, from_date: fromDate, to_date: toDate },
        { skip: !shopId || reportType !== "gst" }
    );

    const handleRefresh = () => {
        if (reportType === "daily") {
            refetchDaily();
        } else {
            refetchGST();
        }
        toast.success("Report refreshed");
    };

    const handleDownload = () => {
        if (reportType === "daily") {
            const data = dailyData;
            const csvContent = [
                ["Shop ID", data?.shop_id || ""],
                ["Date", data?.date || ""],
                ["Bill Count", data?.bill_count || 0],
                ["Total Amount", data?.total_amount || 0],
                ["Total GST", data?.total_gst || 0],
                ["Total Collected", data?.total_collected || 0],
                ["", ""],
                ["Payment Methods", ""],
                ...Object.entries(data?.payment_methods || {}).map(([key, value]) => [key, value]),
                ["", ""],
                ["GST Breakdown", ""],
                ["CGST", data?.gst?.cgst || 0],
                ["SGST", data?.gst?.sgst || 0],
                ["IGST", data?.gst?.igst || 0],
            ];
            const csv = csvContent.map(row => row.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `daily-summary-${dailyDate}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("CSV downloaded");
        } else {
            const data = gstData;
            const csvRows = [
                ["Shop ID", data?.shop_id || ""],
                ["Shop Name", data?.shop_name || ""],
                ["From Date", data?.from_date || ""],
                ["To Date", data?.to_date || ""],
                ["", ""],
                ["HSN Code", "GST %", "Taxable Value", "Tax Amount", "CGST", "SGST", "IGST"],
                ...(data?.hsn_summary || []).map(h => [
                    h.hsn_code, h.gst_percent, h.taxable_value, h.tax_amount, h.cgst, h.sgst, h.igst
                ]),
                ["", ""],
                ["Totals", "", data?.totals?.taxable_value || 0, data?.totals?.tax_amount || 0, data?.totals?.cgst || 0, data?.totals?.sgst || 0, data?.totals?.igst || 0],
            ];
            const csv = csvRows.map(row => row.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gst-report-${fromDate}-to-${toDate}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("CSV downloaded");
        }
    };

    const isLoading = (reportType === "daily" && dailyLoading) || (reportType === "gst" && gstLoading);

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-4 py-4">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sales Reports</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        View daily sales summary and GST reports by HSN
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={13} /> Refresh
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isLoading || (!dailyData && !gstData)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Report Type Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1 w-fit">
                <button
                    onClick={() => setReportType("daily")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${reportType === "daily"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Calendar size={14} className="inline mr-2" />
                    Daily Summary
                </button>
                <button
                    onClick={() => setReportType("gst")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${reportType === "gst"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <FileText size={14} className="inline mr-2" />
                    GST Report (HSN-wise)
                </button>
            </div>

            {/* Date Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                {reportType === "daily" ? (
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-600">Select Date:</label>
                        <input
                            type="date"
                            value={dailyDate}
                            onChange={(e) => setDailyDate(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="text-sm font-medium text-gray-600">From Date:</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-600">To Date:</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-3" />
                    <p className="text-gray-500">Loading report data...</p>
                </div>
            )}

            {/* Error State */}
            {!isLoading && ((reportType === "daily" && dailyError) || (reportType === "gst" && gstError)) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <p className="text-red-600">Failed to load report data</p>
                    <button onClick={handleRefresh} className="mt-3 text-sm text-red-700 underline">Try Again</button>
                </div>
            )}

            {/* Daily Summary View */}
            {!isLoading && reportType === "daily" && dailyData && (
                <div className="space-y-5">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-blue-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-blue-400 uppercase tracking-wide">Bill Count</p>
                                <Receipt size={16} className="text-blue-300" />
                            </div>
                            <p className="text-3xl font-bold text-blue-700">{dailyData.bill_count || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">total bills</p>
                        </div>

                        <div className="bg-white rounded-xl border border-emerald-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-emerald-500 uppercase tracking-wide">Total Amount</p>
                                <IndianRupee size={16} className="text-emerald-300" />
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(dailyData.total_amount)}</p>
                            <p className="text-xs text-gray-400 mt-1">net sales</p>
                        </div>

                        <div className="bg-white rounded-xl border border-purple-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-purple-400 uppercase tracking-wide">Total GST</p>
                                <TrendingUp size={16} className="text-purple-300" />
                            </div>
                            <p className="text-3xl font-bold text-purple-600">{formatCurrency(dailyData.total_gst)}</p>
                            <p className="text-xs text-gray-400 mt-1">tax collected</p>
                        </div>

                        <div className="bg-white rounded-xl border border-orange-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-orange-400 uppercase tracking-wide">Total Collected</p>
                                <Wallet size={16} className="text-orange-300" />
                            </div>
                            <p className="text-3xl font-bold text-orange-600">{formatCurrency(dailyData.total_collected)}</p>
                            <p className="text-xs text-gray-400 mt-1">after adjustments</p>
                        </div>
                    </div>

                    {/* Payment Methods Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700">Payment Methods</h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(dailyData.payment_methods || {}).map(([method, amount]) => (
                                    <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">{method}</span>
                                        <span className="text-lg font-bold text-gray-800">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                                {Object.keys(dailyData.payment_methods || {}).length === 0 && (
                                    <p className="text-gray-400 text-sm col-span-2 text-center py-4">No payment data available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* GST Breakdown */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700">GST Breakdown</h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-blue-500">CGST</p>
                                    <p className="text-xl font-bold text-blue-700">{formatCurrency(dailyData.gst?.cgst)}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-xs text-green-500">SGST</p>
                                    <p className="text-xl font-bold text-green-700">{formatCurrency(dailyData.gst?.sgst)}</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <p className="text-xs text-purple-500">IGST</p>
                                    <p className="text-xl font-bold text-purple-700">{formatCurrency(dailyData.gst?.igst)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GST Report View */}
            {!isLoading && reportType === "gst" && gstData && (
                <div className="space-y-5">
                    {/* Shop Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <Building2 size={24} className="text-gray-400" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{gstData.shop_name || "Shop"}</p>
                                <p className="text-xs text-gray-400">Period: {gstData.from_date} to {gstData.to_date}</p>
                            </div>
                        </div>
                    </div>

                    {/* HSN Summary Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700">HSN-wise GST Summary</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">HSN Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">GST %</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Taxable Value</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Tax Amount</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">CGST</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">SGST</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">IGST</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {(gstData.hsn_summary || []).map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-gray-700">{item.hsn_code}</td>
                                            <td className="px-4 py-3">{item.gst_percent}%</td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.taxable_value)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.tax_amount)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.cgst)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.sgst)}</td>
                                            <td className="px-4 py-3 text-right">{formatCurrency(item.igst)}</td>
                                        </tr>
                                    ))}
                                    {(gstData.hsn_summary || []).length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                                No HSN data available for selected period
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-3 text-right font-semibold text-gray-700">Totals</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(gstData.totals?.taxable_value)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(gstData.totals?.tax_amount)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(gstData.totals?.cgst)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(gstData.totals?.sgst)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(gstData.totals?.igst)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

