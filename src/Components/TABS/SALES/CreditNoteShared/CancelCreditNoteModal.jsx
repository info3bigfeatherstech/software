// TABS/SALES/CreditNoteShared/CancelCreditNoteModal.jsx
//
// Cancel Credit Note Modal (Admin only)

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Ban } from "lucide-react";
import { toast } from "react-toastify";
import { updateCancelForm, setActionErrors } from "../../../../REDUX_FEATURES/REDUX_SLICES/CreditNote_api/creditNoteSlice";

export default function CancelCreditNoteModal({ creditNote, onSuccess, onClose }) {
    const dispatch = useDispatch();
    const { cancelForm, actionErrors } = useSelector((state) => state.creditNote);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!cancelForm.cancel_reason?.trim()) {
            dispatch(setActionErrors({ cancel_reason: "Cancellation reason is required" }));
            toast.error("Please enter a cancellation reason");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSuccess(creditNote.credit_note_id, {
                cancel_reason: cancelForm.cancel_reason,
            });
            onClose();
        } catch (err) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <Ban size={18} className="text-red-600" />
                            Cancel Credit Note
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">{creditNote.credit_note_number || creditNote.credit_note_id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700 font-medium">
                            ⚠️ Warning: This action cannot be undone.
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                            Cancelling will reverse any stock restored and adjust customer spend.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Cancellation Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={cancelForm.cancel_reason}
                            onChange={(e) => dispatch(updateCancelForm({ cancel_reason: e.target.value }))}
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                actionErrors.cancel_reason ? "border-red-400" : "border-gray-300"
                            }`}
                            placeholder="Why is this credit note being cancelled?"
                        />
                        {actionErrors.cancel_reason && (
                            <p className="text-xs text-red-500 mt-1">{actionErrors.cancel_reason}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
                    >
                        {isSubmitting ? "Processing..." : "Confirm Cancel"}
                    </button>
                </div>
            </div>
    </div>
</div>
    );
}