import React from "react";

export default function WarehouseProfileFormBody({ formData, onChange, formErrors }) {
    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors?.[name] ? "border-red-400" : "border-gray-300"
        }`;

    const readOnlyCls =
        "w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-600 border-gray-200 cursor-not-allowed";

    const errorMsg = (name) =>
        formErrors?.[name] ? (
            <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>
        ) : null;

    return (
        <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse Code</label>
                <input value={formData.warehouse_code || ""} disabled className={readOnlyCls} />
                <p className="text-xs text-gray-400 mt-1">Set by admin — cannot be changed</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse Name</label>
                <input value={formData.warehouse_name || ""} disabled className={readOnlyCls} />
                <p className="text-xs text-gray-400 mt-1">Set by admin — cannot be changed</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input value={formData.city || ""} disabled className={readOnlyCls} />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Manager Name</label>
                <input
                    value={formData.manager_name || ""}
                    onChange={(e) => onChange({ manager_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className={inputCls("manager_name")}
                />
                {errorMsg("manager_name")}
            </div>

            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Address <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.address || ""}
                    onChange={(e) => onChange({ address: e.target.value })}
                    rows={3}
                    placeholder="Full warehouse address"
                    className={`${inputCls("address")} resize-none`}
                />
                {errorMsg("address")}
            </div>

            {formData.remarks ? (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        {formData.remarks}
                    </p>
                </div>
            ) : null}

            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <input
                    value={formData.is_active ? "Active" : "Inactive"}
                    disabled
                    className={readOnlyCls}
                />
            </div>
        </div>
    );
}
