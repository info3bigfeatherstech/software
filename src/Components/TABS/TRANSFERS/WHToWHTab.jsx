// TABS/TRANSFERS/WHToWHTab.jsx
// BizPro rule: WH→WH transfers require approval before stock changes hands.
import React, { useState, useEffect } from "react";
import { INITIAL_WAREHOUSES, INITIAL_PRODUCTS, INITIAL_TRANSFERS } from "../../demoData";
import { CURRENT_USER, filterByLocation, getControlledLocations, getVisibleLocations, isAdmin, isWarehouseRole } from "../../roles";

const SK = { T: "vyapar_transfers", P: "vyapar_products", W: "vyapar_warehouses" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };
const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));
const STATUS_CLS = { pending_approval: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };

export default function WHToWHTab() {
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [fromWH, setFromWH] = useState("");
    const [toWH, setToWH] = useState("");
    const [cart, setCart] = useState([]);
    const [reason, setReason] = useState("");

    useEffect(() => {
        const allWH = load(SK.W, INITIAL_WAREHOUSES);
        setWarehouses(getControlledLocations(allWH));
        setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        
        const all = load(SK.T, INITIAL_TRANSFERS);
        const scopedTransfers = isAdmin()
            ? all
            : all.filter(t => t.fromWarehouseId === CURRENT_USER.locationId || t.toWarehouseId === CURRENT_USER.locationId);
            
        setTransfers(scopedTransfers.filter(t => t.type === "WH_TO_WH"));

        if (!isAdmin() && isWarehouseRole()) {
            setFromWH(CURRENT_USER.locationId);
        }
    }, []);

    const addItem = (p) => setCart(prev => {
        const ex = prev.find(c => c.productId === p.id);
        if (ex) return prev.map(c => c.productId === p.id ? { ...c, qty: c.qty + 1 } : c);
        return [...prev, { productId: p.id, name: p.name, qty: 1, unit: p.unit || "Pcs" }];
    });

    const saveTransfer = () => {
        if (!fromWH || !toWH || fromWH === toWH || cart.length === 0) {
            alert("Select two different warehouses and add items."); return;
        }
        const all = load(SK.T, INITIAL_TRANSFERS);
        const rec = {
            id: `TR-${Date.now()}`, transferNumber: `WTW-${Date.now().toString().slice(-6)}`,
            type: "WH_TO_WH",
            fromWarehouseId: fromWH, fromWarehouseName: warehouses.find(w => w.id === fromWH)?.name,
            toWarehouseId: toWH, toWarehouseName: load(SK.W, INITIAL_WAREHOUSES).find(w => w.id === toWH)?.name,
            items: cart, status: "pending_approval",
            requestedBy: "Current User", approvedBy: null,
            createdAt: new Date().toISOString().split("T")[0], reason,
        };
        save(SK.T, [...all, rec]);
        setTransfers(prev => [rec, ...prev]);
        setCart([]); setFromWH(isAdmin() ? "" : CURRENT_USER.locationId); setToWH(""); setReason(""); setShowForm(false);
        alert("✅ Transfer submitted! Awaiting Super Admin approval.");
    };

    const updateStatus = (id, status) => {
        const all = load(SK.T, INITIAL_TRANSFERS);
        const updated = all.map(t => t.id === id ? { ...t, status, approvedBy: status === "approved" ? "Super Admin" : "Super Admin", completedAt: status === "completed" ? new Date().toISOString().split("T")[0] : null } : t);
        save(SK.T, updated);
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">WH → WH Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Requires Super Admin approval. Stock stays in-transit until confirmed.</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ New Transfer</button>
            </div>

            {/* Pending Approvals Banner */}
            {transfers.filter(t => t.status === "pending_approval").length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-3">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <p className="text-sm text-yellow-800 font-medium">
                        {transfers.filter(t => t.status === "pending_approval").length} transfer(s) awaiting approval
                    </p>
                </div>
            )}

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm text-gray-700">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Request WH → WH Transfer</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From Warehouse *</label>
                            <select 
                                value={fromWH} 
                                onChange={e => { setFromWH(e.target.value); setCart([]); }} 
                                disabled={!isAdmin() && isWarehouseRole()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select —</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To Warehouse *</label>
                            <select 
                                value={toWH} 
                                onChange={e => setToWH(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">— Select —</option>
                                {getVisibleLocations(load(SK.W, INITIAL_WAREHOUSES)).filter(w => w.id !== fromWH).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Reason for Transfer *</label>
                            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Capacity rebalancing, seasonal demand" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-2">Add Products</label>
                        <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2">
                            {products.map(p => (
                                <button key={p.id} onClick={() => addItem(p)} className="text-left p-2 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg text-xs cursor-pointer transition-colors">
                                    <p className="font-medium text-gray-800 truncate">{p.name}</p>
                                    <p className="text-gray-400">Stock: {p.stock}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-3 py-2 text-left text-xs text-gray-500">Product</th>
                                <th className="px-3 py-2 text-center text-xs text-gray-500">Qty</th>
                                <th className="px-3 py-2"></th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {cart.map(c => (
                                    <tr key={c.productId}>
                                        <td className="px-3 py-2 font-medium text-gray-700">{c.name}</td>
                                        <td className="px-3 py-2"><input type="number" min="1" value={c.qty} onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, qty: +e.target.value || 1 } : x))} className="w-16 px-2 py-1 border rounded text-center text-sm" /></td>
                                        <td className="px-3 py-2 text-center"><button onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))} className="text-red-500 text-xs cursor-pointer">✕</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => { setShowForm(false); setCart([]); }} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={saveTransfer} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Submit for Approval</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 text-sm">WH → WH Transfer Log</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["ID", "From WH", "To WH", "Items", "Date", "Reason", "Status", "Actions"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {transfers.length === 0
                            ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No inter-warehouse transfers yet</td></tr>
                            : transfers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.transferNumber || t.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{t.fromWarehouseName || t.fromWarehouseId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.toWarehouseName || t.toWarehouseId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.items?.length || 0}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.createdAt}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500 max-w-32 truncate">{t.reason || "—"}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[t.status] || "bg-gray-100 text-gray-600"}`}>{t.status?.replace(/_/g, " ")}</span></td>
                                    <td className="px-4 py-3">
                                        {t.status === "pending_approval" && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateStatus(t.id, "approved")} className="text-xs text-green-600 font-medium cursor-pointer hover:text-green-800">Approve</button>
                                                <button onClick={() => updateStatus(t.id, "rejected")} className="text-xs text-red-500 font-medium cursor-pointer hover:text-red-700">Reject</button>
                                            </div>
                                        )}
                                        {t.status === "approved" && (
                                            <button onClick={() => updateStatus(t.id, "completed")} className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-800">Mark Complete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
