import React, { useEffect, useState } from "react";
import { X, Copy, CheckCircle } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "react-toastify";
import { buildUpiPaymentUri } from "../../../../utils/upiPayment";

export default function UpiPaymentModal({
    open,
    onClose,
    onConfirm,
    account,
    amount,
    isConfirming = false,
}) {
    const [qrDataUrl, setQrDataUrl] = useState("");
    const [referenceNo, setReferenceNo] = useState("");

    useEffect(() => {
        if (!open || !account?.upi_id) {
            setQrDataUrl("");
            return;
        }

        const uri = buildUpiPaymentUri({
            upiId: account.upi_id,
            payeeName: account.account_holder_name,
            amount,
            transactionNote: "Shop Bill Payment",
        });

        QRCode.toDataURL(uri, { width: 240, margin: 2 })
            .then(setQrDataUrl)
            .catch(() => {
                setQrDataUrl("");
                toast.error("Failed to generate UPI QR code");
            });
    }, [open, account, amount]);

    useEffect(() => {
        if (!open) setReferenceNo("");
    }, [open]);

    if (!open || !account) return null;

    const handleCopyUpi = async () => {
        try {
            await navigator.clipboard.writeText(account.upi_id);
            toast.success("UPI ID copied");
        } catch {
            toast.error("Could not copy UPI ID");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800">UPI Payment</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{account.bank_name}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 text-center">
                        <div className="flex justify-center">
                            {qrDataUrl ? (
                                <img
                                    src={qrDataUrl}
                                    alt="UPI payment QR code"
                                    className="w-60 h-60 border border-gray-200 rounded-xl"
                                />
                            ) : (
                                <div className="w-60 h-60 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
                                    Generating QR…
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">UPI ID</span>
                                <span className="font-mono text-gray-800">{account.upi_id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Amount</span>
                                <span className="font-bold text-blue-600">₹{Number(amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Account Holder</span>
                                <span className="text-gray-800">{account.account_holder_name}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <Copy size={14} /> Copy UPI ID
                        </button>

                        <div className="text-left">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                UPI Transaction Ref (optional)
                            </label>
                            <input
                                value={referenceNo}
                                onChange={(e) => setReferenceNo(e.target.value)}
                                placeholder="e.g. UTR / reference from customer app"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                maxLength={100}
                            />
                        </div>

                        <p className="text-xs text-gray-500">
                            Ask the customer to scan and pay. Confirm only after you verify payment on your UPI app.
                        </p>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onConfirm({ reference_no: referenceNo.trim() || undefined })}
                            disabled={isConfirming}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {isConfirming ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Bill…
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Payment Received — Create Bill
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
