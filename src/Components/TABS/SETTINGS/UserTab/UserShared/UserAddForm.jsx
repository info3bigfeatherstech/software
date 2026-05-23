// TABS/SETTINGS/UserShared/UserAddForm.jsx
//
// Responsibility: POST /users
// Handles role-aware validation (WH roles need warehouse_id, shop roles need shop_id).

import React from "react";
import { useDispatch } from "react-redux";
import { useCreateUserMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/User_Api/userApi";
import {
    closeAddForm,
    updateFormData,
    setFormErrors,
    clearFormErrors,
    setSubmitting,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/User_Api/userSlice";
import UserFormBody from "./UserFormBody";

const WH_ROLES = ["WH_MANAGER", "WH_STOCK_LISTER"];
const SHOP_ROLES = ["SHOP_OWNER", "BILLING_STAFF", "SHOP_STOCK_LISTER"];

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^])[A-Za-z\d@$!%*?&_#^]{8,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function UserAddForm({ formData, formErrors, onSave }) {
    const dispatch = useDispatch();
    const [createUser, { isLoading }] = useCreateUserMutation();

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        const role = formData.role;

        if (!formData.name?.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.phone?.trim()) {
            errors.phone = "Phone is required";
        } else if (!PHONE_REGEX.test(formData.phone.trim())) {
            errors.phone = "Enter a valid 10-digit Indian mobile number";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (!PASSWORD_REGEX.test(formData.password)) {
            errors.password = "Min 8 chars with uppercase, lowercase, digit, and special character";
        }

        if (!role) {
            errors.role = "Role is required";
        }

        // if (WH_ROLES.includes(role) && !formData.warehouse_id?.trim()) {
        //     errors.warehouse_id = "Warehouse ID is required for this role";
        // }

        // if (SHOP_ROLES.includes(role) && !formData.shop_id?.trim()) {
        //     errors.shop_id = "Shop ID is required for this role";
        // }

        return errors;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        dispatch(clearFormErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setFormErrors(errors));
            return;
        }

        dispatch(setSubmitting(true));
        try {
            const role = formData.role;
            // const payload = {
            //     name: formData.name.trim(),
            //     phone: formData.phone.trim(),
            //     password: formData.password,
            //     role,
            //     remarks: formData.remarks?.trim() || undefined,
            // };

            // // Only attach the relevant ID — backend rejects invalid combos
            // if (WH_ROLES.includes(role)) payload.warehouse_id = formData.warehouse_id.trim();
            // if (SHOP_ROLES.includes(role)) payload.shop_id = formData.shop_id.trim();
            // Instead of sending empty string, only include field if it has value

            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
                role,
                remarks: formData.remarks?.trim() || undefined,
            };

            // Only attach if value exists (not empty string)
            if (WH_ROLES.includes(role) && formData.warehouse_id?.trim()) {
                payload.warehouse_id = formData.warehouse_id.trim();
            }
            if (SHOP_ROLES.includes(role) && formData.shop_id?.trim()) {
                payload.shop_id = formData.shop_id.trim();
            }
            await createUser(payload).unwrap();
            onSave();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const backendErrors = {};
                err.data.errors.forEach(({ field, message }) => {
                    backendErrors[field] = message;
                });
                dispatch(setFormErrors(backendErrors));
            } else {
                dispatch(setFormErrors({ general: err?.data?.message || "Failed to create user" }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800">Add New User</h3>
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

                {/* Form Fields */}
                <UserFormBody
                    formData={formData}
                    onChange={(data) => dispatch(updateFormData(data))}
                    formErrors={formErrors}
                    isEdit={false}
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
                        {isLoading ? "Creating…" : "Create User"}
                    </button>
                </div>

            </div>
        </div>
    );
}