import React, { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { useGetDebitNotesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/DebitNote_api/debitNoteApi";
import CreateDebitNoteModal from "./CreateDebitNoteModal";
import DebitNoteViewModal from "./DebitNoteViewModal";

const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_BADGE = {
    ISSUED: "bg-green-50 text-green-700 border border-green-200",
    CANCELLED: "bg-gray-100 text-gray-600 border border-gray-200",
};

const TYPE_LABELS = {
    SHORTAGE: "Shortage",
    DEFECTIVE: "Defective",
    RATE_DIFFERENCE: "Rate diff.",
    OTHER: "Other",
};

export default function PurchaseReturnsTab() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [type, setType] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [viewId, setViewId] = useState(null);

    const { data, isLoading, refetch } = useGetDebitNotesQuery({
        page: 1,
        limit: 50,
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
    });

    const debitNotes = data?.debitNotes || [];
    const summary = data?.summary || {};
    const issuedTotal = summary.issued_total_amount ?? 0;
    const issuedCount = summary.issued_count ?? debitNotes.filter((d) => d.status === "ISSUED").length;

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Purchase Return / Dr. Note</h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Debit notes raised by warehouse against vendors (purchase shortage / defective)
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Plus size={14} /> New Debit Note
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Issued debit notes</p>
                    <p className="text-3xl font-bold text-gray-800">{issuedCount}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Issued value</p>
                    <p className="text-3xl font-bold text-gray-800">{fmtCurrency(issuedTotal)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">Listed</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.meta?.total ?? debitNotes.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-gray-500">With stock return</p>
                    <p className="text-3xl font-bold text-gray-800">
                        {debitNotes.filter((d) => d.return_stock).length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search DN no, vendor, purchase..."
                        className="flex-1 min-w-[180px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All status</option>
                        <option value="ISSUED">Issued</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All types</option>
                        <option value="SHORTAGE">Shortage</option>
                        <option value="DEFECTIVE">Defective</option>
                        <option value="RATE_DIFFERENCE">Rate difference</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Debit notes</span>
                    {isLoading && <span className="text-xs text-gray-400">Loading...</span>}
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">DN No</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Vendor</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Purchase</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Type</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-right">Amount</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Stock</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-left">Date</th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                        {debitNotes.map((row) => (
                            <tr key={row.debit_note_id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs">{row.debit_note_number}</td>
                                <td className="px-4 py-3">{row.vendor?.company_name}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                    {row.original_purchase?.purchase_number}
                                </td>
                                <td className="px-4 py-3">{TYPE_LABELS[row.type] || row.type}</td>
                                <td className="px-4 py-3 text-right font-semibold">{fmtCurrency(row.debit_amount)}</td>
                                <td className="px-4 py-3 text-xs">{row.return_stock ? "Returned" : "—"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[row.status] || ""}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(row.created_at)}</td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setViewId(row.debit_note_id)}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                                        title="View"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && !debitNotes.length && (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                                    No debit notes yet. Create one against a purchase entry.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreate && (
                <CreateDebitNoteModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => refetch()}
                />
            )}
            {viewId && (
                <DebitNoteViewModal debitNoteId={viewId} onClose={() => setViewId(null)} />
            )}
        </div>
    );
}
