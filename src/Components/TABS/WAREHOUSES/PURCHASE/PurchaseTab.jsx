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

const stockColor = (n) => {
  if (n > 10) return 'text-green-700 bg-green-50 border border-green-200';
  if (n > 0)  return 'text-amber-700 bg-amber-50 border border-amber-200';
  return               'text-red-600 bg-red-50 border border-red-200';
};

const STATS = (locationPurchases, totalSpend, products, cartUnits) => [
  {
    label: 'Total Orders',
    value: locationPurchases.length,
    valueColor: 'text-gray-900',
    accent: 'border-l-4 border-l-blue-400',
  },
  {
    label: 'Total Spend',
    value: `₹${totalSpend.toLocaleString()}`,
    valueColor: 'text-green-700',
    accent: 'border-l-4 border-l-green-400',
  },
  {
    label: 'Products Listed',
    value: products.length,
    valueColor: 'text-gray-900',
    accent: 'border-l-4 border-l-violet-400',
  },
  {
    label: 'Cart Units',
    value: cartUnits,
    valueColor: 'text-amber-700',
    accent: 'border-l-4 border-l-amber-400',
  },
];

const PurchaseTab = () => {
  const [products, setProducts]                   = useState([]);
  const [vendors, setVendors]                     = useState([]);
  const [purchases, setPurchases]                 = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(CURRENT_USER.locationId);
  const [warehouses, setWarehouses]               = useState([]);
  const [showForm, setShowForm]                   = useState(false);
  const [cart, setCart]                           = useState([]);
  const [selectedVendor, setSelectedVendor]       = useState('');
  const [vendorBillNo, setVendorBillNo]           = useState('');
  const [generatedBarcode, setGeneratedBarcode]   = useState(null);
  const [productSearch, setProductSearch]         = useState('');

  useEffect(() => {
    const allProducts   = getData(STORAGE_KEYS.PRODUCTS,   INITIAL_PRODUCTS);
    const allWarehouses = getData(STORAGE_KEYS.WAREHOUSES,  INITIAL_WAREHOUSES || []);
    const scopedProducts = isAdmin()
      ? allProducts.filter(p => p.locationId === selectedWarehouse || p.shopId === selectedWarehouse)
      : filterByLocation(allProducts);
    setProducts(scopedProducts);
    setVendors(getData(STORAGE_KEYS.VENDORS, INITIAL_VENDORS));
    setPurchases(filterByLocation(getData(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES), 'shopId'));
    setWarehouses(filterLocationList(allWarehouses));
  }, [selectedWarehouse]);

  const addToCart = (productId) => {
    const product  = products.find(p => p.id === productId);
    const existing = cart.find(c => c.productId === productId);
    if (existing) {
      setCart(cart.map(c => c.productId === productId
        ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.cost }
        : c));
    } else {
      setCart([...cart, {
        productId, name: product.name, quantity: 1,
        cost:  product.wholesale || product.mrp * 0.7,
        total: product.wholesale || product.mrp * 0.7,
      }]);
    }
  };

  const removeFromCart = (productId) => setCart(cart.filter(c => c.productId !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(cart.map(c => c.productId === productId
      ? { ...c, quantity: parseInt(quantity), total: parseInt(quantity) * parseFloat(c.cost) }
      : c));
  };

  const updateCost = (productId, cost) => {
    setCart(cart.map(c => c.productId === productId
      ? { ...c, cost: parseFloat(cost), total: c.quantity * parseFloat(cost) }
      : c));
  };

  const savePurchase = () => {
    if (!selectedVendor || cart.length === 0) return alert('Select vendor and add items');
    const allProducts     = getData(STORAGE_KEYS.PRODUCTS,  INITIAL_PRODUCTS);
    const purchaseItems   = cart.map(c => ({ productId: c.productId, quantity: c.quantity, cost: c.cost }));
    const updatedProducts = allProducts.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem && (p.locationId === selectedWarehouse || p.shopId === selectedWarehouse)) {
        return { ...p, stock: p.stock + cartItem.quantity };
      }
      return p;
    });
    saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);
    const newPurchaseId = `PUR-${Date.now()}`;
    const newPurchase   = {
      id: newPurchaseId, vendorId: selectedVendor, shopId: selectedWarehouse,
      vendorBillNo, date: new Date().toISOString().split('T')[0],
      items: purchaseItems, total: cart.reduce((sum, c) => sum + c.total, 0),
    };
    const allPurchases = getData(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    saveData(STORAGE_KEYS.PURCHASES, [...allPurchases, newPurchase]);
    setGeneratedBarcode(`VYP-${selectedWarehouse.split('-')[1]}-${Date.now().toString().slice(-4)}`);
    setCart([]); setSelectedVendor(''); setVendorBillNo(''); setShowForm(false);
    setProducts(updatedProducts.filter(p => p.locationId === selectedWarehouse || p.shopId === selectedWarehouse));
    setPurchases([...allPurchases, newPurchase]);
    alert('Purchase saved! Stock updated in Warehouse.');
  };

  const getVendorName = (vendorId) => vendors.find(v => v.id === vendorId)?.name || 'Unknown';

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const cartTotal         = cart.reduce((s, c) => s + c.total, 0);
  const cartUnits         = cart.reduce((s, c) => s + c.quantity, 0);
  const locationPurchases = purchases.filter(p => p.shopId === selectedWarehouse);
  const totalSpend        = locationPurchases.reduce((s, p) => s + p.total, 0);

  const inputCls = " w-full text-sm text-gray-800 border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  return (
    <div className=" min-h-screen bg-gray-100 p-5 space-y-4">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border border-gray-200 rounded px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div>
            <h1 className="text-gray-900 text-base font-bold leading-tight">Goods Receipt / Purchase Entry</h1>
            <p className="text-gray-400 text-xs mt-0.5">Record incoming stock to warehouse</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin() ? (
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className=" text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
            </select>
          ) : (
            <span className="text-sm font-semibold text-gray-600 border border-gray-200 rounded px-3 py-1.5 bg-gray-50">
              {warehouses[0]?.name || CURRENT_USER.locationId}
            </span>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className=" flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded px-4 py-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Purchase
          </button>
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS(locationPurchases, totalSpend, products, cartUnits).map(({ label, value, valueColor, accent }) => (
          <div key={label} className={`bg-white border border-gray-200 rounded px-4 py-3 ${accent}`}>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── BARCODE NOTICE ── */}
      {generatedBarcode && (
        <div className="bg-blue-50 border border-blue-200 rounded px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-blue-900">Barcode generated — apply to incoming boxes</p>
            <p className="text-xs text-blue-500 mt-0.5">Code-128 format</p>
          </div>
          <span className="font-mono text-base font-bold tracking-[0.18em] text-blue-900 border border-blue-300 rounded px-4 py-2 bg-white">
            {generatedBarcode}
          </span>
          <button
            onClick={() => setGeneratedBarcode(null)}
            className="text-blue-400 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            Dismiss ✕
          </button>
        </div>
      )}

      {/* ── PURCHASE FORM ── */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded overflow-hidden">

          {/* Form title bar */}
          <div className="bg-gray-800 px-5 py-2.5 flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Create Purchase Order</span>
            <button
              onClick={() => { setShowForm(false); setCart([]); }}
              className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200">

            {/* LEFT — vendor + products */}
            <div className="lg:w-3/5 p-5 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Vendor</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className={inputCls + ' cursor-pointer'}
                  >
                    <option value="">— Select Vendor —</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Bill / Invoice No.</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2024-001"
                    value={vendorBillNo}
                    onChange={(e) => setVendorBillNo(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Product picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Select Products</label>
                  <input
                    type="text"
                    placeholder="Search product…"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className=" text-xs text-gray-700 border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:border-blue-400 w-40"
                  />
                </div>

                <div className="border border-gray-200 rounded overflow-hidden">
                  <div className="max-h-52 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                          <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Add</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 font-medium text-gray-800">{p.name}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${stockColor(p.stock)}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => addToCart(p.id)}
                                className="text-xs font-semibold text-blue-600 border border-blue-300 bg-blue-50 rounded px-2.5 py-1 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                              >
                                + Add
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={3} className="px-3 py-6 text-center text-gray-400 text-sm">No products found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — cart */}
            <div className="lg:w-2/5 p-5 flex flex-col bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">Cart</span>
                {cart.length > 0 && (
                  <span className="text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 rounded px-2 py-0.5">
                    {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p className="text-gray-400 text-sm">Cart is empty</p>
                  <p className="text-gray-300 text-xs mt-0.5">Click "+ Add" to add products</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto border border-gray-200 rounded bg-white overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-500 font-semibold uppercase tracking-wide">Item</th>
                        <th className="text-center px-2 py-2 text-gray-500 font-semibold uppercase tracking-wide">Qty</th>
                        <th className="text-center px-2 py-2 text-gray-500 font-semibold uppercase tracking-wide">Cost ₹</th>
                        <th className="text-right px-3 py-2 text-gray-500 font-semibold uppercase tracking-wide">Total</th>
                        <th className="px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cart.map(c => (
                        <tr key={c.productId} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-800 max-w-[100px] truncate" title={c.name}>{c.name}</td>
                          <td className="px-2 py-2">
                            <input
                              type="number" min={1} value={c.quantity}
                              onChange={(e) => updateQuantity(c.productId, e.target.value)}
                              className=" w-12 text-xs text-center text-gray-800 border border-gray-300 rounded px-1 py-1 focus:outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number" step="0.01" value={c.cost}
                              onChange={(e) => updateCost(c.productId, e.target.value)}
                              className=" w-16 text-xs text-center text-gray-800 border border-gray-300 rounded px-1 py-1 focus:outline-none focus:border-blue-400"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-green-700">₹{c.total.toFixed(2)}</td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removeFromCart(c.productId)}
                              className="text-gray-300 hover:text-red-500 transition-colors font-bold"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {cart.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Grand Total</span>
                    <span className="text-lg font-bold text-green-700">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={savePurchase}
                    className=" w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded px-4 py-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Save &amp; Print Barcodes
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── PURCHASE HISTORY ── */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">

        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Purchase History</h3>
          <span className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-2.5 py-0.5 bg-white">
            {locationPurchases.length} record{locationPurchases.length !== 1 ? 's' : ''}
          </span>
        </div>

        {locationPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <svg className="w-8 h-8 text-gray-300 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <p className="text-sm text-gray-400 font-medium">No purchases recorded yet</p>
            <p className="text-xs text-gray-300 mt-1">Click "New Purchase" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Purchase ID</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-center px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Units</th>
                  <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locationPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
                        {p.id}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{getVendorName(p.vendorId)}</td>
                    <td className="px-5 py-3 text-gray-500">{p.date}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-xs font-semibold text-blue-700 border border-blue-200 rounded px-2.5 py-0.5 bg-blue-50">
                        {p.items.reduce((sum, i) => sum + i.quantity, 0)} units
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-green-700">
                      ₹{p.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PurchaseTab;