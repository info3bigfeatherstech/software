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
            <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 mt-3">Loading inward details...</p>
                </div>
    </div>
</div>
        );
    }

    // Error state
    if (isError || !inward) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6">
                    <p className="text-red-600">Failed to load inward details</p>
                    <button onClick={handleClose} className="mt-4 px-4 py-2 border rounded-lg">
                        Close
                    </button>
                </div>
    </div>
</div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
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
</div>
    );
}
