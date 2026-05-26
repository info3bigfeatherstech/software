// ShopStockShared/useBarcodeScanner.js
//
// Hook that listens for keyboard input from a handheld barcode scanner.
// Barcode scanners act like a keyboard — they type fast and end with Enter.
// This hook buffers that input and fires onScan(value) when Enter is detected.
//
// Also exports ScanSearchBar — a text input that accepts both typed search
// and scanner input, then resolves full product data from shop stocks.
//
// Usage — hook only:
//   const { lastScan, clearScan } = useBarcodeScanner({ onScan: (val) => ... });
//
// Usage — component:
//   <ScanSearchBar stocks={stocks} onResult={(stockRow) => openBarcodeModal(stockRow)} />

import { useEffect, useRef, useState, useCallback } from "react";

// ── useBarcodeScanner ─────────────────────────────────────────────────────────
//
// Detects scanner input globally on the document.
// Scanners type each character with ~0ms between keystrokes (vs human ~100ms+).
// We buffer characters and if Enter arrives within SCANNER_TIMEOUT ms, treat it
// as a scanner event.

const SCANNER_TIMEOUT = 80; // ms — scanners are faster than this per char

export function useBarcodeScanner({ onScan, enabled = true } = {}) {
    const bufferRef   = useRef("");
    const timerRef    = useRef(null);
    const [lastScan, setLastScan] = useState(null);

    const flush = useCallback(() => {
        const value = bufferRef.current.trim();
        bufferRef.current = "";
        if (value.length > 1) {
            setLastScan(value);
            onScan?.(value);
        }
    }, [onScan]);

    useEffect(() => {
        if (!enabled) return;

        const handleKey = (e) => {
            // Ignore if focus is inside an input/textarea/select — let the user type normally
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === "input" || tag === "textarea" || tag === "select") return;

            if (e.key === "Enter") {
                clearTimeout(timerRef.current);
                flush();
                return;
            }

            // Only collect printable characters
            if (e.key.length === 1) {
                bufferRef.current += e.key;
                clearTimeout(timerRef.current);
                timerRef.current = setTimeout(flush, SCANNER_TIMEOUT);
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("keydown", handleKey);
            clearTimeout(timerRef.current);
        };
    }, [enabled, flush]);

    const clearScan = useCallback(() => setLastScan(null), []);

    return { lastScan, clearScan };
}

// ── resolveScan ───────────────────────────────────────────────────────────────
//
// Given a raw scan value (Code128 → system_barcode string, or QR → JSON string),
// find the matching stock row from the loaded stocks array.
// Returns the full stock row or null.

export function resolveScan(scanValue, stocks = []) {
    if (!scanValue || !stocks.length) return null;

    // Try to parse as QR JSON payload first
    try {
        const parsed = JSON.parse(scanValue);
        // QR payload has shop_stock_id — direct match
        if (parsed.shop_stock_id) {
            const match = stocks.find(s => s.shop_stock_id === parsed.shop_stock_id);
            if (match) return { stock: match, source: "qr", payload: parsed };
        }
        // Fallback: match by variant_id from QR
        if (parsed.variant_id) {
            const match = stocks.find(s => s.variant_id === parsed.variant_id);
            if (match) return { stock: match, source: "qr", payload: parsed };
        }
        // Fallback: match by system_barcode from QR
        if (parsed.system_barcode) {
            const match = stocks.find(s =>
                s.variant?.system_barcode === parsed.system_barcode ||
                s.variant?.product_code   === parsed.system_barcode ||
                s.variant?.sku            === parsed.system_barcode
            );
            if (match) return { stock: match, source: "qr", payload: parsed };
        }
    } catch {
        // Not JSON — treat as Code128 plain string
    }

    // Code128 plain value — match against system_barcode, product_code, sku
    const val = scanValue.trim();
    const match = stocks.find(s =>
        s.variant?.system_barcode === val ||
        s.variant?.product_code   === val ||
        s.variant?.sku            === val
    );

    if (match) return { stock: match, source: "code128", payload: null };

    return null;
}


// ── ScanSearchBar ─────────────────────────────────────────────────────────────
//
// Drop-in search bar that:
//   1. Accepts typed product name / SKU / barcode text search
//   2. Accepts scanner input (Code128 or QR)
//   3. Calls onResult(stockRow) when a match is found
//   4. Calls onSearch(term) for live text filtering
//
// Props:
//   stocks       — full loaded stocks array (from RTK query)
//   onResult     — called with matching stock row (e.g. open BarcodeModal)
//   onSearch     — called with typed text (for table filtering)
//   placeholder  — input placeholder

export function ScanSearchBar({ stocks = [], onResult, onSearch, placeholder = "Search or scan barcode…" }) {
    const [value, setValue] = useState("");
    const [scanFlash, setScanFlash] = useState(false);
    const inputRef = useRef(null);

    const tryResolve = useCallback((raw) => {
        const result = resolveScan(raw, stocks);
        if (result) {
            setScanFlash(true);
            setTimeout(() => setScanFlash(false), 600);
            onResult?.(result.stock);
            setValue("");
            onSearch?.("");
        }
    }, [stocks, onResult, onSearch]);

    // Also listen for scanner input even when input is focused
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            tryResolve(value);
        }
    }, [value, tryResolve]);

    const handleChange = useCallback((e) => {
        const v = e.target.value;
        setValue(v);
        onSearch?.(v);
    }, [onSearch]);

    const handleClear = useCallback(() => {
        setValue("");
        onSearch?.("");
        inputRef.current?.focus();
    }, [onSearch]);

    return (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Scanner icon */}
            <div style={{
                position: "absolute", left: "10px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
                display: "flex", alignItems: "center",
            }}>
                <svg style={{ width: "15px", height: "15px", color: scanFlash ? "#15803D" : "#9CA3AF", transition: "color 0.2s" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H3a2 2 0 00-2 2v4a2 2 0 002 2h3M9 20H7a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
                </svg>
            </div>

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    height: "36px",
                    padding: "0 32px 0 32px",
                    border: `0.5px solid ${scanFlash ? "#86EFAC" : "#D1D5DB"}`,
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#111827",
                    background: scanFlash ? "#F0FDF4" : "#ffffff",
                    outline: "none",
                    transition: "border-color 0.2s, background 0.2s",
                    fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "#378ADD"}
                onBlur={(e) => e.target.style.borderColor = scanFlash ? "#86EFAC" : "#D1D5DB"}
            />

            {/* Clear button */}
            {value && (
                <button
                    onClick={handleClear}
                    style={{
                        position: "absolute", right: "8px", top: "50%",
                        transform: "translateY(-50%)",
                        width: "18px", height: "18px", borderRadius: "50%",
                        border: "none", background: "#9CA3AF",
                        color: "#fff", fontSize: "11px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", lineHeight: 1,
                    }}
                >✕</button>
            )}

            {/* Flash feedback */}
            {scanFlash && (
                <div style={{
                    position: "absolute", right: "30px", top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "10px", fontWeight: 500, color: "#15803D",
                    background: "#DCFCE7", borderRadius: "10px",
                    padding: "2px 7px", whiteSpace: "nowrap",
                }}>
                    ✓ Found
                </div>
            )}
        </div>
    );
}
