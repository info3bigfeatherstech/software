import React, { useState, useEffect, useMemo } from "react";
import { useCreateVendorPaymentMutation, useGetPayablePurchasesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseFinanceApi";
import { useGetVendorsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
import { PAYMENT_METHODS, fmtCurrency } from "../purchaseFinanceUtils";

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function RecordPaymentModal({ open, onClose, onSaved, warehouseId }) {
    const [createPayment, { isLoading }] = useCreateVendorPaymentMutation();
    const { data: vendorsData, isError: vendorsError } = useGetVendorsQuery(
        { page: 1, limit: 100 },
        { skip: !open }
    );
    const vendors = vendorsData?.vendors || [];

    const [vendorId, setVendorId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
    const [referenceNo, setReferenceNo] = useState("");
    const [paymentDate, setPaymentDate] = useState(todayIso());
    const [status, setStatus] = useState("PAID");
    const [remarks, setRemarks] = useState("");
    const [allocations, setAllocations] = useState({});
    const [errors, setErrors] = useState({});

    const { data: payablePurchases = [], isFetching: loadingPayables } = useGetPayablePurchasesQuery(
        { vendor_id: vendorId, warehouse_id: warehouseId || undefined },
        { skip: !open || !vendorId }
    );

    useEffect(() => {
        if (!open) return;
        setVendorId("");
        setPaymentMethod("BANK_TRANSFER");
        setReferenceNo("");
        setPaymentDate(todayIso());
        setStatus("PAID");
        setRemarks("");
        setAllocations({});
        setErrors({});
    }, [open]);

    const totalAllocated = useMemo(
        () => Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0),
        [allocations]
    );

    const setAlloc = (purchaseId, value, max) => {
        const num = value === "" ? "" : Math.min(Number(value), max);
        setAllocations((a) => ({ ...a, [purchaseId]: num }));
    };

    const fillFull = (purchaseId, amount) => {
        setAllocations((a) => ({ ...a, [purchaseId]: amount }));
    };

    const validate = () => {
        const e = {};
        if (!warehouseId) e.general = "Select a warehouse before recording payment";
        if (!vendorId) e.vendor = "Select a vendor";
        if (!paymentMethod) e.method = "Payment method required";
        const rows = Object.entries(allocations).filter(([, v]) => Number(v) > 0);
        if (!rows.length) e.allocations = "Allocate to at least one purchase";
        if (totalAllocated <= 0) e.allocations = "Total allocation must be greater than zero";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const allocationRows = Object.entries(allocations)
            .filter(([, v]) => Number(v) > 0)
            .map(([purchase_id, allocated_amount]) => ({
                purchase_id,
                allocated_amount: Number(allocated_amount),
            }));

        try {
            await createPayment({
                warehouse_id: warehouseId || undefined,
                vendor_id: vendorId,
                amount: totalAllocated,
                payment_method: paymentMethod,
                reference_no: referenceNo.trim() || undefined,
                payment_date: paymentDate,
                status,
                remarks: remarks.trim() || undefined,
                allocations: allocationRows,
            }).unwrap();
            onSaved();
            onClose();
        } catch (err) {
            setErrors({ general: err?.data?.message || "Failed to record payment" });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-base font-semibold text-gray-800">Record Vendor Payment</h3>
                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.general}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Vendor *</label>
                            <select value={vendorId} onChange={(e) => { setVendorId(e.target.value); setAllocations({}); }} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <option value="">{vendorsError ? "Failed to load vendors" : vendors.length ? "Select vendor" : "No vendors found"}</option>
                                {vendors.map((v) => (
                                    <option key={v.vendor_id} value={v.vendor_id}>{v.company_name}</option>
                                ))}
                            </select>
                            {vendorsError && <p className="text-xs text-red-500 mt-1">Could not load vendors. Refresh and try again.</p>}
                            {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Payment method *</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <option value="PAID">Paid</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Payment date</label>
                            <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Reference (UTR / Cheque #)</label>
                            <input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Remarks</label>
                            <input value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>

                    {vendorId && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Allocate to purchase bills</div>
                            {loadingPayables && <p className="px-4 py-6 text-sm text-gray-400">Loading payable purchases…</p>}
                            {!loadingPayables && payablePurchases.length === 0 && (
                                <p className="px-4 py-6 text-sm text-gray-400">No outstanding purchases for this vendor</p>
                            )}
                            {payablePurchases.map((p) => (
                                <div key={p.purchase_id} className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="text-sm font-medium">{p.purchase_number}</p>
                                        <p className="text-xs text-gray-400">{p.vendor_invoice_no} · Due: {fmtCurrency(p.outstanding_amount)}</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        max={p.outstanding_amount}
                                        step="0.01"
                                        value={allocations[p.purchase_id] ?? ""}
                                        onChange={(e) => setAlloc(p.purchase_id, e.target.value, p.outstanding_amount)}
                                        placeholder="0"
                                        className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                                    />
                                    <button type="button" onClick={() => fillFull(p.purchase_id, p.outstanding_amount)} className="text-xs text-blue-600 hover:underline">Pay full</button>
                                </div>
                            ))}
                            {errors.allocations && <p className="px-4 py-2 text-xs text-red-500">{errors.allocations}</p>}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm font-semibold">
                                Total payment: {fmtCurrency(totalAllocated)}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg disabled:opacity-60">
                            {isLoading ? "Saving…" : "Record Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
