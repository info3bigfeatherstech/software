import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    useCreateVendorPaymentMutation,
    useUpdateVendorPaymentMutation,
    useGetPayablePurchasesQuery,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseFinanceApi";
import { useGetVendorsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import { PAYMENT_METHODS, fmtCurrency } from "../purchaseFinanceUtils";

const todayIso = () => new Date().toISOString().slice(0, 10);

const toDateInput = (value) => {
    if (!value) return todayIso();
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return todayIso();
    return d.toISOString().slice(0, 10);
};

export default function RecordPaymentModal({
    open,
    onClose,
    onSaved,
    isSuperAdmin = false,
    assignedWarehouseId = "",
    assignedWarehouseName = "",
    initialWarehouseId = "",
    mode = "create",
    paymentId = "",
    initialPayment = null,
    onEditExistingPending,
}) {
    const isEdit = mode === "edit";
    const [createPayment, { isLoading: creating }] = useCreateVendorPaymentMutation();
    const [updatePayment, { isLoading: updating }] = useUpdateVendorPaymentMutation();
    const isLoading = creating || updating;

    const { data: vendorsData, isError: vendorsError } = useGetVendorsQuery(
        { page: 1, limit: 100 },
        { skip: !open || isEdit }
    );
    const vendors = vendorsData?.vendors || [];

    const { data: warehousesData } = useGetWarehousesQuery(
        { page: 1, limit: 100, is_active: "true" },
        { skip: !open || !isSuperAdmin || isEdit }
    );
    const warehouses = warehousesData?.warehouses || [];

    const [adminWarehouseId, setAdminWarehouseId] = useState("");
    const warehouseId = isEdit
        ? initialPayment?.warehouse_id || ""
        : isSuperAdmin
            ? adminWarehouseId
            : assignedWarehouseId;
    const whDisplayName = isEdit
        ? initialPayment?.warehouse?.warehouse_name || assignedWarehouseName
        : assignedWarehouseName || warehouses.find((w) => w.warehouse_id === assignedWarehouseId)?.warehouse_name;

    const [vendorId, setVendorId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
    const [referenceNo, setReferenceNo] = useState("");
    const [paymentDate, setPaymentDate] = useState(todayIso());
    const [status, setStatus] = useState("PAID");
    const [remarks, setRemarks] = useState("");
    const [allocations, setAllocations] = useState({});
    const [errors, setErrors] = useState({});
    const wasOpenRef = useRef(false);

    const { data: payablePurchases = [], isFetching: loadingPayables } = useGetPayablePurchasesQuery(
        {
            vendor_id: vendorId,
            warehouse_id: warehouseId,
            exclude_payment_id: isEdit ? paymentId : "",
        },
        { skip: !open || !vendorId || !warehouseId }
    );

    useEffect(() => {
        if (!open) {
            wasOpenRef.current = false;
            return;
        }

        if (isEdit && initialPayment) {
            setAdminWarehouseId(initialPayment.warehouse_id || "");
            setVendorId(initialPayment.vendor_id || "");
            setPaymentMethod(initialPayment.payment_method || "BANK_TRANSFER");
            setReferenceNo(initialPayment.reference_no || "");
            setPaymentDate(toDateInput(initialPayment.payment_date));
            setStatus(initialPayment.status || "PENDING");
            setRemarks(initialPayment.remarks || "");
            const allocMap = {};
            (initialPayment.allocations || []).forEach((a) => {
                allocMap[a.purchase_id] = a.allocated_amount;
            });
            setAllocations(allocMap);
            setErrors({});
            wasOpenRef.current = true;
            return;
        }

        if (!wasOpenRef.current) {
            setAdminWarehouseId(initialWarehouseId || "");
            setVendorId("");
            setPaymentMethod("BANK_TRANSFER");
            setReferenceNo("");
            setPaymentDate(todayIso());
            setStatus("PAID");
            setRemarks("");
            setAllocations({});
            setErrors({});
            wasOpenRef.current = true;
        }
    }, [open, initialWarehouseId, isEdit, initialPayment]);

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
        if (!warehouseId) {
            e.general = isSuperAdmin
                ? "Select a warehouse before recording payment"
                : "Your account is not assigned to a warehouse";
        }
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

        const payload = {
            amount: totalAllocated,
            payment_method: paymentMethod,
            reference_no: referenceNo.trim() || undefined,
            payment_date: paymentDate,
            status: status === "PENDING" ? "PENDING" : "PAID",
            remarks: remarks.trim() || undefined,
            allocations: allocationRows,
        };

        try {
            if (isEdit) {
                await updatePayment({ paymentId, ...payload }).unwrap();
            } else {
                await createPayment({
                    warehouse_id: warehouseId || undefined,
                    vendor_id: vendorId,
                    ...payload,
                }).unwrap();
            }
            onSaved();
            onClose();
        } catch (err) {
            setErrors({ general: err?.data?.message || `Failed to ${isEdit ? "update" : "record"} payment` });
        }
    };

    if (!open) return null;

    const vendorName = isEdit
        ? initialPayment?.vendor?.company_name
        : vendors.find((v) => v.vendor_id === vendorId)?.company_name;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-base font-semibold text-gray-800">
                        {isEdit ? "Edit Vendor Payment" : "Record Vendor Payment"}
                    </h3>
                    {isEdit && initialPayment?.payment_number && (
                        <p className="text-xs text-gray-500 font-mono">{initialPayment.payment_number}</p>
                    )}
                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.general}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {isSuperAdmin && !isEdit ? (
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Warehouse *</label>
                                <select
                                    value={adminWarehouseId}
                                    onChange={(e) => {
                                        setAdminWarehouseId(e.target.value);
                                        setVendorId("");
                                        setAllocations({});
                                    }}
                                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Select warehouse</option>
                                    {warehouses.map((w) => (
                                        <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Purchase bills for this warehouse will appear below after you select a vendor
                                </p>
                            </div>
                        ) : (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Warehouse</p>
                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {whDisplayName || "Your assigned warehouse"}
                                </p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Vendor *</label>
                            {isEdit ? (
                                <p className="text-sm font-medium text-gray-800 mt-1">{vendorName || "—"}</p>
                            ) : (
                                <>
                                    <select value={vendorId} onChange={(e) => { setVendorId(e.target.value); setAllocations({}); }} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                        <option value="">{vendorsError ? "Failed to load vendors" : vendors.length ? "Select vendor" : "No vendors found"}</option>
                                        {vendors.map((v) => (
                                            <option key={v.vendor_id} value={v.vendor_id}>{v.company_name}</option>
                                        ))}
                                    </select>
                                    {vendorsError && <p className="text-xs text-red-500 mt-1">Could not load vendors. Refresh and try again.</p>}
                                    {errors.vendor && <p className="text-xs text-red-500 mt-1">{errors.vendor}</p>}
                                </>
                            )}
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
                            {!isEdit && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Each payment entry keeps the status you select here (independent of earlier payments on the same bill).
                                </p>
                            )}
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

                    {vendorId && warehouseId && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">Allocate to purchase bills</div>
                            {loadingPayables && <p className="px-4 py-6 text-sm text-gray-400">Loading payable purchases…</p>}
                            {!loadingPayables && payablePurchases.length === 0 && (
                                <p className="px-4 py-6 text-sm text-gray-400">
                                    No outstanding purchase bills for this vendor at the selected warehouse.
                                    Receive goods and map inward to create a purchase bill first.
                                </p>
                            )}
                            {payablePurchases.map((p) => {
                                const maxAlloc = p.allocation_available ?? p.outstanding_amount;
                                const hasOtherPending = (p.pending_allocations || []).length > 0;
                                const pendingLabel = hasOtherPending
                                    ? (p.pending_allocations || [])
                                        .map((pa) => `${fmtCurrency(pa.allocated_amount)} (${pa.payment_number})`)
                                        .join(", ")
                                    : null;

                                return (
                                    <div key={p.purchase_id} className="px-4 py-3 border-t border-gray-100 flex flex-wrap items-center gap-3">
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-sm font-medium">{p.purchase_number}</p>
                                            <p className="text-xs text-gray-400">
                                                {p.vendor_invoice_no} · Due: {fmtCurrency(p.outstanding_amount)}
                                                {p.paid_total > 0 && ` · Paid: ${fmtCurrency(p.paid_total)}`}
                                            </p>
                                            {pendingLabel && (
                                                <p className="text-xs text-amber-600 mt-0.5">
                                                    Pending: {pendingLabel}
                                                    {onEditExistingPending && (
                                                        <>
                                                            {" · "}
                                                            <button
                                                                type="button"
                                                                onClick={() => onEditExistingPending(p.pending_allocations[0]?.payment_id)}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Edit existing payment
                                                            </button>
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={maxAlloc}
                                            step="0.01"
                                            value={allocations[p.purchase_id] ?? ""}
                                            onChange={(e) => setAlloc(p.purchase_id, e.target.value, maxAlloc)}
                                            placeholder="0"
                                            disabled={hasOtherPending && !isEdit}
                                            className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fillFull(p.purchase_id, maxAlloc)}
                                            disabled={hasOtherPending && !isEdit}
                                            className="text-xs text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                                        >
                                            Pay full
                                        </button>
                                    </div>
                                );
                            })}
                            {errors.allocations && <p className="px-4 py-2 text-xs text-red-500">{errors.allocations}</p>}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm font-semibold">
                                Total payment: {fmtCurrency(totalAllocated)}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
                        <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-60">
                            {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Record Payment"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
