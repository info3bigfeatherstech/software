import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import {
    useCreateShopBankAccountMutation,
    useUpdateShopBankAccountMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";

const EMPTY_FORM = {
    account_holder_name: "",
    bank_name: "",
    branch_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    is_default: false,
    remarks: "",
};

export default function BankAccountFormModal({ shopId, account, onClose, onSuccess }) {
    const isEdit = Boolean(account?.bank_account_id);
    const [form, setForm] = useState(EMPTY_FORM);

    const [createAccount, { isLoading: isCreating }] = useCreateShopBankAccountMutation();
    const [updateAccount, { isLoading: isUpdating }] = useUpdateShopBankAccountMutation();

    useEffect(() => {
        if (account) {
            setForm({
                account_holder_name: account.account_holder_name || "",
                bank_name: account.bank_name || "",
                branch_name: account.branch_name || "",
                account_number: "",
                ifsc_code: account.ifsc_code || "",
                upi_id: account.upi_id || "",
                is_default: Boolean(account.is_default),
                remarks: account.remarks || "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [account]);

    const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shopId) {
            toast.error("Select a shop first");
            return;
        }

        const payload = {
            account_holder_name: form.account_holder_name.trim(),
            bank_name: form.bank_name.trim(),
            branch_name: form.branch_name.trim() || null,
            ifsc_code: form.ifsc_code.trim().toUpperCase(),
            upi_id: form.upi_id.trim(),
            is_default: form.is_default,
            remarks: form.remarks.trim() || null,
        };

        if (form.account_number.trim()) {
            payload.account_number = form.account_number.trim().replace(/\s/g, "");
        } else if (!isEdit) {
            toast.error("Account number is required");
            return;
        }

        try {
            if (isEdit) {
                await updateAccount({
                    shopId,
                    bankAccountId: account.bank_account_id,
                    ...payload,
                }).unwrap();
                toast.success("Bank account updated");
            } else {
                await createAccount({ shopId, ...payload }).unwrap();
                toast.success("Bank account added");
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to save bank account");
        }
    };

    const isSaving = isCreating || isUpdating;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
                        <h3 className="text-base font-semibold text-gray-800">
                            {isEdit ? "Edit Bank Account" : "Add Bank Account"}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Account Holder Name *</label>
                            <input
                                required
                                value={form.account_holder_name}
                                onChange={(e) => setField("account_holder_name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Bank Name *</label>
                                <input
                                    required
                                    value={form.bank_name}
                                    onChange={(e) => setField("bank_name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                                <input
                                    value={form.branch_name}
                                    onChange={(e) => setField("branch_name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Account Number {isEdit ? "(leave blank to keep unchanged)" : "*"}
                            </label>
                            <input
                                required={!isEdit}
                                value={form.account_number}
                                onChange={(e) => setField("account_number", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                placeholder={isEdit ? account?.account_number_masked : ""}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">IFSC Code *</label>
                                <input
                                    required
                                    value={form.ifsc_code}
                                    onChange={(e) => setField("ifsc_code", e.target.value.toUpperCase())}
                                    maxLength={11}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">UPI ID *</label>
                                <input
                                    required
                                    value={form.upi_id}
                                    onChange={(e) => setField("upi_id", e.target.value)}
                                    placeholder="shop@bank"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.is_default}
                                onChange={(e) => setField("is_default", e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Set as default account for UPI billing
                        </label>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
                            <input
                                value={form.remarks}
                                onChange={(e) => setField("remarks", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                            >
                                {isSaving ? "Saving…" : isEdit ? "Update Account" : "Add Account"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
