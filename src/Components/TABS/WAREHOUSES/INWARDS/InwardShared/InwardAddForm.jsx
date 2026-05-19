// TABS/WAREHOUSES/INWARDS/InwardShared/InwardAddForm.jsx
//
// Responsibility: POST /inwards (schedule only)
// No transport/challan/invoice at this stage — backend will reject them.

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCreateInwardMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
import {
    closeAddForm,
    updateScheduleForm,
    setScheduleErrors,
    clearScheduleErrors,
    setSubmitting,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
import InwardScheduleFormBody from "./InwardScheduleFormBody";

const WH_ROLES = ["WH_MANAGER", "WH_STOCK_LISTER"];

export default function InwardAddForm({ formData, formErrors, onSave }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [createInward, { isLoading }] = useCreateInwardMutation();

    // Auto-fill warehouse_id for WH roles on mount
    useEffect(() => {
        if (WH_ROLES.includes(user?.role) && user?.warehouse_id) {
            dispatch(updateScheduleForm({ warehouse_id: user.warehouse_id }));
        }
    }, []);

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!formData.vendor_id) errors.vendor_id = "Vendor is required";
        if (!formData.warehouse_id) errors.warehouse_id = "Warehouse is required";
        return errors;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        dispatch(clearScheduleErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setScheduleErrors(errors));
            return;
        }

        dispatch(setSubmitting(true));
        try {
            const payload = {
                vendor_id: formData.vendor_id,
                warehouse_id: formData.warehouse_id,
            };
            if (formData.expected_date) {
                payload.expected_date = new Date(formData.expected_date).toISOString();
            }
            if (formData.remarks?.trim()) {
                payload.remarks = formData.remarks.trim();
            }

            await createInward(payload).unwrap();
            onSave();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setScheduleErrors(be));
            } else {
                dispatch(setScheduleErrors({
                    general: err?.data?.message || "Failed to schedule inward",
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
                        <h3 className="text-base font-semibold text-gray-800">Schedule Inward</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Pre-arrival entry — transport &amp; invoice details added when truck arrives
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(closeAddForm())}
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

                <InwardScheduleFormBody
                    formData={formData}
                    onChange={(data) => dispatch(updateScheduleForm(data))}
                    formErrors={formErrors}
                />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => dispatch(closeAddForm())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                    >
                        {isLoading ? "Scheduling…" : "Schedule Inward"}
                    </button>
                </div>

            </div>
        </div>
    );
}

// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardAddForm.jsx
// //
// // Responsibility: POST /inwards (schedule only)
// // No transport/challan/invoice at this stage — backend will reject them.

// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useCreateInwardMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import {
//     closeAddForm,
//     updateScheduleForm,
//     setScheduleErrors,
//     clearScheduleErrors,
//     setSubmitting,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import InwardScheduleFormBody from "./InwardScheduleFormBody";

// const WH_ROLES = ["WH_MANAGER", "WH_STOCK_LISTER"];

// export default function InwardAddForm({ formData, formErrors, onSave }) {
//     const dispatch = useDispatch();
//     const { user } = useSelector((state) => state.auth);

//     const [createInward, { isLoading }] = useCreateInwardMutation();

//     // Auto-fill warehouse_id for WH roles on mount
//     useEffect(() => {
//         if (WH_ROLES.includes(user?.role) && user?.warehouse_id) {
//             dispatch(updateScheduleForm({ warehouse_id: user.warehouse_id }));
//         }
//     }, []);

//     // ── Validation ─────────────────────────────────────────────────────────────
//     const validate = () => {
//         const errors = {};
//         if (!formData.vendor_id) errors.vendor_id = "Vendor is required";
//         if (!formData.warehouse_id) errors.warehouse_id = "Warehouse is required";
//         return errors;
//     };

//     // ── Submit ─────────────────────────────────────────────────────────────────
//     const handleSave = async () => {
//         dispatch(clearScheduleErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setScheduleErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 vendor_id: formData.vendor_id,
//                 warehouse_id: formData.warehouse_id,
//             };
//             if (formData.expected_date) {
//                 payload.expected_date = new Date(formData.expected_date).toISOString();
//             }
//             if (formData.remarks?.trim()) {
//                 payload.remarks = formData.remarks.trim();
//             }

//             await createInward(payload).unwrap();
//             onSave();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setScheduleErrors(be));
//             } else {
//                 dispatch(setScheduleErrors({
//                     general: err?.data?.message || "Failed to schedule inward",
//                 }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5">

//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h3 className="text-base font-semibold text-gray-800">Schedule Inward</h3>
//                         <p className="text-xs text-gray-400 mt-0.5">
//                             Pre-arrival entry — transport &amp; invoice details added when truck arrives
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => dispatch(closeAddForm())}
//                         className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* General error */}
//                 {formErrors?.general && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                         <p className="text-sm text-red-600">{formErrors.general}</p>
//                     </div>
//                 )}

//                 <InwardScheduleFormBody
//                     formData={formData}
//                     onChange={(data) => dispatch(updateScheduleForm(data))}
//                     formErrors={formErrors}
//                 />

//                 {/* Actions */}
//                 <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//                     <button
//                         onClick={() => dispatch(closeAddForm())}
//                         className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         disabled={isLoading}
//                         className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//                     >
//                         {isLoading ? "Scheduling…" : "Schedule Inward"}
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// }