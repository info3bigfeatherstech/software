import React, { useState, useEffect } from "react";
import {
    useCreateWarehouseExpenseMutation,
    useUpdateWarehouseExpenseMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseFinanceApi";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../purchaseFinanceUtils";

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ExpenseFormModal({ open, onClose, onSaved, expense, warehouseId }) {
    const [createExpense, { isLoading: creating }] = useCreateWarehouseExpenseMutation();
    const [updateExpense, { isLoading: updating }] = useUpdateWarehouseExpenseMutation();
    const isEdit = Boolean(expense);

    const [form, setForm] = useState({
        category: "RENT",
        description: "",
        amount: "",
        expense_date: todayIso(),
        payment_method: "",
        reference_no: "",
        remarks: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        if (expense) {
            setForm({
                category: expense.category || "OTHER",
                description: expense.description || "",
                amount: String(expense.amount ?? ""),
                expense_date: expense.expense_date ? new Date(expense.expense_date).toISOString().slice(0, 10) : todayIso(),
                payment_method: expense.payment_method || "",
                reference_no: expense.reference_no || "",
                remarks: expense.remarks || "",
            });
        } else {
            setForm({
                category: "RENT",
                description: "",
                amount: "",
                expense_date: todayIso(),
                payment_method: "",
                reference_no: "",
                remarks: "",
            });
        }
        setErrors({});
    }, [open, expense]);

    const validate = () => {
        const e = {};
        if (!warehouseId) e.general = "Select a warehouse before saving";
        if (!form.description.trim()) e.description = "Description is required";
        if (!form.amount || Number(form.amount) <= 0) e.amount = "Valid amount is required";
        if (!form.expense_date) e.expense_date = "Date is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const payload = {
            warehouse_id: warehouseId || undefined,
            category: form.category,
            description: form.description.trim(),
            amount: Number(form.amount),
            expense_date: form.expense_date,
            payment_method: form.payment_method || undefined,
            reference_no: form.reference_no.trim() || undefined,
            remarks: form.remarks.trim() || undefined,
        };
        try {
            if (isEdit) {
                await updateExpense({ expenseId: expense.expense_id, ...payload }).unwrap();
            } else {
                await createExpense(payload).unwrap();
            }
            onSaved();
            onClose();
        } catch (err) {
            setErrors({ general: err?.data?.message || "Failed to save expense" });
        }
    };

    if (!open) return null;

    const field = (name) => ({
        value: form[name],
        onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
    });

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto text-gray-700">
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
                    <h3 className="text-base font-semibold text-gray-800">
                        {isEdit ? "Edit Expense" : "Add Expense"}
                    </h3>
                    {errors.general && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{errors.general}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Category</label>
                            <select {...field("category")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                {EXPENSE_CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Description *</label>
                            <input {...field("description")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Amount (₹) *</label>
                            <input type="number" min="0" step="0.01" {...field("amount")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Date *</label>
                            <input type="date" {...field("expense_date")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Paid via</label>
                            <select {...field("payment_method")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                                <option value="">—</option>
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Reference</label>
                            <input {...field("reference_no")} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500">Remarks</label>
                            <textarea {...field("remarks")} rows={2} className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={creating || updating}
                            className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg disabled:opacity-60"
                        >
                            {creating || updating ? "Saving…" : isEdit ? "Update" : "Save Expense"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
