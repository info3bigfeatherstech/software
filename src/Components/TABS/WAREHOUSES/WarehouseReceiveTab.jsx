// TABS/WAREHOUSES/WarehouseReceiveTab.jsx
// Receive goods into a warehouse — Dual input: Manual Selection + Barcode Scanning
// Flow: Configure (WH + room + rack) → Scanning Session (manual + scanner) → Review → Save GRN

import React, { useState, useEffect, useCallback, useMemo,useRef } from "react";
import { INITIAL_WAREHOUSES, INITIAL_VENDORS, INITIAL_PRODUCTS } from "../../demoData";
import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin, isWarehouseRole } from "../../roles";
import BarcodeScanner from "../SALES/BillingTab_Compo/BarcodeScanner";

/* ─── Storage helpers ────────────────────────────────────────── */
const SK = { 
    W: "vyapar_warehouses", 
    V: "vyapar_vendors", 
    P: "vyapar_products", 
    GRN: "vyapar_grns" 
};

const load = (k, d) => { 
    const s = localStorage.getItem(k); 
    if (s) return JSON.parse(s); 
    localStorage.setItem(k, JSON.stringify(d)); 
    return d; 
};

const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));

/* ─── Session states ─────────────────────────────────────────── */
const SESSION = { 
    IDLE: "IDLE", 
    CONFIGURING: "CONFIGURING", 
    SCANNING: "SCANNING", 
    REVIEWING: "REVIEWING" 
};

const STATUS_CLS = { 
    received: "bg-green-100 text-green-700", 
    partial: "bg-yellow-100 text-yellow-700", 
    pending: "bg-gray-100 text-gray-500" 
};

/* ─── Toast component ────────────────────────────────────────── */
function Toast({ toasts }) {
    if (toasts.length === 0) return null;
    
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ${
                    t.type === "success" ? "bg-green-600" : 
                    t.type === "error" ? "bg-red-600" : 
                    t.type === "warn" ? "bg-amber-500" : "bg-blue-600"
                }`}>
                    <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warn" ? "⚠️" : "ℹ️"}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

/* ─── Manual Product Selector Component ─────────────────────────── */
function ManualProductSelector({ products, onSelectProduct, disabled, cartCount }) {
    const [search, setSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const inputRef = useRef(null);

    // Auto-focus on mount
    useEffect(() => {
        if (!disabled) inputRef.current?.focus();
    }, [disabled]);

    // Filter products based on search
    const filteredProducts = useMemo(() => {
        if (!search.trim()) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode || "").includes(search) ||
            (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(search.toLowerCase())
        ).slice(0, 10);
    }, [products, search]);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSearch(product.name);
    };

    const handleAddToCart = () => {
        if (!selectedProduct) {
            alert("Please select a product first");
            return;
        }
        if (quantity < 1) {
            alert("Quantity must be at least 1");
            return;
        }
        
        onSelectProduct(selectedProduct, quantity);
        
        // Reset form
        setSelectedProduct(null);
        setSearch("");
        setQuantity(1);
        inputRef.current?.focus();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && selectedProduct) {
            handleAddToCart();
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🖐️</span>
                <h3 className="text-sm font-semibold text-gray-700">Manual Product Selection</h3>
                {cartCount > 0 && (
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {cartCount} items in cart
                    </span>
                )}
            </div>
            
            <div className="space-y-3">
                {/* Product Search Input */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type product name, barcode, or SKU..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        disabled={disabled}
                        onKeyPress={handleKeyPress}
                    />
                    
                    {/* Dropdown for search results */}
                    {search && filteredProducts.length > 0 && !disabled && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProductSelect(p)}
                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{p.barcode || "No barcode"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-blue-600">₹{p.mrp}</p>
                                            <p className="text-xs text-gray-400">{p.unit || "Pcs"}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Selected Product Display */}
                {selectedProduct && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">{selectedProduct.name}</p>
                                <p className="text-xs text-gray-600 font-mono">Barcode: {selectedProduct.barcode || "N/A"}</p>
                                <p className="text-xs text-gray-600">Price: ₹{selectedProduct.mrp} / {selectedProduct.unit || "Pcs"}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setSearch("");
                                }}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                ✕ Change
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Quantity Input & Add Button */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            disabled={!selectedProduct || disabled}
                        />
                    </div>
                    <div className="flex-1 flex items-end">
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedProduct || disabled}
                            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            + Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function WarehouseReceiveTab() {
    // Data states
    const [warehouses, setWarehouses] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [grns, setGrns] = useState([]);

    // Session state
    const [sessionState, setSessionState] = useState(SESSION.IDLE);

    // Configuration fields
    const [toWH, setToWH] = useState("");
    const [vendor, setVendor] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [room, setRoom] = useState("");
    const [rack, setRack] = useState("");

    // Cart items
    const [cart, setCart] = useState([]);

    // Scanner state
    const [showScanner, setShowScanner] = useState(false);
    const [unknownBarcode, setUnknownBarcode] = useState(null);

    // Toasts
    const [toasts, setToasts] = useState([]);
    const toastTimers = useRef({});

    // Load initial data
    useEffect(() => {
        setWarehouses(filterLocationList(load(SK.W, INITIAL_WAREHOUSES)));
        setVendors(load(SK.V, INITIAL_VENDORS));
        setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        setGrns(filterByLocation(load(SK.GRN, []), "toWarehouseId"));
        
        if (!isAdmin() && isWarehouseRole()) {
            setToWH(CURRENT_USER.locationId);
        }
    }, []);

    // Toast helper
    const addToast = useCallback((msg, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        
        if (toastTimers.current[id]) clearTimeout(toastTimers.current[id]);
        toastTimers.current[id] = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            delete toastTimers.current[id];
        }, 2800);
    }, []);

    // Cleanup toasts on unmount
    useEffect(() => {
        return () => {
            Object.values(toastTimers.current).forEach(clearTimeout);
        };
    }, []);

    /* ─── Cart Operations ──────────────────────────────────────── */
    const addProductToCart = useCallback((product, qty = 1) => {
        setCart(prev => {
            const existing = prev.find(c => c.productId === product.id);
            
            if (existing) {
                const newQty = existing.qty + qty;
                addToast(`+${qty} · ${product.name} (now ${newQty})`, "success");
                return prev.map(c => 
                    c.productId === product.id 
                        ? { ...c, qty: newQty }
                        : c
                );
            }
            
            addToast(`Added · ${product.name} x${qty}`, "success");
            return [...prev, {
                productId: product.id,
                name: product.name,
                qty: qty,
                buyPrice: product.buyPrice || product.wholesale || product.mrp || 0,
                unit: product.unit || "Pcs",
                barcode: product.barcode || "",
                sku: product.sku || "",
            }];
        });
    }, [addToast]);

    const updateCartItem = useCallback((productId, field, value) => {
        setCart(prev => prev.map(c => 
            c.productId === productId ? { ...c, [field]: value } : c
        ));
    }, []);

    const removeCartItem = useCallback((productId) => {
        setCart(prev => {
            const item = prev.find(c => c.productId === productId);
            if (item) addToast(`Removed · ${item.name}`, "info");
            return prev.filter(c => c.productId !== productId);
        });
    }, [addToast]);

    /* ─── Barcode Scanner Handlers ─────────────────────────────── */
    const handleProductFound = useCallback((product) => {
        addProductToCart(product, 1);
        // Optional: Keep scanner open for continuous scanning
        // setShowScanner(true); // Already true
    }, [addProductToCart]);

    const handleUnknownBarcode = useCallback((barcode) => {
        setUnknownBarcode(barcode);
        setShowScanner(false);
        addToast(`⚠️ Unknown barcode: ${barcode} — please select product manually`, "warn");
    }, [addToast]);

    const handleManualSelect = useCallback((product, quantity) => {
        addProductToCart(product, quantity);
        // If unknown barcode picker is open, close it after selection
        if (unknownBarcode) {
            setUnknownBarcode(null);
            setShowScanner(true);
        }
    }, [addProductToCart, unknownBarcode]);

    /* ─── Session Management ───────────────────────────────────── */
    const startSession = useCallback(() => {
        if (!toWH) { addToast("Please select a warehouse", "error"); return; }
        if (!vendor) { addToast("Please select a vendor", "error"); return; }
        
        const warehouse = warehouses.find(w => w.id === toWH);
        const defaultRoom = warehouse?.rooms?.[0] || "Ground Floor";
        const defaultRack = warehouse?.racks?.[0] || "R1";
        
        if (!room) setRoom(defaultRoom);
        if (!rack) setRack(defaultRack);
        
        setCart([]);
        setUnknownBarcode(null);
        setShowScanner(true);
        setSessionState(SESSION.SCANNING);
        addToast("Session started — you can scan barcodes OR manually select products", "success");
    }, [toWH, vendor, warehouses, room, rack, addToast]);

    const stopScanning = useCallback(() => {
        if (cart.length === 0) {
            addToast("Cart is empty — please add at least one product", "warn");
            return;
        }
        setShowScanner(false);
        setSessionState(SESSION.REVIEWING);
    }, [cart.length, addToast]);

    const backToScanning = useCallback(() => {
        setShowScanner(true);
        setUnknownBarcode(null);
        setSessionState(SESSION.SCANNING);
    }, []);

    const cancelSession = useCallback(() => {
        setShowScanner(false);
        setSessionState(SESSION.IDLE);
        setCart([]);
        setToWH(isAdmin() ? "" : CURRENT_USER.locationId);
        setVendor("");
        setInvoiceNo("");
        setRoom("");
        setRack("");
        setUnknownBarcode(null);
        addToast("Session cancelled", "info");
    }, [addToast]);

    const saveGRN = useCallback(() => {
        if (cart.length === 0) {
            addToast("Nothing to save — cart is empty", "error");
            return;
        }

        // Update product stock
        const allProducts = load(SK.P, INITIAL_PRODUCTS);
        const updatedProducts = allProducts.map(p => {
            const cartItem = cart.find(c => c.productId === p.id);
            if (!cartItem) return p;
            
            return {
                ...p,
                stock: (p.stock || 0) + cartItem.qty,
                warehouseId: toWH,
                room: room,
                rack: rack,
                lastReceived: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
        save(SK.P, updatedProducts);
        setProducts(filterByLocation(updatedProducts));

        // Create GRN record
        const warehouse = warehouses.find(w => w.id === toWH);
        const vendorData = vendors.find(v => v.id === vendor);
        
        const grnRecord = {
            id: `GRN-${Date.now()}`,
            grnNumber: `GRN-${Date.now().toString().slice(-6)}`,
            toWarehouseId: toWH,
            toWarehouseName: warehouse?.name,
            vendorId: vendor,
            vendorName: vendorData?.name,
            invoiceNo: invoiceNo || "",
            items: cart,
            room: room,
            rack: rack,
            status: "received",
            receivedBy: CURRENT_USER?.name || "System",
            createdAt: new Date().toISOString(),
            totalValue: cart.reduce((sum, item) => sum + (item.qty * item.buyPrice), 0),
            totalUnits: cart.reduce((sum, item) => sum + item.qty, 0),
        };

        const allGRNs = load(SK.GRN, []);
        save(SK.GRN, [grnRecord, ...allGRNs]);
        setGrns(prev => [grnRecord, ...prev]);

        addToast(`✅ GRN ${grnRecord.grnNumber} created successfully! Stock updated.`, "success");
        
        // Reset session
        cancelSession();
    }, [cart, toWH, vendor, invoiceNo, room, rack, warehouses, vendors, addToast, cancelSession]);

    // Computed values
    const warehouseRooms = useMemo(() => {
        if (!toWH) return ["Ground Floor", "First Floor"];
        return warehouses.find(w => w.id === toWH)?.rooms || ["Ground Floor", "First Floor"];
    }, [toWH, warehouses]);

    const warehouseRacks = useMemo(() => {
        if (!toWH) return ["R1", "R2", "R3"];
        return warehouses.find(w => w.id === toWH)?.racks || ["R1", "R2", "R3"];
    }, [toWH, warehouses]);

    const cartTotal = useMemo(() => 
        cart.reduce((sum, item) => sum + (item.qty * item.buyPrice), 0),
        [cart]
    );

    const totalUnits = useMemo(() => 
        cart.reduce((sum, item) => sum + item.qty, 0),
        [cart]
    );

    /* ─── Render ───────────────────────────────────────────────── */
    return (
        <div className="space-y-5 pb-8">
            <Toast toasts={toasts} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Receive Goods (GRN)</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Add products by scanning barcodes OR manually searching
                    </p>
                </div>
                
                {sessionState === SESSION.IDLE && (
                    <button
                        onClick={() => setSessionState(SESSION.CONFIGURING)}
                        className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        + New GRN
                    </button>
                )}
                
                {sessionState !== SESSION.IDLE && (
                    <button
                        onClick={cancelSession}
                        className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                        ✕ Cancel Session
                    </button>
                )}
            </div>

            {/* Main Session Panel */}
            {(sessionState === SESSION.CONFIGURING || sessionState === SESSION.SCANNING || sessionState === SESSION.REVIEWING) && (
                <div className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 ${
                    sessionState === SESSION.SCANNING ? "border-green-300" : 
                    sessionState === SESSION.REVIEWING ? "border-blue-300" : 
                    "border-gray-200"
                }`}>
                    
                    {/* Step Indicator */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        {[
                            { key: SESSION.CONFIGURING, label: "Configure", icon: "⚙️" },
                            { key: SESSION.SCANNING, label: "Add Products", icon: "📦" },
                            { key: SESSION.REVIEWING, label: "Review & Save", icon: "✅" },
                        ].map((step, i) => {
                            const states = [SESSION.CONFIGURING, SESSION.SCANNING, SESSION.REVIEWING];
                            const currentIdx = states.indexOf(sessionState);
                            const stepIdx = states.indexOf(step.key);
                            const isDone = stepIdx < currentIdx;
                            const isActive = step.key === sessionState;
                            
                            return (
                                <React.Fragment key={step.key}>
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                                        isActive ? "bg-blue-100 text-blue-700" : 
                                        isDone ? "bg-green-100 text-green-700" : 
                                        "text-gray-400"
                                    }`}>
                                        <span>{isDone ? "✓" : step.icon}</span>
                                        <span className="hidden sm:inline">{step.label}</span>
                                    </div>
                                    {i < 2 && <span className="text-gray-300 text-xs">›</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Configuration Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Warehouse *</label>
                            <select
                                value={toWH}
                                onChange={e => setToWH(e.target.value)}
                                disabled={!isAdmin() || sessionState !== SESSION.CONFIGURING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                <option value="">— Select Warehouse —</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Vendor *</label>
                            <select
                                value={vendor}
                                onChange={e => setVendor(e.target.value)}
                                disabled={sessionState !== SESSION.CONFIGURING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                <option value="">— Select Vendor —</option>
                                {vendors.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Invoice Number (Optional)</label>
                            <input
                                type="text"
                                value={invoiceNo}
                                onChange={e => setInvoiceNo(e.target.value)}
                                disabled={sessionState !== SESSION.CONFIGURING}
                                placeholder="e.g., INV-2025-001"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Room</label>
                            <select
                                value={room || warehouseRooms[0]}
                                onChange={e => setRoom(e.target.value)}
                                disabled={sessionState === SESSION.REVIEWING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                {warehouseRooms.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Rack</label>
                            <select
                                value={rack || warehouseRacks[0]}
                                onChange={e => setRack(e.target.value)}
                                disabled={sessionState === SESSION.REVIEWING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                {warehouseRacks.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Start Button */}
                    {sessionState === SESSION.CONFIGURING && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={startSession}
                                disabled={!toWH || !vendor}
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <span>🚀</span> Start Receiving Goods
                            </button>
                        </div>
                    )}

                    {/* Scanning & Manual Selection Section */}
                    {sessionState === SESSION.SCANNING && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            {/* Session Info Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-sm font-semibold text-green-700">Session Active</p>
                                    <span className="text-xs text-gray-400 hidden sm:inline">
                                        — Use scanner OR manual search below
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {cart.length} item{cart.length !== 1 ? "s" : ""} · {totalUnits} units
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                                        {room || warehouseRooms[0]} / {rack || warehouseRacks[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Two Column Layout for Manual + Scanner */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Manual Selection */}
                                <ManualProductSelector
                                    products={products}
                                    onSelectProduct={handleManualSelect}
                                    disabled={false}
                                    cartCount={cart.length}
                                />

                                {/* Barcode Scanner */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">📷</span>
                                        <h3 className="text-sm font-semibold text-gray-700">Barcode Scanner</h3>
                                    </div>
                                    <BarcodeScanner
                                        products={products}
                                        onProductFound={handleProductFound}
                                        showScanner={showScanner}
                                        setShowScanner={setShowScanner}
                                        disabled={!!unknownBarcode}
                                    />
                                </div>
                            </div>

                            {/* Unknown Barcode Fallback */}
                            {unknownBarcode && (
                                <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-600 text-lg">⚠️</span>
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800">Unknown Barcode</p>
                                                <p className="text-xs text-amber-600 font-mono">{unknownBarcode}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setUnknownBarcode(null);
                                                setShowScanner(true);
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            ✕ Dismiss
                                        </button>
                                    </div>
                                    <p className="text-xs text-amber-700 mb-3">
                                        This barcode wasn't found. Please select the product manually from the list above to add it to your cart.
                                    </p>
                                </div>
                            )}

                            {/* Live Cart Preview */}
                            {cart.length > 0 && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600">
                                            🛒 Cart Preview ({cart.length} items)
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Total: ₹{cartTotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr className="text-gray-500">
                                                    <th className="px-3 py-2 text-left">Product</th>
                                                    <th className="px-3 py-2 text-center w-20">Qty</th>
                                                    <th className="px-3 py-2 text-right w-24">Price</th>
                                                    <th className="px-3 py-2 text-right w-24">Total</th>
                                                    <th className="px-3 py-2 text-center w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {cart.map(item => (
                                                    <tr key={item.productId} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2">
                                                            <div>
                                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                                <p className="text-gray-400 font-mono text-[10px]">{item.barcode || item.sku}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.qty}
                                                                onChange={e => updateCartItem(item.productId, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="w-16 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.buyPrice}
                                                                onChange={e => updateCartItem(item.productId, 'buyPrice', parseFloat(e.target.value) || 0)}
                                                                className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right font-medium text-gray-700">
                                                            ₹{(item.qty * item.buyPrice).toFixed(2)}
                                                        </td>
                                                        <td className="px-3 py-2 text-center">
                                                            <button
                                                                onClick={() => removeCartItem(item.productId)}
                                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                            >
                                                                ✕
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={stopScanning}
                                    disabled={cart.length === 0}
                                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <span>✓</span> Review & Save GRN
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Review Section */}
                    {sessionState === SESSION.REVIEWING && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Review GRN Before Saving</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Verify quantities and prices before finalizing
                                    </p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                    {warehouses.find(w => w.id === toWH)?.name} · {vendors.find(v => v.id === vendor)?.name}
                                </span>
                            </div>

                            {/* Full Cart Table for Review */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="text-gray-500 text-xs">
                                            <th className="px-4 py-3 text-left">Product</th>
                                            <th className="px-4 py-3 text-left">Barcode/SKU</th>
                                            <th className="px-4 py-3 text-center w-24">Quantity</th>
                                            <th className="px-4 py-3 text-right w-28">Unit Price</th>
                                            <th className="px-4 py-3 text-right w-28">Total</th>
                                            <th className="px-4 py-3 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {cart.map(item => (
                                            <tr key={item.productId} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.barcode || item.sku || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.qty}
                                                        onChange={e => updateCartItem(item.productId, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="w-20 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.buyPrice}
                                                        onChange={e => updateCartItem(item.productId, 'buyPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-24 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-700">
                                                    ₹{(item.qty * item.buyPrice).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => removeCartItem(item.productId)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                        <tr className="font-semibold">
                                            <td colSpan="3" className="px-4 py-3 text-right text-gray-700">
                                                Total: {totalUnits} units · {cart.length} products
                                            </td>
                                            <td colSpan="2" className="px-4 py-3 text-right text-blue-700 text-lg">
                                                ₹{cartTotal.toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={backToScanning}
                                    className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                                >
                                    ← Back to Adding Products
                                </button>
                                <button
                                    onClick={saveGRN}
                                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    ✅ Create GRN & Update Stock
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* GRN History Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">GRN History</h3>
                    <span className="text-xs text-gray-400">{grns.length} record{grns.length !== 1 ? "s" : ""}</span>
                </div>
                
                {grns.length === 0 ? (
                    <div className="px-5 py-10 text-center text-gray-400 text-sm">
                        No GRNs yet. Start a new session to receive goods.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-gray-500 text-xs">
                                    <th className="px-4 py-3 text-left">GRN #</th>
                                    <th className="px-4 py-3 text-left">Warehouse</th>
                                    <th className="px-4 py-3 text-left">Vendor</th>
                                    <th className="px-4 py-3 text-left">Invoice</th>
                                    <th className="px-4 py-3 text-center">Items</th>
                                    <th className="px-4 py-3 text-center">Units</th>
                                    <th className="px-4 py-3 text-right">Value</th>
                                    <th className="px-4 py-3 text-left">Location</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grns.map(grn => (
                                    <tr key={grn.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{grn.grnNumber}</td>
                                        <td className="px-4 py-3 text-gray-700">{grn.toWarehouseName}</td>
                                        <td className="px-4 py-3 text-gray-600">{grn.vendorName}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{grn.invoiceNo || "—"}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">{grn.items?.length}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">{grn.totalUnits}</td>
                                        <td className="px-4 py-3 text-right font-medium text-blue-700">₹{grn.totalValue?.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{grn.room} / {grn.rack}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {new Date(grn.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[grn.status]}`}>
                                                {grn.status}
                                            </span>
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
}

// // TABS/WAREHOUSES/WarehouseReceiveTab.jsx
// // Receive goods into a warehouse from a vendor (purchase receipt)
// import React, { useState, useEffect } from "react";
// import { INITIAL_WAREHOUSES, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_PURCHASES } from "../../demoData";
// import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin, isWarehouseRole } from "../../roles";

// const SK = { W: "vyapar_warehouses", V: "vyapar_vendors", P: "vyapar_products", PU: "vyapar_purchases", GRN: "vyapar_grns" };
// const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };
// const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));

// const STATUS_CLS = { received: "bg-green-100 text-green-700", partial: "bg-yellow-100 text-yellow-700", pending: "bg-gray-100 text-gray-500" };

// export default function WarehouseReceiveTab() {
//     const [warehouses, setWarehouses] = useState([]);
//     const [vendors, setVendors] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [grns, setGrns] = useState([]);
//     const [showForm, setShowForm] = useState(false);

//     const [toWH, setToWH] = useState("");
//     const [vendor, setVendor] = useState("");
//     const [invoiceNo, setInvoiceNo] = useState("");
//     const [cart, setCart] = useState([]);
//     const [room, setRoom] = useState("Ground Floor");
//     const [rack, setRack] = useState("R1");

//     useEffect(() => {
//         setWarehouses(filterLocationList(load(SK.W, INITIAL_WAREHOUSES)));
//         setVendors(load(SK.V, INITIAL_VENDORS));
//         setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
//         setGrns(filterByLocation(load(SK.GRN, []), 'toWarehouseId'));

//         if (!isAdmin() && isWarehouseRole()) {
//             setToWH(CURRENT_USER.locationId);
//         }
//     }, []);

//     const addItem = (p) => setCart(prev => {
//         const ex = prev.find(c => c.productId === p.id);
//         if (ex) return prev.map(c => c.productId === p.id ? { ...c, qty: c.qty + 1 } : c);
//         return [...prev, { productId: p.id, name: p.name, qty: 1, buyPrice: p.buyPrice || p.wholesale || 0, unit: p.unit || "Pcs" }];
//     });

//     const saveGRN = () => {
//         if (!toWH || !vendor || cart.length === 0) { alert("Select warehouse, vendor, and add items."); return; }

//         // Update product stock
//         const allP = load(SK.P, INITIAL_PRODUCTS);
//         const updatedP = allP.map(p => {
//             const ci = cart.find(c => c.productId === p.id);
//             if (!ci) return p;
//             return { ...p, stock: (p.stock || 0) + ci.qty, warehouseId: toWH, room, rack, updatedAt: new Date().toISOString() };
//         });
//         save(SK.P, updatedP);

//         const grnRec = {
//             id: `GRN-${Date.now()}`,
//             grnNumber: `GRN-${Date.now().toString().slice(-6)}`,
//             toWarehouseId: toWH,
//             toWarehouseName: warehouses.find(w => w.id === toWH)?.name,
//             vendorId: vendor,
//             vendorName: vendors.find(v => v.id === vendor)?.name,
//             invoiceNo, items: cart, room, rack,
//             status: "received",
//             receivedBy: "Current User",
//             createdAt: new Date().toISOString().split("T")[0],
//             totalValue: cart.reduce((s, c) => s + (c.qty * c.buyPrice), 0),
//         };

//         const allGRN = load(SK.GRN, []);
//         save(SK.GRN, [...allGRN, grnRec]);
//         setGrns(prev => [grnRec, ...prev]);
//         setCart([]); setToWH(""); setVendor(""); setInvoiceNo(""); setShowForm(false);
//         alert("✅ GRN created and stock updated!");
//     };

//     const whRooms = toWH ? (warehouses.find(w => w.id === toWH)?.rooms || ["Ground Floor", "First Floor"]) : ["Ground Floor"];
//     const whRacks = toWH ? (warehouses.find(w => w.id === toWH)?.racks || ["R1", "R2", "R3"]) : ["R1"];

//     return (
//         <div className="space-y-5">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-base font-semibold text-gray-800">Receive Goods (GRN)</h2>
//                     <p className="text-xs text-gray-400 mt-0.5">Create a Goods Receipt Note when stock arrives at the warehouse</p>
//                 </div>
//                 <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ New GRN</button>
//             </div>

//             {showForm && (
//                 <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
//                     <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Create Goods Receipt Note (GRN)</p>
//                     <div className="grid grid-cols-3 gap-4">
//                         <div>
//                             <label className="block text-xs text-gray-500 mb-1">To Warehouse *</label>
//                             <select 
//                                 value={toWH} 
//                                 onChange={e => setToWH(e.target.value)} 
//                                 disabled={!isAdmin() && isWarehouseRole()}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
//                             >
//                                 <option value="">— Select —</option>
//                                 {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs text-gray-500 mb-1">Vendor *</label>
//                             <select value={vendor} onChange={e => setVendor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
//                                 <option value="">— Select Vendor —</option>
//                                 {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs text-gray-500 mb-1">Vendor Invoice No.</label>
//                             <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. VEN-INV-2025" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
//                         </div>
//                         <div>
//                             <label className="block text-xs text-gray-500 mb-1">Place in Room</label>
//                             <select value={room} onChange={e => setRoom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
//                                 {whRooms.map(r => <option key={r} value={r}>{r}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs text-gray-500 mb-1">Rack</label>
//                             <select value={rack} onChange={e => setRack(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
//                                 {whRacks.map(r => <option key={r} value={r}>{r}</option>)}
//                             </select>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-xs text-gray-500 mb-2">Add Products Received</label>
//                         <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2">
//                             {products.map(p => (
//                                 <button key={p.id} onClick={() => addItem(p)} className="text-left p-2 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-lg text-xs cursor-pointer transition-colors">
//                                     <p className="font-medium text-gray-800 truncate">{p.name}</p>
//                                     <p className="text-gray-400">MRP: ₹{p.mrp}</p>
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {cart.length > 0 && (
//                         <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
//                             <thead className="bg-gray-50"><tr>
//                                 <th className="px-3 py-2 text-left text-xs text-gray-500">Product</th>
//                                 <th className="px-3 py-2 text-center text-xs text-gray-500">Qty Received</th>
//                                 <th className="px-3 py-2 text-center text-xs text-gray-500">Buy Price</th>
//                                 <th className="px-3 py-2 text-center text-xs text-gray-500">Value</th>
//                                 <th className="px-3 py-2"></th>
//                             </tr></thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {cart.map(c => (
//                                     <tr key={c.productId}>
//                                         <td className="px-3 py-2 font-medium text-gray-700">{c.name}</td>
//                                         <td className="px-3 py-2"><input type="number" min="1" value={c.qty} onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, qty: +e.target.value || 1 } : x))} className="w-16 px-2 py-1 border rounded text-center text-sm" /></td>
//                                         <td className="px-3 py-2"><input type="number" value={c.buyPrice} onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, buyPrice: +e.target.value || 0 } : x))} className="w-20 px-2 py-1 border rounded text-center text-sm" /></td>
//                                         <td className="px-3 py-2 text-center font-medium text-gray-700">₹{(c.qty * c.buyPrice).toFixed(0)}</td>
//                                         <td className="px-3 py-2 text-center"><button onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))} className="text-red-500 text-xs cursor-pointer">✕</button></td>
//                                     </tr>
//                                 ))}
//                                 <tr className="bg-gray-50">
//                                     <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Total Value:</td>
//                                     <td className="px-3 py-2 text-center font-bold text-blue-700">₹{cart.reduce((s, c) => s + c.qty * c.buyPrice, 0).toFixed(0)}</td>
//                                     <td />
//                                 </tr>
//                             </tbody>
//                         </table>
//                     )}
//                     <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//                         <button onClick={() => { setShowForm(false); setCart([]); }} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
//                         <button onClick={saveGRN} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 cursor-pointer">Create GRN & Update Stock</button>
//                     </div>
//                 </div>
//             )}

//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                 <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
//                     <h3 className="font-semibold text-gray-700 text-sm">GRN Log</h3>
//                 </div>
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50"><tr>
//                         {["GRN #", "Warehouse", "Vendor", "Invoice", "Items", "Total Value", "Room/Rack", "Date", "Status"].map(h => (
//                             <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                         ))}
//                     </tr></thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {grns.length === 0
//                             ? <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">No GRNs yet. Click "New GRN" to receive goods.</td></tr>
//                             : grns.map(g => (
//                                 <tr key={g.id} className="hover:bg-gray-50">
//                                     <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.grnNumber}</td>
//                                     <td className="px-4 py-3 font-medium text-gray-700">{g.toWarehouseName}</td>
//                                     <td className="px-4 py-3 text-gray-600">{g.vendorName}</td>
//                                     <td className="px-4 py-3 font-mono text-xs text-gray-400">{g.invoiceNo || "—"}</td>
//                                     <td className="px-4 py-3 text-gray-600">{g.items?.length}</td>
//                                     <td className="px-4 py-3 font-medium text-blue-700">₹{g.totalValue?.toFixed(0)}</td>
//                                     <td className="px-4 py-3 text-xs text-gray-500">{g.room} / {g.rack}</td>
//                                     <td className="px-4 py-3 text-xs text-gray-400">{g.createdAt}</td>
//                                     <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[g.status] || "bg-gray-100 text-gray-600"}`}>{g.status}</span></td>
//                                 </tr>
//                             ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
