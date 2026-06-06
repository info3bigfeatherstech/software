import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetShopCollectionsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Cashbank_api/cashbankApi";
import CashBankPageShell, { StatCard, EmptyState } from "../shared/CashBankPageShell";
import {
    fmtCurrency,
    fmtDate,
    todayIso,
    resolveShopId,
    shouldSkipShopCashbank,
    PAYMENT_METHOD_LABELS,
    PAYMENT_METHOD_BADGE,
} from "../cashbankUtils";

export default function CollectionsTab() {
    const { user } = useSelector((state) => state.auth);
    const shopId = resolveShopId(user);
    const [fromDate, setFromDate] = useState(todayIso());
    const [toDate, setToDate] = useState(todayIso());
    const [paymentMethod, setPaymentMethod] = useState("");
    const [search, setSearch] = useState("");

    const { data, isLoading, isFetching, error, refetch } = useGetShopCollectionsQuery(
        {
            shop_id: shopId,
            from_date: fromDate,
            to_date: toDate,
            payment_method: paymentMethod,
            search,
            limit: 100,
        },
        { skip: shouldSkipShopCashbank(user) }
    );

    const payments = data?.payments || [];
    const summary = data?.meta?.summary || { totals: {}, grandTotal: 0, count: 0 };

    if (shouldSkipShopCashbank(user)) {
        return (
            <CashBankPageShell title="Collections / Day Book" subtitle="Daily sales collections from billing">
                <EmptyState message="Select a shop to view collections." detail="Super Admin: ensure shop_id is on your user or use a shop-scoped account." />
            </CashBankPageShell>
        );
    }

    return (
        <CashBankPageShell
            title="Collections / Day Book"
            subtitle="Bill payments collected at your shop — auto-synced from billing"
            onRefresh={refetch}
            isRefreshing={isFetching}
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Total Collected" value={fmtCurrency(summary.grandTotal)} hint={`${summary.count || 0} payments`} tone="green" />
                <StatCard label="Cash" value={fmtCurrency(summary.totals?.CASH)} tone="blue" />
                <StatCard label="UPI" value={fmtCurrency(summary.totals?.UPI)} tone="purple" />
                <StatCard label="Card / Bank" value={fmtCurrency((summary.totals?.CARD || 0) + (summary.totals?.BANK_TRANSFER || 0))} tone="amber" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">All Methods</option>
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bill or customer…"
                    className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                    {error.data?.message || "Failed to load collections"}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Date", "Bill", "Customer", "Method", "Amount", "Staff", "Collected By"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(isLoading || isFetching) && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!isLoading && !isFetching && payments.length === 0 && (
                            <tr><td colSpan={7}><EmptyState message="No collections in this period" /></td></tr>
                        )}
                        {!isLoading && payments.map((p) => (
                            <tr key={p.payment_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(p.paid_at)}</td>
                                <td className="px-4 py-3 font-mono text-xs">{p.bill?.bill_number}</td>
                                <td className="px-4 py-3">{p.bill?.customer_name || "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_METHOD_BADGE[p.payment_method] || "bg-gray-100 text-gray-600"}`}>
                                        {PAYMENT_METHOD_LABELS[p.payment_method] || p.payment_method}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{fmtCurrency(p.amount)}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{p.bill?.staff_code_value || "—"}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{p.collector?.name || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CashBankPageShell>
    );
}
