// TABS/SETTINGS/StaffCodesTab/StaffCodesTab.jsx
//
// Shop-scoped billing staff codes for shared terminal logins.

import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Pencil, Trash2, Plus, RefreshCw, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import {
    useGetShopsQuery,
    useGetMyShopQuery,
    useGetShopStaffCodesQuery,
    useGetShopStaffBillingSummaryQuery,
    useDeleteShopStaffCodeMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import StaffCodeFormModal from "./StaffCodeFormModal";

export default function StaffCodesTab() {
    const { user } = useSelector((state) => state.auth);
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const isShopOwner = user?.role === "SHOP_OWNER";

    const [selectedShopId, setSelectedShopId] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCode, setEditingCode] = useState(null);

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

    const today = new Date().toISOString().slice(0, 10);

    const {
        data: staffCodes = [],
        isLoading,
        isFetching,
        refetch,
    } = useGetShopStaffCodesQuery(
        { shopId: effectiveShopId, active_only: false },
        { skip: !effectiveShopId }
    );

    const { data: summary, refetch: refetchSummary } = useGetShopStaffBillingSummaryQuery(
        { shopId: effectiveShopId, from_date: today, to_date: today },
        { skip: !effectiveShopId }
    );

    const [deleteCode] = useDeleteShopStaffCodeMutation();

    const activeCount = staffCodes.filter((c) => c.is_active).length;

    const openAdd = () => {
        setEditingCode(null);
        setShowForm(true);
    };

    const openEdit = (code) => {
        setEditingCode(code);
        setShowForm(true);
    };

    const handleDelete = async (code) => {
        if (!window.confirm(`Remove staff code "${code.code} — ${code.display_name}"?`)) return;
        try {
            const result = await deleteCode({
                shopId: effectiveShopId,
                staffCodeId: code.staff_code_id,
            }).unwrap();
            toast.success(
                result?.deactivated
                    ? "Code deactivated (used on past bills)"
                    : "Staff code removed"
            );
            refetch();
            refetchSummary();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to remove staff code");
        }
    };

    const handleRefresh = () => {
        refetch();
        refetchSummary();
    };

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Billing Staff Codes</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Shared login + per-bill staff code selection at the billing counter
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
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
                        <Plus size={14} /> Add Staff Code
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
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Active Codes</p>
                    <p className="text-3xl font-bold text-blue-700">{activeCount}</p>
                    <p className="text-xs text-gray-400 mt-1">for billing dropdown</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Today&apos;s Bills</p>
                    <p className="text-3xl font-bold text-green-600">{summary?.bill_count ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-1">with staff attribution</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Staff on Duty Today</p>
                    <p className="text-3xl font-bold text-purple-600">{summary?.by_staff?.length ?? 0}</p>
                    <p className="text-xs text-gray-400 mt-1">unique codes billed</p>
                </div>
            </div>

            {summary?.by_staff?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <BarChart3 size={16} className="text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Today — Bills by Staff</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {["Code", "Name", "Bills", "Total", "Collected"].map((h) => (
                                    <th key={h} className="px-4 py-2 text-xs font-semibold text-gray-400 text-left uppercase">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {summary.by_staff.map((row) => (
                                <tr key={row.staff_code_value}>
                                    <td className="px-4 py-2 font-mono text-gray-700">{row.staff_code_value}</td>
                                    <td className="px-4 py-2 text-gray-800">{row.staff_name_snapshot}</td>
                                    <td className="px-4 py-2">{row.bill_count}</td>
                                    <td className="px-4 py-2">₹{Number(row.total_amount).toLocaleString()}</td>
                                    <td className="px-4 py-2">₹{Number(row.total_collected).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Staff Codes</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border px-2 py-0.5 rounded-full">
                        {staffCodes.length} records
                    </span>
                </div>

                {(isLoading || isFetching) && (
                    <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
                )}

                {!isLoading && staffCodes.length === 0 && (
                    <div className="py-12 text-center text-sm text-gray-400">
                        No staff codes yet. Add SC001, SC002… for billing staff to select at checkout.
                    </div>
                )}

                {!isLoading && staffCodes.length > 0 && (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {["Code", "Name", "Phone", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 text-left uppercase">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {staffCodes.map((row) => (
                                <tr key={row.staff_code_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-medium text-gray-800">{row.code}</td>
                                    <td className="px-4 py-3 text-gray-700">{row.display_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{row.phone || "—"}</td>
                                    <td className="px-4 py-3">
                                        {row.is_active ? (
                                            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
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

            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                <p className="text-xs text-amber-800">
                    Staff do not need separate logins. They use the shared billing account and select their code on each bill.
                    When a person leaves, edit the code&apos;s name — old bills keep the original name snapshot.
                </p>
            </div>

            {showForm && (
                <StaffCodeFormModal
                    shopId={effectiveShopId}
                    staffCode={editingCode}
                    onClose={() => {
                        setShowForm(false);
                        setEditingCode(null);
                    }}
                    onSuccess={() => {
                        refetch();
                        refetchSummary();
                    }}
                />
            )}
        </div>
    );
}
