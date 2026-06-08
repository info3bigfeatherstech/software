import React from "react";
import { X, Download } from "lucide-react";
import { toast } from "../../../shared/ToastConfig";
import { useGetDebitNoteByIdQuery, useLazyDownloadDebitNotePdfQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/DebitNote_api/debitNoteApi";
import { downloadBlobFile } from "../../../../utils/downloadBlob";

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TYPE_LABELS = {
    SHORTAGE: "Shortage",
    DEFECTIVE: "Defective return",
    RATE_DIFFERENCE: "Rate difference",
    OTHER: "Other",
};

export default function DebitNoteViewModal({ debitNoteId, onClose }) {
    const { data: dn, isLoading, isError } = useGetDebitNoteByIdQuery(debitNoteId, { skip: !debitNoteId });
    const [downloadPdf, { isFetching: downloading }] = useLazyDownloadDebitNotePdfQuery();

    const handlePdf = async () => {
        try {
            const result = await downloadPdf(debitNoteId).unwrap();
            downloadBlobFile(result, `${dn?.debit_note_number || "debit-note"}.pdf`);
        } catch {
            toast.error("Failed to download PDF");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-gray-700">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h3 className="text-lg font-semibold">Debit Note</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
                    {isError && <p className="text-sm text-red-600">Could not load debit note</p>}
                    {dn && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Number</p>
                                    <p className="font-mono font-medium">{dn.debit_note_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Status</p>
                                    <p>{dn.status}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Type</p>
                                    <p>{TYPE_LABELS[dn.type] || dn.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Date</p>
                                    <p>{fmtDate(dn.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Vendor</p>
                                    <p>{dn.vendor?.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Purchase</p>
                                    <p className="font-mono text-xs">{dn.original_purchase?.purchase_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Vendor invoice</p>
                                    <p className="font-mono text-xs">{dn.original_purchase?.vendor_invoice_no}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Stock returned</p>
                                    <p>{dn.return_stock ? "Yes" : "No"}</p>
                                </div>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs text-gray-400">Item</th>
                                            <th className="px-3 py-2 text-right text-xs text-gray-400">Qty</th>
                                            <th className="px-3 py-2 text-right text-xs text-gray-400">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {(dn.lines || []).map((line) => (
                                            <tr key={line.line_id}>
                                                <td className="px-3 py-2">
                                                    {line.variant?.product?.name}
                                                    <span className="text-xs text-gray-400 block">{line.variant?.sku}</span>
                                                </td>
                                                <td className="px-3 py-2 text-right">{line.quantity}</td>
                                                <td className="px-3 py-2 text-right font-medium">{fmtCurrency(line.line_total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p>Subtotal: {fmtCurrency(dn.subtotal)}</p>
                                <p>GST: {fmtCurrency(dn.gst_amount)}</p>
                                <p className="text-lg font-bold">Debit: {fmtCurrency(dn.debit_amount)}</p>
                            </div>
                            {dn.remarks && (
                                <p className="text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{dn.remarks}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="px-5 py-4 border-t flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handlePdf}
                        disabled={downloading || !dn}
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                        <Download size={14} /> PDF
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
