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
        <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5">

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
</div>
    );
}
