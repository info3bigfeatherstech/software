// TABS/INVENTORY/ShopStockShared/downloadBarcode.js
//
// Utility to download barcode as PNG using JsBarcode
// No API call - purely client-side

import JsBarcode from "jsbarcode";

export function downloadBarcode(barcodeValue, productName) {
    if (!barcodeValue) {
        console.error("No barcode value provided");
        return;
    }

    // Create an off-screen canvas
    const canvas = document.createElement("canvas");

    JsBarcode(canvas, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        lineColor: "#000000",
    });

    // Trigger download
    const link = document.createElement("a");
    const fileName = productName 
        ? `barcode-${productName.replace(/[^a-zA-Z0-9]/g, "-")}.png`
        : `barcode-${barcodeValue}.png`;
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
}