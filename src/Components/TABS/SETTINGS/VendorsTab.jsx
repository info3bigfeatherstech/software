// TABS/SETTINGS/VendorsTab.jsx
// Full vendor master CRUD with outstanding balances and purchase history
import React, { useState, useEffect } from "react";
import { INITIAL_VENDORS } from "../../demoData";

const SK = "vyapar_vendors";
const load = () => { const s = localStorage.getItem(SK); if (s) return JSON.parse(s); localStorage.setItem(SK, JSON.stringify(INITIAL_VENDORS)); return INITIAL_VENDORS; };
const save = (d) => localStorage.setItem(SK, JSON.stringify(d));

const BLANK = { name: "", phone: "", email: "", city: "", address: "", gstin: "", contactPerson: "", creditDays: "30", isActive: true };

export default function VendorsTab() {
    const [vendors, setVendors] = useState([]);
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => setVendors(load()), []);

    const filtered = vendors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.city?.toLowerCase().includes(search.toLowerCase()) || v.phone?.includes(search));

    const saveVendor = () => {
        if (!form.name || !form.phone) { alert("Name and phone required."); return; }
        const all = load();
        if (editingId) {
            const updated = all.map(v => v.id === editingId ? { ...v, ...form } : v);
            save(updated);
            setVendors(updated);
        } else {
            const newV = { id: `VEN-${Date.now().toString().slice(-6)}`, ...form, outstanding: 0, totalPurchased: 0, createdAt: new Date().toISOString().split("T")[0] };
            save([...all, newV]);
            setVendors(prev => [...prev, newV]);
        }
        setForm(BLANK); setEditingId(null); setShowForm(false);
        alert(editingId ? "✅ Vendor updated!" : "✅ Vendor added!");
    };

    const startEdit = (v) => {
        setForm({ name: v.name, phone: v.phone, email: v.email || "", city: v.city || "", address: v.address || "", gstin: v.gst || v.gstin || "", contactPerson: v.contactPerson || "", creditDays: v.creditDays || "30", isActive: v.isActive !== false });
        setEditingId(v.id);
        setShowForm(true);
        setSelected(null);
    };

    const toggleActive = (id) => {
        const all = load();
        const updated = all.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
        save(updated);
        setVendors(updated);
        if (selected?.id === id) setSelected(updated.find(v => v.id === id));
    };

    const stats = {
        total: vendors.length,
        active: vendors.filter(v => v.isActive !== false).length,
        outstanding: vendors.reduce((s, v) => s + (v.outstanding || 0), 0),
        totalBusiness: vendors.reduce((s, v) => s + (v.totalPurchased || 0), 0),
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Vendor Master</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage all vendor/supplier records, GSTIN, and outstanding balances</p>
                </div>
                <button onClick={() => { setForm(BLANK); setEditingId(null); setShowForm(v => !v); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ Add Vendor</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { l: "Total Vendors", v: stats.total, c: "text-gray-800" },
                    { l: "Active", v: stats.active, c: "text-green-600" },
                    { l: "Total Outstanding", v: `₹${(stats.outstanding / 1000).toFixed(0)}K`, c: "text-red-600" },
                    { l: "Total Business", v: `₹${(stats.totalBusiness / 100000).toFixed(1)}L`, c: "text-blue-600" },
                ].map(s => (
                    <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.l}</p>
                        <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="bg-white text-gray-700 border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{editingId ? "Edit Vendor" : "Add New Vendor"}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { k: "name", l: "Vendor / Company Name *" },
                            { k: "phone", l: "Phone *" },
                            { k: "email", l: "Email" },
                            { k: "city", l: "City" },
                            { k: "address", l: "Address" },
                            { k: "gstin", l: "GSTIN" },
                            { k: "contactPerson", l: "Contact Person" },
                            { k: "creditDays", l: "Credit Days" },
                        ].map(f => (
                            <div key={f.k}>
                                <label className="block text-xs text-gray-500 mb-1">{f.l}</label>
                                <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => { setShowForm(false); setForm(BLANK); setEditingId(null); }} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={saveVendor} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">{editingId ? "Update Vendor" : "Add Vendor"}</button>
                    </div>
                </div>
            )}

            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors by name, city, or phone..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["Vendor", "Contact", "City", "GSTIN", "Outstanding", "Credit Days", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0
                            ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No vendors found</td></tr>
                            : filtered.map(v => (
                                <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${v.isActive === false ? "opacity-60" : ""}`}>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{v.name}</p>
                                        <p className="text-xs text-gray-400">{v.contactPerson || "—"}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        <p className="text-gray-600">{v.phone}</p>
                                        <p className="text-gray-400">{v.email || "—"}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{v.city || "—"}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.gst || v.gstin || "—"}</td>
                                    <td className="px-4 py-3">
                                        {(v.outstanding || 0) > 0
                                            ? <span className="text-red-600 font-medium">₹{v.outstanding?.toLocaleString()}</span>
                                            : <span className="text-green-600 text-xs font-medium">Cleared</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{v.creditDays || 30} days</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {v.isActive !== false ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(v)} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">Edit</button>
                                            <button onClick={() => toggleActive(v.id)} className={`text-xs cursor-pointer font-medium ${v.isActive !== false ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}>
                                                {v.isActive !== false ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
