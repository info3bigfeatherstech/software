// TABS/SETTINGS/ShopsSettingsTab.jsx
// View all shops — GST numbers, bank details, managers.
import React, { useState, useEffect } from "react";
import { INITIAL_SHOPS } from "../../demoData";

const SK = "vyapar_shops";
const load = () => { const s = localStorage.getItem(SK); if (s) return JSON.parse(s); localStorage.setItem(SK, JSON.stringify(INITIAL_SHOPS)); return INITIAL_SHOPS; };
const save = (d) => localStorage.setItem(SK, JSON.stringify(d));

export default function ShopsSettingsTab() {
    const [shops, setShops] = useState([]);
    const [selected, setSelected] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newShop, setNewShop] = useState({ name: "", city: "", address: "", gstin: "", phone: "", manager: "", bank: "", isActive: true });

    useEffect(() => setShops(load()), []);

    const saveEdit = () => {
        const allShops = load();
        const updated = allShops.map(s => s.id === editForm.id ? { ...s, ...editForm } : s);
        save(updated);
        setShops(updated);
        setSelected(editForm);
        setEditMode(false);
        alert("✅ Shop updated!");
    };

    const addShop = () => {
        if (!newShop.name || !newShop.city) { alert("Name and city are required."); return; }
        const allShops = load();
        const s = { id: `SHP-${Date.now().toString().slice(-6)}`, ...newShop, createdAt: new Date().toISOString().split("T")[0] };
        save([...allShops, s]);
        setShops(prev => [...prev, s]);
        setNewShop({ name: "", city: "", address: "", gstin: "", phone: "", manager: "", bank: "", isActive: true });
        setShowAddForm(false);
        alert("✅ Shop added!");
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Shop Configuration</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage shop details, GST numbers, and bank accounts</p>
                </div>
                <button onClick={() => setShowAddForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ Add Shop</button>
            </div>

            {showAddForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Add New Shop</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[{ k: "name", l: "Shop Name *" }, { k: "city", l: "City *" }, { k: "address", l: "Full Address" }, { k: "gstin", l: "GSTIN" }, { k: "phone", l: "Contact Phone" }, { k: "manager", l: "Manager Name" }, { k: "bank", l: "Bank Account" }].map(f => (
                            <div key={f.k}>
                                <label className="block text-xs text-gray-500 mb-1">{f.l}</label>
                                <input value={newShop[f.k]} onChange={e => setNewShop(s => ({ ...s, [f.k]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={addShop} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Add Shop</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-5">
                {/* Shop list */}
                <div className="col-span-1 space-y-2">
                    {shops.map(s => (
                        <div key={s.id} onClick={() => { setSelected(s); setEditMode(false); }}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${selected?.id === s.id ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.city}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {s.isActive !== false ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-gray-400 mt-1.5">{s.gstin || "No GSTIN"}</p>
                        </div>
                    ))}
                </div>

                {/* Detail panel */}
                <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    {!selected ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <p className="text-4xl mb-3">🏪</p>
                            <p className="text-sm">Select a shop to view details</p>
                        </div>
                    ) : editMode ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-800">Edit: {selected.name}</p>
                                <button onClick={() => setEditMode(false)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">✕ Cancel</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[{ k: "name", l: "Shop Name" }, { k: "city", l: "City" }, { k: "address", l: "Address" }, { k: "gstin", l: "GSTIN" }, { k: "phone", l: "Phone" }, { k: "manager", l: "Manager" }, { k: "bank", l: "Bank Account" }].map(f => (
                                    <div key={f.k}>
                                        <label className="block text-xs text-gray-500 mb-1">{f.l}</label>
                                        <input value={editForm[f.k] || ""} onChange={e => setEditForm(s => ({ ...s, [f.k]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <button onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-lg text-sm cursor-pointer">Cancel</button>
                                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Save Changes</button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">{selected.name}</h3>
                                <button onClick={() => { setEditForm({ ...selected }); setEditMode(true); }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Edit</button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {[
                                    { l: "Shop ID", v: selected.id, mono: true },
                                    { l: "City", v: selected.city },
                                    { l: "Address", v: selected.address || "—" },
                                    { l: "GSTIN", v: selected.gstin || "—", mono: true },
                                    { l: "Phone", v: selected.phone || "—" },
                                    { l: "Manager", v: selected.manager || "—" },
                                    { l: "Bank Account", v: selected.bank || "—", mono: true },
                                    { l: "Status", v: selected.isActive !== false ? "Active" : "Inactive" },
                                ].map(f => (
                                    <div key={f.l} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">{f.l}</p>
                                        <p className={`text-gray-700 font-medium ${f.mono ? "font-mono text-xs" : ""}`}>{f.v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
