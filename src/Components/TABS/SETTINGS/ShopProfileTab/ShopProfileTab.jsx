import React, { useEffect, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
    useGetMyShopQuery,
    useUpdateMyShopMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import ShopProfileFormBody from "./ShopProfileFormBody";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

const validate = (formData) => {
    const errors = {};
    if (!formData.address?.trim() || formData.address.trim().length < 2) {
        errors.address = "Address is required";
    }
    if (!formData.city?.trim() || formData.city.trim().length < 2) {
        errors.city = "City is required";
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        errors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.phone?.trim() || !/^[0-9]{10}$/.test(formData.phone.trim())) {
        errors.phone = "Phone must be a 10-digit number";
    }
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Enter a valid email";
    }
    if (formData.gst_number?.trim() && !GSTIN_RE.test(formData.gst_number.trim())) {
        errors.gst_number = "Enter a valid 15-character GSTIN";
    }
    return errors;
};

export default function ShopProfileTab() {
    const { data: myShop, isLoading, isFetching, refetch } = useGetMyShopQuery();
    const [updateMyShop, { isLoading: isSaving }] = useUpdateMyShopMutation();

    const [formData, setFormData] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (myShop) {
            setFormData({
                shop_code: myShop.shop_code || "",
                shop_name: myShop.shop_name || "",
                address: myShop.address || "",
                city: myShop.city || "",
                pincode: myShop.pincode || "",
                phone: myShop.phone || "",
                email: myShop.email || "",
                gst_number: myShop.gst_number || "",
                sales_channels: myShop.sales_channels || [],
                remarks: myShop.remarks || "",
                is_active: myShop.is_active ?? true,
            });
        }
    }, [myShop]);

    const handleChange = (patch) => {
        setFormData((prev) => ({ ...prev, ...patch }));
        const cleared = Object.keys(patch).reduce((acc, key) => {
            acc[key] = undefined;
            return acc;
        }, {});
        setFormErrors((prev) => {
            const next = { ...prev };
            Object.keys(cleared).forEach((k) => delete next[k]);
            return next;
        });
    };

    const handleSave = async () => {
        const errors = validate(formData);
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            toast.error("Please fix the highlighted fields");
            return;
        }

        try {
            await updateMyShop({
                address: formData.address.trim(),
                city: formData.city.trim(),
                pincode: formData.pincode?.trim() || null,
                phone: formData.phone.trim(),
                email: formData.email?.trim() || null,
                gst_number: formData.gst_number?.trim() || null,
            }).unwrap();
            toast.success("Shop profile updated");
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update shop profile");
        }
    };

    if (isLoading || !formData) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                Loading shop profile...
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Shop Profile</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View your shop details and update address, contact, and GSTIN for bills.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <ShopProfileFormBody
                    formData={formData}
                    onChange={handleChange}
                    formErrors={formErrors}
                />

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
