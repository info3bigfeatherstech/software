import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetShopCashSummaryQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Cashbank_api/cashbankApi";
import CashBankPageShell, { StatCard, EmptyState, PhaseNotice } from "../shared/CashBankPageShell";
import { fmtCurrency, fmtDate, todayIso, resolveShopId, shouldSkipShopCashbank } from "../cashbankUtils";

export default function CashInHandTab() {
    const { user } = useSelector((state) => state.auth);
    const shopId = resolveShopId(user);
    const [fromDate, setFromDate] = useState(todayIso());
    const [toDate, setToDate] = useState(todayIso());
    const [openingBalance, setOpeningBalance] = useState("0");

    const { data, isLoading, isFetching, error, refetch } = useGetShopCashSummaryQuery(
        {
            shop_id: shopId,
            from_date: fromDate,
            to_date: toDate,
            opening_balance: Number(openingBalance) || 0,
        },
        { skip: shouldSkipShopCashbank(user) }
    );

    if (shouldSkipShopCashbank(user)) {
        return (
            <CashBankPageShell title="Cash In Hand" subtitle="Shop counter cash drawer">
                <EmptyState message="Select a shop to view cash summary." />
            </CashBankPageShell>
        );
    }

    const cashInEntries = data?.cash_in_entries || [];
    const cashOutEntries = data?.cash_out_entries || [];

    return (
        <CashBankPageShell
            title="Cash In Hand"
            subtitle="Physical cash at shop counter — cash bill payments minus cash refunds"
            onRefresh={refetch}
            isRefreshing={isFetching}
        >
            <PhaseNotice>
                Set opening balance manually each morning. Petty cash expenses and bank deposits will be added in a future update.
            </PhaseNotice>

            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Opening Balance (₹)</label>
                    <input
                        type="number"
                        min="0"
                        value={openingBalance}
                        onChange={(e) => setOpeningBalance(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-36"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                    {error.data?.message || "Failed to load cash summary"}
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Opening" value={fmtCurrency(data?.opening_balance)} tone="blue" />
                <StatCard label="Cash In" value={fmtCurrency(data?.cash_in)} hint="from bill payments" tone="green" />
                <StatCard label="Cash Out" value={fmtCurrency(data?.cash_out)} hint="cash refunds" tone="red" />
                <StatCard label="Closing Balance" value={fmtCurrency(data?.closing_balance)} tone="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">Cash In</div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-50">
                            {(isLoading || isFetching) && (
                                <tr><td className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                            )}
                            {!isLoading && cashInEntries.length === 0 && (
                                <tr><td><EmptyState message="No cash payments in period" /></td></tr>
                            )}
                            {cashInEntries.map((e) => (
                                <tr key={e.payment_id}>
                                    <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(e.paid_at)}</td>
                                    <td className="px-4 py-2">{e.bill?.bill_number} — {e.bill?.customer_name || "Walk-in"}</td>
                                    <td className="px-4 py-2 text-right font-medium text-green-700">{fmtCurrency(e.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                    <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">Cash Out (Refunds)</div>
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-50">
                            {!isLoading && cashOutEntries.length === 0 && (
                                <tr><td><EmptyState message="No cash refunds in period" /></td></tr>
                            )}
                            {cashOutEntries.map((e) => (
                                <tr key={e.credit_note_id}>
                                    <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(e.refunded_at)}</td>
                                    <td className="px-4 py-2">{e.credit_note_number} — {e.customer_name || "—"}</td>
                                    <td className="px-4 py-2 text-right font-medium text-red-600">{fmtCurrency(e.amount_refunded)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </CashBankPageShell>
    );
}
