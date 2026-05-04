// TABS/TRANSFERS/WHToShopTab.jsx
import React, { useState, useEffect } from "react";
import { INITIAL_WAREHOUSES, INITIAL_SHOPS, INITIAL_PRODUCTS, INITIAL_TRANSFERS } from "../../demoData";
import { CURRENT_USER, filterByLocation, getControlledLocations, getVisibleLocations, isAdmin, isWarehouseRole } from "../../roles";

const SK = { T: "vyapar_transfers", P: "vyapar_products", S: "vyapar_shops", W: "vyapar_warehouses" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };
const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));

const STATUS_CLS = { dispatched: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700" };

export default function WHToShopTab() {
    const [warehouses, setWarehouses] = useState([]);
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [fromWH, setFromWH] = useState("");
    const [toShop, setToShop] = useState("");
    const [cart, setCart] = useState([]);
    const [reason, setReason] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const allWH = load(SK.W, INITIAL_WAREHOUSES);
        const allShops = load(SK.S, INITIAL_SHOPS);
        
        setWarehouses(getControlledLocations(allWH));
        setShops(getVisibleLocations(allShops));
        setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        
        const all = load(SK.T, INITIAL_TRANSFERS);
        // Scoping transfers
        const scopedTransfers = isAdmin() 
            ? all 
            : all.filter(t => t.fromWarehouseId === CURRENT_USER.locationId || t.toShopId === CURRENT_USER.locationId);
        
        setTransfers(scopedTransfers.filter(t => t.type === "WH_TO_SHOP"));

        // Auto-select for non-admins
        if (!isAdmin()) {
            if (isWarehouseRole()) setFromWH(CURRENT_USER.locationId);
            else setToShop(CURRENT_USER.locationId);
        }
    }, []);

    const addItem = (p) => {
        setCart(prev => {
            const ex = prev.find(c => c.productId === p.id);
            if (ex) return prev.map(c => c.productId === p.id ? { ...c, qty: c.qty + 1 } : c);
            return [...prev, { productId: p.id, name: p.name, qty: 1, unit: p.unit || "Pcs" }];
        });
    };

    const saveChallan = () => {
        if (!fromWH || !toShop || cart.length === 0) { alert("Select warehouse, shop, and add items."); return; }
        
        const allProducts = load(SK.P, INITIAL_PRODUCTS);
        const allTransfers = load(SK.T, INITIAL_TRANSFERS);

        // 1. Deduct stock from Warehouse
        const updatedProducts = allProducts.map(p => {
            const cartItem = cart.find(c => c.productId === p.id);
            // Verify if product is in the 'fromWH' warehouse
            if (cartItem && (p.locationId === fromWH || p.shopId === fromWH)) {
                if (p.stock < cartItem.qty) {
                    alert(`Not enough stock for ${p.name} in warehouse!`);
                    throw new Error("Insufficient stock");
                }
                return { ...p, stock: p.stock - cartItem.qty };
            }
            return p;
        });

        try {
            save(SK.P, updatedProducts);
            setProducts(updatedProducts);

            const rec = {
                id: `TR-${Date.now()}`, 
                transferNumber: `CHAL-${Date.now().toString().slice(-6)}`,
                type: "WH_TO_SHOP",
                fromWarehouseId: fromWH, fromWarehouseName: warehouses.find(w => w.id === fromWH)?.name,
                toShopId: toShop, toShopName: shops.find(s => s.id === toShop)?.name,
                items: cart, status: "dispatched",
                createdAt: new Date().toISOString().split("T")[0], 
                reason: reason || "Stock replenishment",
            };

            save(SK.T, [...allTransfers, rec]);
            setTransfers(prev => [rec, ...prev]);
            setCart([]); setFromWH(""); setToShop(""); setReason(""); setShowForm(false);
            alert("✅ Dispatch Challan created! Stock moved to In-Transit.");
        } catch (e) {
            console.error(e);
        }
    };

    const receiveStock = (transfer) => {
        if (transfer.status === "completed") return;

        const allProducts = load(SK.P, INITIAL_PRODUCTS);
        const allTransfers = load(SK.T, INITIAL_TRANSFERS);

        // 1. Add stock to the Shop
        const updatedProducts = [...allProducts];
        
        transfer.items.forEach(item => {
            const productInShop = updatedProducts.find(p => p.id === item.productId && (p.locationId === transfer.toShopId || p.shopId === transfer.toShopId));
            if (productInShop) {
                productInShop.stock = (productInShop.stock || 0) + item.qty;
            } else {
                const masterProduct = allProducts.find(p => p.id === item.productId);
                updatedProducts.push({
                    ...masterProduct,
                    stock: item.qty,
                    shopId: transfer.toShopId,
                    locationId: transfer.toShopId,
                    locationType: 'SHOP'
                });
            }
        });

        // 2. Mark transfer as completed
        const updatedTransfers = allTransfers.map(t => 
            t.id === transfer.id ? { ...t, status: "completed", completedAt: new Date().toISOString().split("T")[0] } : t
        );

        save(SK.P, updatedProducts);
        save(SK.T, updatedTransfers);
        
        setProducts(updatedProducts);
        setTransfers(updatedTransfers.filter(t => t.type === "WH_TO_SHOP"));
        
        alert("✅ Stock received and added to shop inventory!");
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">WH → Shop Dispatch</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Challan must be created before goods physically leave the warehouse</p>
                </div>
                <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ New Challan</button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm text-gray-700">
                    <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Create Dispatch Challan</p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">From Warehouse *</label>
                            <select 
                                value={fromWH} 
                                onChange={e => setFromWH(e.target.value)} 
                                disabled={!isAdmin() && isWarehouseRole()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select —</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To Shop *</label>
                            <select 
                                value={toShop} 
                                onChange={e => setToShop(e.target.value)} 
                                disabled={!isAdmin() && !isWarehouseRole()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select —</option>
                                {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Reason</label>
                            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Stock replenishment" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Search & Add Products</label>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or barcode..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2" />
                        <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2">
                            {filtered.map(p => (
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
                                <th className="px-3 py-2 text-center text-xs text-gray-500">Unit</th>
                                <th className="px-3 py-2"></th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {cart.map(c => (
                                    <tr key={c.productId}>
                                        <td className="px-3 py-2 font-medium text-gray-700">{c.name}</td>
                                        <td className="px-3 py-2"><input type="number" min="1" value={c.qty} onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, qty: +e.target.value } : x))} className="w-16 px-2 py-1 border rounded text-center text-sm" /></td>
                                        <td className="px-3 py-2 text-center text-gray-400 text-xs">{c.unit}</td>
                                        <td className="px-3 py-2 text-center"><button onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))} className="text-red-500 text-xs cursor-pointer hover:text-red-700">✕</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button onClick={() => { setShowForm(false); setCart([]); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
                        <button onClick={saveChallan} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">Create Challan</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">Dispatch Log</h3>
                    <span className="text-xs text-gray-400">{transfers.length} challans</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        {["Challan #", "From WH", "To Shop", "Items", "Date", "Reason", "Status"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                        {transfers.length === 0
                            ? <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">No challans yet</td></tr>
                            : transfers.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.transferNumber || t.id}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{t.fromWarehouseName || t.fromWarehouseId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.toShopName || t.toShopId}</td>
                                    <td className="px-4 py-3 text-gray-600">{t.items?.length || 0} lines</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{t.createdAt}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{t.reason || "—"}</td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[t.status] || "bg-gray-100 text-gray-600"}`}>{t.status}</span>
                                        {t.status === "dispatched" && (
                                            <button 
                                                onClick={() => receiveStock(t)}
                                                className="px-2 py-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-700 cursor-pointer"
                                            >
                                                Mark Received
                                            </button>
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
