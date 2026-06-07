// TABS/SALES/CreditNoteShared/RedeemCreditNoteModal.jsx
//
// Redeem Credit Note Modal
// FIXED: Changed `remaining_amount` to `balance` to match backend API

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, CreditCard } from "lucide-react";
import { toast } from "../../../shared/ToastConfig";
import { updateRedeemForm, setActionErrors } from "../../../../REDUX_FEATURES/REDUX_SLICES/CreditNote_api/creditNoteSlice";
import { useGetBillsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingApi";

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

export default function RedeemCreditNoteModal({ creditNote, onSuccess, onClose }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { redeemForm, actionErrors } = useSelector((state) => state.creditNote);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userShopId = user?.shop_id || "";
    // FIXED: Changed `remaining_amount` to `balance` to match backend API
    const remainingAmount = toNumber(creditNote.balance || creditNote.credit_amount || creditNote.amount);

    const { data: billsData } = useGetBillsQuery({
        page: 1,
        limit: 50,
        shop_id: userShopId,
    });

    const bills = billsData?.bills || [];

    const handleSubmit = async () => {
        const amount = toNumber(redeemForm.redeemed_amount);
        
        if (!redeemForm.redeemed_amount || amount <= 0) {
            dispatch(setActionErrors({ redeemed_amount: "Valid amount is required" }));
            toast.error("Please enter a valid amount");
            return;
        }
        
        if (amount > remainingAmount) {
            dispatch(setActionErrors({ redeemed_amount: `Cannot redeem more than ₹${remainingAmount.toFixed(2)}` }));
            toast.error(`Maximum redeemable amount is ₹${remainingAmount.toFixed(2)}`);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSuccess(creditNote.credit_note_id, {
                redeemed_amount: amount,
                against_bill_id: redeemForm.against_bill_id || undefined,
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
                            <CreditCard size={18} className="text-green-600" />
                            Redeem Credit Note
                        </h3>
                        <p className="text-xs text-gray-400 font-mono">{creditNote.credit_note_number || creditNote.credit_note_id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Available Balance:</span>
                            <span className="font-bold text-green-600">₹{remainingAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-gray-500">Total Amount:</span>
                            <span className="text-gray-700">₹{toNumber(creditNote.credit_amount || creditNote.amount).toFixed(2)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Redeemed Amount <span className="text-red-500">*</span></label>
                        <input type="number" step="0.01" min="1" max={remainingAmount} value={redeemForm.redeemed_amount} onChange={(e) => dispatch(updateRedeemForm({ redeemed_amount: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${actionErrors.redeemed_amount ? "border-red-400" : "border-gray-300"}`} placeholder={`Max ₹${remainingAmount.toFixed(2)}`} />
                        {actionErrors.redeemed_amount && <p className="text-xs text-red-500 mt-1">{actionErrors.redeemed_amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Against Bill (Optional)</label>
                        <select value={redeemForm.against_bill_id} onChange={(e) => dispatch(updateRedeemForm({ against_bill_id: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="">Select a bill (or leave empty)</option>
                            {bills.map((bill) => (<option key={bill.bill_id} value={bill.bill_id}>{bill.bill_number} - ₹{toNumber(bill.total_amount).toFixed(2)} ({bill.customer_name || "Walk-in"})</option>))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">If selected, this credit note will be linked to this bill</p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3"><p className="text-xs text-amber-700">⚠️ Redeemed credit notes cannot be refunded later.</p></div>
                </div>

                <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">{isSubmitting ? "Processing..." : "Confirm Redeem"}</button>
                </div>
            </div>
    </div>
</div>
    );
}