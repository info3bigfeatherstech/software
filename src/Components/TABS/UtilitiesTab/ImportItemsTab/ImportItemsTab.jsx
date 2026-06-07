// TABS/UtilitiesTab/ImportItemsTab/ImportItemsTab.jsx

import React, { useState } from "react";
import { Upload, FileSpreadsheet, Image, CheckCircle, Download } from "lucide-react";

const IMPORT_HISTORY = [
    { id: "IMP-003", file: "products_may.xlsx", type: "Excel", products: "45 items", status: "Completed", statusClass: "bg-green-50 text-green-700 border border-green-200", by: "Admin", date: "28 May 2026" },
    { id: "IMP-002", file: "products_apr.csv", type: "CSV", products: "38 items", status: "Completed", statusClass: "bg-green-50 text-green-700 border border-green-200", by: "Admin", date: "15 Apr 2026" },
    { id: "IMP-001", file: "catalog.jpg", type: "Image", products: "12 items", status: "Partial", statusClass: "bg-yellow-50 text-yellow-700 border border-yellow-200", by: "Super Admin", date: "02 Apr 2026" },
];

const PREVIEW_ROWS = [
    { code: "PC-1001", name: "Laptop Backpack", mrp: "₹1,299", purchase: "₹850", gst: "18%" },
    { code: "PC-1002", name: "Stainless Steel Bottle", mrp: "₹499", purchase: "₹280", gst: "12%" },
    { code: "PC-1003", name: "Wireless Mouse", mrp: "₹799", purchase: "₹450", gst: "18%" },
    { code: "PC-1004", name: "USB-C Hub", mrp: "₹1,499", purchase: "₹900", gst: "18%" },
    { code: "PC-1005", name: "Desk Organizer", mrp: "₹649", purchase: "₹380", gst: "12%" },
];

const IMPORT_TYPES = [
    { value: "excel", label: "Excel (.xlsx)" },
    { value: "csv", label: "CSV (.csv)" },
    { value: "image", label: "By Image (AI)" },
];

export default function ImportItemsTab() {
    const [importType, setImportType] = useState("excel");
    const [selectedFile, setSelectedFile] = useState(null);
    const [importing, setImporting] = useState(false);

    const handleSelectFile = () => {
        const name = importType === "image" ? "pricelist.jpg" : importType === "csv" ? "products.csv" : "products.xlsx";
        setSelectedFile({ name, size: "128 KB", rows: 45 });
    };

    const acceptLabel = importType === "image" ? "JPG, PNG files (price lists, catalogs)" : importType === "csv" ? ".csv files only" : ".xlsx files only";

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="pb-3 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Import Items</h2>
                <p className="text-sm text-gray-400 mt-0.5">Bulk import products into your inventory via Excel, CSV, or image</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-1 inline-flex gap-1 flex-wrap">
                {IMPORT_TYPES.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setImportType(opt.value); setSelectedFile(null); }}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${importType === opt.value ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50"}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">How to Import</h3>
                {(importType === "excel" || importType === "csv") ? (
                    <>
                        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                            <li>Download the sample template below</li>
                            <li>Fill in your product details (Product Code, Name, MRP, Purchase Price, Special Price, HSN, GST%)</li>
                            <li>Save the file and upload it here</li>
                            <li>Review the preview and confirm import</li>
                        </ol>
                        <button type="button" className="mt-4 bg-white border border-green-200 text-green-600 text-sm px-4 py-2 rounded-lg hover:bg-green-50 inline-flex items-center gap-2 transition-colors">
                            <Download size={14} /> Download Sample Template
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-gray-500">
                            Upload images of your existing product catalog or price list. Our AI will attempt to extract product details automatically.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 mt-3">
                            <p className="text-xs text-yellow-700">Image import is in beta. Always review extracted data before confirming.</p>
                        </div>
                    </>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <button
                    type="button"
                    onClick={handleSelectFile}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                    {importType === "image" ? <Image size={32} className="text-gray-300" /> : <FileSpreadsheet size={32} className="text-gray-300" />}
                    <p className="text-sm text-gray-400">Click to upload file</p>
                    <p className="text-xs text-gray-400">{acceptLabel}</p>
                </button>
            </div>

            {selectedFile && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700">Import Preview</h3>
                    <p className="text-sm text-gray-600">45 products found · 45 new · 0 duplicates · 0 errors</p>
                    <div className="overflow-x-auto border border-gray-100 rounded-lg">
                        <table className="w-full min-w-[720px] lg:min-w-0 text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b text-gray-600 border-gray-100">
                                <tr>
                                    {["Product Code", "Name", "MRP", "Purchase Price", "GST%"].map((h) => (
                                        <th key={h} className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {PREVIEW_ROWS.map((row) => (
                                    <tr key={row.code}>
                                        <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                                        <td className="px-3 py-2">{row.name}</td>
                                        <td className="px-3 py-2">{row.mrp}</td>
                                        <td className="px-3 py-2">{row.purchase}</td>
                                        <td className="px-3 py-2">{row.gst}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="button"
                        disabled={importing}
                        onClick={() => {
                            setImporting(true);
                            setTimeout(() => {
                                setImporting(false);
                                setSelectedFile(null);
                            }, 2000);
                        }}
                        className={`w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center justify-center gap-2 ${importing ? "opacity-60" : ""}`}
                    >
                        <CheckCircle size={16} />
                        {importing ? "Importing..." : "Confirm Import"}
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Import History</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">3 records</span>
                </div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Import ID", "File", "Type", "Products", "Status", "Imported By", "Date"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {IMPORT_HISTORY.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.file}</td>
                                <td className="px-4 py-3 text-gray-600">{row.type}</td>
                                <td className="px-4 py-3 text-gray-600">{row.products}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.statusClass}`}>{row.status}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{row.by}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
