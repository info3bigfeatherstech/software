// TABS/SETTINGS/UserShared/UserEditForm.jsx
//
// Responsibility:
//   PUT  /users/:userId          — update name, role, assignment, remarks
//   PATCH /users/:userId/status  — activate / deactivate
//   POST /users/:userId/reset-password — reset password
//
// All three actions live in this one modal with separate buttons.

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    useUpdateUserMutation,
    usePatchUserStatusMutation,
    useResetUserPasswordMutation,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/User_Api/userApi";
import {
    closeEditForm,
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

export default function UserEditForm({ formData, formErrors, selectedUser, onSave }) {
    const dispatch = useDispatch();

    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
    const [patchStatus, { isLoading: isPatching }] = usePatchUserStatusMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();

    // Local state for reset password section
    const [resetPass, setResetPass] = useState("");
    const [resetPassErr, setResetPassErr] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

    // ── Update Validation ──────────────────────────────────────────────────────
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

        // Password only validated if provided (optional on edit)
        // if (formData.password && !PASSWORD_REGEX.test(formData.password)) {
        //     errors.password = "Min 8 chars with uppercase, lowercase, digit, and special character";
        // }
        if (formData.password) {
            errors.password = "Min 8 chars with uppercase, lowercase, digit, and special character";
        }

        if (!role) {
            errors.role = "Role is required";
        }

        if (WH_ROLES.includes(role) && !formData.warehouse_id?.trim()) {
            errors.warehouse_id = "Warehouse ID is required for this role";
        }

        if (SHOP_ROLES.includes(role) && !formData.shop_id?.trim()) {
            errors.shop_id = "Shop ID is required for this role";
        }

        return errors;
    };

    // ── Handle Update (PUT) ────────────────────────────────────────────────────
    const handleUpdate = async () => {
        dispatch(clearFormErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setFormErrors(errors));
            return;
        }

        dispatch(setSubmitting(true));
        try {
            const role = formData.role;
            const payload = {
                userId: selectedUser.user_id,
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                role,
                remarks: formData.remarks?.trim() || undefined,
            };

            // Include password only if user typed a new one
            if (formData.password) payload.password = formData.password;

            // Role-aware assignment — only attach relevant ID
            if (WH_ROLES.includes(role)) payload.warehouse_id = formData.warehouse_id.trim();
            if (SHOP_ROLES.includes(role)) payload.shop_id = formData.shop_id.trim();

            await updateUser(payload).unwrap();
            onSave();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const backendErrors = {};
                err.data.errors.forEach(({ field, message }) => {
                    backendErrors[field] = message;
                });
                dispatch(setFormErrors(backendErrors));
            } else {
                dispatch(setFormErrors({ general: err?.data?.message || "Failed to update user" }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    // ── Handle Status Toggle (PATCH) ───────────────────────────────────────────
    const handleStatusToggle = async () => {
        const newStatus = !selectedUser.is_active;
        const label = newStatus ? "activate" : "deactivate";
        if (!window.confirm(`Are you sure you want to ${label} this user?`)) return;

        try {
            await patchStatus({ userId: selectedUser.user_id, is_active: newStatus }).unwrap();
            onSave();
        } catch (err) {
            alert(err?.data?.message || `Failed to ${label} user`);
        }
    };

    // ── Handle Reset Password (POST) ──────────────────────────────────────────
    const handleResetPassword = async () => {
        setResetPassErr("");
        setResetSuccess(false);

        if (!resetPass) {
            setResetPassErr("New password is required");
            return;
        }
        if (!PASSWORD_REGEX.test(resetPass)) {
            setResetPassErr("Min 8 chars with uppercase, lowercase, digit, and special character");
            return;
        }

        try {
            await resetPassword({ userId: selectedUser.user_id, new_password: resetPass }).unwrap();
            setResetPass("");
            setResetSuccess(true);
        } catch (err) {
            setResetPassErr(err?.data?.message || "Failed to reset password");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Edit User</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {selectedUser?.name} — {selectedUser?.role}
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(closeEditForm())}
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

                {/* ── Section 1: Update Details ────────────────────────────────── */}
                <UserFormBody
                    formData={formData}
                    onChange={(data) => dispatch(updateFormData(data))}
                    formErrors={formErrors}
                    isEdit={true}
                />

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={() => dispatch(closeEditForm())}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                    >
                        {isUpdating ? "Saving…" : "Save Changes"}
                    </button>
                </div>

                {/* ── Section 2: Activate / Deactivate ────────────────────────── */}
                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Account Status</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Current:{" "}
                                <span className={selectedUser?.is_active ? "text-green-600 font-medium" : "text-gray-400 font-medium"}>
                                    {selectedUser?.is_active ? "Active" : "Inactive"}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={handleStatusToggle}
                            disabled={isPatching}
                            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-60 ${selectedUser?.is_active
                                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                                }`}
                        >
                            {isPatching
                                ? "Updating…"
                                : selectedUser?.is_active
                                    ? "Deactivate User"
                                    : "Activate User"}
                        </button>
                    </div>
                </div>

                {/* ── Section 3: Reset Password ────────────────────────────────── */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Reset Password</p>
                    {resetSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                            <p className="text-sm text-green-600">Password reset successfully.</p>
                        </div>
                    )}
                    <div className="flex gap-3 items-start text-gray-700">
                        <div className="flex-1">
                            <input
                                type="password"
                                value={resetPass}
                                onChange={(e) => { setResetPass(e.target.value); setResetPassErr(""); setResetSuccess(false); }}
                                placeholder="New password for this user"
                                autoComplete="new-password"
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${resetPassErr ? "border-red-400" : "border-gray-300"
                                    }`}
                            />
                            {resetPassErr && <p className="text-xs text-red-500 mt-1">{resetPassErr}</p>}
                        </div>
                        <button
                            onClick={handleResetPassword}
                            disabled={isResetting}
                            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                        >
                            {isResetting ? "Resetting…" : "Reset Password"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">
                        This also revokes all active sessions for this user.
                    </p>
                </div>

            </div>
        </div>
    );
}