// TABS/UtilitiesTab/SetUpBillPerformaTab/SetUpBillPerformaTab.jsx

import React, { useState } from "react";
import { FileText, Eye, Save } from "lucide-react";

const DEFAULT_BILL = {
    companyName: "OfferWale Baba Pvt Ltd",
    tagline: "Quality Products, Best Prices",
    address: "14, Azad Market Road, Delhi - 110006",
    phone: "+91 98765 43210",
    gstin: "07AABCU9603R1ZX",
    showLogo: true,
    showSignatory: true,
    showBankDetails: true,
    showTerms: true,
    termsText: "Goods once sold will not be taken back. Subject to Delhi jurisdiction.",
    footerNote: "Thank you for your business!",
    gstType: "inclusive",
    billColor: "#1e1e2e",
};

export default function SetUpBillPerformaTab() {
    const [billData, setBillData] = useState(DEFAULT_BILL);

    const update = (field, value) => setBillData((prev) => ({ ...prev, [field]: value }));

    const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300";

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Set Up Bill Performa</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Customise how your invoices and bills look when printed or sent to customers</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Eye size={16} />
                    <Save size={16} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Header Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Company Name</label>
                                <input value={billData.companyName} onChange={(e) => update("companyName", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Tagline</label>
                                <input value={billData.tagline} onChange={(e) => update("tagline", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Address</label>
                                <input value={billData.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Phone</label>
                                <input value={billData.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">GSTIN</label>
                                <input value={billData.gstin} onChange={(e) => update("gstin", e.target.value)} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Display Options</h3>
                        <div className="space-y-2">
                            {[
                                ["showLogo", "Show logo"],
                                ["showSignatory", "Show signatory"],
                                ["showBankDetails", "Show bank details"],
                                ["showTerms", "Show terms & conditions"],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={billData[key]} onChange={() => update(key, !billData[key])} className="rounded border-gray-300" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Footer</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Terms & Conditions</label>
                                <textarea rows={3} value={billData.termsText} onChange={(e) => update("termsText", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Footer Note</label>
                                <input value={billData.footerNote} onChange={(e) => update("footerNote", e.target.value)} className={inputCls} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">GST Display</h3>
                        <select value={billData.gstType} onChange={(e) => update("gstType", e.target.value)} className={inputCls}>
                            <option value="inclusive">GST Inclusive</option>
                            <option value="exclusive">GST Exclusive</option>
                            <option value="none">No GST</option>
                        </select>
                    </div>

                    <button type="button" className="w-full bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center justify-center gap-2">
                        <Save size={16} /> Save Bill Template
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
                        <p className="font-bold text-sm text-gray-900">{billData.companyName}</p>
                        <p className="text-gray-500">{billData.tagline}</p>
                        <p className="text-gray-500 mt-1">{billData.address}</p>
                        <p className="text-gray-500">{billData.phone}</p>
                        <p className="text-gray-500">GSTIN: {billData.gstin}</p>
                        <hr className="my-3 border-gray-200" />
                        <p className="text-center font-bold text-gray-900 text-sm mt-2">TAX INVOICE</p>
                        <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                        <table className="w-full min-w-[720px] lg:min-w-0 mt-3 text-xs text-gray-600">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500">
                                    <th className="text-left py-1">Item</th>
                                    <th className="text-right py-1">Qty</th>
                                    <th className="text-right py-1">Rate</th>
                                    <th className="text-right py-1">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-1">Laptop Backpack</td>
                                    <td className="text-right">2</td>
                                    <td className="text-right">₹1,299</td>
                                    <td className="text-right">₹2,598</td>
                                </tr>
                                <tr>
                                    <td className="py-1">USB-C Hub</td>
                                    <td className="text-right">1</td>
                                    <td className="text-right">₹1,499</td>
                                    <td className="text-right">₹1,499</td>
                                </tr>
                                <tr className="border-t border-gray-200 font-bold">
                                    <td colSpan={3} className="py-2 text-right">Total</td>
                                    <td className="text-right py-2">₹4,097</td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                        {billData.showTerms && (
                            <p className="text-xs text-gray-400 mt-3">{billData.termsText}</p>
                        )}
                        <p className="text-center text-xs text-gray-400 mt-2">{billData.footerNote}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Preview is approximate. Actual bill may vary slightly based on printer settings.</p>
                </div>
            </div>
        </div>
    );
}
