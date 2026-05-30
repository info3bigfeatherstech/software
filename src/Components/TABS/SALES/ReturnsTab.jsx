// src/Components/TABS/SALES/ReturnsTab.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_CREDIT_NOTES, INITIAL_BILLS, INITIAL_PRODUCTS, INITIAL_SHOPS } from '../../demoData';

const STORAGE_KEYS = {
    BILLS: 'vyapar_bills',
    PRODUCTS: 'vyapar_products',
    CREDIT_NOTES: 'vyapar_credit_notes',
    SHOPS: 'vyapar_shops'
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

const ReturnsTab = () => {
    const [creditNotes, setCreditNotes] = useState([]);
    const [bills, setBills] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('SHP-001');
    const [searchMobile, setSearchMobile] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const [returnItems, setReturnItems] = useState([]);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [redeemMobile, setRedeemMobile] = useState('');
    const [redeemAmount, setRedeemAmount] = useState(0);

    useEffect(() => {
        const allCreditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, INITIAL_CREDIT_NOTES);
        const allBills = getData(STORAGE_KEYS.BILLS, INITIAL_BILLS);
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allShops = getData(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);
        setCreditNotes(allCreditNotes);
        setBills(allBills.filter(b => b.shopId === selectedShop));
        setProducts(allProducts);
        setShops(allShops);
    }, [selectedShop]);

    const initiateReturn = (bill) => {
        setSelectedBill(bill);
        setReturnItems(bill.items.map(item => ({
            ...item, returnQty: 0, selected: false, maxQty: item.qty
        })));
        setShowReturnModal(true);
    };

    const toggleReturnItem = (item) => {
        setReturnItems(returnItems.map(i =>
            i.productId === item.productId
                ? { ...i, selected: !i.selected, returnQty: !i.selected ? i.maxQty : 0 }
                : i
        ));
    };

    const updateReturnQty = (item, qty) => {
        const newQty = Math.min(parseInt(qty) || 0, item.maxQty);
        setReturnItems(returnItems.map(i =>
            i.productId === item.productId ? { ...i, returnQty: newQty } : i
        ));
    };

    const calculateReturnAmount = () => {
        return returnItems.reduce((total, item) => {
            if (item.selected && item.returnQty > 0) {
                return total + (item.price / item.qty) * item.returnQty;
            }
            return total;
        }, 0);
    };

    const generateCreditNote = () => {
        const selectedItems = returnItems.filter(i => i.selected && i.returnQty > 0);
        if (selectedItems.length === 0) { alert('Please select items to return'); return; }
        const returnAmount = calculateReturnAmount();
        if (returnAmount <= 0) { alert('Invalid return amount'); return; }

        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allCreditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, INITIAL_CREDIT_NOTES);
        const allBills = getData(STORAGE_KEYS.BILLS, INITIAL_BILLS);

        const updatedProducts = allProducts.map(p => {
            const returnItem = selectedItems.find(i => i.productId === p.id);
            if (returnItem && p.shopId === selectedShop) return { ...p, stock: p.stock + returnItem.returnQty };
            return p;
        });
        saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);

        const updatedBills = allBills.map(b =>
            b.id === selectedBill.id
                ? { ...b, hasReturns: true, returnedAmount: (b.returnedAmount || 0) + returnAmount }
                : b
        );
        saveData(STORAGE_KEYS.BILLS, updatedBills);

        const newCreditNote = {
            id: `CN-${Date.now()}`,
            creditNoteNumber: `CR-${Date.now().toString().slice(-8)}`,
            originalBillId: selectedBill.id,
            originalBillNumber: selectedBill.billNumber,
            shopId: selectedShop,
            customerMobile: selectedBill.customerMobile,
            customerName: selectedBill.customerName,
            amount: returnAmount,
            items: selectedItems.map(i => ({
                productId: i.productId, name: i.name, quantity: i.returnQty,
                price: i.price / i.qty, total: (i.price / i.qty) * i.returnQty
            })),
            redeemed: false,
            redeemedAt: null,
            redeemedAtShop: null,
            redeemedAtBill: null,
            createdAt: new Date().toISOString().split('T')[0],
            reason: document.getElementById('returnReason')?.value || 'Customer return',
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        saveData(STORAGE_KEYS.CREDIT_NOTES, [...allCreditNotes, newCreditNote]);
        setCreditNotes([...allCreditNotes, newCreditNote]);
        setProducts(updatedProducts);
        setShowReturnModal(false);
        setSelectedBill(null);
        setSearchMobile('');
        alert(`Credit note ${newCreditNote.creditNoteNumber} generated for ₹${returnAmount.toFixed(2)}`);
    };

    const checkCreditNote = () => {
        if (!redeemMobile || redeemMobile.length < 10) { alert('Please enter a valid 10-digit mobile number'); return; }
        const activeNotes = creditNotes.filter(cn =>
            cn.customerMobile === redeemMobile && !cn.redeemed && new Date(cn.expiryDate) > new Date()
        );
        if (activeNotes.length === 0) { setRedeemAmount(0); alert('No active credit notes found'); }
        else { setRedeemAmount(activeNotes.reduce((sum, cn) => sum + cn.amount, 0)); }
    };

    const redeemCreditNote = (creditNoteId) => {
        const allCreditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, INITIAL_CREDIT_NOTES);
        const updatedNotes = allCreditNotes.map(cn =>
            cn.id === creditNoteId
                ? { ...cn, redeemed: true, redeemedAt: new Date().toISOString().split('T')[0], redeemedAtShop: selectedShop }
                : cn
        );
        saveData(STORAGE_KEYS.CREDIT_NOTES, updatedNotes);
        setCreditNotes(updatedNotes);
    };

    const filteredCreditNotes = creditNotes.filter(cn => {
        const matchesSearch = cn.customerMobile.includes(searchTerm) ||
            cn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cn.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'active') return !cn.redeemed && matchesSearch;
        if (activeTab === 'redeemed') return cn.redeemed && matchesSearch;
        return matchesSearch;
    });

    const getTotalActiveCredit = () =>
        creditNotes.filter(cn => !cn.redeemed && new Date(cn.expiryDate) > new Date())
            .reduce((sum, cn) => sum + cn.amount, 0);

    const getTotalRedeemedCredit = () =>
        creditNotes.filter(cn => cn.redeemed).reduce((sum, cn) => sum + cn.amount, 0);

    const getExpiringSoonCount = () => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return creditNotes.filter(cn =>
            !cn.redeemed && new Date(cn.expiryDate) <= thirtyDaysFromNow && new Date(cn.expiryDate) > new Date()
        ).length;
    };

    const tabs = [
        { key: 'active',   label: 'Active Credit Notes' },
        { key: 'redeemed', label: 'Redeemed' },
        { key: 'all',      label: 'All' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-7  space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 ">Returns & Credit Notes</h1>
                    <p className="text-sm text-gray-400 mt-0.5 ">Process returns and manage credit notes across shops</p>
                </div>
                <select
                    value={selectedShop}
                    onChange={(e) => setSelectedShop(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700  outline-none cursor-pointer"
                >
                    {shops.map(shop => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                    ))}
                </select>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Active Credit Notes', value: creditNotes.filter(cn => !cn.redeemed).length, sub: `Value: ₹${getTotalActiveCredit().toLocaleString()}` },
                    { label: 'Redeemed Credit Notes', value: creditNotes.filter(cn => cn.redeemed).length, sub: `Value: ₹${getTotalRedeemedCredit().toLocaleString()}` },
                    { label: 'Expiring Soon (30 days)', value: getExpiringSoonCount(), sub: 'Need attention' },
                    { label: 'Total Credit Issued', value: `₹${creditNotes.reduce((sum, cn) => sum + cn.amount, 0).toLocaleString()}`, sub: 'Lifetime' },
                ].map((card, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-5 flex flex-col gap-1">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 ">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900  leading-tight">{card.value}</p>
                        <p className="text-xs text-gray-400 ">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Action Cards ── */}
            <div className="grid grid-cols-2 gap-5">

                {/* Create Return */}
                <div className="bg-white border border-gray-100 p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 ">Create Return & Credit Note</h3>
                        <p className="text-xs text-gray-400 mt-1 ">Process customer returns and generate credit notes redeemable at any shop.</p>
                    </div>
                    <input
                        type="tel"
                        placeholder="Customer Mobile Number"
                        value={searchMobile}
                        onChange={(e) => setSearchMobile(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm  outline-none focus:border-gray-400 transition"
                    />
                    <button
                        onClick={() => {
                            const customerBills = bills.filter(b => b.customerMobile === searchMobile);
                            if (customerBills.length > 0) initiateReturn(customerBills[0]);
                            else alert('No bills found for this customer');
                        }}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold  hover:bg-gray-700 transition"
                    >
                        Find Customer Bills
                    </button>
                </div>

                {/* Redeem Credit Note */}
                <div className="bg-white border border-gray-100 p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800 ">Redeem Credit Note</h3>
                        <p className="text-xs text-gray-400 mt-1 ">Customer can redeem credit note at any shop by providing mobile number.</p>
                    </div>
                    <input
                        type="tel"
                        placeholder="Customer Mobile Number"
                        value={redeemMobile}
                        onChange={(e) => setRedeemMobile(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm  outline-none focus:border-gray-400 transition"
                    />
                    <button
                        onClick={checkCreditNote}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold  hover:bg-gray-700 transition"
                    >
                        Check Credit Notes
                    </button>
                    {redeemAmount > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <p className="text-sm font-semibold text-gray-800 ">Available Credit: ₹{redeemAmount.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 mt-0.5 ">Apply at billing counter by entering customer mobile</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-gray-200">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-5 py-2.5 text-sm font-medium  transition-all border-b-2 -mb-px ${
                            activeTab === t.key
                                ? 'text-gray-900 border-gray-900'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Search ── */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl w-full">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by customer name, mobile, or credit note number…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 text-sm bg-transparent outline-none text-gray-700  placeholder:text-gray-400"
                />
            </div>

            {/* ── Table ── */}
            <div className="bg-white border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            {['Credit Note #', 'Customer', 'Original Bill', 'Created', 'Amount', 'Valid Until', 'Status', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredCreditNotes.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-5 py-14 text-center text-sm text-gray-400 ">
                                    No credit notes found
                                </td>
                            </tr>
                        ) : (
                            filteredCreditNotes.map(cn => {
                                const isExpired = new Date(cn.expiryDate) < new Date();
                                return (
                                    <tr key={cn.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-lg ">
                                                {cn.creditNoteNumber || cn.id}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-800 ">{cn.customerName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 ">{cn.customerMobile}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-mono text-gray-500">{cn.originalBillNumber}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-500 ">{cn.createdAt}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-gray-900 ">
                                            ₹{cn.amount.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs  ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
                                                {cn.expiryDate || '90 days from creation'}
                                                {isExpired && ' · Expired'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {cn.redeemed ? (
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-full ">Redeemed</span>
                                            ) : isExpired ? (
                                                <span className="px-2.5 py-1 bg-red-50 text-red-400 text-xs rounded-full ">Expired</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full ">Active</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                {!cn.redeemed && !isExpired && (
                                                    <button
                                                        onClick={() => redeemCreditNote(cn.id)}
                                                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold  hover:bg-gray-700 transition"
                                                    >
                                                        Redeem
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => alert(`Credit Note: ${cn.creditNoteNumber}\nCustomer: ${cn.customerName}\nAmount: ₹${cn.amount}\nItems: ${cn.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}\nReason: ${cn.reason}`)}
                                                    className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold  hover:bg-gray-50 transition"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Return Modal ── */}
            {showReturnModal && selectedBill && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 ">Create Return & Credit Note</h3>
                                <p className="text-xs text-gray-400 mt-0.5 ">Select items to return from the original bill</p>
                            </div>
                            <button onClick={() => setShowReturnModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition text-lg">
                                ✕
                            </button>
                        </div>

                        {/* Bill Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 ">Original Bill</p>
                                    <p className="text-sm font-semibold text-gray-800  mt-0.5">{selectedBill.billNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 ">Customer</p>
                                    <p className="text-sm font-semibold text-gray-800  mt-0.5">{selectedBill.customerName}</p>
                                    <p className="text-xs text-gray-400 ">{selectedBill.customerMobile}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 ">Date</p>
                                    <p className="text-sm font-semibold text-gray-800  mt-0.5">{selectedBill.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-5">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider ">Select Items to Return</p>
                            {returnItems.map(item => (
                                <div
                                    key={item.productId}
                                    onClick={() => toggleReturnItem(item)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                                        item.selected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
                                        item.selected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'
                                    }`}>
                                        {item.selected && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 ">{item.name}</p>
                                        <p className="text-xs text-gray-400 ">₹{(item.price / item.qty).toFixed(2)} per unit · GST {item.gst}%</p>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <span className="text-xs text-gray-400 ">Qty</span>
                                        <input
                                            type="number"
                                            value={item.returnQty}
                                            onChange={(e) => updateReturnQty(item, e.target.value)}
                                            disabled={!item.selected}
                                            min="0"
                                            max={item.maxQty}
                                            className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center  outline-none focus:border-gray-400 disabled:opacity-40"
                                        />
                                        <span className="text-xs text-gray-400 ">/ {item.maxQty}</span>
                                    </div>
                                    <div className="w-20 text-right">
                                        <p className="text-sm font-bold text-gray-900 ">
                                            ₹{((item.price / item.qty) * item.returnQty).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Return Reason */}
                        <div className="mb-5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider  block mb-2">Return Reason</label>
                            <select
                                id="returnReason"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700  outline-none focus:border-gray-400 bg-white"
                            >
                                <option>Damaged product</option>
                                <option>Expired product</option>
                                <option>Wrong product delivered</option>
                                <option>Customer changed mind</option>
                                <option>Quality issue</option>
                            </select>
                        </div>

                        {/* Summary + Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 ">Total Credit Amount</p>
                                <p className="text-xl font-bold text-gray-900 ">₹{calculateReturnAmount().toFixed(2)}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReturnModal(false)}
                                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold  hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={generateCreditNote}
                                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold  hover:bg-gray-700 transition"
                                >
                                    Generate Credit Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnsTab;

// // TABS/SALES/ReturnsTab.jsx
// import React, { useState } from "react";
// import { RETURNS } from "../../demoData";

// const statusColors = {
//     approved: "bg-green-100 text-green-700",
//     pending: "bg-yellow-100 text-yellow-700",
//     rejected: "bg-red-100 text-red-600",
// };

// const ReturnsTab = () => {
//     const [search, setSearch] = useState("");

//     const filtered = RETURNS.filter(r =>
//         r.customer.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search)
//     );

//     return (
//         <div>
//             {/* Stats */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { label: "Total Returns", value: RETURNS.length, color: "text-gray-800" },
//                     { label: "Approved", value: RETURNS.filter(r => r.status === "approved").length, color: "text-green-600" },
//                     { label: "Pending Review", value: RETURNS.filter(r => r.status === "pending").length, color: "text-yellow-600" },
//                     { label: "Total Refunded", value: "₹" + RETURNS.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0).toLocaleString(), color: "text-red-500" },
//                 ].map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             <div className="flex items-center gap-3 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search returns..."
//                     value={search}
//                     onChange={e => setSearch(e.target.value)}
//                     className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                 />
//                 <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                     + New Return
//                 </button>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             {["Return ID", "Original Invoice", "Customer", "Date", "Items", "Amount", "Reason", "Status", "Credit Note"].map(h => (
//                                 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {filtered.map(r => (
//                             <tr key={r.id} className="hover:bg-blue-50/40 transition-colors cursor-pointer">
//                                 <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.id}</td>
//                                 <td className="px-4 py-3 text-xs text-blue-600 underline cursor-pointer">{r.originalInv}</td>
//                                 <td className="px-4 py-3 font-medium text-gray-800">{r.customer}</td>
//                                 <td className="px-4 py-3 text-gray-500 text-xs">{r.date}</td>
//                                 <td className="px-4 py-3 text-center text-gray-600">{r.items}</td>
//                                 <td className="px-4 py-3 font-medium text-gray-700">₹{r.amount.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{r.reason}</td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
//                                         {r.status}
//                                     </span>
//                                 </td>
//                                 <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.creditNote || "—"}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {filtered.length === 0 && (
//                     <div className="py-12 text-center text-gray-400 text-sm">No returns found</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ReturnsTab;