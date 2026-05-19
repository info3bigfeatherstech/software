// TABS/WAREHOUSES/INWARDS/InwardShared/InwardStatusModal.jsx
//
// Responsibility: PATCH /inwards/:inwardId/status
// Used for two actions only: MAPPED and CANCELLED.
// ARRIVED is handled separately via InwardArrivalModal.
// Backend returns 409 if any item has mapped_product_id = null when marking MAPPED.

import React from "react";
import { useDispatch } from "react-redux";
import { usePatchInwardStatusMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
import {
    closeStatusModal,
    setStatusRemarks,
    setSubmitting,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";

const STATUS_CONFIG = {
    MAPPED: {
        label: "Mark as Mapped",
        description: "All items have been mapped to products. This finalises the inward.",
        buttonLabel: "Confirm Mapped",
        buttonCls: "bg-blue-600 hover:bg-blue-700",
        warning: "Backend will reject this if any item still has no mapped product.",
    },
    CANCELLED: {
        label: "Cancel Inward",
        description: "This inward will be marked as cancelled. This action cannot be undone.",
        buttonLabel: "Confirm Cancel",
        buttonCls: "bg-red-600 hover:bg-red-700",
        warning: null,
    },
};

export default function InwardStatusModal({
    selectedInward,
    statusAction,
    statusRemarks,
    onSave,
}) {
    const dispatch = useDispatch();
    const [patchStatus, { isLoading, error }] = usePatchInwardStatusMutation();

    const config = STATUS_CONFIG[statusAction];

    const handleConfirm = async () => {
        dispatch(setSubmitting(true));
        try {
            await patchStatus({
                inwardId: selectedInward.inward_id,
                status: statusAction,
                remarks: statusRemarks?.trim() || undefined,
            }).unwrap();
            onSave();
        } catch (err) {
            // 409 INWARD_ITEMS_UNMAPPED is shown inline — no alert, stays open
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    if (!config) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">{config.label}</h3>
                    <button
                        onClick={() => dispatch(closeStatusModal())}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Inward info */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                    <p className="font-medium text-gray-700">{selectedInward?.inward_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{config.description}</p>
                </div>

                {/* Warning note */}
                {config.warning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <p className="text-xs text-yellow-700">{config.warning}</p>
                    </div>
                )}

                {/* Backend error (e.g. 409 unmapped items) */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        <p className="text-sm text-red-600 font-medium">
                            {error.data?.message || "Action failed"}
                        </p>
                        {error.status === 409 && (
                            <p className="text-xs text-red-500 mt-1">
                                Go back and map all items to products before marking as Mapped.
                            </p>
                        )}
                    </div>
                )}

                {/* Remarks */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 text-gray-700">
                        Remarks {statusAction === "CANCELLED" && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                        value={statusRemarks}
                        onChange={(e) => dispatch(setStatusRemarks(e.target.value))}
                        placeholder={
                            statusAction === "MAPPED"
                                ? "e.g. All lines mapped to products"
                                : "Reason for cancellation"
                        }
                        rows={2}
                        className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => dispatch(closeStatusModal())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`px-5 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-60 cursor-pointer ${config.buttonCls}`}
                    >
                        {isLoading ? "Processing…" : config.buttonLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}

// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardStatusModal.jsx
// //
// // Responsibility:
// //   - Confirmation modal for PATCH /inwards/:id/status
// //   - Handles both MAPPED and CANCELLED actions
// //   - statusAction ('MAPPED' | 'CANCELLED') comes from inwardSlice
// //   - Shows 409 INWARD_ITEMS_UNMAPPED error clearly

// import React from "react";
// import { useDispatch } from "react-redux";
// import {
//     closeStatusModal,
//     setStatusRemarks,
//     setSubmitting,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import { usePatchInwardStatusMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import { useState } from "react";

// // ── Config per action ─────────────────────────────────────────────────────────
// const ACTION_CONFIG = {
//     MAPPED: {
//         title: "Mark as Mapped",
//         description: "All items will be marked as mapped to products. This cannot be undone.",
//         confirmLabel: "Confirm Mapped",
//         confirmCls: "bg-green-600 hover:bg-green-700 text-white",
//         iconBg: "bg-green-50 text-green-600",
//         icon: "✓",
//         warningNote: "Make sure all items have been mapped to products before confirming. If any item is unmapped the server will reject this action.",
//     },
//     CANCELLED: {
//         title: "Cancel Inward",
//         description: "This inward will be cancelled and no further changes will be allowed.",
//         confirmLabel: "Confirm Cancellation",
//         confirmCls: "bg-red-600 hover:bg-red-700 text-white",
//         iconBg: "bg-red-50 text-red-600",
//         icon: "✕",
//         warningNote: "Cancelling an inward is irreversible. All items data will be retained for records.",
//     },
// };

// export default function InwardStatusModal({
//     selectedInward,
//     statusAction,
//     statusRemarks,
//     onSave,
// }) {
//     const dispatch = useDispatch();
//     const [patchStatus, { isLoading }] = usePatchInwardStatusMutation();
//     const [serverError, setServerError] = useState("");

//     const config = ACTION_CONFIG[statusAction] || ACTION_CONFIG.CANCELLED;

//     // ── Submit ────────────────────────────────────────────────────────────────
//     const handleConfirm = async () => {
//         setServerError("");
//         dispatch(setSubmitting(true));
//         try {
//             await patchStatus({
//                 inwardId: selectedInward.inward_id,
//                 status: statusAction,
//                 remarks: statusRemarks || undefined,
//             }).unwrap();
//             dispatch(closeStatusModal());
//             onSave();
//         } catch (err) {
//             // 409 INWARD_ITEMS_UNMAPPED — surface clearly
//             if (err?.status === 409 || err?.data?.code === "INWARD_ITEMS_UNMAPPED") {
//                 setServerError(
//                     "Some items have not been mapped to products yet. Please map all items before marking as Mapped."
//                 );
//             } else {
//                 setServerError(
//                     err?.data?.message || `Failed to update status to ${statusAction}`
//                 );
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">

//                 {/* ── Header with icon ─────────────────────────────────────── */}
//                 <div className="flex items-start gap-4">
//                     <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${config.iconBg}`}>
//                         {config.icon}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                         <h3 className="text-base font-semibold text-gray-800">{config.title}</h3>
//                         <p className="text-xs text-gray-500 mt-0.5 font-mono">
//                             {selectedInward?.inward_number || selectedInward?.inward_id}
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => dispatch(closeStatusModal())}
//                         className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer flex-shrink-0"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* ── Description ──────────────────────────────────────────── */}
//                 <p className="text-sm text-gray-600">{config.description}</p>

//                 {/* ── Warning note ─────────────────────────────────────────── */}
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
//                     <p className="text-xs text-amber-700">{config.warningNote}</p>
//                 </div>

//                 {/* ── Server error (e.g. 409 unmapped) ────────────────────── */}
//                 {serverError && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
//                         <p className="text-sm text-red-600">{serverError}</p>
//                     </div>
//                 )}

//                 {/* ── Remarks ──────────────────────────────────────────────── */}
//                 <div>
//                     <label className="block text-xs font-medium text-gray-600 mb-1">
//                         Remarks <span className="text-gray-400">(optional)</span>
//                     </label>
//                     <textarea
//                         value={statusRemarks}
//                         onChange={(e) => dispatch(setStatusRemarks(e.target.value))}
//                         placeholder={
//                             statusAction === "MAPPED"
//                                 ? "e.g. All lines mapped to products"
//                                 : "e.g. Vendor did not deliver"
//                         }
//                         rows={2}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//                     />
//                 </div>

//                 {/* ── Actions ──────────────────────────────────────────────── */}
//                 <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
//                     <button
//                         onClick={() => dispatch(closeStatusModal())}
//                         className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                     >
//                         Go Back
//                     </button>
//                     <button
//                         onClick={handleConfirm}
//                         disabled={isLoading}
//                         className={`px-5 py-2 text-sm font-medium rounded-lg disabled:opacity-60 cursor-pointer ${config.confirmCls}`}
//                     >
//                         {isLoading ? "Processing…" : config.confirmLabel}
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// }