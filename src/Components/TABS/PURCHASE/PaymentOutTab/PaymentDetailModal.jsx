import React, { useState } from "react";
import { X, Pencil, CheckCircle, XCircle } from "lucide-react";
import {
    useGetVendorPaymentByIdQuery,
    useGetPurchasePaymentHistoryQuery,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseFinanceApi";
import {
    fmtCurrency,
    fmtDate,
    fmtDateTime,
    PAYMENT_STATUS_BADGE,
    getPaymentMethodLabel,
} from "../purchaseFinanceUtils";

export default function PaymentDetailModal({
    open,
    paymentId,
    onClose,
    canWrite = false,
    onEdit,
    onMarkPaid,
    onCancel,
}) {
    const [historyPurchaseId, setHistoryPurchaseId] = useState(null);

    const { data: payment, isLoading, isError } = useGetVendorPaymentByIdQuery(paymentId, {
        skip: !open || !paymentId,
    });

    const { data: purchaseHistory, isFetching: loadingHistory } = useGetPurchasePaymentHistoryQuery(
        historyPurchaseId,
        { skip: !historyPurchaseId }
    );

    if (!open) return null;

    const isPending = payment?.status === "PENDING";

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800">Payment Details</h3>
                            {payment?.payment_number && (
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{payment.payment_number}</p>
                            )}
                        </div>
                        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <X size={18} />
                        </button>
                    </div>

                    {isLoading && <p className="text-sm text-gray-400 py-8 text-center">Loading payment…</p>}
                    {isError && <p className="text-sm text-red-600 py-8 text-center">Failed to load payment details</p>}

                    {payment && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Vendor</p>
                                    <p className="font-medium">{payment.vendor?.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Warehouse</p>
                                    <p className="font-medium">{payment.warehouse?.warehouse_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="font-semibold text-lg">{fmtCurrency(payment.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Method</p>
                                    <p>{getPaymentMethodLabel(payment.payment_method)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Payment date</p>
                                    <p>{fmtDate(payment.payment_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_BADGE[payment.status] || PAYMENT_STATUS_BADGE.PENDING}`}>
                                        {payment.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Reference</p>
                                    <p>{payment.reference_no || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Recorded by</p>
                                    <p>{payment.paid_by?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created / Updated</p>
                                    <p className="text-xs">{fmtDateTime(payment.created_at)}</p>
                                    {payment.updated_at !== payment.created_at && (
                                        <p className="text-xs text-gray-400">Updated {fmtDateTime(payment.updated_at)}</p>
                                    )}
                                </div>
                                {payment.remarks && (
                                    <div className="col-span-2 sm:col-span-3">
                                        <p className="text-xs text-gray-500">Remarks</p>
                                        <p>{payment.remarks}</p>
                                    </div>
                                )}
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                    Allocations
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {["Purchase Bill", "Invoice", "Allocated", "Bill Due (after paid)", ""].map((h) => (
                                                <th key={h} className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(payment.allocations || []).map((a) => (
                                            <tr key={a.allocation_id}>
                                                <td className="px-4 py-3 font-mono text-xs">{a.purchase?.purchase_number}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{a.purchase?.vendor_invoice_no || "—"}</td>
                                                <td className="px-4 py-3 font-medium">{fmtCurrency(a.allocated_amount)}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500">
                                                    {fmtCurrency(a.purchase?.outstanding_amount ?? 0)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setHistoryPurchaseId(a.purchase_id)}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        All payments
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {historyPurchaseId && (
                                <div className="border border-blue-100 rounded-xl overflow-hidden bg-blue-50/30">
                                    <div className="px-4 py-2 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-blue-700 uppercase">
                                            Payment history — {purchaseHistory?.purchase?.purchase_number || "…"}
                                        </p>
                                        <button type="button" onClick={() => setHistoryPurchaseId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                                            Close
                                        </button>
                                    </div>
                                    {loadingHistory && <p className="px-4 py-4 text-sm text-gray-400">Loading history…</p>}
                                    {!loadingHistory && purchaseHistory && (
                                        <>
                                            <p className="px-4 pb-2 text-xs text-gray-500">
                                                Bill due (after paid): {fmtCurrency(purchaseHistory.outstanding_amount)}
                                            </p>
                                            <table className="w-full text-sm bg-white">
                                                <thead className="border-t border-blue-100">
                                                    <tr>
                                                        {["Payment #", "Date", "Amount", "Method", "Status"].map((h) => (
                                                            <th key={h} className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {(purchaseHistory.payments || []).length === 0 && (
                                                        <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400 text-xs">No payments recorded</td></tr>
                                                    )}
                                                    {(purchaseHistory.payments || []).map((row) => (
                                                        <tr key={row.payment_id} className={row.payment_id === paymentId ? "bg-yellow-50" : ""}>
                                                            <td className="px-4 py-2 font-mono text-xs">{row.payment_number}</td>
                                                            <td className="px-4 py-2 text-xs">{fmtDate(row.payment_date)}</td>
                                                            <td className="px-4 py-2">{fmtCurrency(row.allocated_amount)}</td>
                                                            <td className="px-4 py-2 text-xs">{getPaymentMethodLabel(row.payment_method)}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_BADGE[row.status] || ""}`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                </div>
                            )}

                            {canWrite && isPending && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(payment)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMarkPaid?.(payment)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-green-200 text-green-700 rounded-lg hover:bg-green-50"
                                    >
                                        <CheckCircle size={14} /> Mark Paid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onCancel?.(payment)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                    >
                                        <XCircle size={14} /> Cancel Payment
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
