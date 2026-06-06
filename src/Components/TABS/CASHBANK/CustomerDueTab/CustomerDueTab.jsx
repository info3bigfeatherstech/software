import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetShopReceivablesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Cashbank_api/cashbankApi";
import CashBankPageShell, { StatCard, EmptyState } from "../shared/CashBankPageShell";
import { fmtCurrency, fmtDate, resolveShopId, shouldSkipShopCashbank, AGING_BADGE } from "../cashbankUtils";

export default function CustomerDueTab() {
    const { user } = useSelector((state) => state.auth);
    const shopId = resolveShopId(user);
    const [search, setSearch] = useState("");

    const { data, isLoading, isFetching, error, refetch } = useGetShopReceivablesQuery(
        { shop_id: shopId, search, limit: 100 },
        { skip: shouldSkipShopCashbank(user) }
    );

    const bills = data?.bills || [];
    const summary = data?.meta?.summary || {};

    if (shouldSkipShopCashbank(user)) {
        return (
            <CashBankPageShell title="Customer Due" subtitle="Outstanding balances on bills">
                <EmptyState message="Select a shop to view receivables." />
            </CashBankPageShell>
        );
    }

    return (
        <CashBankPageShell
            title="Customer Due / Receivables"
            subtitle="Bills with pending balance — follow up for collection"
            onRefresh={refetch}
            isRefreshing={isFetching}
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Outstanding Bills" value={summary.bill_count || 0} tone="red" />
                <StatCard label="Total Due" value={fmtCurrency(summary.total_outstanding)} tone="red" />
                <StatCard label="Total Billed" value={fmtCurrency(summary.total_billed)} tone="blue" />
                <StatCard label="Already Collected" value={fmtCurrency(summary.total_collected)} tone="green" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bill, customer name or phone…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                    {error.data?.message || "Failed to load receivables"}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Bill", "Customer", "Bill Date", "Total", "Paid", "Due", "Status", "Aging"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(isLoading || isFetching) && (
                            <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!isLoading && !isFetching && bills.length === 0 && (
                            <tr><td colSpan={8}><EmptyState message="No outstanding customer dues" detail="All bills are fully paid." /></td></tr>
                        )}
                        {!isLoading && bills.map((b) => (
                            <tr key={b.bill_id} className="hover:bg-gray-50 text-gray-700">
                                <td className="px-4 py-3 font-mono text-xs">{b.bill_number}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-800">{b.customer_name || "Walk-in"}</p>
                                    <p className="text-xs text-gray-400">{b.customer_mobile}</p>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(b.created_at)}</td>
                                <td className="px-4 py-3">{fmtCurrency(b.total_amount)}</td>
                                <td className="px-4 py-3 text-green-600">{fmtCurrency(b.paid_amount)}</td>
                                <td className="px-4 py-3 font-semibold text-red-600">{fmtCurrency(b.balance_amount)}</td>
                                <td className="px-4 py-3 text-xs">{b.payment_status}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${AGING_BADGE[b.aging_bucket] || AGING_BADGE["0-30"]}`}>
                                        {b.aging_bucket} days
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CashBankPageShell>
    );
}
