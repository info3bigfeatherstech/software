// TABS/SALES/CreditNoteShared/RefundCreditNoteModal.jsx
//
// Refund Credit Note Modal (Cash/UPI/Card)
// FIXED: Changed `remaining_amount` to `balance` to match backend API

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Receipt } from "lucide-react";
import { toast } from "../../../shared/ToastConfig";
import { updateRefundForm, setActionErrors } from "../../../../REDUX_FEATURES/REDUX_SLICES/CreditNote_api/creditNoteSlice";

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export default function RefundCreditNoteModal({ creditNote, onSuccess, onClose }) {
    const dispatch = useDispatch();
    const { refundForm, actionErrors } = useSelector((state) => state.creditNote);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FIXED: Changed `remaining_amount` to `balance` to match backend API
    const remainingAmount = toNumber(creditNote.balance || creditNote.credit_amount || creditNote.amount);

    const handleSubmit = async () => {
        const amount = toNumber(refundForm.refund_amount);
        
        if (!refundForm.refund_amount || amount <= 0) {
            dispatch(setActionErrors({ refund_amount: "Valid amount is required" }));
            toast.error("Please enter a valid amount");
            return;
        }
        if (amount > remainingAmount) {
            dispatch(setActionErrors({ refund_amount: `Cannot refund more than ₹${remainingAmount.toFixed(2)}` }));
            toast.error(`Maximum refundable amount is ₹${remainingAmount.toFixed(2)}`);
            return;
        }
        if (!refundForm.refund_method) {
            dispatch(setActionErrors({ refund_method: "Refund method is required" }));
            toast.error("Please select a refund method");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSuccess(creditNote.credit_note_id, {
                refund_amount: amount,
                refund_method: refundForm.refund_method,
                reference_no: refundForm.reference_no || undefined,
            });
            onClose();
        } catch (err) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <Receipt size={18} className="text-purple-600" />
                            Refund Credit Note
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">{creditNote.credit_note_number || creditNote.credit_note_id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Available Balance:</span>
                            <span className="font-bold text-purple-600">₹{remainingAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-gray-500">Total Amount:</span>
                            <span className="text-gray-700">₹{toNumber(creditNote.credit_amount || creditNote.amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Refund Amount <span className="text-red-500">*</span></label>
                        <input type="number" step="0.01" min="1" max={remainingAmount} value={refundForm.refund_amount} onChange={(e) => dispatch(updateRefundForm({ refund_amount: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${actionErrors.refund_amount ? "border-red-400" : "border-gray-300"}`} placeholder={`Max ₹${remainingAmount.toFixed(2)}`} />
                        {actionErrors.refund_amount && <p className="text-xs text-red-500 mt-1">{actionErrors.refund_amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Refund Method <span className="text-red-500">*</span></label>
                        <select value={refundForm.refund_method} onChange={(e) => dispatch(updateRefundForm({ refund_method: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="CASH">💵 Cash</option>
                            <option value="UPI">📱 UPI</option>
                            <option value="CARD">💳 Card</option>
                        </select>
                        {actionErrors.refund_method && <p className="text-xs text-red-500 mt-1">{actionErrors.refund_method}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Reference Number (Optional)</label>
                        <input type="text" value={refundForm.reference_no} onChange={(e) => dispatch(updateRefundForm({ reference_no: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., UTR number, Cash voucher ID" />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><p className="text-xs text-amber-700">⚠️ Refunded credit notes cannot be redeemed later.</p></div>
                </div>

                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-60">{isSubmitting ? "Processing..." : "Confirm Refund"}</button>
                </div>
            </div>
    </div>
</div>
    );
}