import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetShopBankTransactionsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Cashbank_api/cashbankApi";
import { useGetShopBankAccountsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import CashBankPageShell, { StatCard, EmptyState } from "../shared/CashBankPageShell";
import { fmtCurrency, fmtDate, todayIso, resolveShopId, shouldSkipShopCashbank, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_BADGE } from "../cashbankUtils";

const maskAccount = (num) => (num ? `****${String(num).slice(-4)}` : "—");

export default function ShopBankStatementTab() {
    const { user } = useSelector((state) => state.auth);
    const shopId = resolveShopId(user);
    const [fromDate, setFromDate] = useState(todayIso());
    const [toDate, setToDate] = useState(todayIso());
    const [bankAccountId, setBankAccountId] = useState("");

    const skip = shouldSkipShopCashbank(user);

    const { data: bankAccounts = [] } = useGetShopBankAccountsQuery(
        { shopId, active_only: true },
        { skip: skip || !shopId }
    );

    const { data, isLoading, isFetching, error, refetch } = useGetShopBankTransactionsQuery(
        { shop_id: shopId, from_date: fromDate, to_date: toDate, bank_account_id: bankAccountId },
        { skip }
    );

    const payments = data?.payments || [];
    const refunds = data?.refunds || [];

    const rows = [
        ...payments.map((p) => ({
            id: p.payment_id,
            date: p.paid_at,
            type: "Credit",
            description: `Payment — ${p.bill?.bill_number} (${p.bill?.customer_name || "Walk-in"})`,
            method: p.payment_method,
            amount: p.amount,
            account: p.bill?.bank_account,
        })),
        ...refunds.map((r) => ({
            id: r.credit_note_id,
            date: r.refunded_at,
            type: "Debit",
            description: `Refund — ${r.credit_note_number}`,
            method: r.refund_method,
            amount: r.amount_refunded,
            account: null,
        })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (shouldSkipShopCashbank(user)) {
        return (
            <CashBankPageShell title="Bank Statement (Shop)" subtitle="UPI, card and bank transfer activity">
                <EmptyState message="Select a shop to view bank transactions." />
            </CashBankPageShell>
        );
    }

    return (
        <CashBankPageShell
            title="Bank Statement (Shop)"
            subtitle="Non-cash collections and refunds from billing — linked to shop bank accounts"
            onRefresh={refetch}
            isRefreshing={isFetching}
        >
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 text-gray-700">
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[200px]">
                    <option value="">All Bank Accounts</option>
                    {bankAccounts.map((a) => (
                        <option key={a.bank_account_id} value={a.bank_account_id}>
                            {a.bank_name} — {maskAccount(a.account_number)}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                    {error.data?.message || "Failed to load bank transactions"}
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard label="Credits (In)" value={fmtCurrency(data?.credits)} tone="green" />
                <StatCard label="Debits (Out)" value={fmtCurrency(data?.debits)} tone="red" />
                <StatCard label="Net" value={fmtCurrency(data?.net)} tone="blue" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Date", "Description", "Account", "Type", "Method", "Amount"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(isLoading || isFetching) && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Loading…</td></tr>
                        )}
                        {!isLoading && rows.length === 0 && (
                            <tr><td colSpan={6}><EmptyState message="No bank transactions in this period" /></td></tr>
                        )}
                        {rows.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(r.date)}</td>
                                <td className="px-4 py-3">{r.description}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {r.account ? `${r.account.bank_name} ${maskAccount(r.account.account_number)}` : "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-medium ${r.type === "Credit" ? "text-green-600" : "text-red-600"}`}>{r.type}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${PAYMENT_METHOD_BADGE[r.method] || "bg-gray-100"}`}>
                                        {PAYMENT_METHOD_LABELS[r.method] || r.method}
                                    </span>
                                </td>
                                <td className={`px-4 py-3 font-medium ${r.type === "Credit" ? "text-green-700" : "text-red-600"}`}>
                                    {r.type === "Credit" ? "+" : "-"}{fmtCurrency(r.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CashBankPageShell>
    );
}
