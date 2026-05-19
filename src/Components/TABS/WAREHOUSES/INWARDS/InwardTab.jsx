// TABS/WAREHOUSES/INWARDS/InwardTab.jsx
//
// Main inward management tab.
// Status pills: All | SCHEDULED | ARRIVED | MAPPED | CANCELLED
// Row actions by status:
//   SCHEDULED → "Edit" (opens InwardEditForm)
//   ARRIVED   → "Edit" (opens InwardEditForm) + "Manage Items" (opens InwardItemsModal)
//   MAPPED    → read only
//   CANCELLED → read only

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { useGetInwardsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
import {
    openAddForm,
    openEditForm,           // FIXED: import openEditForm (not openArrivalModal)
    openArrivalModal,
    closeArrivalModal,
    openItemsModal,
    closeItemsModal,
    setSearch,
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
import InwardAddForm from "./InwardShared/InwardAddForm";
import InwardEditForm from "./InwardShared/InwardEditForm";
import InwardArrivalModal from "./InwardShared/InwardArrivalModal";
import InwardItemsModal from "./InwardShared/InwardItemsModal";
import InwardStatusModal from "./InwardShared/InwardStatusModal";

const STATUS_BADGE = {
    SCHEDULED: "bg-yellow-100 text-yellow-700",
    ARRIVED: "bg-blue-100 text-blue-700",
    MAPPED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
};

const STATUS_PILLS = ["", "SCHEDULED", "ARRIVED", "MAPPED", "CANCELLED"];
const PILL_LABEL = { "": "All", SCHEDULED: "Scheduled", ARRIVED: "Arrived", MAPPED: "Mapped", CANCELLED: "Cancelled" };

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function InwardTab() {
    const dispatch = useDispatch();

    // ── Redux state ───────────────────────────────────────────────────────────
    const {
        showAddForm,
        showEditForm,          // FIXED: new flag for edit form
        showArrivalModal,      // FIXED: now ONLY for arrival modal
        showItemsModal,
        showStatusModal,
        selectedInward,
        scheduleForm,
        scheduleErrors,
        arrivalForm,
        arrivalErrors,
        editForm,
        editErrors,
        itemForm,
        itemErrors,
        editingItemId,
        statusAction,
        statusRemarks,
        search,
        statusFilter,
        currentPage,
        pageSize,
    } = useSelector((state) => state.inward);

    const { user } = useSelector((state) => state.auth);

    // ── RTK Query ─────────────────────────────────────────────────────────────
    const { data: inwardData, isLoading, isFetching, error, refetch } = useGetInwardsQuery({
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        warehouse_id: ["WH_MANAGER", "WH_STOCK_LISTER"].includes(user?.role) ? user?.warehouse_id : "",
    });

    const inwards = inwardData?.inwards || [];
    const meta = inwardData?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalItems = meta?.total || 0;

    // ── Callbacks ─────────────────────────────────────────────────────────────
    // const handleAddSuccess = () => { refetch(); };
    // const handleEditClose = () => { refetch(); };   // edit form closes itself
    // const handleArrivalSuccess = () => { refetch(); };
    // const handleItemsClose = () => { refetch(); };
    // const handleStatusSuccess = () => { refetch(); };
    // ── Callbacks with AUTO-CLOSE ─────────────────────────────────────────────
    const handleAddSuccess = () => {
        dispatch(closeAddForm());      // Close add modal
        refetch();                      // Refresh table
    };

    const handleEditClose = () => {
        // Edit form already closes itself via closeEditForm() inside the modal
        refetch();
    };

    const handleArrivalSuccess = () => {
        dispatch(closeArrivalModal());  // Close arrival modal
        refetch();                      // Refresh table
    };

    const handleItemsClose = () => {
        dispatch(closeItemsModal());    // Close items modal
        refetch();                      // Refresh table
    };

    const handleStatusSuccess = () => {
        dispatch(closeStatusModal());   // Close status modal
        refetch();                      // Refresh table
    };
    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Inward Receipts</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Schedule, receive, and map incoming stock from vendors</p>
                </div>
                <button
                    onClick={() => dispatch(openAddForm())}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                    + Schedule Inward
                </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap">
                {STATUS_PILLS.map((s) => (
                    <button
                        key={s}
                        onClick={() => dispatch(setStatusFilter(s))}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${statusFilter === s
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                            }`}
                    >
                        {PILL_LABEL[s]}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3">
                <input
                    value={search}
                    onChange={(e) => dispatch(setSearch(e.target.value))}
                    placeholder="Search by inward number, invoice, challan…"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                    onClick={() => dispatch(resetFilters())}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                    <X size={14} /> Clear
                </button>
                <select
                    value={pageSize}
                    onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
                >
                    {[10, 20, 50].map((s) => <option key={s} value={s}>{s} per page</option>)}
                </select>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">Error loading inwards: {error.data?.message || "Please try again"}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {["Inward #", "Vendor", "Warehouse", "Expected", "Arrived", "Invoice / Challan", "Status", "Actions"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(isLoading || isFetching) && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!isLoading && !isFetching && inwards.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    No inwards found
                                </td>
                            </tr>
                        )}
                        {!isLoading && inwards.map((inward) => (
                            <tr key={inward.inward_id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-mono text-xs font-semibold text-gray-800">{inward.inward_number}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(inward.created_at)}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700 font-medium">{inward.vendor?.company_name || "—"}</p>
                                    {inward.vendor?.city && <p className="text-xs text-gray-400">{inward.vendor.city}</p>}
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-gray-700">{inward.warehouse?.warehouse_name || "—"}</p>
                                    {inward.warehouse?.city && <p className="text-xs text-gray-400">{inward.warehouse.city}</p>}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(inward.expected_date)}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(inward.arrived_at)}</td>
                                <td className="px-4 py-3">
                                    {inward.vendor_invoice_no ? (
                                        <div>
                                            <p className="text-xs font-mono text-gray-700">{inward.vendor_invoice_no}</p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">{inward.challan_no || "—"}</p>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[inward.status] || "bg-gray-100 text-gray-500"}`}>
                                        {inward.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col gap-1.5">
                                        {/* Edit button - SCHEDULED or ARRIVED */}
                                        {(inward.status === "SCHEDULED" || inward.status === "ARRIVED") && (
                                            <button onClick={() => dispatch(openEditForm(inward))} className="text-xs font-medium text-blue-600 hover:text-blue-800 text-left">
                                                Edit
                                            </button>
                                        )}

                                        {/* Mark Arrived button - SCHEDULED only */}
                                        {inward.status === "SCHEDULED" && (
                                            <button
                                                onClick={() => dispatch(openArrivalModal(inward))}
                                                className="text-xs font-medium text-green-600 hover:text-green-800 text-left"
                                            >
                                                Mark Arrived
                                            </button>
                                        )}

                                        {/* Manage Items button - ARRIVED only */}
                                        {inward.status === "ARRIVED" && (
                                            <button onClick={() => dispatch(openItemsModal(inward))} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 text-left">
                                                Manage Items
                                            </button>
                                        )}

                                        {/* MAPPED/CANCELLED - no actions */}
                                        {(inward.status === "MAPPED" || inward.status === "CANCELLED") && (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODALS ───────────────────────────────────────────────────────────── */}

            {/* Add Form Modal */}
            {showAddForm && (
                <InwardAddForm
                    formData={scheduleForm}
                    formErrors={scheduleErrors}
                    onSave={handleAddSuccess}
                />
            )}

            {/* FIXED: Edit Form Modal (READ-ONLY detail view) - uses showEditForm flag */}
            {showEditForm && selectedInward && (
                <InwardEditForm
                    selectedInward={selectedInward}
                    formData={editForm}
                    formErrors={editErrors}
                    onSave={handleEditClose}
                />
            )}

            {/* FIXED: Arrival Modal - uses showArrivalModal flag (separate from edit form) */}
            {showArrivalModal && selectedInward && (
                <InwardArrivalModal
                    selectedInward={selectedInward}
                    formData={arrivalForm}
                    formErrors={arrivalErrors}
                    onSave={handleArrivalSuccess}
                />
            )}

            {/* Items Modal */}
            {showItemsModal && selectedInward && (
                <InwardItemsModal
                    selectedInward={selectedInward}
                    itemForm={itemForm}
                    itemErrors={itemErrors}
                    editingItemId={editingItemId}
                    onClose={handleItemsClose}
                />
            )}

            {/* Status Modal */}
            {showStatusModal && selectedInward && (
                <InwardStatusModal
                    selectedInward={selectedInward}
                    statusAction={statusAction}
                    statusRemarks={statusRemarks}
                    onSave={handleStatusSuccess}
                />
            )}

        </div>
    );
}
// // TABS/WAREHOUSES/INWARDS/InwardTab.jsx
// //
// // Responsibility:
// //   - Main table showing all inwards with status badge
// //   - Status pill filters: All | SCHEDULED | ARRIVED | MAPPED | CANCELLED
// //   - Search input
// //   - Per-row action buttons based on status
// //   - Wires all modals: Add, ArrivalModal, EditForm, ItemsModal, StatusModal

// import React, { useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useGetInwardsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import {
//     openAddForm,
//     openArrivalModal,
//     openItemsModal,
//     openStatusModal,
//     setSearch,
//     setStatusFilter,
//     setCurrentPage,
//     // modal open for edit
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";

// import InwardAddForm from "./InwardShared/InwardAddForm";
// import InwardArrivalModal from "./InwardShared/InwardArrivalModal";
// import InwardEditForm from "./InwardShared/InwardEditForm";
// import InwardItemsModal from "./InwardShared/InwardItemsModal";
// import InwardStatusModal from "./InwardShared/InwardStatusModal";

// // ── Local action: open edit form ──────────────────────────────────────────────
// // We keep editForm open state in a local slice action — openEditForm is defined
// // in inwardSlice but InwardTab imports it directly.
// import {
//     openEditForm,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";

// // ── Status config ─────────────────────────────────────────────────────────────
// const STATUS_PILLS = [
//     { label: "All", value: "" },
//     { label: "Scheduled", value: "SCHEDULED" },
//     { label: "Arrived", value: "ARRIVED" },
//     { label: "Mapped", value: "MAPPED" },
//     { label: "Cancelled", value: "CANCELLED" },
// ];

// const STATUS_BADGE = {
//     SCHEDULED: "bg-yellow-100 text-yellow-700 border border-yellow-200",
//     ARRIVED: "bg-blue-100 text-blue-700 border border-blue-200",
//     MAPPED: "bg-green-100 text-green-700 border border-green-200",
//     CANCELLED: "bg-red-100 text-red-600 border border-red-200",
// };

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const fmt = (iso) => {
//     if (!iso) return "—";
//     return new Date(iso).toLocaleDateString("en-IN", {
//         day: "2-digit", month: "short", year: "numeric",
//     });
// };

// export default function InwardTab() {
//     const dispatch = useDispatch();

//     // ── Redux state ───────────────────────────────────────────────────────────
//     const {
//         showAddForm,
//         showArrivalModal,
//         showEditForm,
//         showItemsModal,
//         showStatusModal,
//         selectedInward,
//         scheduleForm,
//         scheduleErrors,
//         arrivalForm,
//         arrivalErrors,
//         editForm,
//         editErrors,
//         itemForm,
//         itemErrors,
//         editingItemId,
//         statusAction,
//         statusRemarks,
//         search,
//         statusFilter,
//         currentPage,
//         pageSize,
//     } = useSelector((s) => s.inward);

//     // ── RTK Query ─────────────────────────────────────────────────────────────
//     const { data, isLoading, isFetching, isError, refetch } = useGetInwardsQuery({
//         page: currentPage,
//         limit: pageSize,
//         search,
//         status: statusFilter,
//     });

//     const inwards = data?.inwards || [];
//     const meta = data?.meta || { total: 0, totalPages: 1 };

//     // ── Search debounce ───────────────────────────────────────────────────────
//     const handleSearch = useCallback(
//         (e) => dispatch(setSearch(e.target.value)),
//         [dispatch]
//     );

//     // ── onSave callback — just close; RTK cache invalidation refetches ────────
//     const onSave = () => { };   // modals close themselves after dispatch

//     // ── Pagination range ──────────────────────────────────────────────────────
//     const startRow = (currentPage - 1) * pageSize + 1;
//     const endRow = Math.min(currentPage * pageSize, meta.total);

//     return (
//         <div className="flex flex-col gap-4">

//             {/* ── Top bar ─────────────────────────────────────────────────── */}
//             <div className="flex items-center justify-between gap-3 flex-wrap">
//                 <div>
//                     <h2 className="text-base font-semibold text-gray-800">Inwards</h2>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         Pre-arrival schedules, arrivals &amp; item receipts
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                     {/* Search */}
//                     <div className="relative">
//                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
//                         <input
//                             value={search}
//                             onChange={handleSearch}
//                             placeholder="Search invoice, challan…"
//                             className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
//                         />
//                     </div>
//                     {/* Refresh */}
//                     <button
//                         onClick={refetch}
//                         disabled={isFetching}
//                         className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
//                         title="Refresh"
//                     >
//                         {isFetching ? "⟳" : "↺"}
//                     </button>
//                     {/* Schedule new */}
//                     <button
//                         onClick={() => dispatch(openAddForm())}
//                         className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
//                     >
//                         + Schedule Inward
//                     </button>
//                 </div>
//             </div>

//             {/* ── Status pills ─────────────────────────────────────────────── */}
//             <div className="flex items-center gap-2 flex-wrap">
//                 {STATUS_PILLS.map((pill) => (
//                     <button
//                         key={pill.value}
//                         onClick={() => dispatch(setStatusFilter(pill.value))}
//                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${statusFilter === pill.value
//                             ? "bg-blue-600 text-white border-blue-600"
//                             : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
//                             }`}
//                     >
//                         {pill.label}
//                     </button>
//                 ))}
//                 {(search || statusFilter) && (
//                     <button
//                         onClick={() => {
//                             dispatch(setSearch(""));
//                             dispatch(setStatusFilter(""));
//                         }}
//                         className="text-xs text-red-500 hover:underline ml-1 cursor-pointer"
//                     >
//                         Clear filters
//                     </button>
//                 )}
//             </div>

//             {/* ── Table card ───────────────────────────────────────────────── */}
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

//                 {isError && (
//                     <div className="px-6 py-4 bg-red-50 border-b border-red-100">
//                         <p className="text-sm text-red-600">Failed to load inwards. <button onClick={refetch} className="underline cursor-pointer">Retry</button></p>
//                     </div>
//                 )}

//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead>
//                             <tr className="bg-gray-50 border-b border-gray-100">
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Inward #</th>
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendor</th>
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Warehouse</th>
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Expected Date</th>
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Invoice No</th>
//                                 <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
//                                 <th className="text-right px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {isLoading ? (
//                                 Array.from({ length: 6 }).map((_, i) => (
//                                     <tr key={i} className="animate-pulse">
//                                         {Array.from({ length: 7 }).map((__, j) => (
//                                             <td key={j} className="px-5 py-3">
//                                                 <div className="h-3 bg-gray-100 rounded w-3/4" />
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))
//                             ) : inwards.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
//                                         No inwards found{statusFilter ? ` with status "${statusFilter}"` : ""}.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 inwards.map((inward) => (
//                                     <InwardRow
//                                         key={inward.inward_id}
//                                         inward={inward}
//                                         onEdit={() => dispatch(openEditForm(inward))}
//                                         onMarkArrived={() => dispatch(openArrivalModal(inward))}
//                                         onManageItems={() => dispatch(openItemsModal(inward))}
//                                         onMarkMapped={() => dispatch(openStatusModal({ inward, action: "MAPPED" }))}
//                                         onCancel={() => dispatch(openStatusModal({ inward, action: "CANCELLED" }))}
//                                     />
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 {!isLoading && meta.total > 0 && (
//                     <div className="flex items-center text-gray-700 justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
//                         <p className="text-xs text-gray-400">
//                             Showing {startRow}–{endRow} of {meta.total}
//                         </p>
//                         <div className="flex items-center gap-1 text-gray-700">
//                             <button
//                                 onClick={() => dispatch(setCurrentPage(currentPage - 1))}
//                                 disabled={currentPage <= 1}
//                                 className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
//                             >
//                                 ← Prev
//                             </button>
//                             <span className="px-3 py-1.5 text-xs text-gray-600">
//                                 {currentPage} / {meta.totalPages}
//                             </span>
//                             <button
//                                 onClick={() => dispatch(setCurrentPage(currentPage + 1))}
//                                 disabled={currentPage >= meta.totalPages}
//                                 className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
//                             >
//                                 Next →
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* ── Modals ───────────────────────────────────────────────────── */}
//             {showAddForm && (
//                 <InwardAddForm
//                     formData={scheduleForm}
//                     formErrors={scheduleErrors}
//                     onSave={onSave}
//                 />
//             )}
//             {showArrivalModal && selectedInward && (
//                 <InwardArrivalModal
//                     selectedInward={selectedInward}
//                     formData={arrivalForm}
//                     formErrors={arrivalErrors}
//                     onSave={onSave}
//                 />
//             )}
//             {showEditForm && selectedInward && (
//                 <InwardEditForm
//                     selectedInward={selectedInward}
//                     formData={editForm}
//                     formErrors={editErrors}
//                     onSave={onSave}
//                 />
//             )}
//             {showItemsModal && selectedInward && (
//                 <InwardItemsModal
//                     selectedInward={selectedInward}
//                     itemForm={itemForm}
//                     itemErrors={itemErrors}
//                     editingItemId={editingItemId}
//                     onSave={onSave}
//                 />
//             )}
//             {showStatusModal && selectedInward && (
//                 <InwardStatusModal
//                     selectedInward={selectedInward}
//                     statusAction={statusAction}
//                     statusRemarks={statusRemarks}
//                     onSave={onSave}
//                 />
//             )}
//         </div>
//     );
// }

// // ── InwardRow — isolated so re-render is per-row only ─────────────────────────
// function InwardRow({ inward, onEdit, onMarkArrived, onManageItems, onMarkMapped, onCancel }) {
//     const { inward_id, inward_number, vendor, warehouse, expected_date, vendor_invoice_no, status } = inward;

//     const isTerminal = status === "MAPPED" || status === "CANCELLED";

//     return (
//         <tr className="hover:bg-gray-50/60 transition-colors">
//             <td className="px-5 py-3 font-mono text-xs text-gray-700">
//                 {inward_number || inward_id?.slice(-8)}
//             </td>
//             <td className="px-5 py-3 text-gray-700">
//                 {vendor?.company_name || "—"}
//             </td>
//             <td className="px-5 py-3 text-gray-500 text-xs">
//                 {warehouse?.warehouse_name || "—"}
//             </td>
//             <td className="px-5 py-3 text-gray-500 text-xs">
//                 {fmt(expected_date)}
//             </td>
//             <td className="px-5 py-3 font-mono text-xs text-gray-500">
//                 {vendor_invoice_no || "—"}
//             </td>
//             <td className="px-5 py-3">
//                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}>
//                     {status}
//                 </span>
//             </td>
//             <td className="px-5 py-3">
//                 <div className="flex items-center justify-end gap-1.5 flex-wrap">
//                     {isTerminal ? (
//                         // MAPPED or CANCELLED — view only
//                         <button
//                             onClick={onEdit}
//                             className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
//                         >
//                             View
//                         </button>
//                     ) : (
//                         <>
//                             {/* Edit always available for non-terminal */}
//                             <button
//                                 onClick={onEdit}
//                                 className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
//                             >
//                                 Edit
//                             </button>

//                             {/* SCHEDULED → Mark Arrived */}
//                             {status === "SCHEDULED" && (
//                                 <button
//                                     onClick={onMarkArrived}
//                                     className="px-3 py-1.5 text-xs bg-blue-50 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-100 cursor-pointer"
//                                 >
//                                     Mark Arrived
//                                 </button>
//                             )}

//                             {/* ARRIVED → Manage Items + Mark Mapped */}
//                             {status === "ARRIVED" && (
//                                 <>
//                                     <button
//                                         onClick={onManageItems}
//                                         className="px-3 py-1.5 text-xs bg-indigo-50 border border-indigo-300 rounded-lg text-indigo-700 hover:bg-indigo-100 cursor-pointer"
//                                     >
//                                         Items
//                                     </button>
//                                     <button
//                                         onClick={onMarkMapped}
//                                         className="px-3 py-1.5 text-xs bg-green-50 border border-green-300 rounded-lg text-green-700 hover:bg-green-100 cursor-pointer"
//                                     >
//                                         Mark Mapped
//                                     </button>
//                                 </>
//                             )}

//                             {/* Cancel — SCHEDULED or ARRIVED */}
//                             <button
//                                 onClick={onCancel}
//                                 className="px-3 py-1.5 text-xs bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 cursor-pointer"
//                             >
//                                 Cancel
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </td>
//         </tr>
//     );
// }