import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import {
    useCreateDebitNoteMutation,
    useLazyGetPurchaseReturnableLinesQuery,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/DebitNote_api/debitNoteApi";
import { useGetPurchaseEntriesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Purchase_api/purchaseApi";

const DEBIT_TYPES = [
    { value: "SHORTAGE", label: "Shortage (not received / invoice mismatch)" },
    { value: "DEFECTIVE", label: "Defective — return stock to vendor" },
    { value: "RATE_DIFFERENCE", label: "Rate / billing difference" },
    { value: "OTHER", label: "Other" },
];

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function CreateDebitNoteModal({ onSuccess, onClose }) {
    const [purchaseSearch, setPurchaseSearch] = useState("");
    const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
    const [lineQty, setLineQty] = useState({});
    const [type, setType] = useState("SHORTAGE");
    const [reason, setReason] = useState("");

    const { data: purchaseData, isFetching: loadingPurchases } = useGetPurchaseEntriesQuery({
        page: 1,
        limit: 30,
        search: purchaseSearch || undefined,
        status: "RECEIVED",
    });

    const [fetchReturnable, { data: returnable, isFetching: loadingLines }] =
        useLazyGetPurchaseReturnableLinesQuery();

    const [createDebitNote, { isLoading: isCreating }] = useCreateDebitNoteMutation();

    const purchases = purchaseData?.purchases || [];

    useEffect(() => {
        if (!selectedPurchaseId) return;
        fetchReturnable(selectedPurchaseId);
        setLineQty({});
    }, [selectedPurchaseId, fetchReturnable]);

    const lines = returnable?.lines || [];

    const estimatedTotal = useMemo(() => {
        let sub = 0;
        let tax = 0;
        for (const line of lines) {
            const qty = Number(lineQty[line.purchase_item_id] || 0);
            if (qty <= 0) continue;
            const lineSub = qty * Number(line.purchase_cost || 0);
            const rate = Number(line.gst_percent || 0);
            const lineTax = rate > 0 ? (lineSub * rate) / 100 : 0;
            sub += lineSub;
            tax += lineTax;
        }
        return { subtotal: sub, tax, total: sub + tax };
    }, [lines, lineQty]);

    const handleQtyChange = (purchaseItemId, value, max) => {
        const n = Math.max(0, Math.min(max, parseInt(value, 10) || 0));
        setLineQty((prev) => ({ ...prev, [purchaseItemId]: n }));
    };

    const handleSubmit = async () => {
        if (!selectedPurchaseId) {
            toast.error("Select a purchase entry");
            return;
        }
        if (!reason.trim()) {
            toast.error("Enter a reason");
            return;
        }

        const items = lines
            .filter((l) => (lineQty[l.purchase_item_id] || 0) > 0)
            .map((l) => ({
                purchase_item_id: l.purchase_item_id,
                quantity: lineQty[l.purchase_item_id],
            }));

        if (!items.length) {
            toast.error("Enter return quantity for at least one line");
            return;
        }

        try {
            await createDebitNote({
                idempotencyKey: `dn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
                original_purchase_id: selectedPurchaseId,
                type,
                items,
                reason: reason.trim(),
                return_stock: type === "DEFECTIVE" ? true : undefined,
            }).unwrap();
            toast.success("Debit note created");
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err?.data?.message || err?.message || "Failed to create debit note";
            toast.error(msg);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">New Debit Note</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Find purchase (GRN)</label>
                        <input
                            type="text"
                            value={purchaseSearch}
                            onChange={(e) => setPurchaseSearch(e.target.value)}
                            placeholder="Purchase no / vendor invoice..."
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <select
                            value={selectedPurchaseId}
                            onChange={(e) => setSelectedPurchaseId(e.target.value)}
                            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            disabled={loadingPurchases}
                        >
                            <option value="">Select purchase entry...</option>
                            {purchases.map((p) => (
                                <option key={p.purchase_id} value={p.purchase_id}>
                                    {p.purchase_number} — {p.vendor?.company_name} — Inv {p.vendor_invoice_no}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Debit note type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            >
                                {DEBIT_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Est. debit amount</label>
                            <p className="mt-2 text-lg font-semibold text-gray-800">{fmtMoney(estimatedTotal.total)}</p>
                            <p className="text-xs text-gray-400">Taxable {fmtMoney(estimatedTotal.subtotal)} + GST {fmtMoney(estimatedTotal.tax)}</p>
                        </div>
                    </div>

                    {selectedPurchaseId && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                Return lines {loadingLines ? "(loading...)" : ""}
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs text-gray-400">Product</th>
                                        <th className="px-3 py-2 text-right text-xs text-gray-400">Purchased</th>
                                        <th className="px-3 py-2 text-right text-xs text-gray-400">Already DN</th>
                                        <th className="px-3 py-2 text-right text-xs text-gray-400">Return qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lines.map((line) => (
                                        <tr key={line.purchase_item_id}>
                                            <td className="px-3 py-2">
                                                <div className="font-medium text-gray-800">{line.product_name}</div>
                                                <div className="text-xs text-gray-400">{line.sku}</div>
                                            </td>
                                            <td className="px-3 py-2 text-right">{line.purchased_quantity}</td>
                                            <td className="px-3 py-2 text-right text-amber-700">{line.already_returned}</td>
                                            <td className="px-3 py-2 text-right">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={line.returnable_quantity}
                                                    value={lineQty[line.purchase_item_id] ?? ""}
                                                    onChange={(e) =>
                                                        handleQtyChange(
                                                            line.purchase_item_id,
                                                            e.target.value,
                                                            line.returnable_quantity
                                                        )
                                                    }
                                                    disabled={line.returnable_quantity <= 0}
                                                    className="w-20 border border-gray-200 rounded px-2 py-1 text-right text-sm"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingLines && !lines.length && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-gray-400 text-sm">
                                                No returnable lines on this purchase
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Reason *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            placeholder="Shortage / defective / rate difference details..."
                        />
                    </div>

                    {type === "DEFECTIVE" && (
                        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Defective return will deduct stock from warehouse (batch-wise) and record PURCHASE_RETURN in ledger.
                        </p>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        {isCreating ? "Creating..." : "Issue Debit Note"}
                    </button>
                </div>
            </div>
        </div>
    );
}
