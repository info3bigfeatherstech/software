// TABS/TRANSFERS/BulkTransferShared/BulkActionModals.jsx
//
// Complete Action Modals for Bulk Transfer Requests
// Handles: Approve (partial/full), Dispatch, Receive, Cancel, View Details

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, AlertTriangle, Package, Truck, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "react-toastify";
import {
    useApproveBulkTransferRequestMutation,
    useDispatchBulkTransferRequestMutation,
    useReceiveBulkTransferRequestMutation,
    useCancelBulkTransferRequestMutation,
    generateBulkIdempotencyKey,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferApi";
import {
    closeApproveModal,
    closeDispatchModal,
    closeReceiveModal,
    closeCancelModal,
    closeViewModal,
    setApproveType,
    setApproveItem,
    setTrackingNumber,
    setExpectedDelivery,
    setReceiveQuantity,
    setReceiveRemarks,
    setCancelReason,
    setActionErrors,
    clearActionErrors,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferSlice";

const STATUS_BADGE = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    DISPATCHED: "bg-purple-100 text-purple-700",
    PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
};

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function BulkActionModals({ onSuccess }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        showApproveModal,
        showDispatchModal,
        showReceiveModal,
        showCancelModal,
        showViewModal,
        selectedRequest,
        approveItems,
        approveType,
        trackingNumber,
        expectedDelivery,
        receiveQuantity,
        receiveRemarks,
        cancelReason,
        actionErrors,
    } = useSelector((state) => state.bulkTransfer);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [approveBulkRequest] = useApproveBulkTransferRequestMutation();
    const [dispatchBulkRequest] = useDispatchBulkTransferRequestMutation();
    const [receiveBulkRequest] = useReceiveBulkTransferRequestMutation();
    const [cancelBulkRequest] = useCancelBulkTransferRequestMutation();

    const inputCls = (name, errors) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors?.[name] ? "border-red-400" : "border-gray-300"}`;

    // Calculate remaining quantity for receive modal (moved to top level)
    const totalQty = selectedRequest?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
    const receivedQty = selectedRequest?.received_quantity || 0;
    const remainingQty = totalQty - receivedQty;

    // AUTO-FILL LOGIC - moved to top level useEffect
    useEffect(() => {
        // Auto-fill remaining quantity when receive modal opens
        if (showReceiveModal && remainingQty > 0 && !receiveQuantity) {
            dispatch(setReceiveQuantity(remainingQty.toString()));
        }
    }, [showReceiveModal, remainingQty, receiveQuantity, dispatch]);

    // Handle Approve
    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            let payload = {};
            if (approveType === "partial" && approveItems.length > 0) {
                payload.items = approveItems;
            }
            
            await approveBulkRequest({
                bulkRequestId: selectedRequest.bulk_request_id,
                ...payload,
                idempotencyKey: generateBulkIdempotencyKey(),
            }).unwrap();
            
            toast.success(approveType === "full" ? "✅ Bulk request approved fully" : "✅ Bulk request approved partially");
            dispatch(closeApproveModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to approve");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Dispatch
    const handleDispatch = async () => {
        setIsSubmitting(true);
        try {
            await dispatchBulkRequest({
                bulkRequestId: selectedRequest.bulk_request_id,
                tracking_number: trackingNumber?.trim() || null,
                expected_delivery: expectedDelivery || null,
                idempotencyKey: generateBulkIdempotencyKey(),
            }).unwrap();
            toast.success("🚚 Bulk request dispatched successfully");
            dispatch(closeDispatchModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to dispatch");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Receive
   // In the handleReceive function, REPLACE with this (uncomment the validation):

const handleReceive = async () => {
    let qty = parseInt(receiveQuantity);
    
    // If quantity is empty or 0, receive all remaining
    if (!receiveQuantity || qty <= 0) {
        qty = remainingQty;
    }
    
    // FIXED: Uncommented this validation
    if (qty <= 0) {
        toast.error("No quantity to receive");
        return;
    }
    if (qty > remainingQty) {
        toast.error(`Cannot receive more than ${remainingQty} units`);
        return;
    }
    
    setIsSubmitting(true);
    try {
        await receiveBulkRequest({
            bulkRequestId: selectedRequest.bulk_request_id,
            received_quantity: qty,
            receive_remarks: receiveRemarks?.trim() || null,
            idempotencyKey: generateBulkIdempotencyKey(),
        }).unwrap();
        
        if (qty === remainingQty) {
            toast.success("📦 Bulk request completed successfully!");
        } else {
            toast.success(`📦 Received ${qty} of ${remainingQty} units`);
        }
        dispatch(closeReceiveModal());
        if (onSuccess) onSuccess();
    } catch (err) {
        toast.error(err?.data?.message || "Failed to receive");
    } finally {
        setIsSubmitting(false);
    }
};

    // Handle Cancel
    const handleCancel = async () => {
        if (!cancelReason?.trim()) {
            dispatch(setActionErrors({ cancel_reason: "Cancellation reason is required" }));
            return;
        }
        setIsSubmitting(true);
        try {
            await cancelBulkRequest({
                bulkRequestId: selectedRequest.bulk_request_id,
                cancel_reason: cancelReason,
                idempotencyKey: generateBulkIdempotencyKey(),
            }).unwrap();
            toast.success("❌ Bulk request cancelled");
            dispatch(closeCancelModal());
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to cancel");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ============================================================
    // APPROVE MODAL
    // ============================================================
    if (showApproveModal && selectedRequest) {
        const items = selectedRequest.items || [];
        const approveTotalQty = items.reduce((s, i) => s + i.quantity, 0);
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-600" />
                                Approve Bulk Request
                            </h3>
                            <p className="text-xs text-gray-400">{selectedRequest.bulk_request_number}</p>
                        </div>
                        <button onClick={() => dispatch(closeApproveModal())} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p><strong>From Warehouse:</strong> {selectedRequest.from_warehouse?.warehouse_name || selectedRequest.from_warehouse_id}</p>
                            <p><strong>To Shop:</strong> {selectedRequest.to_shop?.shop_name || selectedRequest.to_shop_id}</p>
                            <p><strong>Total Items:</strong> {items.length} | <strong>Total Quantity:</strong> {approveTotalQty} units</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => dispatch(setApproveType("full"))} 
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    approveType === "full" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                ✅ Approve All Items
                            </button>
                            <button 
                                onClick={() => dispatch(setApproveType("partial"))} 
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    approveType === "partial" ? "bg-yellow-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                ⚡ Partial Approve
                            </button>
                        </div>
                        
                        {approveType === "partial" && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 w-20">Approve</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2">
                                                    <p className="font-medium text-gray-800">{item.variant?.product?.name || "Unknown"}</p>
                                                    <p className="text-xs text-gray-400">{item.variant?.sku || "—"}</p>
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold">{item.quantity}</td>
                                                <td className="px-3 py-2 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        onChange={(e) => dispatch(setApproveItem({ variant_id: item.variant_id, approved: e.target.checked }))} 
                                                        className="w-4 h-4 text-green-600 rounded"
                                                        defaultChecked={true}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {approveType === "partial" && approveItems.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
                                <p className="text-xs text-yellow-700">⚠️ No items selected for approval</p>
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                        <button onClick={() => dispatch(closeApproveModal())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                        <button 
                            onClick={handleApprove} 
                            disabled={isSubmitting || (approveType === "partial" && approveItems.length === 0)} 
                            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                            {isSubmitting ? "Processing..." : "Confirm Approval"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // DISPATCH MODAL
    // ============================================================
    if (showDispatchModal && selectedRequest) {
        const dispatchTotalQty = selectedRequest.items?.reduce((s, i) => s + i.quantity, 0) || 0;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Truck size={18} className="text-blue-600" />
                                Dispatch Bulk Request
                            </h3>
                            <p className="text-xs text-gray-400">{selectedRequest.bulk_request_number}</p>
                        </div>
                        <button onClick={() => dispatch(closeDispatchModal())} className="text-gray-400"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p><strong>To Shop:</strong> {selectedRequest.to_shop?.shop_name || selectedRequest.to_shop_id}</p>
                            <p><strong>Total Items:</strong> {selectedRequest.items?.length || 0}</p>
                            <p><strong>Total Quantity:</strong> {dispatchTotalQty} units</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tracking Number</label>
                            <input 
                                value={trackingNumber} 
                                onChange={(e) => dispatch(setTrackingNumber(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="e.g., TRK-2026-001" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                            <input 
                                type="date" 
                                value={expectedDelivery} 
                                onChange={(e) => dispatch(setExpectedDelivery(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                            <p className="text-xs text-amber-700">Stock will be deducted from warehouse and marked as in-transit.</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                        <button onClick={() => dispatch(closeDispatchModal())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={handleDispatch} disabled={isSubmitting} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                            {isSubmitting ? "Processing..." : "Confirm Dispatch"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // RECEIVE MODAL (NO HOOKS INSIDE CONDITIONAL)
    // ============================================================
    if (showReceiveModal && selectedRequest) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-green-600" />
                                Receive Bulk Request
                            </h3>
                            <p className="text-xs text-gray-400">{selectedRequest.bulk_request_number}</p>
                        </div>
                        <button onClick={() => dispatch(closeReceiveModal())} className="text-gray-400"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                            <p><strong>Total Requested:</strong> {totalQty} units</p>
                            <p><strong>Already Received:</strong> {receivedQty} units</p>
                            <p><strong>Remaining to Receive:</strong> <span className="font-bold text-blue-600">{remainingQty}</span> units</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity to Receive <span className="text-gray-400 text-xs">(Optional - auto-filled)</span>
                            </label>
                            <input 
                                type="number" 
                                min="0" 
                                max={remainingQty} 
                                value={receiveQuantity} 
                                onChange={(e) => dispatch(setReceiveQuantity(e.target.value))} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" 
                                placeholder="Leave empty to receive all"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                💡 Auto-filled with remaining quantity ({remainingQty} units). Change if receiving partial.
                            </p>
                            {actionErrors.receive_quantity && <p className="text-xs text-red-500 mt-1">{actionErrors.receive_quantity}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                            <textarea 
                                value={receiveRemarks} 
                                onChange={(e) => dispatch(setReceiveRemarks(e.target.value))} 
                                rows={2} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500" 
                                placeholder="Any issues with delivery?"
                            />
                        </div>
                    </div>
                    <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                        <button onClick={() => dispatch(closeReceiveModal())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={handleReceive} disabled={isSubmitting} className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                            {isSubmitting ? "Processing..." : "Confirm Receive"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // CANCEL MODAL
    // ============================================================
    if (showCancelModal && selectedRequest) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <XCircle size={18} className="text-red-600" />
                                Cancel Bulk Request
                            </h3>
                            <p className="text-xs text-gray-400">{selectedRequest.bulk_request_number}</p>
                        </div>
                        <button onClick={() => dispatch(closeCancelModal())} className="text-gray-400"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700 font-medium">⚠️ Warning: This action cannot be undone.</p>
                            {selectedRequest.status === "DISPATCHED" && (
                                <p className="text-xs text-red-600 mt-1">Stock will be reversed to source warehouse.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Cancellation Reason <span className="text-red-500">*</span></label>
                            <textarea 
                                value={cancelReason} 
                                onChange={(e) => dispatch(setCancelReason(e.target.value))} 
                                rows={2} 
                                className={inputCls("cancel_reason", actionErrors)} 
                                placeholder="Why is this request being cancelled?"
                            />
                            {actionErrors.cancel_reason && <p className="text-xs text-red-500 mt-1">{actionErrors.cancel_reason}</p>}
                        </div>
                    </div>
                    <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                        <button onClick={() => dispatch(closeCancelModal())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                        <button onClick={handleCancel} disabled={isSubmitting} className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                            {isSubmitting ? "Processing..." : "Confirm Cancel"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================================
    // VIEW DETAILS MODAL
    // ============================================================
    if (showViewModal && selectedRequest) {
        const viewTotalQty = selectedRequest.items?.reduce((s, i) => s + i.quantity, 0) || 0;
        const status = selectedRequest.status;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-gray-700">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                <Eye size={18} className="text-blue-600" />
                                Bulk Request Details
                            </h3>
                            <p className="text-xs text-gray-400">{selectedRequest.bulk_request_number}</p>
                        </div>
                        <button onClick={() => dispatch(closeViewModal())} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}>
                                {status?.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-gray-400">Created: {fmtDate(selectedRequest.created_at)}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3">
                            <div>
                                <p className="text-xs text-gray-500">Source Warehouse</p>
                                <p className="font-medium text-gray-800">{selectedRequest.from_warehouse?.warehouse_name || selectedRequest.from_warehouse_id}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Destination Shop</p>
                                <p className="font-medium text-gray-800">{selectedRequest.to_shop?.shop_name || selectedRequest.to_shop_id}</p>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Items ({selectedRequest.items?.length || 0})</p>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Requested</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Received</th>
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedRequest.items?.map((item, idx) => {
                                            const received = item.received_quantity || 0;
                                            const itemStatus = received === 0 ? "Pending" : received === item.quantity ? "Completed" : "Partial";
                                            return (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">
                                                        <p className="font-medium text-gray-800">{item.variant?.product?.name || "Unknown"}</p>
                                                        <p className="text-xs text-gray-400">{item.variant?.sku || "—"}</p>
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-semibold">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-right text-gray-600">{received}</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            itemStatus === "Completed" ? "bg-green-100 text-green-700" : 
                                                            itemStatus === "Partial" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                                                        }`}>
                                                            {itemStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td className="px-3 py-2 font-semibold">Total</td>
                                            <td className="px-3 py-2 text-right font-semibold">{viewTotalQty}</td>
                                            <td className="px-3 py-2 text-right font-semibold">{selectedRequest.received_quantity || 0}</td>
                                            <td className="px-3 py-2"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        
                        {selectedRequest.request_remarks && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Remarks</p>
                                <p className="text-sm text-gray-700">{selectedRequest.request_remarks}</p>
                            </div>
                        )}
                        
                        {selectedRequest.tracking_number && (
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Tracking Information</p>
                                <p className="text-sm font-medium text-gray-700">Tracking #: {selectedRequest.tracking_number}</p>
                                {selectedRequest.expected_delivery && (
                                    <p className="text-xs text-gray-500 mt-1">Expected: {fmtDate(selectedRequest.expected_delivery)}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
                        <button onClick={() => dispatch(closeViewModal())} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}