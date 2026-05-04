// TABS/WAREHOUSES/WarehouseReceiveTab.jsx
// Receive goods into a warehouse — scan-session based GRN creation
// Flow: Configure (WH + room + rack) → Scanning Session (scanner stays open) → Review → Save GRN

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { INITIAL_WAREHOUSES, INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_PURCHASES } from "../../demoData";
import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin, isWarehouseRole } from "../../roles";

/* ─── Storage helpers ────────────────────────────────────────── */
const SK = { W: "vyapar_warehouses", V: "vyapar_vendors", P: "vyapar_products", GRN: "vyapar_grns" };
const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };
const save = (k, d) => localStorage.setItem(k, JSON.stringify(d));

/* ─── Session states ─────────────────────────────────────────── */
const SESSION = { IDLE: "IDLE", CONFIGURING: "CONFIGURING", SCANNING: "SCANNING", REVIEWING: "REVIEWING" };
const STATUS_CLS = { received: "bg-green-100 text-green-700", partial: "bg-yellow-100 text-yellow-700", pending: "bg-gray-100 text-gray-500" };

/* ─── Toast component ────────────────────────────────────────── */
function Toast({ toasts }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white transition-all duration-300 ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : t.type === "warn" ? "bg-amber-500" : "bg-blue-600"}`}>
                    <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : t.type === "warn" ? "⚠️" : "ℹ️"}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

/* ─── Inline fallback product picker ─────────────────────────── */
function FallbackPicker({ products, unknownBarcode, onPick, onDismiss }) {
    const [search, setSearch] = useState(unknownBarcode || "");
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || "").includes(search) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);

    return (
        <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-amber-600 text-lg">⚠️</span>
                    <div>
                        <p className="text-sm font-semibold text-amber-800">Unknown Barcode</p>
                        <p className="text-xs text-amber-600 font-mono">{unknownBarcode}</p>
                    </div>
                </div>
                <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-white cursor-pointer">
                    Skip &amp; Continue
                </button>
            </div>
            <p className="text-xs text-amber-700">Search and manually select the product to add it to the cart:</p>
            <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, SKU, barcode..."
                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-300 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                {filtered.length === 0
                    ? <p className="col-span-2 text-xs text-gray-400 text-center py-4">No products match</p>
                    : filtered.map(p => (
                        <button key={p.id} onClick={() => onPick(p)}
                            className="text-left p-2.5 bg-white hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg text-xs cursor-pointer transition-colors shadow-sm">
                            <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                            <p className="text-gray-400 font-mono">{p.barcode || "no barcode"}</p>
                            <p className="text-blue-600">₹{p.mrp} · {p.unit || "Pcs"}</p>
                        </button>
                    ))}
            </div>
        </div>
    );
}

/* ─── Scan Session Scanner ────────────────────────────────────── */
function ScannerPanel({ products, onProductFound, onUnknown, isActive }) {
    const scannerRef = useRef(null);
    const lastScanRef = useRef(null); // debounce duplicate hw-scanner triggers
    const [cameraOn, setCameraOn] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const manualRef = useRef(null);

    const playBeep = (success) => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = "sine";
            if (success) {
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                osc.start(); osc.stop(ctx.currentTime + 0.2);
            } else {
                osc.frequency.setValueAtTime(240, ctx.currentTime);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.start(); osc.stop(ctx.currentTime + 0.35);
            }
        } catch (_) { }
    };

    const processBarcode = useCallback((barcode) => {
        const b = barcode.trim();
        if (!b) return;
        // Debounce: same barcode within 800ms = ignore (hw scanners fire twice)
        if (lastScanRef.current === b) {
            const now = Date.now();
            if (now - lastScanRef.current_time < 800) return;
        }
        lastScanRef.current = b;
        lastScanRef.current_time = Date.now();

        const found = products.find(p => p.barcode === b || p.system_barcode === b);
        if (found) {
            playBeep(true);
            navigator.vibrate?.([80, 40, 80]);
            onProductFound(found);
        } else {
            playBeep(false);
            navigator.vibrate?.([260]);
            onUnknown(b);
        }
    }, [products, onProductFound, onUnknown]);

    // Camera scanner lifecycle
    useEffect(() => {
        if (cameraOn && isActive) {
            const el = document.getElementById("grn-reader");
            if (!el) return;
            el.innerHTML = "";

            const scanner = new Html5QrcodeScanner("grn-reader", {
                fps: 30,
                qrbox: { width: 460, height: 220 },
                aspectRatio: 1.777778,
                experimentalFeatures: { useBarCodeDetectorIfSupported: true }
            }, false);

            scanner.render(
                (result) => { processBarcode(result); },
                () => { }
            );

            scannerRef.current = scanner;
            return () => {
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(() => { });
                    scannerRef.current = null;
                }
            };
        } else if (!cameraOn && scannerRef.current) {
            scannerRef.current.clear().catch(() => { });
            scannerRef.current = null;
        }
    }, [cameraOn, isActive, processBarcode]);

    // Cleanup on unmount
    useEffect(() => () => {
        if (scannerRef.current) { scannerRef.current.clear().catch(() => { }); scannerRef.current = null; }
    }, []);

    // Auto-focus manual input when not using camera
    useEffect(() => {
        if (!cameraOn && isActive) manualRef.current?.focus();
    }, [cameraOn, isActive]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        processBarcode(manualInput.trim());
        setManualInput("");
        manualRef.current?.focus();
    };

    if (!isActive) return null;

    return (
        <div className="space-y-3">
            {/* Manual / HW scanner input — always visible */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌨️</span>
                    <input
                        ref={manualRef}
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        placeholder={cameraOn ? "Camera active — or type barcode here too" : "Scan with hardware scanner or type barcode + Enter"}
                        className="w-full pl-9 pr-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer shrink-0">
                    Add
                </button>
            </form>

            {/* Camera toggle */}
            <button
                onClick={() => setCameraOn(v => !v)}
                className={`w-full py-2 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${cameraOn ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"}`}
            >
                <span>📷</span>
                {cameraOn ? "Close Webcam Scanner" : "Open Webcam Scanner"}
            </button>

            {/* Camera view */}
            {cameraOn && (
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900 shadow-inner">
                    <div id="grn-reader" className="w-full min-h-[220px]" />
                    <p className="text-xs text-gray-400 text-center py-2">
                        Scanner stays open — keep scanning until done
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function WarehouseReceiveTab() {
    const [warehouses, setWarehouses] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [grns, setGrns] = useState([]);

    // Session state machine
    const [sessionState, setSessionState] = useState(SESSION.IDLE);

    // Config fields
    const [toWH, setToWH] = useState("");
    const [vendor, setVendor] = useState("");
    const [invoiceNo, setInvoiceNo] = useState("");
    const [room, setRoom] = useState("");
    const [rack, setRack] = useState("");

    // Cart — items in current scan session
    const [cart, setCart] = useState([]);

    // Fallback picker state
    const [unknownBarcode, setUnknownBarcode] = useState(null); // null = picker closed
    const [scannerPaused, setScannerPaused] = useState(false);

    // Toasts
    const [toasts, setToasts] = useState([]);
    const toastTimers = useRef({});

    useEffect(() => {
        setWarehouses(filterLocationList(load(SK.W, INITIAL_WAREHOUSES)));
        setVendors(load(SK.V, INITIAL_VENDORS));
        setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        setGrns(filterByLocation(load(SK.GRN, []), "toWarehouseId"));
        if (!isAdmin() && isWarehouseRole()) setToWH(CURRENT_USER.locationId);
    }, []);

    const addToast = (msg, type = "info") => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        toastTimers.current[id] = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 2800);
    };

    /* ─── Cart operations ──────────────────────────────────────── */
    const addProductToCart = useCallback((product) => {
        setCart(prev => {
            const ex = prev.find(c => c.productId === product.id);
            if (ex) {
                addToast(`+1 · ${product.name} (qty ${ex.qty + 1})`, "success");
                return prev.map(c => c.productId === product.id ? { ...c, qty: c.qty + 1 } : c);
            }
            addToast(`Added · ${product.name}`, "success");
            return [...prev, {
                productId: product.id,
                name: product.name,
                qty: 1,
                buyPrice: product.buyPrice || product.wholesale || 0,
                unit: product.unit || "Pcs",
                barcode: product.barcode || "",
            }];
        });
    }, []);

    const handleUnknownBarcode = useCallback((barcode) => {
        setUnknownBarcode(barcode);
        setScannerPaused(true);
        addToast(`Unknown barcode: ${barcode}`, "warn");
    }, []);

    const handleFallbackPick = (product) => {
        addProductToCart(product);
        setUnknownBarcode(null);
        setScannerPaused(false);
    };

    const handleFallbackDismiss = () => {
        setUnknownBarcode(null);
        setScannerPaused(false);
        addToast("Skipped unknown barcode — continuing scan", "info");
    };

    /* ─── Session transitions ──────────────────────────────────── */
    const startSession = () => {
        if (!toWH) { addToast("Select a warehouse first", "error"); return; }
        if (!vendor) { addToast("Select a vendor first", "error"); return; }
        const wh = warehouses.find(w => w.id === toWH);
        const defaultRoom = wh?.rooms?.[0] || "Ground Floor";
        const defaultRack = wh?.racks?.[0] || "R1";
        if (!room) setRoom(defaultRoom);
        if (!rack) setRack(defaultRack);
        setCart([]);
        setSessionState(SESSION.SCANNING);
    };

    const stopScanning = () => {
        if (cart.length === 0) { addToast("Cart is empty — scan some products first", "warn"); return; }
        setSessionState(SESSION.REVIEWING);
    };

    const backToScanning = () => setSessionState(SESSION.SCANNING);

    const cancelSession = () => {
        setSessionState(SESSION.IDLE);
        setCart([]);
        setToWH(isAdmin() ? "" : CURRENT_USER.locationId);
        setVendor(""); setInvoiceNo(""); setRoom(""); setRack("");
        setUnknownBarcode(null); setScannerPaused(false);
    };

    const saveGRN = () => {
        if (cart.length === 0) { addToast("Nothing in cart", "error"); return; }

        const allP = load(SK.P, INITIAL_PRODUCTS);
        const updatedP = allP.map(p => {
            const ci = cart.find(c => c.productId === p.id);
            if (!ci) return p;
            return { ...p, stock: (p.stock || 0) + ci.qty, warehouseId: toWH, room, rack, updatedAt: new Date().toISOString() };
        });
        save(SK.P, updatedP);

        const wh = warehouses.find(w => w.id === toWH);
        const vnd = vendors.find(v => v.id === vendor);
        const grnRec = {
            id: `GRN-${Date.now()}`,
            grnNumber: `GRN-${Date.now().toString().slice(-6)}`,
            toWarehouseId: toWH,
            toWarehouseName: wh?.name,
            vendorId: vendor,
            vendorName: vnd?.name,
            invoiceNo,
            items: cart,
            room, rack,
            status: "received",
            receivedBy: CURRENT_USER?.name || "Current User",
            createdAt: new Date().toISOString().split("T")[0],
            totalValue: cart.reduce((s, c) => s + c.qty * c.buyPrice, 0),
        };

        const allGRN = load(SK.GRN, []);
        save(SK.GRN, [...allGRN, grnRec]);
        setGrns(prev => [grnRec, ...prev]);
        addToast(`GRN ${grnRec.grnNumber} created — stock updated!`, "success");
        cancelSession();
    };

    const whRooms = toWH ? (warehouses.find(w => w.id === toWH)?.rooms || ["Ground Floor", "First Floor"]) : ["Ground Floor"];
    const whRacks = toWH ? (warehouses.find(w => w.id === toWH)?.racks || ["R1", "R2", "R3"]) : ["R1"];
    const cartTotal = cart.reduce((s, c) => s + c.qty * c.buyPrice, 0);

    /* ─── Render ─────────────────────────────────────────────────*/
    return (
        <div className="space-y-5">
            <Toast toasts={toasts} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-800">Receive Goods (GRN)</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Scan products into a room/rack, then create GRN to update stock</p>
                </div>
                {sessionState === SESSION.IDLE && (
                    <button
                        onClick={() => setSessionState(SESSION.CONFIGURING)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                        + New GRN
                    </button>
                )}
                {sessionState !== SESSION.IDLE && (
                    <button
                        onClick={cancelSession}
                        className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 cursor-pointer"
                    >
                        ✕ Cancel Session
                    </button>
                )}
            </div>

            {/* ── STEP 1: CONFIGURE ─────────────────────────────────── */}
            {(sessionState === SESSION.CONFIGURING || sessionState === SESSION.SCANNING || sessionState === SESSION.REVIEWING) && (
                <div className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 ${sessionState === SESSION.SCANNING ? "border-green-300" : sessionState === SESSION.REVIEWING ? "border-blue-300" : "border-gray-200"}`}>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        {[
                            { key: SESSION.CONFIGURING, label: "1. Configure", icon: "⚙️" },
                            { key: SESSION.SCANNING, label: "2. Scan Products", icon: "📷" },
                            { key: SESSION.REVIEWING, label: "3. Review & Save", icon: "✅" },
                        ].map((step, i) => {
                            const states = [SESSION.CONFIGURING, SESSION.SCANNING, SESSION.REVIEWING];
                            const currentIdx = states.indexOf(sessionState);
                            const stepIdx = states.indexOf(step.key);
                            const isDone = stepIdx < currentIdx;
                            const isActive = step.key === sessionState;
                            return (
                                <React.Fragment key={step.key}>
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${isActive ? "bg-blue-100 text-blue-700" : isDone ? "bg-green-100 text-green-700" : "text-gray-400"}`}>
                                        <span>{isDone ? "✓" : step.icon}</span>
                                        {step.label}
                                    </div>
                                    {i < 2 && <span className="text-gray-300 text-xs">›</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Config fields — always visible, locked during scan/review */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">To Warehouse *</label>
                            <select
                                value={toWH}
                                onChange={e => setToWH(e.target.value)}
                                disabled={!isAdmin() || sessionState !== SESSION.CONFIGURING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select —</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Vendor *</label>
                            <select
                                value={vendor}
                                onChange={e => setVendor(e.target.value)}
                                disabled={sessionState !== SESSION.CONFIGURING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            >
                                <option value="">— Select Vendor —</option>
                                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Vendor Invoice No.</label>
                            <input
                                value={invoiceNo}
                                onChange={e => setInvoiceNo(e.target.value)}
                                disabled={sessionState !== SESSION.CONFIGURING}
                                placeholder="e.g. VEN-INV-2025"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                Room <span className="text-blue-500">(all items in this session go here)</span>
                            </label>
                            <select
                                value={room || whRooms[0]}
                                onChange={e => setRoom(e.target.value)}
                                disabled={sessionState === SESSION.REVIEWING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                {whRooms.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Rack</label>
                            <select
                                value={rack || whRacks[0]}
                                onChange={e => setRack(e.target.value)}
                                disabled={sessionState === SESSION.REVIEWING}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                            >
                                {whRacks.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Start scanning button */}
                    {sessionState === SESSION.CONFIGURING && (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={startSession}
                                disabled={!toWH || !vendor}
                                className="px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                            >
                                <span>📷</span> Start Scanning Session
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: SCANNING ──────────────────────────────── */}
                    {sessionState === SESSION.SCANNING && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-sm font-semibold text-green-700">Scan Session Active</p>
                                    <span className="text-xs text-gray-400">— scanner stays open until you click Stop</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {cart.length} product{cart.length !== 1 ? "s" : ""} · {cart.reduce((s, c) => s + c.qty, 0)} units
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                                        {room || whRooms[0]} / {rack || whRacks[0]}
                                    </span>
                                </div>
                            </div>

                            {/* Fallback picker — shows ABOVE scanner when active, scanner input still usable */}
                            {unknownBarcode && (
                                <FallbackPicker
                                    products={products}
                                    unknownBarcode={unknownBarcode}
                                    onPick={handleFallbackPick}
                                    onDismiss={handleFallbackDismiss}
                                />
                            )}

                            {/* Scanner panel — paused only for unknown barcode handling */}
                            <ScannerPanel
                                products={products}
                                onProductFound={addProductToCart}
                                onUnknown={handleUnknownBarcode}
                                isActive={!scannerPaused}
                            />

                            {/* Live cart preview during scanning */}
                            {cart.length > 0 && (
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-600">Cart Preview</span>
                                        <span className="text-xs text-gray-400">Scroll to see all</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <tbody className="divide-y divide-gray-50">
                                                {[...cart].reverse().map(c => (
                                                    <tr key={c.productId} className="hover:bg-gray-50">
                                                        <td className="px-3 py-1.5 font-medium text-gray-700">{c.name}</td>
                                                        <td className="px-3 py-1.5 text-center">
                                                            <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">{c.qty}</span>
                                                        </td>
                                                        <td className="px-3 py-1.5 text-right text-gray-500 font-mono">₹{(c.qty * c.buyPrice).toFixed(0)}</td>
                                                        <td className="px-3 py-1.5 text-center">
                                                            <button
                                                                onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))}
                                                                className="text-red-400 hover:text-red-600 cursor-pointer"
                                                            >✕</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={stopScanning}
                                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                                >
                                    ✓ Done Scanning — Review GRN
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: REVIEW ────────────────────────────────── */}
                    {sessionState === SESSION.REVIEWING && (
                        <div className="space-y-4 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-700">Review GRN Before Saving</p>
                                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {room || whRooms[0]} / {rack || whRacks[0]} · {vendors.find(v => v.id === vendor)?.name}
                                </span>
                            </div>

                            {/* Full editable cart */}
                            <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Product", "Barcode", "Qty", "Buy Price (₹)", "Value (₹)", ""].map(h => (
                                            <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {cart.map(c => (
                                        <tr key={c.productId} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-800">{c.name}</td>
                                            <td className="px-3 py-2 font-mono text-xs text-gray-400">{c.barcode || "—"}</td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number" min="1" value={c.qty}
                                                    onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, qty: Math.max(1, +e.target.value || 1) } : x))}
                                                    className="w-16 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number" min="0" value={c.buyPrice}
                                                    onChange={e => setCart(prev => prev.map(x => x.productId === c.productId ? { ...x, buyPrice: +e.target.value || 0 } : x))}
                                                    className="w-20 px-2 py-1 border border-gray-200 rounded text-center text-sm"
                                                />
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-700">₹{(c.qty * c.buyPrice).toFixed(0)}</td>
                                            <td className="px-3 py-2 text-center">
                                                <button onClick={() => setCart(prev => prev.filter(x => x.productId !== c.productId))} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">✕</button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={4} className="px-3 py-2.5 text-right text-sm text-gray-700">
                                            Total · {cart.reduce((s, c) => s + c.qty, 0)} units across {cart.length} SKUs
                                        </td>
                                        <td className="px-3 py-2.5 text-blue-700 font-bold text-sm">₹{cartTotal.toFixed(0)}</td>
                                        <td />
                                    </tr>
                                </tbody>
                            </table>

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={backToScanning}
                                    className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
                                >
                                    ← Back to Scanning
                                </button>
                                <button
                                    onClick={saveGRN}
                                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-2 shadow-sm"
                                >
                                    ✅ Create GRN &amp; Update Stock
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── GRN LOG TABLE ─────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700 text-sm">GRN Log</h3>
                    <span className="text-xs text-gray-400">{grns.length} record{grns.length !== 1 ? "s" : ""}</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {["GRN #", "Warehouse", "Vendor", "Invoice", "SKUs", "Units", "Total Value", "Room / Rack", "Date", "Status"].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {grns.length === 0
                            ? <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400 text-sm">No GRNs yet. Click "New GRN" to start receiving goods.</td></tr>
                            : grns.map(g => (
                                <tr key={g.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{g.grnNumber}</td>
                                    <td className="px-4 py-3 font-medium text-gray-700">{g.toWarehouseName}</td>
                                    <td className="px-4 py-3 text-gray-600">{g.vendorName}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{g.invoiceNo || "—"}</td>
                                    <td className="px-4 py-3 text-gray-600">{g.items?.length}</td>
                                    <td className="px-4 py-3 text-gray-600">{g.items?.reduce((s, i) => s + i.qty, 0)}</td>
                                    <td className="px-4 py-3 font-medium text-blue-700">₹{g.totalValue?.toFixed(0)}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{g.room} / {g.rack}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{g.createdAt}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLS[g.status] || "bg-gray-100 text-gray-600"}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
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
