// BarcodeGeneratorTab.jsx

import React, { useState } from "react";

const BarcodeGeneratorTab = () => {
    const [productName, setProductName] = useState("");
    const [sku, setSku] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const generateBarcode = () => {
        const code = `INV-${Date.now().toString().slice(-6)}`;
        setGeneratedCode(code);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

            <div>
                <h1 className="text-xl font-bold text-gray-900">
                    Barcode Generator
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                    Generate printable barcodes for inventory products
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Generated Today", value: "124" },
                    { label: "Products Tagged", value: "2,431" },
                    { label: "Pending Labels", value: "42" },
                    { label: "Warehouses", value: "04" },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white border border-gray-200 rounded p-4"
                    >
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {item.label}
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                            {item.value}
                        </h3>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white border border-gray-200 rounded p-5">

                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                            Generate Barcode
                        </h3>

                        <button className="border text-zinc-800 border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm">
                            Bulk Import
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Product Name
                            </label>

                            <input
                                type="text"
                                value={productName}
                                onChange={(e) =>
                                    setProductName(e.target.value)
                                }
                                placeholder="Enter product name"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                SKU Code
                            </label>

                            <input
                                type="text"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                placeholder="SKU-001"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Barcode Type
                            </label>

                            <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                                <option>Code 128</option>
                                <option>EAN-13</option>
                                <option>UPC</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                Quantity
                            </label>

                            <input
                                type="number"
                                defaultValue={1}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <button
                            onClick={generateBarcode}
                            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded text-sm font-semibold"
                        >
                            Generate Barcode
                        </button>

                        <button className="border border-gray-300 hover:bg-gray-50 px-5 py-2 rounded text-sm">
                            Print Labels
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded p-5 flex flex-col justify-center items-center">

                    <div className="w-full border border-dashed border-gray-300 rounded p-6 bg-gray-50 text-center">

                        <div className="h-20 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_4px)] rounded mb-4" />

                        <p className="font-mono text-lg tracking-[0.18em] font-bold text-gray-900">
                            {generatedCode || "INV-XXXXXX"}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                            Code 128 Barcode
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeGeneratorTab;