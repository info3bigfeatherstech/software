import React, { useState } from "react";
import { useGetVendorPurchaseSummaryQuery, useGetPurchaseEntriesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseApi";
import CashBankPageShell, { StatCard, EmptyState, PhaseNotice } from "../shared/CashBankPageShell";
import { fmtCurrency, fmtDate } from "../cashbankUtils";

export default function VendorPayablesTab() {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [search, setSearch] = useState("");

    const { data: vendorSummary = [], isLoading: summaryLoading, refetch: refetchSummary } =
        useGetVendorPurchaseSummaryQuery({ from_date: fromDate, to_date: toDate });

    const { data: purchaseData, isLoading: listLoading, isFetching, refetch: refetchList } =
        useGetPurchaseEntriesQuery({ from_date: fromDate, to_date: toDate, search, limit: 50 });

    const purchases = purchaseData?.purchases || [];
    const totalPayable = vendorSummary.reduce((s, v) => s + (v.total_amount || 0), 0);

    const refetch = () => {
        refetchSummary();
        refetchList();
    };

    return (
        <CashBankPageShell
            title="Vendor Payables"
            subtitle="Outstanding purchase amounts by vendor — from mapped inward purchases"
            onRefresh={refetch}
            isRefreshing={isFetching}
        >
            <PhaseNotice>
                Payable amounts are derived from purchase entries. Vendor payment allocation will reduce outstanding when Vendor Payments module is enabled.
            </PhaseNotice>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search purchase or vendor…"
                    className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard label="Vendors" value={vendorSummary.length} tone="blue" />
                <StatCard label="Total Purchases" value={fmtCurrency(totalPayable)} hint="accrual basis" tone="red" />
                <StatCard label="Purchase Entries" value={purchaseData?.meta?.total || purchases.length} tone="purple" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">Vendor-wise Summary</div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Vendor", "Purchases", "Subtotal", "Tax", "Total Payable"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {summaryLoading && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!summaryLoading && vendorSummary.length === 0 && (
                            <tr><td colSpan={5}><EmptyState message="No vendor purchases in this period" /></td></tr>
                        )}
                        {vendorSummary.map((v) => (
                            <tr key={v.vendor_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{v.vendor_name}</td>
                                <td className="px-4 py-3">{v.total_purchases}</td>
                                <td className="px-4 py-3">{fmtCurrency(v.total_subtotal)}</td>
                                <td className="px-4 py-3">{fmtCurrency(v.total_tax)}</td>
                                <td className="px-4 py-3 font-semibold text-red-600">{fmtCurrency(v.total_amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">Recent Purchase Entries</div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Purchase #", "Vendor Invoice", "Vendor", "Date", "Amount", "Warehouse"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(listLoading || isFetching) && (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!listLoading && purchases.length === 0 && (
                            <tr><td colSpan={6}><EmptyState message="No purchase entries found" /></td></tr>
                        )}
                        {purchases.map((p) => (
                            <tr key={p.purchase_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs">{p.purchase_number}</td>
                                <td className="px-4 py-3 text-xs">{p.vendor_invoice_no}</td>
                                <td className="px-4 py-3">{p.vendor?.company_name}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(p.purchase_date)}</td>
                                <td className="px-4 py-3 font-medium">{fmtCurrency(p.total_amount)}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{p.warehouse?.warehouse_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CashBankPageShell>
    );
}
