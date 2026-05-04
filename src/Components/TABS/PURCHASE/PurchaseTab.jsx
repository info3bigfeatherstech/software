// src/Components/TABS/PURCHASE/PurchaseTab.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_VENDORS, INITIAL_PURCHASES, INITIAL_SHOPS, INITIAL_WAREHOUSES } from '../../demoData';
import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin } from '../../roles';

const STORAGE_KEYS = {
  PRODUCTS: 'vyapar_products',
  VENDORS: 'vyapar_vendors',
  PURCHASES: 'vyapar_purchases',
  WAREHOUSES: 'vyapar_warehouses'
};

const getData = (key, initialData) => {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const PurchaseTab = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  // Lock non-admins to their own location; admins can switch via dropdown
  const [selectedWarehouse, setSelectedWarehouse] = useState(CURRENT_USER.locationId);
  const [warehouses, setWarehouses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorBillNo, setVendorBillNo] = useState('');
  const [generatedBarcode, setGeneratedBarcode] = useState(null);

  useEffect(() => {
    const allProducts  = getData(STORAGE_KEYS.PRODUCTS,   INITIAL_PRODUCTS);
    const allWarehouses = getData(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES || []);

    // Admin: filter by selectedWarehouse dropdown. WH_MANAGER: filter by their locationId.
    const scopedProducts = isAdmin()
      ? allProducts.filter(p => p.locationId === selectedWarehouse || p.shopId === selectedWarehouse)
      : filterByLocation(allProducts);

    setProducts(scopedProducts);
    setVendors(getData(STORAGE_KEYS.VENDORS, INITIAL_VENDORS));
    setPurchases(filterByLocation(getData(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES), 'shopId'));
    // Non-admins only see their own warehouse in selector
    setWarehouses(filterLocationList(allWarehouses));
  }, [selectedWarehouse]);

  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.cost } : c));
    } else {
      setCart([...cart, { productId, name: product.name, quantity: 1, cost: product.wholesale || product.mrp * 0.7, total: product.wholesale || product.mrp * 0.7 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId));
  };

  const updateQuantity = (productId, quantity, cost) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(cart.map(c => c.productId === productId ? { ...c, quantity: parseInt(quantity), total: parseInt(quantity) * parseFloat(c.cost) } : c));
  };

  const updateCost = (productId, cost) => {
    setCart(cart.map(c => c.productId === productId ? { ...c, cost: parseFloat(cost), total: c.quantity * parseFloat(cost) } : c));
  };

  const savePurchase = () => {
    if (!selectedVendor || cart.length === 0) return alert('Select vendor and add items');

    const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const purchaseItems = cart.map(c => ({ productId: c.productId, quantity: c.quantity, cost: c.cost }));

    // Update stock in the warehouse
    const updatedProducts = allProducts.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem && (p.locationId === selectedWarehouse || p.shopId === selectedWarehouse)) {
        return { ...p, stock: p.stock + cartItem.quantity };
      }
      return p;
    });
    saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);

    // Save purchase record
    const newPurchaseId = `PUR-${Date.now()}`;
    const newPurchase = {
      id: newPurchaseId,
      vendorId: selectedVendor,
      shopId: selectedWarehouse, // Generic location ID
      vendorBillNo: vendorBillNo,
      date: new Date().toISOString().split('T')[0],
      items: purchaseItems,
      total: cart.reduce((sum, c) => sum + c.total, 0)
    };
    const allPurchases = getData(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    saveData(STORAGE_KEYS.PURCHASES, [...allPurchases, newPurchase]);

    // Generate barcode sticker
    setGeneratedBarcode(`VYP-${selectedWarehouse.split('-')[1]}-${Date.now().toString().slice(-4)}`);

    // Reset
    setCart([]);
    setSelectedVendor('');
    setVendorBillNo('');
    setShowForm(false);
    setProducts(updatedProducts.filter(p => p.locationId === selectedWarehouse || p.shopId === selectedWarehouse));
    setPurchases([...allPurchases, newPurchase]);
    alert('Purchase saved! Stock updated in Warehouse.');
  };

  const getVendorName = (vendorId) => vendors.find(v => v.id === vendorId)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">🛒 Goods Receipt (To Warehouse)</h2>

          {/* Admin: switchable dropdown. Non-admin: read-only badge locked to their WH. */}
          {isAdmin() ? (
            <select value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)} className="px-3 py-2 text-gray-700 border rounded-lg text-sm">
              {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
            </select>
          ) : (
            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700">
              🏢 {warehouses[0]?.name || CURRENT_USER.locationId}
            </span>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">+ New Purchase</button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl text-gray-700 p-6">
          <h3 className="font-semibold mb-4">Create Purchase Order</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name} - {v.city}</option>)}
            </select>
            <input type="text" placeholder="Vendor Bill/Invoice No." value={vendorBillNo} onChange={(e) => setVendorBillNo(e.target.value)} className="px-3 py-2 border rounded-lg" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Add Products</label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto mb-4 border rounded-lg p-3">
              {products.map(p => (
                <button key={p.id} onClick={() => addToCart(p.id)} className="text-left px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm">
                  {p.name}<br /><span className="text-xs text-gray-500">Stock: {p.stock}</span>
                </button>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Purchase Cart</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Product</th><th>Quantity</th><th>Cost (₹)</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {cart.map(c => (
                    <tr key={c.productId} className="border-t">
                      <td className="px-4 py-2">{c.name}</td>
                      <td className="px-4 py-2"><input type="number" value={c.quantity} onChange={(e) => updateQuantity(c.productId, e.target.value, c.cost)} className="w-20 px-2 py-1 border rounded" /></td>
                      <td className="px-4 py-2"><input type="number" step="0.01" value={c.cost} onChange={(e) => updateCost(c.productId, e.target.value)} className="w-24 px-2 py-1 border rounded" /></td>
                      <td className="px-4 py-2">₹{c.total}</td>
                      <td className="px-4 py-2"><button onClick={() => removeFromCart(c.productId)} className="text-red-600">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50"><tr><td colSpan="3" className="px-4 py-2 font-bold text-right">Total:</td><td className="px-4 py-2 font-bold">₹{cart.reduce((s, c) => s + c.total, 0)}</td><td></td></tr></tfoot>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setCart([]); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={savePurchase} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save & Print Barcodes</button>
          </div>
        </div>
      )}

      {/* Barcode Print Simulation */}
      {generatedBarcode && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-yellow-800 flex items-center gap-2">🖨️ Barcode Sticker Generated!</h4>
            <p className="text-sm text-yellow-700">Apply this barcode to the incoming boxes.</p>
          </div>
          <div className="bg-white px-6 py-3 border rounded-lg shadow-inner text-center">
            <div className="font-mono text-xl tracking-[0.2em] font-bold">{generatedBarcode}</div>
            <div className="text-[10px] text-gray-400">Code-128 format</div>
          </div>
          <button onClick={() => setGeneratedBarcode(null)} className="text-yellow-600 hover:text-yellow-800 font-bold">Dismiss</button>
        </div>
      )}

      {/* Purchase History */}
      <div className="bg-white border rounded-xl overflow-hidden text-gray-700">
        <div className="px-6 py-4 border-b bg-gray-50"><h3 className="font-semibold">Purchase History</h3></div>
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs">Purchase ID</th><th>Vendor</th><th>Date</th><th>Items</th><th>Total</th></tr></thead>
          <tbody>
            {purchases.filter(p => p.shopId === selectedWarehouse).map(p => (
              <tr key={p.id} className="border-t">
                <td className="px-6 py-4 text-sm font-mono">{p.id}</td>
                <td className="px-6 py-4">{getVendorName(p.vendorId)}</td>
                <td className="px-6 py-4">{p.date}</td>
                <td className="px-6 py-4">{p.items.reduce((sum, i) => sum + i.quantity, 0)} units</td>
                <td className="px-6 py-4 font-semibold">₹{p.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseTab;
// // TABS/PURCHASE/PurchaseTab.jsx
// import React, { useState } from "react";
// import { PURCHASE_ORDERS, SUPPLIERS } from "../../demoData";

// const statusColors = {
//     received: "bg-green-100 text-green-700",
//     ordered: "bg-blue-100 text-blue-700",
//     partial: "bg-orange-100 text-orange-600",
//     overdue: "bg-red-100 text-red-600",
// };

// const PurchaseTab = () => {
//     const [activeSection, setActiveSection] = useState("orders");
//     const [search, setSearch] = useState("");

//     const filteredOrders = PURCHASE_ORDERS.filter(o =>
//         o.supplier.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
//     );

//     const filteredSuppliers = SUPPLIERS.filter(s =>
//         s.name.toLowerCase().includes(search.toLowerCase())
//     );

//     return (
//         <div>
//             {/* Section toggle */}
//             <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
//                 {[
//                     { id: "orders", label: "Purchase Orders" },
//                     { id: "suppliers", label: "Suppliers" },
//                 ].map(s => (
//                     <button
//                         key={s.id}
//                         onClick={() => setActiveSection(s.id)}
//                         className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-all cursor-pointer ${activeSection === s.id
//                                 ? "border-blue-500 text-blue-600 bg-blue-50"
//                                 : "border-transparent text-gray-500 hover:text-gray-700"
//                             }`}
//                     >
//                         {s.label}
//                     </button>
//                 ))}
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {(activeSection === "orders" ? [
//                     { label: "Total Orders", value: PURCHASE_ORDERS.length },
//                     { label: "Total Value", value: "₹" + (PURCHASE_ORDERS.reduce((s, o) => s + o.amount, 0) / 1000).toFixed(0) + "K" },
//                     { label: "Paid", value: "₹" + (PURCHASE_ORDERS.reduce((s, o) => s + o.paid, 0) / 1000).toFixed(0) + "K" },
//                     { label: "Overdue", value: PURCHASE_ORDERS.filter(o => o.status === "overdue").length },
//                 ] : [
//                     { label: "Total Suppliers", value: SUPPLIERS.length },
//                     { label: "Active", value: SUPPLIERS.filter(s => s.status === "active").length },
//                     { label: "Total Purchased", value: "₹" + (SUPPLIERS.reduce((s, x) => s + x.totalPurchased, 0) / 100000).toFixed(1) + "L" },
//                     { label: "Outstanding", value: "₹" + (SUPPLIERS.reduce((s, x) => s + x.outstanding, 0) / 1000).toFixed(0) + "K" },
//                 ]).map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Search + CTA */}
//             <div className="flex items-center gap-3 mb-4">
//                 <input
//                     type="text"
//                     placeholder={activeSection === "orders" ? "Search by supplier or PO ID..." : "Search suppliers..."}
//                     value={search}
//                     onChange={e => setSearch(e.target.value)}
//                     className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                 />
//                 <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                     {activeSection === "orders" ? "+ New Purchase Order" : "+ Add Supplier"}
//                 </button>
//             </div>

//             {/* Orders table */}
//             {activeSection === "orders" && (
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                             <tr>
//                                 {["PO ID", "Supplier", "Date", "Due Date", "Items", "Amount", "Paid", "Status", "Mode"].map(h => (
//                                     <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {filteredOrders.map(o => (
//                                 <tr key={o.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
//                                     <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.id}</td>
//                                     <td className="px-4 py-3 font-medium text-gray-800">{o.supplier}</td>
//                                     <td className="px-4 py-3 text-xs text-gray-500">{o.date}</td>
//                                     <td className="px-4 py-3 text-xs text-gray-500">{o.dueDate}</td>
//                                     <td className="px-4 py-3 text-center text-gray-600">{o.items}</td>
//                                     <td className="px-4 py-3 font-semibold text-gray-800">₹{o.amount.toLocaleString()}</td>
//                                     <td className="px-4 py-3 text-green-600 font-medium">₹{o.paid.toLocaleString()}</td>
//                                     <td className="px-4 py-3">
//                                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>{o.status}</span>
//                                     </td>
//                                     <td className="px-4 py-3 text-xs text-gray-500">{o.paymentMode || "—"}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* Suppliers table */}
//             {activeSection === "suppliers" && (
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                     <table className="w-full text-sm">
//                         <thead className="bg-gray-50 border-b border-gray-100">
//                             <tr>
//                                 {["Supplier", "Phone", "City", "Total Purchased", "Outstanding", "GSTIN", "Status"].map(h => (
//                                     <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {filteredSuppliers.map(s => (
//                                 <tr key={s.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
//                                     <td className="px-4 py-3">
//                                         <div className="font-medium text-gray-800">{s.name}</div>
//                                         <div className="text-xs text-gray-400">{s.id}</div>
//                                     </td>
//                                     <td className="px-4 py-3 text-gray-600">{s.phone}</td>
//                                     <td className="px-4 py-3 text-gray-600">{s.city}</td>
//                                     <td className="px-4 py-3 font-medium text-gray-700">₹{s.totalPurchased.toLocaleString()}</td>
//                                     <td className="px-4 py-3">
//                                         {s.outstanding > 0
//                                             ? <span className="text-red-500 font-medium">₹{s.outstanding.toLocaleString()}</span>
//                                             : <span className="text-green-500 text-xs">Cleared</span>
//                                         }
//                                     </td>
//                                     <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.gstin || "—"}</td>
//                                     <td className="px-4 py-3">
//                                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.status}</span>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PurchaseTab;