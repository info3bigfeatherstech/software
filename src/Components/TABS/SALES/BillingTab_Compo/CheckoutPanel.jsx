// TABS/SALES/BillingTab_Compo/CheckoutPanel.jsx
//
// Checkout panel - totals, payment method, create bill button
// Calls billingApi to create bill
// FIXED: Added View Bill modal, fixed PDF download

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Printer, Download, PlusCircle, Eye, X } from "lucide-react";
import { toast } from "react-toastify";
import { useCreateBillMutation, useLazyGetBillPdfQuery, useGetBillByIdQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingApi";
import {
    clearCart,
    clearSelectedCustomer,
    setBillType,
    setPaymentMethod,
    setLastCreatedBill,
    clearLastCreatedBill,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";
import { selectCartSubtotal, selectCartGst, selectCartTotal, selectCartItemCount } from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";

const toNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

const fmtDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

// Bill View Modal Component
const BillViewModal = ({ bill, onClose }) => {
    if (!bill) return null;

    const totalQty = bill.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Bill Details</h3>
                        <p className="text-xs text-gray-400 font-mono">{bill.bill_number}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Bill Info */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-500">Bill Date</p>
                            <p className="font-medium text-gray-800">{fmtDateTime(bill.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Bill Type</p>
                            <p className="font-medium text-gray-800">{bill.bill_type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Payment Status</p>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${bill.payment_status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {bill.payment_status || "PENDING"}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="font-medium text-gray-800">{bill.customer_name || "Walk-in Customer"}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Items ({totalQty})</p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Price</th>
                                        <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bill.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-3 py-2">
                                                <p className="font-medium text-gray-800">{item.variant?.product?.name || item.product?.name}</p>
                                                <p className="text-xs text-gray-400">{item.variant?.sku || "—"}</p>
                                            </td>
                                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                                            <td className="px-3 py-2 text-right">₹{toNumber(item.unit_price).toFixed(2)}</td>
                                            <td className="px-3 py-2 text-right font-semibold">₹{toNumber(item.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-3 py-2 text-right font-semibold">Subtotal:</td>
                                        <td className="px-3 py-2 text-right">₹{toNumber(bill.subtotal).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-3 py-2 text-right font-semibold">GST:</td>
                                        <td className="px-3 py-2 text-right">₹{toNumber(bill.gst_amount).toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-t border-gray-200">
                                        <td colSpan="3" className="px-3 py-2 text-right font-bold text-lg">Total:</td>
                                        <td className="px-3 py-2 text-right font-bold text-lg text-blue-600">₹{toNumber(bill.total_amount).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {bill.payments && bill.payments.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 mb-2">Payments</p>
                            {bill.payments.map((payment, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{payment.payment_method} • {fmtDateTime(payment.paid_at)}</span>
                                    <span className="font-medium">₹{toNumber(payment.amount).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Close</button>
                </div>
            </div>
        </div>
    );
};

export default function CheckoutPanel({ shop_id }) {
    const dispatch = useDispatch();
    const { cart, selectedCustomer, customerMobileInput, billType, paymentMethod, lastCreatedBill } = useSelector((state) => state.billing);
    const subtotal = useSelector(selectCartSubtotal);
    const gstAmount = useSelector(selectCartGst);
    const total = useSelector(selectCartTotal);
    const itemCount = useSelector(selectCartItemCount);

    const [createBill, { isLoading: isCreating }] = useCreateBillMutation();
    const [triggerPdf, { isLoading: isPdfLoading }] = useLazyGetBillPdfQuery();
    const [createdBillData, setCreatedBillData] = useState(null);
    const [showBillModal, setShowBillModal] = useState(false);
    const [viewBillId, setViewBillId] = useState(null);

    // Fetch bill details for viewing
    const { data: billDetails, refetch: refetchBill } = useGetBillByIdQuery(viewBillId, {
        skip: !viewBillId,
    });

    // Open bill view modal
    const handleViewBill = (billId) => {
        setViewBillId(billId);
        setShowBillModal(true);
        refetchBill();
    };

    const handleCreateBill = async () => {
        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        // Build items array
        const items = cart.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            price_type: item.price_type,
        }));

        // Build payload
        const payload = {
            shop_id,
            bill_type: billType,
            payment_method: paymentMethod,
            sales_channel: "WALK_IN",
            items,
        };

        // Add customer info
        if (selectedCustomer) {
            payload.customer_id = selectedCustomer.customer_id;
        } else {
            payload.customer_name = customerMobileInput ? customerMobileInput : "Walk-in Customer";
            if (customerMobileInput) {
                payload.customer_mobile = customerMobileInput;
            }
        }

        // IMPORTANT: payment_amount is NOT sent - backend calculates it

        try {
            const result = await createBill({
                idempotencyKey: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...payload,
            }).unwrap();

            toast.success(`Bill ${result.bill_number} created successfully`);
            setCreatedBillData(result);
            dispatch(setLastCreatedBill(result));
            dispatch(clearCart());
            dispatch(clearSelectedCustomer());
        } catch (err) {
            console.error("Bill creation error:", err);
            toast.error(err?.data?.message || "Failed to create bill");
        }
    };
    const handleDownloadPdf = async () => {
        const billId = createdBillData?.bill_id || lastCreatedBill?.bill_id;
        if (!billId) {
            toast.error("No bill available to download");
            return;
        }

        try {
            const response = await triggerPdf(billId).unwrap();

            // response should be a Blob
            if (response instanceof Blob && response.type === 'application/pdf') {
                const url = window.URL.createObjectURL(response);
                const a = document.createElement("a");
                a.href = url;
                a.download = `invoice-${billId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("PDF downloaded");
            } else {
                // If response is not a PDF blob, check if it's a URL
                toast.error("PDF generation failed. Please check backend logs.");
            }
        } catch (err) {
            console.error("PDF download error:", err);
            toast.error(err?.data?.message || "Failed to download PDF");
        }
    };

    const handleNewBill = () => {
        setCreatedBillData(null);
        dispatch(clearLastCreatedBill());
    };

    // Show success UI after bill creation
    if (createdBillData || lastCreatedBill) {
        const bill = createdBillData || lastCreatedBill;
        return (
            <>
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <p className="font-bold text-green-800">Bill Created Successfully!</p>
                        <p className="text-sm text-green-700 font-mono mt-1">{bill.bill_number}</p>
                        <p className="text-xs text-green-600 mt-1">
                            Amount: ₹{toNumber(bill.total_amount || bill.total).toFixed(2)}
                        </p>
                        <div className="flex gap-2 mt-4">
                            {/* VIEW BILL BUTTON - NEW */}
                            <button
                                onClick={() => handleViewBill(bill.bill_id)}
                                className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
                            >
                                <Eye size={14} />
                                View Bill
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                disabled={isPdfLoading}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                <Download size={14} />
                                {isPdfLoading ? "Loading..." : "Download PDF"}
                            </button>
                            <button
                                onClick={handleNewBill}
                                className="flex-1 py-2 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-2"
                            >
                                <PlusCircle size={14} />
                                New Bill
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bill View Modal */}
                {showBillModal && billDetails && (
                    <BillViewModal
                        bill={billDetails}
                        onClose={() => {
                            setShowBillModal(false);
                            setViewBillId(null);
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <div className="mt-4 pt-3 border-t border-gray-200">
            {/* Bill Type Toggle */}
            <div className="flex gap-2 mb-3">
                <button
                    onClick={() => dispatch(setBillType("ESTIMATE"))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${billType === "ESTIMATE"
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    📄 Estimate
                </button>
                <button
                    onClick={() => dispatch(setBillType("GST_INVOICE"))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${billType === "GST_INVOICE"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    🧾 GST Invoice
                </button>
            </div>

            {/* Totals */}
            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal ({itemCount} items):</span>
                    <span className="font-medium text-gray-800">₹{toNumber(subtotal).toFixed(2)}</span>
                </div>
                {billType === "GST_INVOICE" && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total GST:</span>
                        <span className="font-medium text-gray-800">₹{toNumber(gstAmount).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-800">NET PAYABLE:</span>
                    <span className="text-2xl font-black text-blue-600">₹{toNumber(total).toFixed(2)}</span>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-3 text-gray-700">
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                    value={paymentMethod}
                    onChange={(e) => dispatch(setPaymentMethod(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="CASH">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="CARD">💳 Card</option>
                </select>
            </div>

            {/* Create Bill Button */}
            <button
                onClick={handleCreateBill}
                disabled={cart.length === 0 || isCreating}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${cart.length === 0
                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-lg"
                    }`}
            >
                {isCreating ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Bill...
                    </>
                ) : (
                    <>
                        <Printer size={18} />
                        Create Bill & Print
                    </>
                )}
            </button>
        </div>
    );
}