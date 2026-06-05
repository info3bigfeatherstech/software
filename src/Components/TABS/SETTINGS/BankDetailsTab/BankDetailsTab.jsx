// TABS/SETTINGS/BankDetailsTab/BankDetailsTab.jsx
//
// Shop-scoped bank accounts for UPI billing. Each shop manages its own accounts.

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
    useGetShopsQuery,
    useGetMyShopQuery,
    useGetShopBankAccountsQuery,
    useDeleteShopBankAccountMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import BankAccountFormModal from "./BankAccountFormModal";

export default function BankDetailsTab() {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isShopOwner = user?.role === "SHOP_OWNER";

    const [selectedShopId, setSelectedShopId] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const { data: myShop } = useGetMyShopQuery(undefined, { skip: !isShopOwner });
    const { data: shopsData } = useGetShopsQuery(
        { page: 1, limit: 100, is_active: true },
        { skip: !isSuperAdmin }
    );

    const effectiveShopId = useMemo(() => {
        if (isShopOwner) return myShop?.shop_id || user?.shop_id || "";
        if (isSuperAdmin) return selectedShopId || shopsData?.shops?.[0]?.shop_id || "";
        return user?.shop_id || "";
    }, [isShopOwner, isSuperAdmin, myShop, user, selectedShopId, shopsData]);

    const {
        data: accounts = [],
        isLoading,
        isFetching,
        refetch,
    } = useGetShopBankAccountsQuery(
        { shopId: effectiveShopId, active_only: true },
        { skip: !effectiveShopId }
    );

    const [deleteAccount] = useDeleteShopBankAccountMutation();

    const defaultAccount = accounts.find((a) => a.is_default);
    const upiAccounts = accounts.filter((a) => a.upi_id);

    const openAdd = () => {
        setEditingAccount(null);
        setShowForm(true);
    };

    const openEdit = (account) => {
        setEditingAccount(account);
        setShowForm(true);
    };

    const handleDelete = async (account) => {
        if (!window.confirm(`Remove bank account "${account.bank_name}" (${account.account_number_masked})?`)) {
            return;
        }
        try {
            const result = await deleteAccount({
                shopId: effectiveShopId,
                bankAccountId: account.bank_account_id,
            }).unwrap();
            toast.success(
                result?.deactivated
                    ? "Account deactivated (used on past bills)"
                    : "Bank account removed"
            );
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to remove account");
        }
    };

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Bank Accounts</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Manage UPI-enabled bank accounts for this shop&apos;s billing counter
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        type="button"
                        onClick={openAdd}
                        disabled={!effectiveShopId}
                        className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        <Plus size={14} /> Add Bank Account
                    </button>
                </div>
            </div>

            {isSuperAdmin && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Shop</label>
                    <select
                        value={selectedShopId || shopsData?.shops?.[0]?.shop_id || ""}
                        onChange={(e) => setSelectedShopId(e.target.value)}
                        className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                        {(shopsData?.shops || []).map((shop) => (
                            <option key={shop.shop_id} value={shop.shop_id}>
                                {shop.shop_name} — {shop.shop_code}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Total Accounts</p>
                    <p className="text-3xl font-bold text-blue-700">{accounts.length}</p>
                    <p className="text-xs text-gray-400 mt-1">active for this shop</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Default UPI Account</p>
                    <p className="text-lg font-bold text-green-600 truncate">
                        {defaultAccount?.bank_name || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                        {defaultAccount?.upi_id || "Not configured"}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">UPI Ready</p>
                    <p className="text-3xl font-bold text-purple-600">{upiAccounts.length}</p>
                    <p className="text-xs text-gray-400 mt-1">accounts with UPI ID</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank Accounts</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                        {accounts.length} records
                    </span>
                </div>

                {(isLoading || isFetching) && (
                    <div className="py-12 text-center text-sm text-gray-400">Loading accounts…</div>
                )}

                {!isLoading && !effectiveShopId && (
                    <div className="py-12 text-center text-sm text-gray-400">No shop selected</div>
                )}

                {!isLoading && effectiveShopId && accounts.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400">
                        No bank accounts yet. Add one with a UPI ID to accept UPI payments at billing.
                    </div>
                )}

                {!isLoading && accounts.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                {["Bank", "Holder", "Account", "IFSC", "UPI ID", "Default", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {accounts.map((row) => (
                                <tr key={row.bank_account_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{row.bank_name}</td>
                                    <td className="px-4 py-3 text-gray-700">{row.account_holder_name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                        {row.account_number_masked}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.ifsc_code}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.upi_id || "—"}</td>
                                    <td className="px-4 py-3">
                                        {row.is_default ? (
                                            <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(row)}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(row)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-800">
                    Each shop has its own bank accounts. At billing, staff selects UPI and picks an account — a QR code is generated with the bill amount. Accounts are never shared across shops.
                </p>
            </div>

            {showForm && (
                <BankAccountFormModal
                    shopId={effectiveShopId}
                    account={editingAccount}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAccount(null);
                    }}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
}
