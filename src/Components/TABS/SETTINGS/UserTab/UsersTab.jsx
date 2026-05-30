// TABS/SETTINGS/UsersTab.jsx
//
// Full rewrite — real API only, zero localStorage, zero fake data.
// Table view: name, phone, role badge, assigned (warehouse/shop), status, created, actions.
// Actions: Edit (opens UserEditForm which also handles status + reset password).

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { useGetUsersQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/User_Api/userApi";
import {
    openAddForm,
    closeAddForm,
    openEditForm,
    closeEditForm,
    updateFormData,
    setFormErrors,
    clearFormErrors,
    setSearch,
    setRoleFilter,
    setActiveFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/User_Api/userSlice";
import UserAddForm from "./UserShared/UserAddForm";
import UserEditForm from "./UserShared/UserEditForm";
import { USER_ROLES } from "./UserShared/UserFormBody";

// ── Role badge helper ──────────────────────────────────────────────────────
const getRoleBadge = (role) => {
    const r = USER_ROLES.find(r => r.value === role);
    return r
        ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>
        : <span className="text-xs text-gray-400 font-mono">{role}</span>;
};

// ── Assigned-to label ──────────────────────────────────────────────────────
const getAssignedTo = (user) => {
    if (user.warehouse_id) return <span className="text-xs font-mono text-indigo-600">{user.warehouse_id}</span>;
    if (user.shop_id) return <span className="text-xs font-mono text-green-600">{user.shop_id}</span>;
    return <span className="text-xs text-gray-400">—</span>;
};

export default function UsersTab() {
    const dispatch = useDispatch();

    // ── Slice state ────────────────────────────────────────────────────────
    const {
        showAddForm,
        showEditForm,
        selectedUser,
        formData,
        formErrors,
        search,
        roleFilter,
        activeFilter,
        currentPage,
        pageSize,
    } = useSelector((state) => state.user);

    // ── API ────────────────────────────────────────────────────────────────
    const {
        data: usersData,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetUsersQuery({
        page: currentPage,
        limit: pageSize,
        search,
        role: roleFilter,
        is_active: activeFilter,
    });

    const users = usersData?.users || [];
    const meta = usersData?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalItems = meta?.total || 0;

    // ── Stats from current page ────────────────────────────────────────────
    const activeCount = users.filter(u => u.is_active).length;

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleAddSuccess = () => {
        dispatch(closeAddForm());
        dispatch(clearFormErrors());
        refetch();
    };

    const handleEditSuccess = () => {
        dispatch(closeEditForm());
        dispatch(clearFormErrors());
        refetch();
    };

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Users & Roles</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Deactivate users instead of deleting — audit trail must be preserved
                    </p>
                </div>
                <button
                    onClick={() => dispatch(openAddForm())}
                    className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 cursor-pointer"
                >
                    + Add User
                </button>
            </div>

            {/* ── Summary Cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 text-black shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl font-bold mt-1">{totalItems}</p>
                </div>
                <div className="bg-white p-4 text-black shadow-md">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Active (this page)</p>
                    <p className="text-3xl font-bold mt-1">{activeCount}</p>
                </div>
                <div className="bg-white border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Role Breakdown</p>
                    <div className="space-y-1">
                        {USER_ROLES.map(r => {
                            const count = users.filter(u => u.role === r.value).length;
                            if (!count) return null;
                            return (
                                <div key={r.value} className="flex items-center justify-between">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${r.color}`}>{r.label}</span>
                                    <span className="text-xs font-semibold text-gray-700">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Filters Bar ─────────────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 p-4 space-y-3">
                <div className="flex gap-3">
                    <input
                        value={search}
                        onChange={(e) => dispatch(setSearch(e.target.value))}
                        placeholder="Search by name or phone…"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                        onClick={() => dispatch(resetFilters())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                        <X size={14} /> Clear
                    </button>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {/* Role filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => dispatch(setRoleFilter(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                    >
                        <option value="">All Roles</option>
                        {USER_ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={activeFilter}
                        onChange={(e) => dispatch(setActiveFilter(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>

                    {/* Page size */}
                    <select
                        value={pageSize}
                        onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer"
                    >
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
                    </select>
                </div>
            </div>

            {/* ── Error ───────────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">
                        Error loading users: {error.data?.message || "Please try again"}
                    </p>
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {["User", "Phone", "Role", "Assigned To", "Status", "Created", "Actions"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">

                        {/* Loading rows */}
                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={7} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Empty state */}
                        {!isLoading && !isFetching && users.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    No users found
                                </td>
                            </tr>
                        )}

                        {/* User rows */}
                        {!isLoading && users.map(u => (
                            <tr
                                key={u.user_id}
                                className={`hover:bg-gray-50 transition-colors ${!u.is_active ? "opacity-50" : ""}`}
                            >
                                {/* User */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {u.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{u.name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{u.user_id}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Phone */}
                                <td className="px-4 py-3 text-xs text-gray-600 font-mono">{u.phone}</td>

                                {/* Role */}
                                <td className="px-4 py-3">{getRoleBadge(u.role)}</td>

                                {/* Assigned To */}
                                <td className="px-4 py-3">{getAssignedTo(u)}</td>

                                {/* Status */}
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {u.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>

                                {/* Created */}
                                <td className="px-4 py-3 text-xs text-gray-400">
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => dispatch(openEditForm(u))}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ───────────────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* ── Add Form Modal ───────────────────────────────────────────────── */}
            {showAddForm && (
                <UserAddForm
                    formData={formData}
                    formErrors={formErrors}
                    onSave={handleAddSuccess}
                />
            )}

            {/* ── Edit Form Modal ──────────────────────────────────────────────── */}
            {showEditForm && (
                <UserEditForm
                    formData={formData}
                    formErrors={formErrors}
                    selectedUser={selectedUser}
                    onSave={handleEditSuccess}
                />
            )}

        </div>
    );
}