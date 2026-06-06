import React from "react";
import { formatStateWithCode } from "../../../../constants/indianStateCodes";

const CHANNEL_LABELS = {
    WALK_IN: "Walk-in Store",
    ONLINE: "Online Store",
    WHOLESALE: "Wholesale",
    MHM: "MHM",
    OWB: "OWB (Online Wholesale)",
    OTHER: "Other",
};

export default function ShopProfileFormBody({ formData, onChange, formErrors }) {
    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            formErrors[name] ? "border-red-400" : "border-gray-300"
        }`;

    const readOnlyCls =
        "w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-600 border-gray-200 cursor-not-allowed";

    const errorMsg = (name) =>
        formErrors[name] ? (
            <p className="text-xs text-red-500 mt-1">{formErrors[name]}</p>
        ) : null;

    const channels = formData.sales_channels || [];

    return (
        <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Shop Code</label>
                <input value={formData.shop_code || ""} disabled className={readOnlyCls} />
                <p className="text-xs text-gray-400 mt-1">Set by admin — cannot be changed</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Shop Name</label>
                <input value={formData.shop_name || ""} disabled className={readOnlyCls} />
                <p className="text-xs text-gray-400 mt-1">Set by admin — cannot be changed</p>
            </div>

            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={formData.address || ""}
                    onChange={(e) => onChange({ address: e.target.value })}
                    rows={2}
                    placeholder="Full address of the shop"
                    className={`${inputCls("address")} resize-none`}
                />
                {errorMsg("address")}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input
                    value={formData.state_code ? formatStateWithCode(formData.state_code) : "Not set"}
                    disabled
                    className={readOnlyCls}
                />
                <p className="text-xs text-gray-400 mt-1">Set by admin — used as Place of Dispatch on bills</p>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                </label>
                <input
                    value={formData.city || ""}
                    onChange={(e) => onChange({ city: e.target.value })}
                    placeholder="e.g., Delhi"
                    className={inputCls("city")}
                />
                {errorMsg("city")}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                <input
                    value={formData.pincode || ""}
                    onChange={(e) => onChange({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className={inputCls("pincode")}
                />
                {errorMsg("pincode")}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                </label>
                <input
                    value={formData.phone || ""}
                    onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="10-digit number (shown on bills)"
                    maxLength={10}
                    className={inputCls("phone")}
                />
                {errorMsg("phone")}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => onChange({ email: e.target.value })}
                    placeholder="shop@example.com"
                    className={inputCls("email")}
                />
                {errorMsg("email")}
            </div>

            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Shop GSTIN</label>
                <input
                    value={formData.gst_number || ""}
                    onChange={(e) => onChange({ gst_number: e.target.value.toUpperCase() })}
                    placeholder="e.g., 07AABCU9603R1ZX"
                    maxLength={15}
                    className={`${inputCls("gst_number")} font-mono uppercase`}
                />
                {errorMsg("gst_number")}
                <p className="text-xs text-gray-400 mt-1">Required for GST tax invoices</p>
            </div>

            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-2">Sales Channels</label>
                <div className="flex flex-wrap gap-2">
                    {channels.length ? (
                        channels.map((channel) => (
                            <span
                                key={channel}
                                className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                            >
                                {CHANNEL_LABELS[channel] || channel}
                            </span>
                        ))
                    ) : (
                        <span className="text-sm text-gray-400">None configured</span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Managed by admin only</p>
            </div>

            {formData.remarks ? (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        {formData.remarks}
                    </p>
                </div>
            ) : null}

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <input
                    value={formData.is_active ? "Active" : "Inactive"}
                    disabled
                    className={readOnlyCls}
                />
            </div>
        </div>
    );
}
