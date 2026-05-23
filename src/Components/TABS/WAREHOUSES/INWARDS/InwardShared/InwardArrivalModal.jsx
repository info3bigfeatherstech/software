// TABS/WAREHOUSES/INWARDS/InwardShared/InwardArrivalModal.jsx
//
// Responsibility: PATCH /inwards/:inwardId/arrival-details
// Opens when user clicks "Mark Arrived" on a SCHEDULED inward row.
// Sets status to ARRIVED on the backend automatically.

import React from "react";
import { useDispatch } from "react-redux";
import { usePatchArrivalDetailsMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
import {
    closeArrivalModal,
    updateArrivalForm,
    setArrivalErrors,
    clearArrivalErrors,
    setSubmitting,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";

export default function InwardArrivalModal({
    selectedInward,
    formData,
    formErrors,
    onSave,
}) {
    const dispatch = useDispatch();
    const [patchArrival, { isLoading }] = usePatchArrivalDetailsMutation();

    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors?.[name] ? "border-red-400" : "border-gray-300"
        }`;

    const errorMsg = (name) =>
        formErrors?.[name] ? (
            <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>
        ) : null;

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!formData.vendor_invoice_no?.trim())
            errors.vendor_invoice_no = "Vendor invoice number is required";
        if (!formData.challan_no?.trim())
            errors.challan_no = "Challan number is required";
        if (!formData.transport_details?.trim())
            errors.transport_details = "Transport details are required";
        return errors;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        dispatch(clearArrivalErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setArrivalErrors(errors));
            return;
        }

        dispatch(setSubmitting(true));
        try {
            const payload = {
                inwardId: selectedInward.inward_id,
                vendor_invoice_no: formData.vendor_invoice_no.trim(),
                challan_no: formData.challan_no.trim(),
                transport_details: formData.transport_details.trim(),
            };
            if (formData.remarks?.trim()) payload.remarks = formData.remarks.trim();

            await patchArrival(payload).unwrap();
            onSave();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setArrivalErrors(be));
            } else {
                dispatch(setArrivalErrors({
                    general: err?.data?.message || "Failed to update arrival details",
                }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Mark Arrived</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {selectedInward?.inward_number} — fill transport &amp; invoice details
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(closeArrivalModal())}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* General error */}
                {formErrors?.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                        <p className="text-sm text-red-600">{formErrors.general}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-gray-700">

                    {/* Vendor Invoice No */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Vendor Invoice No <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={formData.vendor_invoice_no}
                            onChange={(e) => dispatch(updateArrivalForm({ vendor_invoice_no: e.target.value }))}
                            placeholder="e.g. INV-4821"
                            className={inputCls("vendor_invoice_no")}
                        />
                        {errorMsg("vendor_invoice_no")}
                    </div>

                    {/* Challan No */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Challan No <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={formData.challan_no}
                            onChange={(e) => dispatch(updateArrivalForm({ challan_no: e.target.value }))}
                            placeholder="e.g. CH-9821"
                            className={inputCls("challan_no")}
                        />
                        {errorMsg("challan_no")}
                    </div>

                    {/* Transport Details */}
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Transport Details <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={formData.transport_details}
                            onChange={(e) => dispatch(updateArrivalForm({ transport_details: e.target.value }))}
                            placeholder="e.g. Truck HR38A1234"
                            className={inputCls("transport_details")}
                        />
                        {errorMsg("transport_details")}
                    </div>

                    {/* Remarks */}
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                        <textarea
                            value={formData.remarks}
                            onChange={(e) => dispatch(updateArrivalForm({ remarks: e.target.value }))}
                            placeholder="e.g. Vehicle reached gate, unloading started"
                            rows={2}
                            className={`${inputCls("remarks")} resize-none`}
                        />
                        {errorMsg("remarks")}
                    </div>

                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => dispatch(closeArrivalModal())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 cursor-pointer"
                    >
                        {isLoading ? "Saving…" : "Confirm Arrival"}
                    </button>
                </div>

            </div>
        </div>
    );
}
