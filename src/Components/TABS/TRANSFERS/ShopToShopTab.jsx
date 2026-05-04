// TABS/TRANSFERS/ShopToShopTab.jsx
// BizPro rule: A shop can see another shop's available qty — but NEVER its sales data.
import React, { useState, useEffect } from "react";
import { INITIAL_SHOPS, INITIAL_PRODUCTS, INITIAL_TRANSFERS } from "../../demoData";
import { CURRENT_USER, filterByLocation, getControlledLocations, getVisibleLocations, isAdmin, isWarehouseRole } from "../../roles";

const SK = { T: "vyapar_transfers", P: "vyapar_products", S: "vyapar_shops" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };
const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));
const STATUS_CLS = { completed: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", approved: "bg-blue-100 text-blue-700", rejected: "bg-red-100 text-red-600" };

export default function ShopToShopTab() {
    const [shops, setShops] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [fromShop, setFromShop] = useState("");
    const [toShop, setToShop] = useState("");
    const [cart, setCart] = useState([]);
    const [reason, setReason] = useState("");

    useEffect(() => {
        const allShops = load(SK.S, INITIAL_SHOPS);
        setShops(getControlledLocations(allShops));
        setAllProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        
        const all = load(SK.T, INITIAL_TRANSFERS);
        const scopedTransfers = isAdmin()
            ? all
            : all.filter(t => t.fromShopId === CURRENT_USER.locationId || t.toShopId === CURRENT_USER.locationId);
            
        setTransfers(scopedTransfers.filter(t => t.type === "SHOP_TO_SHOP" || (t.fromShopId && t.toShopId && !t.fromWarehouseId)));

        if (!isAdmin() && !isWarehouseRole()) {
            setFromShop(CURRENT_USER.locationId);
        }
    }, []);

    // Only show available qty — never show sales data (BizPro rule)
    const shopProducts = fromShop ? allProducts.filter(p => p.shopId === fromShop) : [];

    const addItem = (p) => setCart(prev => {
        const ex = prev.find(c => c.productId === p.id);
        if (ex) return prev.map(c => c.productId === p.id ? { ...c, qty: c.qty + 1 } : c);
        return [...prev, { productId: p.id, name: p.name, qty: 1, availableQty: p.stock, unit: p.unit || "Pcs" }];
    });

    const saveTransfer = () => {
        if (!fromShop || !toShop || fromShop === toShop || cart.length === 0) {
            alert("Select two different shops and add items."); return;
        }
        const overStock = cart.find(c => c.qty > c.availableQty);
        if (overStock) { alert(`Only ${overStock.availableQty} units of "${overStock.name}" available.`); return; }

        const all = load(SK.T, INITIAL_TRANSFERS);
        const rec = {
            id: `TR-${Date.now()}`, transferNumber: `STS-${Date.now().toString().slice(-6)}`,
            type: "SHOP_TO_SHOP",
            fromShopId: fromShop, fromShopName: load(SK.S, INITIAL_SHOPS).find(s => s.id === fromShop)?.name,
            toShopId: toShop, toShopName: load(SK.S, INITIAL_SHOPS).find(s => s.id === toShop)?.name,
            items: cart, status: "pending",
            requestedBy: "Current User", approvedBy: null,
            createdAt: new Date().toISOString().split("T")[0], reason,
        };
        save(SK.T, [...all, rec]);
        setTransfers(prev => [rec, ...prev]);
        setCart([]); setFromShop(isAdmin() || isWarehouseRole() ? "" : CURRENT_USER.locationId); setToShop(""); setReason(""); setShowForm(false);
        alert("✅ Transfer request raised! Awaiting approval.");
    };

    const approve = (id) => {
        const all = load(SK.T, INITIAL_TRANSFERS);
        const updated = all.map(t => t.id === id ? { ...t, status: "approved", approvedBy: "Super Admin" } : t);
        save(SK.T, updated);
        setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: "approved" } : t));
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Shop → Shop Transfer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Only available qty is visible — sales data is never shared between shops</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ New Transfer</button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm text-gray-700">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Create Shop Transfer</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From Shop *</label>
                            <select 
                                value={fromShop} 
                                onChange={e => { setFromShop(e.target.value); setCart([]); }} 
                                disabled={!isAdmin() && !isWarehouseRole()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select Source Shop —</option>
                                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To Shop *</label>
                            <select value={toShop} onChange={e => setToShop(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">— Select Destination Shop —</option>
                                {getVisibleLocations(load(SK.S, INITIAL_SHOPS)).filter(s => s.id !== fromShop).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Reason</label>
                            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Urgent demand, excess stock" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>

                    {fromShop && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs text-gray-500">Products at {load(SK.S, INITIAL_SHOPS).find(s => s.id === fromShop)?.name}</label>
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Showing available qty only</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2">
                                {shopProducts.length === 0
                                    ? <p className="col-span-4 text-center text-xs text-gray-400 py-4">No products at this shop</p>
                                    : shopProducts.map(p => (
                                        <button key={p.id} onClick={() => addItem(p)} disabled={p.stock === 0}
                                            className={`text-left p-2 rounded-lg text-xs border transition-colors cursor-pointer ${p.stock === 0 ? "opacity-40 bg-gray-100 cursor-not-allowed" : "bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-200"}`}>
                                            <p className="font-medium text-gray-800 truncate">{p.name}</p>
                                            <p className={p.stock <= (p.lowStockAlert || 10) ? "text-red-500" : "text-green-600"}>Avail: {p.stock}</p>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}

                    {cart.length > 0 && (
                        <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-3 py-2 text-left text-xs text-gray-500">Product</th>
                                <th className="px-3 py-2 text-center text-xs text-gray-500">Transfer Qty</th>
                                <th className="px-3 py-2 text-center text-xs text-gray-500">Available</th>
                                <th className="px-3 py-2"></th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {cart.map(c => (
                                    <tr key={c.productId}>
                                        <td className="px-3 py-2 font-medium text-gray-700">{c.name}</td>
                                        <td className="px-3 py-2"><input type="number" min="1" max={c.availableQty} value={c.qty} onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, qty: Math.min(+e.target.value, x.availableQty) } : x))} className="w-16 px-2 py-1 border rounded text-center text-sm" /></td>
                                        <td className="px-3 py-2 text-center text-xs text-gray-400">{c.availableQty}</td>
                                        <td className="px-3 py-2 text-center"><button onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))} className="text-red-500 text-xs cursor-pointer">✕</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => { setShowForm(false); setCart([]); }} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={saveTransfer} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Submit Transfer</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 text-sm">Shop-to-Shop Transfers</h3>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["ID", "From", "To", "Items", "Date", "Reason", "Status", ""].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {transfers.length === 0
                            ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No transfers yet</td></tr>
                            : transfers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.transferNumber || t.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{t.fromShopName || t.fromShopId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.toShopName || t.toShopId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.items?.length || 0}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.createdAt}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{t.reason || "—"}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[t.status] || "bg-gray-100 text-gray-600"}`}>{t.status}</span></td>
                                    <td className="px-4 py-3">
                                        {t.status === "pending" && (
                                            <button onClick={() => approve(t.id)} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">Approve</button>
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
