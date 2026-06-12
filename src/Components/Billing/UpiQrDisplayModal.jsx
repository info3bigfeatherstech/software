import React, { useEffect, useState } from "react";
import { X, Copy } from "lucide-react";
import { toast } from "../shared/ToastConfig";
import { buildUpiQrForBill } from "../../utils/upiQr";
import { prepareBillForDocument } from "../../offline/billing/billDocumentPrepare.service";

/**
 * Read-only UPI QR for offline/synced bills — uses bill's selected bank account + payable amount.
 */
export default function UpiQrDisplayModal({ open, onClose, bill }) {
  const [loading, setLoading] = useState(false);
  const [qrBlock, setQrBlock] = useState(null);

  useEffect(() => {
    if (!open || !bill) {
      setQrBlock(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const prepared = await prepareBillForDocument(bill);
        const block = await buildUpiQrForBill(prepared, prepared.bank_account);
        if (!cancelled) setQrBlock(block);
      } catch (err) {
        console.error("UPI QR load failed:", err);
        if (!cancelled) {
          setQrBlock(null);
          toast.error(err?.message || "Could not generate UPI QR");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, bill]);

  if (!open || !bill) return null;

  const handleCopyUpi = async () => {
    if (!qrBlock?.upi_id) return;
    try {
      await navigator.clipboard.writeText(qrBlock.upi_id);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy UPI ID");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-gray-800">UPI QR — Collect Payment</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                {bill.bill_number || bill.offline_bill_number}
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4 text-center">
            <div className="flex justify-center">
              {loading ? (
                <div className="w-60 h-60 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-sm text-gray-400">
                  Generating QR…
                </div>
              ) : qrBlock?.qr_data_url ? (
                <img
                  src={qrBlock.qr_data_url}
                  alt="UPI payment QR code"
                  className="w-60 h-60 border border-gray-200 rounded-xl"
                />
              ) : (
                <div className="w-60 h-60 border border-dashed border-red-200 rounded-xl flex items-center justify-center text-sm text-red-600 px-4">
                  UPI QR not available — check bank account &amp; amount
                </div>
              )}
            </div>

            {qrBlock && (
              <div className="bg-gray-50 rounded-lg p-3 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bank</span>
                  <span className="text-gray-800">{qrBlock.bank_name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">UPI ID</span>
                  <span className="font-mono text-gray-800">{qrBlock.upi_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Bill amount</span>
                  <span className="font-bold text-blue-600">₹{Number(qrBlock.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account holder</span>
                  <span className="text-gray-800">{qrBlock.account_holder_name || "—"}</span>
                </div>
              </div>
            )}

            {qrBlock?.upi_id && (
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Copy size={14} /> Copy UPI ID
              </button>
            )}

            <p className="text-xs text-gray-500">
              QR is locked to this bill&apos;s selected UPI account and payable amount.
            </p>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
