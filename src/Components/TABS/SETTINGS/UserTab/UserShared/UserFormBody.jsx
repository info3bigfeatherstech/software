// TABS/SETTINGS/UserShared/UserFormBody.jsx
//
// Pure presentational component.
// Role-aware: shows warehouse_id OR shop_id OR neither based on selected role.
// Both AddForm and EditForm import this.

import React from "react";

export const USER_ROLES = [
    { value: "SUPER_ADMIN", label: "Super Admin", color: "bg-purple-100 text-purple-700" },
    { value: "WH_MANAGER", label: "Warehouse Manager", color: "bg-indigo-100 text-indigo-700" },
    { value: "WH_STOCK_LISTER", label: "WH Stock Lister", color: "bg-blue-100 text-blue-700" },
    { value: "SHOP_OWNER", label: "Shop Owner", color: "bg-green-100 text-green-700" },
    { value: "BILLING_STAFF", label: "Billing Staff", color: "bg-yellow-100 text-yellow-700" },
    { value: "SHOP_STOCK_LISTER", label: "Shop Stock Lister", color: "bg-orange-100 text-orange-700" },
];

const WH_ROLES = ["WH_MANAGER", "WH_STOCK_LISTER"];
const SHOP_ROLES = ["SHOP_OWNER", "BILLING_STAFF", "SHOP_STOCK_LISTER"];

export default function UserFormBody({ formData, onChange, formErrors, isEdit = false }) {
    const role = formData.role || "";
    const needsWH = WH_ROLES.includes(role);
    const needsShop = SHOP_ROLES.includes(role);

    const field = (name) => ({
        value: formData[name] ?? "",
        onChange: (e) => onChange({ [name]: e.target.value }),
    });

    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors?.[name] ? "border-red-400" : "border-gray-300"
        }`;

    const errorMsg = (name) =>
        formErrors?.[name] ? (
            <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>
        ) : null;

    return (
        <div className="grid grid-cols-2 gap-4 text-gray-700">

            {/* Name */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    {...field("name")}
                    placeholder="e.g. Ravi Kumar"
                    className={inputCls("name")}
                />
                {errorMsg("name")}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone <span className="text-red-500">*</span>
                </label>
                <input
                    {...field("phone")}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={inputCls("phone")}
                />
                {errorMsg("phone")}
            </div>

            {/* Password — required on Add, optional on Edit */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Password {!isEdit && <span className="text-red-500">*</span>}
                    {isEdit && <span className="text-gray-400 font-normal ml-1">(leave blank to keep current)</span>}
                </label>
                <input
                    type="password"
                    {...field("password")}
                    placeholder={isEdit ? "Enter new password to change" : "Min 8 chars, upper+lower+digit+special"}
                    className={inputCls("password")}
                    autoComplete="new-password"
                />
                {errorMsg("password")}
            </div>

            {/* Role */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Role <span className="text-red-500">*</span>
                </label>
                <select
                    value={formData.role || ""}
                    onChange={(e) => onChange({ role: e.target.value })}
                    className={inputCls("role")}
                >
                    {USER_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
                {errorMsg("role")}
            </div>

            {/* Warehouse ID — only for WH roles */}
            {needsWH && (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Warehouse ID <span className="text-gray-400">(optional for now)</span>
                    </label>
                    <input
                        {...field("warehouse_id")}
                        placeholder="e.g., clxyz123abc — can be updated later"
                        className={inputCls("warehouse_id")}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        You can assign warehouse after creation
                    </p>
                    {errorMsg("warehouse_id")}
                </div>
            )}

            {/* Shop ID — only for shop roles */}
            {needsShop && (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                        Shop ID <span className="text-gray-400">(optional for now)</span>
                    </label>
                    <input
                        {...field("shop_id")}
                        placeholder="e.g., clxyz456def — can be updated later"
                        className={inputCls("shop_id")}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        You can assign shop after creation
                    </p>
                    {errorMsg("shop_id")}
                </div>
            )}
            {/* SUPER_ADMIN note */}
            {role === "SUPER_ADMIN" && (
                <div className="col-span-2 bg-purple-50 border border-purple-100 rounded-lg px-4 py-2">
                    <p className="text-xs text-purple-600">
                        Super Admin has full system access — no warehouse or shop assignment needed.
                    </p>
                </div>
            )}

            {/* Remarks — full width */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                <textarea
                    {...field("remarks")}
                    placeholder="Optional notes about this user"
                    rows={2}
                    className={`${inputCls("remarks")} resize-none`}
                />
                {errorMsg("remarks")}
            </div>

        </div>
    );
}