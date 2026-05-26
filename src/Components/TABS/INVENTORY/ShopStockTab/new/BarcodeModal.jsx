// ShopStockShared/BarcodeModal.jsx
//
// Shows a printable label for a single shop stock row.
// Label contains:
//   - Code128 barcode (system_barcode → scannable by any handheld)
//   - QR code (full JSON payload → scannable by phone)
//   - Human-readable product info below both codes
//
// Usage:
//   <BarcodeModal stock={stockRow} onClose={() => setOpen(false)} />
//
// stockRow shape (from GET /shop-stocks response):
//   stock.variant.system_barcode
//   stock.variant.sku
//   stock.variant.product_code
//   stock.variant.product.name
//   stock.variant.product.product_code
//   stock.shop.shop_name
//   stock.shop.shop_code
//   stock.quantity_available
//   stock.quantity_reserved
//   stock.quantity_in_transit
//   stock.low_stock_threshold

import React, { useEffect, useRef, useCallback } from "react";
import JsBarcode from "jsbarcode";

// ── QR encoder (uses browser canvas, no extra dep beyond qrcode npm pkg) ──────
import QRCode from "qrcode";

export default function BarcodeModal({ stock, onClose }) {
    const barcodeRef = useRef(null);
    const qrRef      = useRef(null);
    const printRef   = useRef(null);

    if (!stock) return null;

    const variant  = stock.variant  || {};
    const product  = variant.product || {};
    const shop     = stock.shop     || {};

    const scanValue = variant.system_barcode || variant.product_code || variant.sku || "NO-BARCODE";

    // Full payload encoded in QR — everything the backend returns for this stock row
    const qrPayload = JSON.stringify({
        system_barcode:      scanValue,
        sku:                 variant.sku,
        product_code:        variant.product_code,
        product_name:        product.name,
        product_id:          product.product_id,
        variant_id:          variant.variant_id,
        shop_id:             shop.shop_id,
        shop_name:           shop.shop_name,
        shop_code:           shop.shop_code,
        quantity_available:  stock.quantity_available,
        quantity_reserved:   stock.quantity_reserved,
        quantity_in_transit: stock.quantity_in_transit,
        low_stock_threshold: stock.low_stock_threshold,
        shop_stock_id:       stock.shop_stock_id,
    });

    useEffect(() => {
        // Code128
        if (barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, scanValue, {
                    format:      "CODE128",
                    width:       2,
                    height:      60,
                    displayValue: false,
                    margin:      0,
                    background:  "#ffffff",
                    lineColor:   "#000000",
                });
            } catch (e) {
                console.error("JsBarcode error", e);
            }
        }

        // QR
        if (qrRef.current) {
            QRCode.toCanvas(qrRef.current, qrPayload, {
                width:          140,
                margin:         1,
                color: { dark: "#000000", light: "#ffffff" },
                errorCorrectionLevel: "M",
            }).catch(console.error);
        }
    }, [scanValue, qrPayload]);

    const handlePrint = useCallback(() => {
        const content = printRef.current?.innerHTML;
        if (!content) return;

        const win = window.open("", "_blank", "width=600,height=500");
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stock Label — ${product.name || scanValue}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Courier New', monospace; background: #fff; }
                    .label { width: 320px; border: 1px solid #000; padding: 10px; margin: 0 auto; }
                    .label-title { font-size: 13px; font-weight: bold; text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 8px; }
                    .codes-row { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
                    .barcode-wrap { flex: 1; }
                    .barcode-wrap svg { max-width: 100%; height: auto; display: block; }
                    .qr-wrap canvas { display: block; }
                    .scan-val { font-size: 10px; text-align: center; letter-spacing: 2px; margin-top: 3px; font-weight: bold; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; font-size: 10px; border-top: 1px dashed #000; padding-top: 6px; }
                    .info-row { display: flex; flex-direction: column; }
                    .info-label { font-size: 8px; text-transform: uppercase; color: #555; letter-spacing: 0.05em; }
                    .info-val { font-size: 11px; font-weight: bold; }
                    .shop-footer { font-size: 9px; text-align: center; margin-top: 6px; border-top: 1px dashed #000; padding-top: 5px; color: #333; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 400);
    }, [product.name, scanValue]);

    const qty = stock.quantity_available ?? "—";
    const isLow = qty > 0 && qty <= (stock.low_stock_threshold || 10);
    const isOut = qty === 0;

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 60,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: "#fff", borderRadius: "14px",
                width: "100%", maxWidth: "640px",
                margin: "0 16px", overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                border: "0.5px solid rgba(0,0,0,0.08)",
            }}>

                {/* Header */}
                <div style={{
                    padding: "14px 20px 12px",
                    borderBottom: "0.5px solid #E5E7EB",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>
                            Stock Label
                        </div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                            Code128 + QR — scan either to get full product data
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                height: "32px", padding: "0 14px", borderRadius: "8px",
                                border: "none", background: "#185FA5", color: "#fff",
                                fontSize: "12px", fontWeight: 500, cursor: "pointer",
                            }}
                        >
                            <svg style={{ width: "13px", height: "13px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Label
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                width: "28px", height: "28px", borderRadius: "6px",
                                border: "0.5px solid #E5E7EB", background: "#F9FAFB",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", fontSize: "15px", color: "#6B7280",
                            }}
                        >✕</button>
                    </div>
                </div>

                {/* Label Preview */}
                <div style={{ padding: "20px", background: "#F9FAFB" }}>
                    <div
                        ref={printRef}
                        style={{
                            width: "320px", margin: "0 auto",
                            border: "1px solid #000", borderRadius: "4px",
                            padding: "10px", background: "#fff",
                            fontFamily: "'Courier New', monospace",
                        }}
                    >
                        {/* Label Title */}
                        <div style={{
                            fontSize: "13px", fontWeight: "bold", textAlign: "center",
                            borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "8px",
                            letterSpacing: "0.02em",
                        }}>
                            {product.name || "—"}
                        </div>

                        {/* Codes row */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "8px" }}>
                            {/* Code128 */}
                            <div style={{ flex: 1 }}>
                                <svg ref={barcodeRef} style={{ width: "100%", height: "auto", display: "block" }} />
                                <div style={{
                                    fontSize: "10px", textAlign: "center",
                                    letterSpacing: "3px", fontWeight: "bold", marginTop: "3px",
                                }}>
                                    {scanValue}
                                </div>
                                <div style={{ fontSize: "8px", textAlign: "center", color: "#555", marginTop: "1px" }}>
                                    CODE128
                                </div>
                            </div>

                            {/* QR */}
                            <div style={{ flexShrink: 0, textAlign: "center" }}>
                                <canvas ref={qrRef} style={{ display: "block" }} />
                                <div style={{ fontSize: "8px", color: "#555", marginTop: "2px" }}>QR · FULL DATA</div>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            gap: "4px 8px",
                            borderTop: "1px dashed #000", paddingTop: "6px",
                            fontSize: "10px",
                        }}>
                            {[
                                ["SKU",       variant.sku || "—"],
                                ["Prod Code", product.product_code || "—"],
                                ["Available", String(stock.quantity_available ?? "—")],
                                ["Reserved",  String(stock.quantity_reserved  ?? 0)],
                                ["In Transit",String(stock.quantity_in_transit ?? 0)],
                                ["Threshold", String(stock.low_stock_threshold ?? "—")],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ fontSize: "8px", textTransform: "uppercase", color: "#666", letterSpacing: "0.05em" }}>{label}</span>
                                    <span style={{ fontSize: "11px", fontWeight: "bold", color: "#000" }}>{val}</span>
                                </div>
                            ))}
                        </div>

                        {/* Shop footer */}
                        <div style={{
                            fontSize: "9px", textAlign: "center",
                            marginTop: "6px", borderTop: "1px dashed #000",
                            paddingTop: "5px", color: "#444",
                        }}>
                            {shop.shop_name || "—"} {shop.shop_code ? `(${shop.shop_code})` : ""}
                        </div>
                    </div>
                </div>

                {/* Live data panel below preview */}
                <div style={{
                    padding: "12px 20px 16px",
                    borderTop: "0.5px solid #E5E7EB",
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px",
                }}>
                    {[
                        { label: "Available",  val: stock.quantity_available ?? "—", color: isOut ? "#DC2626" : isLow ? "#D97706" : "#15803D" },
                        { label: "Reserved",   val: stock.quantity_reserved  ?? 0,   color: "#374151" },
                        { label: "In Transit", val: stock.quantity_in_transit ?? 0,  color: "#185FA5" },
                        { label: "SKU",        val: variant.sku || "—",              color: "#374151" },
                        { label: "Barcode",    val: scanValue,                        color: "#374151" },
                        { label: "Shop",       val: shop.shop_name || "—",           color: "#374151" },
                    ].map(({ label, val, color }) => (
                        <div key={label} style={{
                            background: "#F9FAFB", borderRadius: "8px",
                            padding: "8px 10px",
                            border: "0.5px solid #E5E7EB",
                        }}>
                            <div style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
                                {label}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {String(val)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* QR payload inspector */}
                <div style={{
                    margin: "0 20px 16px",
                    background: "#F3F4F6", borderRadius: "8px",
                    padding: "10px 12px",
                    border: "0.5px solid #E5E7EB",
                }}>
                    <div style={{ fontSize: "10px", fontWeight: 500, color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        QR Encoded Payload (full data on scan)
                    </div>
                    <pre style={{
                        fontSize: "10px", color: "#374151", margin: 0,
                        whiteSpace: "pre-wrap", wordBreak: "break-all",
                        fontFamily: "monospace", maxHeight: "100px", overflowY: "auto",
                    }}>
                        {JSON.stringify(JSON.parse(qrPayload), null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}