// TABS/WAREHOUSES/INWARDS/InwardShared/InwardEditForm.jsx
//
// Responsibility: READ-ONLY detail view modal
// FIXED: Fetches full inward details via useGetInwardByIdQuery

import React from "react";
import { useDispatch } from "react-redux";
import {
    closeEditForm,
    openArrivalModal,
    openStatusModal,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
import { useGetInwardByIdQuery } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const STATUS_BADGE = {
    SCHEDULED: "bg-yellow-100 text-yellow-700",
    ARRIVED: "bg-blue-100 text-blue-700",
    MAPPED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-600",
};

const ReadField = ({ label, value }) => (
    <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[36px]">
            {value || <span className="text-gray-400">—</span>}
        </p>
    </div>
);

export default function InwardEditForm({ selectedInward, onSave }) {
    const dispatch = useDispatch();

    // ── FETCH FULL DETAILS ───────────────────────────────────────────────────
    const {
        data: inwardDetail,
        isLoading,
        isError,
    } = useGetInwardByIdQuery(selectedInward?.inward_id, {
        skip: !selectedInward?.inward_id,
    });

    // Use detailed data if available, fallback to passed selectedInward
    const inward = inwardDetail || selectedInward;
    const status = inward?.status?.toUpperCase?.() ?? inward?.status;
    const isTerminal = status === "MAPPED" || status === "CANCELLED";
    const isArrived = status === "ARRIVED";
    const isScheduled = status === "SCHEDULED";

    const handleOpenArrivalModal = () => {
        dispatch(closeEditForm());
        dispatch(openArrivalModal(inward));
    };

    const handleOpenStatusModal = (action) => {
        dispatch(closeEditForm());
        dispatch(openStatusModal({ inward, action }));
    };

    const handleClose = () => {
        dispatch(closeEditForm());
        if (onSave) onSave();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 mt-3">Loading inward details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !inward) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6">
                    <p className="text-red-600">Failed to load inward details</p>
                    <button onClick={handleClose} className="mt-4 px-4 py-2 border rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 space-y-5">

                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-800">
                                    {isTerminal ? "View Inward" : "Inward Details"}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}>
                                    {status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                {inward?.inward_number || inward?.inward_id}
                            </p>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer">
                            ✕
                        </button>
                    </div>

                    {/* Section 1: Core Info */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Schedule Details
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <ReadField label="Vendor" value={inward?.vendor?.company_name} />
                            <ReadField label="Warehouse" value={inward?.warehouse?.warehouse_name} />
                            <ReadField label="Expected Arrival Date" value={fmt(inward?.expected_date)} />
                            <ReadField label="Remarks" value={inward?.remarks} />
                        </div>
                    </div>

                    {/* Section 2: Arrival Details - NOW WORKS because inward has full data */}
                    {(isArrived || isTerminal) && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Arrival Details
                                </p>
                                {isArrived && (
                                    <button
                                        onClick={handleOpenArrivalModal}
                                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                                    >
                                        Edit arrival details →
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ReadField label="Vendor Invoice No" value={inward?.vendor_invoice_no} />
                                <ReadField label="Challan No" value={inward?.challan_no} />
                                <div className="col-span-2">
                                    <ReadField label="Transport Details" value={inward?.transport_details} />
                                </div>
                                <ReadField label="Arrived At" value={fmt(inward?.arrived_at)} />
                            </div>
                        </div>
                    )}

                    {/* Section 3: Items summary - NOW WORKS */}
                    {(isArrived || isTerminal) && inward?.items?.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Items ({inward.items.length})
                            </p>
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-4 py-2 font-medium text-gray-500">Item</th>
                                            <th className="text-left px-4 py-2 font-medium text-gray-500">Variant</th>
                                            <th className="text-right px-4 py-2 font-medium text-gray-500">Qty</th>
                                            <th className="text-right px-4 py-2 font-medium text-gray-500">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {inward.items.map((item) => (
                                            <tr key={item.inward_item_id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-2 text-gray-700">{item.item_name}</td>
                                                <td className="px-4 py-2 text-gray-500">{item.variant_text || "—"}</td>
                                                <td className="px-4 py-2 text-right text-gray-700">{item.quantity_received}</td>
                                                <td className="px-4 py-2 text-right text-gray-700">₹{item.purchase_cost}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {(isArrived || isTerminal) && (!inward?.items || inward.items.length === 0) && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                            <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                                No items added yet
                            </div>
                        </div>
                    )}

                    {/* Section 4: Status Actions */}
                    {!isTerminal && (
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Change Status
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                                {isArrived && (
                                    <button
                                        onClick={() => handleOpenStatusModal("MAPPED")}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer"
                                    >
                                        Mark as Mapped
                                    </button>
                                )}
                                <button
                                    onClick={() => handleOpenStatusModal("CANCELLED")}
                                    className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 cursor-pointer"
                                >
                                    Cancel Inward
                                </button>
                            </div>
                            {isScheduled && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Mark as Mapped is available only after the inward is Arrived and all items are added.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                        <button onClick={handleClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardEditForm.jsx
// //
// // Responsibility:
// //   - SCHEDULED  → edit expected_date + remarks
// //   - ARRIVED    → edit expected_date + remarks + shows arrival details as read-only
// //   - MAPPED / CANCELLED → fully read-only view of all details
// //   - Status section at bottom: "Mark Mapped" or "Cancel" buttons
// //     that dispatch openStatusModal — NOT a separate file.
// //
// // Uses: editForm / editErrors from inwardSlice via props.
// // Calls: PUT /inwards/:id  (updateInward) — defined in inwardApi.

// import React from "react";
// import { useDispatch } from "react-redux";
// import {
//     closeEditForm,
//     updateEditForm,
//     setEditErrors,
//     clearEditErrors,
//     setSubmitting,
//     openStatusModal,
//     openArrivalModal,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import { useUpdateInwardMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const fmt = (iso) => {
//     if (!iso) return "—";
//     return new Date(iso).toLocaleString("en-IN", {
//         day: "2-digit", month: "short", year: "numeric",
//         hour: "2-digit", minute: "2-digit",
//     });
// };

// const toLocalDatetime = (iso) => {
//     if (!iso) return "";
//     const d = new Date(iso);
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// };

// const STATUS_BADGE = {
//     SCHEDULED: "bg-yellow-100 text-yellow-700",
//     ARRIVED: "bg-blue-100 text-blue-700",
//     MAPPED: "bg-green-100 text-green-700",
//     CANCELLED: "bg-red-100 text-red-600",
// };

// // ── Component ─────────────────────────────────────────────────────────────────
// export default function InwardEditForm({ selectedInward, formData, formErrors, onSave }) {
//     const dispatch = useDispatch();
//     const [updateInward, { isLoading }] = useUpdateInwardMutation();

//     const status = selectedInward?.status || "";
//     const isTerminal = status === "MAPPED" || status === "CANCELLED";
//     const isScheduled = status === "SCHEDULED";
//     const isArrived = status === "ARRIVED";

//     // ── Input styles ──────────────────────────────────────────────────────────
//     const inputCls = (name) =>
//         `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors?.[name] ? "border-red-400" : "border-gray-300"
//         }`;

//     const errorMsg = (name) =>
//         formErrors?.[name] ? (
//             <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>
//         ) : null;

//     // ── Read-only field helper ─────────────────────────────────────────────────
//     const ReadField = ({ label, value }) => (
//         <div>
//             <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
//             <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[36px]">
//                 {value || <span className="text-gray-400">—</span>}
//             </p>
//         </div>
//     );

//     // ── Validate ──────────────────────────────────────────────────────────────
//     const validate = () => {
//         const errors = {};
//         // No required fields for edit — both expected_date and remarks are optional
//         return errors;
//     };

//     // ── Submit — only for non-terminal ────────────────────────────────────────
//     const handleSave = async () => {
//         if (isTerminal) return;
//         dispatch(clearEditErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setEditErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {};
//             if (formData.expected_date) {
//                 payload.expected_date = new Date(formData.expected_date).toISOString();
//             }
//             if (formData.remarks !== undefined) {
//                 payload.remarks = formData.remarks;
//             }

//             await updateInward({ inwardId: selectedInward.inward_id, ...payload }).unwrap();
//             dispatch(closeEditForm());
//             onSave();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setEditErrors(be));
//             } else {
//                 dispatch(setEditErrors({
//                     general: err?.data?.message || "Failed to update inward",
//                 }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
//                 <div className="p-6 space-y-5">

//                     {/* ── Header ──────────────────────────────────────────── */}
//                     <div className="flex items-start justify-between">
//                         <div>
//                             <div className="flex items-center gap-2">
//                                 <h3 className="text-base font-semibold text-gray-800">
//                                     {isTerminal ? "View Inward" : "Edit Inward"}
//                                 </h3>
//                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}>
//                                     {status}
//                                 </span>
//                             </div>
//                             <p className="text-xs text-gray-400 mt-0.5 font-mono">
//                                 {selectedInward?.inward_number || selectedInward?.inward_id}
//                             </p>
//                         </div>
//                         <button
//                             onClick={() => dispatch(closeEditForm())}
//                             className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
//                         >
//                             ✕
//                         </button>
//                     </div>

//                     {/* ── General error ────────────────────────────────────── */}
//                     {formErrors?.general && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                             <p className="text-sm text-red-600">{formErrors.general}</p>
//                         </div>
//                     )}

//                     {/* ── Section 1: Core Info (always visible) ────────────── */}
//                     <div>
//                         <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                             Schedule Details
//                         </p>
//                         <div className="grid grid-cols-2 gap-4">
//                             <ReadField
//                                 label="Vendor"
//                                 value={selectedInward?.vendor?.company_name}
//                             />
//                             <ReadField
//                                 label="Warehouse"
//                                 value={selectedInward?.warehouse?.warehouse_name}
//                             />

//                             {/* Expected date — editable if not terminal */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Expected Arrival Date
//                                 </label>
//                                 {isTerminal ? (
//                                     <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
//                                         {fmt(selectedInward?.expected_date)}
//                                     </p>
//                                 ) : (
//                                     <>
//                                         <input
//                                             type="datetime-local"
//                                             value={formData?.expected_date || toLocalDatetime(selectedInward?.expected_date)}
//                                             onChange={(e) =>
//                                                 dispatch(updateEditForm({ expected_date: e.target.value }))
//                                             }
//                                             className={inputCls("expected_date")}
//                                         />
//                                         {errorMsg("expected_date")}
//                                     </>
//                                 )}
//                             </div>

//                             {/* Remarks — editable if not terminal */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Remarks
//                                 </label>
//                                 {isTerminal ? (
//                                     <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-h-[36px]">
//                                         {selectedInward?.remarks || <span className="text-gray-400">—</span>}
//                                     </p>
//                                 ) : (
//                                     <>
//                                         <input
//                                             value={formData?.remarks ?? selectedInward?.remarks ?? ""}
//                                             onChange={(e) =>
//                                                 dispatch(updateEditForm({ remarks: e.target.value }))
//                                             }
//                                             placeholder="Optional notes"
//                                             className={inputCls("remarks")}
//                                         />
//                                         {errorMsg("remarks")}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* ── Section 2: Arrival Details (ARRIVED / MAPPED / CANCELLED) ── */}
//                     {(isArrived || isTerminal) && (
//                         <div>
//                             <div className="flex items-center justify-between mb-3">
//                                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                                     Arrival Details
//                                 </p>
//                                 {/* Only ARRIVED can re-edit arrival details */}
//                                 {isArrived && (
//                                     <button
//                                         onClick={() => {
//                                             dispatch(closeEditForm());
//                                             dispatch(openArrivalModal(selectedInward));
//                                         }}
//                                         className="text-xs text-blue-600 hover:underline cursor-pointer"
//                                     >
//                                         Edit arrival details →
//                                     </button>
//                                 )}
//                             </div>
//                             <div className="grid grid-cols-2 gap-4">
//                                 <ReadField
//                                     label="Vendor Invoice No"
//                                     value={selectedInward?.vendor_invoice_no}
//                                 />
//                                 <ReadField
//                                     label="Challan No"
//                                     value={selectedInward?.challan_no}
//                                 />
//                                 <div className="col-span-2">
//                                     <ReadField
//                                         label="Transport Details"
//                                         value={selectedInward?.transport_details}
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* ── Section 3: Items summary (ARRIVED / MAPPED / CANCELLED) ── */}
//                     {(isArrived || isTerminal) && selectedInward?.items?.length > 0 && (
//                         <div>
//                             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                                 Items ({selectedInward.items.length})
//                             </p>
//                             <div className="border border-gray-100 rounded-xl overflow-hidden">
//                                 <table className="w-full text-xs">
//                                     <thead>
//                                         <tr className="bg-gray-50 border-b border-gray-100">
//                                             <th className="text-left px-4 py-2 font-medium text-gray-500">Item</th>
//                                             <th className="text-left px-4 py-2 font-medium text-gray-500">Variant</th>
//                                             <th className="text-right px-4 py-2 font-medium text-gray-500">Qty</th>
//                                             <th className="text-right px-4 py-2 font-medium text-gray-500">Cost</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-50">
//                                         {selectedInward.items.map((item) => (
//                                             <tr key={item.inward_item_id} className="hover:bg-gray-50/50">
//                                                 <td className="px-4 py-2 text-gray-700">{item.item_name}</td>
//                                                 <td className="px-4 py-2 text-gray-500">{item.variant_text || "—"}</td>
//                                                 <td className="px-4 py-2 text-right text-gray-700">{item.quantity_received}</td>
//                                                 <td className="px-4 py-2 text-right text-gray-700">₹{item.purchase_cost}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     )}

//                     {/* ── Section 4: Status Actions (non-terminal only) ─────── */}
//                     {!isTerminal && (
//                         <div className="border-t border-gray-100 pt-4">
//                             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                                 Change Status
//                             </p>
//                             <div className="flex items-center gap-3 flex-wrap">
//                                 {isArrived && (
//                                     <button
//                                         onClick={() => {
//                                             dispatch(closeEditForm());
//                                             dispatch(openStatusModal({ inward: selectedInward, action: "MAPPED" }));
//                                         }}
//                                         className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer"
//                                     >
//                                         Mark as Mapped
//                                     </button>
//                                 )}
//                                 <button
//                                     onClick={() => {
//                                         dispatch(closeEditForm());
//                                         dispatch(openStatusModal({ inward: selectedInward, action: "CANCELLED" }));
//                                     }}
//                                     className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 cursor-pointer"
//                                 >
//                                     Cancel Inward
//                                 </button>
//                             </div>
//                             {isScheduled && (
//                                 <p className="text-xs text-gray-400 mt-2">
//                                     Mark as Mapped is available only after the inward is Arrived and items are added.
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     {/* ── Footer actions ───────────────────────────────────── */}
//                     <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//                         <button
//                             onClick={() => dispatch(closeEditForm())}
//                             className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                         >
//                             {isTerminal ? "Close" : "Cancel"}
//                         </button>
//                         {!isTerminal && (
//                             <button
//                                 onClick={handleSave}
//                                 disabled={isLoading}
//                                 className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//                             >
//                                 {isLoading ? "Saving…" : "Save Changes"}
//                             </button>
//                         )}
//                     </div>

//                 </div>
//             </div>
//         </div>
//     );
// }