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
    openEditForm,
    openArrivalModal,
    closeArrivalModal,
    openItemsModal,
    closeItemsModal,
    closeAddForm,           // ✅ ADD THIS
    closeStatusModal,       // ✅ ADD THIS
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
        showEditForm,
        showArrivalModal,
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

    // ── Callbacks with AUTO-CLOSE ─────────────────────────────────────────────
    const handleAddSuccess = () => {
        dispatch(closeAddForm());
        refetch();
    };

    const handleEditClose = () => {
        refetch();
    };

    const handleArrivalSuccess = () => {
        dispatch(closeArrivalModal());
        refetch();
    };

    const handleItemsClose = () => {
        dispatch(closeItemsModal());
        refetch();
    };

    const handleStatusSuccess = () => {
        dispatch(closeStatusModal());  // ✅ Now imported
        refetch();
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
                <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
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

            {/* Edit Form Modal */}
            {showEditForm && selectedInward && (
                <InwardEditForm
                    selectedInward={selectedInward}
                    formData={editForm}
                    formErrors={editErrors}
                    onSave={handleEditClose}
                />
            )}

            {/* Arrival Modal */}
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
// // Main inward management tab.
// // Status pills: All | SCHEDULED | ARRIVED | MAPPED | CANCELLED
// // Row actions by status:
// //   SCHEDULED → "Edit" (opens InwardEditForm)
// //   ARRIVED   → "Edit" (opens InwardEditForm) + "Manage Items" (opens InwardItemsModal)
// //   MAPPED    → read only
// //   CANCELLED → read only

// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { X } from "lucide-react";
// import { useGetInwardsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import {
//     openAddForm,
//     openEditForm,           // FIXED: import openEditForm (not openArrivalModal)
//     openArrivalModal,
//     closeArrivalModal,
//     openItemsModal,
//     closeItemsModal,
//     setSearch,
//     setStatusFilter,
//     setCurrentPage,
//     setPageSize,
//     resetFilters,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import InwardAddForm from "./InwardShared/InwardAddForm";
// import InwardEditForm from "./InwardShared/InwardEditForm";
// import InwardArrivalModal from "./InwardShared/InwardArrivalModal";
// import InwardItemsModal from "./InwardShared/InwardItemsModal";
// import InwardStatusModal from "./InwardShared/InwardStatusModal";

// const STATUS_BADGE = {
//     SCHEDULED: "bg-yellow-100 text-yellow-700",
//     ARRIVED: "bg-blue-100 text-blue-700",
//     MAPPED: "bg-green-100 text-green-700",
//     CANCELLED: "bg-gray-100 text-gray-500",
// };

// const STATUS_PILLS = ["", "SCHEDULED", "ARRIVED", "MAPPED", "CANCELLED"];
// const PILL_LABEL = { "": "All", SCHEDULED: "Scheduled", ARRIVED: "Arrived", MAPPED: "Mapped", CANCELLED: "Cancelled" };

// const fmtDate = (iso) =>
//     iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// export default function InwardTab() {
//     const dispatch = useDispatch();

//     // ── Redux state ───────────────────────────────────────────────────────────
//     const {
//         showAddForm,
//         showEditForm,          // FIXED: new flag for edit form
//         showArrivalModal,      // FIXED: now ONLY for arrival modal
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
//     } = useSelector((state) => state.inward);

//     const { user } = useSelector((state) => state.auth);

//     // ── RTK Query ─────────────────────────────────────────────────────────────
//     const { data: inwardData, isLoading, isFetching, error, refetch } = useGetInwardsQuery({
//         page: currentPage,
//         limit: pageSize,
//         search,
//         status: statusFilter,
//         warehouse_id: ["WH_MANAGER", "WH_STOCK_LISTER"].includes(user?.role) ? user?.warehouse_id : "",
//     });

//     const inwards = inwardData?.inwards || [];
//     const meta = inwardData?.meta;
//     const totalPages = meta?.totalPages || 1;
//     const totalItems = meta?.total || 0;

//     // ── Callbacks ─────────────────────────────────────────────────────────────
//     // const handleAddSuccess = () => { refetch(); };
//     // const handleEditClose = () => { refetch(); };   // edit form closes itself
//     // const handleArrivalSuccess = () => { refetch(); };
//     // const handleItemsClose = () => { refetch(); };
//     // const handleStatusSuccess = () => { refetch(); };
//     // ── Callbacks with AUTO-CLOSE ─────────────────────────────────────────────
//     const handleAddSuccess = () => {
//         dispatch(closeAddForm());      // Close add modal
//         refetch();                      // Refresh table
//     };

//     const handleEditClose = () => {
//         // Edit form already closes itself via closeEditForm() inside the modal
//         refetch();
//     };

//     const handleArrivalSuccess = () => {
//         dispatch(closeArrivalModal());  // Close arrival modal
//         refetch();                      // Refresh table
//     };

//     const handleItemsClose = () => {
//         dispatch(closeItemsModal());    // Close items modal
//         refetch();                      // Refresh table
//     };

//     const handleStatusSuccess = () => {
//         dispatch(closeStatusModal());   // Close status modal
//         refetch();                      // Refresh table
//     };
//     return (
//         <div className="space-y-5">

//             {/* Header */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-base font-semibold text-gray-800">Inward Receipts</h2>
//                     <p className="text-xs text-gray-400 mt-0.5">Schedule, receive, and map incoming stock from vendors</p>
//                 </div>
//                 <button
//                     onClick={() => dispatch(openAddForm())}
//                     className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
//                 >
//                     + Schedule Inward
//                 </button>
//             </div>

//             {/* Status Pills */}
//             <div className="flex items-center gap-2 flex-wrap">
//                 {STATUS_PILLS.map((s) => (
//                     <button
//                         key={s}
//                         onClick={() => dispatch(setStatusFilter(s))}
//                         className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${statusFilter === s
//                             ? "bg-blue-600 text-white border-blue-600"
//                             : "bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600"
//                             }`}
//                     >
//                         {PILL_LABEL[s]}
//                     </button>
//                 ))}
//             </div>

//             {/* Search & Filters */}
//             <div className="flex gap-3">
//                 <input
//                     value={search}
//                     onChange={(e) => dispatch(setSearch(e.target.value))}
//                     placeholder="Search by inward number, invoice, challan…"
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
//                 />
//                 <button
//                     onClick={() => dispatch(resetFilters())}
//                     className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
//                 >
//                     <X size={14} /> Clear
//                 </button>
//                 <select
//                     value={pageSize}
//                     onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
//                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
//                 >
//                     {[10, 20, 50].map((s) => <option key={s} value={s}>{s} per page</option>)}
//                 </select>
//             </div>

//             {/* Error Display */}
//             {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <p className="text-red-600 text-sm">Error loading inwards: {error.data?.message || "Please try again"}</p>
//                 </div>
//             )}

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             {["Inward #", "Vendor", "Warehouse", "Expected", "Arrived", "Invoice / Challan", "Status", "Actions"].map((h) => (
//                                 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                                     {h}
//                                 </th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                         {(isLoading || isFetching) && (
//                             <tr>
//                                 <td colSpan={8} className="px-4 py-10 text-center">
//                                     <div className="flex justify-center">
//                                         <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}
//                         {!isLoading && !isFetching && inwards.length === 0 && (
//                             <tr>
//                                 <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
//                                     No inwards found
//                                 </td>
//                             </tr>
//                         )}
//                         {!isLoading && inwards.map((inward) => (
//                             <tr key={inward.inward_id} className="hover:bg-gray-50 transition-colors">
//                                 <td className="px-4 py-3">
//                                     <p className="font-mono text-xs font-semibold text-gray-800">{inward.inward_number}</p>
//                                     <p className="text-xs text-gray-400 mt-0.5">{fmtDate(inward.created_at)}</p>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <p className="text-sm text-gray-700 font-medium">{inward.vendor?.company_name || "—"}</p>
//                                     {inward.vendor?.city && <p className="text-xs text-gray-400">{inward.vendor.city}</p>}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <p className="text-sm text-gray-700">{inward.warehouse?.warehouse_name || "—"}</p>
//                                     {inward.warehouse?.city && <p className="text-xs text-gray-400">{inward.warehouse.city}</p>}
//                                 </td>
//                                 <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(inward.expected_date)}</td>
//                                 <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(inward.arrived_at)}</td>
//                                 <td className="px-4 py-3">
//                                     {inward.vendor_invoice_no ? (
//                                         <div>
//                                             <p className="text-xs font-mono text-gray-700">{inward.vendor_invoice_no}</p>
//                                             <p className="text-xs font-mono text-gray-400 mt-0.5">{inward.challan_no || "—"}</p>
//                                         </div>
//                                     ) : (
//                                         <span className="text-xs text-gray-400">—</span>
//                                     )}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[inward.status] || "bg-gray-100 text-gray-500"}`}>
//                                         {inward.status}
//                                     </span>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                     <div className="flex flex-col gap-1.5">
//                                         {/* Edit button - SCHEDULED or ARRIVED */}
//                                         {(inward.status === "SCHEDULED" || inward.status === "ARRIVED") && (
//                                             <button onClick={() => dispatch(openEditForm(inward))} className="text-xs font-medium text-blue-600 hover:text-blue-800 text-left">
//                                                 Edit
//                                             </button>
//                                         )}

//                                         {/* Mark Arrived button - SCHEDULED only */}
//                                         {inward.status === "SCHEDULED" && (
//                                             <button
//                                                 onClick={() => dispatch(openArrivalModal(inward))}
//                                                 className="text-xs font-medium text-green-600 hover:text-green-800 text-left"
//                                             >
//                                                 Mark Arrived
//                                             </button>
//                                         )}

//                                         {/* Manage Items button - ARRIVED only */}
//                                         {inward.status === "ARRIVED" && (
//                                             <button onClick={() => dispatch(openItemsModal(inward))} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 text-left">
//                                                 Manage Items
//                                             </button>
//                                         )}

//                                         {/* MAPPED/CANCELLED - no actions */}
//                                         {(inward.status === "MAPPED" || inward.status === "CANCELLED") && (
//                                             <span className="text-xs text-gray-400">—</span>
//                                         )}
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//                 <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
//                     <p className="text-sm text-gray-500">
//                         Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
//                     </p>
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => dispatch(setCurrentPage(currentPage - 1))}
//                             disabled={currentPage === 1}
//                             className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
//                         >
//                             Previous
//                         </button>
//                         <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {totalPages}</span>
//                         <button
//                             onClick={() => dispatch(setCurrentPage(currentPage + 1))}
//                             disabled={currentPage === totalPages}
//                             className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
//                         >
//                             Next
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* ── MODALS ───────────────────────────────────────────────────────────── */}

//             {/* Add Form Modal */}
//             {showAddForm && (
//                 <InwardAddForm
//                     formData={scheduleForm}
//                     formErrors={scheduleErrors}
//                     onSave={handleAddSuccess}
//                 />
//             )}

//             {/* FIXED: Edit Form Modal (READ-ONLY detail view) - uses showEditForm flag */}
//             {showEditForm && selectedInward && (
//                 <InwardEditForm
//                     selectedInward={selectedInward}
//                     formData={editForm}
//                     formErrors={editErrors}
//                     onSave={handleEditClose}
//                 />
//             )}

//             {/* FIXED: Arrival Modal - uses showArrivalModal flag (separate from edit form) */}
//             {showArrivalModal && selectedInward && (
//                 <InwardArrivalModal
//                     selectedInward={selectedInward}
//                     formData={arrivalForm}
//                     formErrors={arrivalErrors}
//                     onSave={handleArrivalSuccess}
//                 />
//             )}

//             {/* Items Modal */}
//             {showItemsModal && selectedInward && (
//                 <InwardItemsModal
//                     selectedInward={selectedInward}
//                     itemForm={itemForm}
//                     itemErrors={itemErrors}
//                     editingItemId={editingItemId}
//                     onClose={handleItemsClose}
//                 />
//             )}

//             {/* Status Modal */}
//             {showStatusModal && selectedInward && (
//                 <InwardStatusModal
//                     selectedInward={selectedInward}
//                     statusAction={statusAction}
//                     statusRemarks={statusRemarks}
//                     onSave={handleStatusSuccess}
//                 />
//             )}

//         </div>
//     );
// }
