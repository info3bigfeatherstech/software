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
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // active, redeemed, all
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

    // Search customer bills for return
    const searchCustomerBills = () => {
        if (!searchMobile || searchMobile.length < 10) {
            alert('❌ Please enter a valid 10-digit mobile number');
            return;
        }
        
        const customerBills = bills.filter(b => b.customerMobile === searchMobile);
        if (customerBills.length === 0) {
            alert('❌ No bills found for this mobile number');
        }
        return customerBills;
    };

    // Initiate return process
    const initiateReturn = (bill) => {
        setSelectedBill(bill);
        setReturnItems(bill.items.map(item => ({
            ...item,
            returnQty: 0,
            selected: false,
            maxQty: item.qty
        })));
        setShowReturnModal(true);
    };

    // Toggle item selection for return
    const toggleReturnItem = (item) => {
        setReturnItems(returnItems.map(i => 
            i.productId === item.productId 
                ? { ...i, selected: !i.selected, returnQty: !i.selected ? i.maxQty : 0 }
                : i
        ));
    };

    // Update return quantity
    const updateReturnQty = (item, qty) => {
        const newQty = Math.min(parseInt(qty) || 0, item.maxQty);
        setReturnItems(returnItems.map(i => 
            i.productId === item.productId 
                ? { ...i, returnQty: newQty }
                : i
        ));
    };

    // Calculate return amount
    const calculateReturnAmount = () => {
        let total = 0;
        returnItems.forEach(item => {
            if (item.selected && item.returnQty > 0) {
                const itemTotal = (item.price / item.qty) * item.returnQty;
                total += itemTotal;
            }
        });
        return total;
    };

    // Generate credit note
    const generateCreditNote = () => {
        const selectedItems = returnItems.filter(i => i.selected && i.returnQty > 0);
        if (selectedItems.length === 0) {
            alert('❌ Please select items to return');
            return;
        }

        const returnAmount = calculateReturnAmount();
        if (returnAmount <= 0) {
            alert('❌ Invalid return amount');
            return;
        }

        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allCreditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, INITIAL_CREDIT_NOTES);
        const allBills = getData(STORAGE_KEYS.BILLS, INITIAL_BILLS);

        // Update stock - ADD BACK to inventory
        const updatedProducts = allProducts.map(p => {
            const returnItem = selectedItems.find(i => i.productId === p.id);
            if (returnItem && p.shopId === selectedShop) {
                return { ...p, stock: p.stock + returnItem.returnQty };
            }
            return p;
        });
        saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);

        // Update bill status (add return flag)
        const updatedBills = allBills.map(b => 
            b.id === selectedBill.id 
                ? { ...b, hasReturns: true, returnedAmount: (b.returnedAmount || 0) + returnAmount }
                : b
        );
        saveData(STORAGE_KEYS.BILLS, updatedBills);

        // Create credit note
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
                productId: i.productId,
                name: i.name,
                quantity: i.returnQty,
                price: i.price / i.qty,
                total: (i.price / i.qty) * i.returnQty
            })),
            redeemed: false,
            redeemedAt: null,
            redeemedAtShop: null,
            redeemedAtBill: null,
            createdAt: new Date().toISOString().split('T')[0],
            reason: document.getElementById('returnReason')?.value || 'Customer return',
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days expiry
        };

        saveData(STORAGE_KEYS.CREDIT_NOTES, [...allCreditNotes, newCreditNote]);
        setCreditNotes([...allCreditNotes, newCreditNote]);
        setProducts(updatedProducts);
        setShowReturnModal(false);
        setSelectedBill(null);
        setSearchMobile('');
        
        // Generate credit note preview
        const preview = `
╔════════════════════════════════════════╗
║         CREDIT NOTE #${newCreditNote.creditNoteNumber}         ║
╠════════════════════════════════════════╣
║ Original Bill: ${newCreditNote.originalBillNumber}
║ Customer: ${newCreditNote.customerName}
║ Mobile: ${newCreditNote.customerMobile}
║ Date: ${newCreditNote.createdAt}
╠════════════════════════════════════════╣
║ Returned Items:
${newCreditNote.items.map(i => `║ • ${i.name} x${i.quantity} = ₹${i.total}`).join('\n')}
╠════════════════════════════════════════╣
║ Total Credit Amount: ₹${newCreditNote.amount}
║ Valid Until: ${newCreditNote.expiryDate}
╚════════════════════════════════════════╝
        `;
        
        alert(`✅ CREDIT NOTE GENERATED!\n\n${preview}\n\n📱 WhatsApp sent to ${newCreditNote.customerMobile}\n\n💡 Customer can redeem this credit note at any shop by providing their mobile number.`);
    };

    // Check and redeem credit note
    const checkCreditNote = () => {
        if (!redeemMobile || redeemMobile.length < 10) {
            alert('❌ Please enter a valid 10-digit mobile number');
            return;
        }
        
        const activeNotes = creditNotes.filter(cn => 
            cn.customerMobile === redeemMobile && 
            !cn.redeemed &&
            new Date(cn.expiryDate) > new Date()
        );
        
        if (activeNotes.length === 0) {
            alert('❌ No active credit notes found for this mobile number');
            setRedeemAmount(0);
        } else {
            const totalAmount = activeNotes.reduce((sum, cn) => sum + cn.amount, 0);
            setRedeemAmount(totalAmount);
            alert(`💰 Found ${activeNotes.length} active credit note(s)\nTotal available: ₹${totalAmount.toLocaleString()}\n\n💡 Apply this at billing counter by entering mobile number.`);
        }
    };

    // Redeem credit note (manual redemption)
    const redeemCreditNote = (creditNoteId) => {
        const allCreditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, INITIAL_CREDIT_NOTES);
        const updatedNotes = allCreditNotes.map(cn => 
            cn.id === creditNoteId 
                ? { 
                    ...cn, 
                    redeemed: true, 
                    redeemedAt: new Date().toISOString().split('T')[0],
                    redeemedAtShop: selectedShop
                  }
                : cn
        );
        saveData(STORAGE_KEYS.CREDIT_NOTES, updatedNotes);
        setCreditNotes(updatedNotes);
        alert(`✅ Credit note redeemed successfully!`);
    };

    // Filter credit notes based on active tab
    const filteredCreditNotes = creditNotes.filter(cn => {
        const matchesSearch = cn.customerMobile.includes(searchTerm) || 
                              cn.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              cn.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'active') return !cn.redeemed && matchesSearch;
        if (activeTab === 'redeemed') return cn.redeemed && matchesSearch;
        return matchesSearch;
    });

    const getShopName = (shopId) => {
        const shop = shops.find(s => s.id === shopId);
        return shop ? shop.name : shopId;
    };

    const getTotalActiveCredit = () => {
        return creditNotes.filter(cn => !cn.redeemed && new Date(cn.expiryDate) > new Date())
                         .reduce((sum, cn) => sum + cn.amount, 0);
    };

    const getTotalRedeemedCredit = () => {
        return creditNotes.filter(cn => cn.redeemed).reduce((sum, cn) => sum + cn.amount, 0);
    };

    const getExpiringSoonCount = () => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return creditNotes.filter(cn => 
            !cn.redeemed && 
            new Date(cn.expiryDate) <= thirtyDaysFromNow &&
            new Date(cn.expiryDate) > new Date()
        ).length;
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Active Credit Notes</p>
                    <p className="text-2xl font-bold">{creditNotes.filter(cn => !cn.redeemed).length}</p>
                    <p className="text-xs opacity-70 mt-1">Value: ₹{getTotalActiveCredit().toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Redeemed Credit Notes</p>
                    <p className="text-2xl font-bold">{creditNotes.filter(cn => cn.redeemed).length}</p>
                    <p className="text-xs opacity-70 mt-1">Value: ₹{getTotalRedeemedCredit().toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Expiring Soon (30 days)</p>
                    <p className="text-2xl font-bold">{getExpiringSoonCount()}</p>
                    <p className="text-xs opacity-70 mt-1">Need attention</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Total Credit Issued</p>
                    <p className="text-2xl font-bold">₹{creditNotes.reduce((sum, cn) => sum + cn.amount, 0).toLocaleString()}</p>
                    <p className="text-xs opacity-70 mt-1">Lifetime</p>
                </div>
            </div>

            {/* Shop Selector */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">🔄 Returns & Credit Notes</h2>
                    <select 
                        value={selectedShop} 
                        onChange={(e) => setSelectedShop(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
                    >
                        {shops.map(shop => (
                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-2 gap-6">
                {/* Create Return / Credit Note */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🔄</span>
                        </div>
                        <h3 className="font-bold text-gray-800">Create Return & Credit Note</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Process customer returns and generate credit notes redeemable at any shop.</p>
                    
                    <div className="space-y-3 text-gray-700">
                        <input 
                            type="tel" 
                            placeholder="Customer Mobile Number" 
                            value={searchMobile}
                            onChange={(e) => setSearchMobile(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button 
                            onClick={() => {
                                const customerBills = bills.filter(b => b.customerMobile === searchMobile);
                                if (customerBills.length > 0) {
                                    setSelectedBill(customerBills[0]);
                                    initiateReturn(customerBills[0]);
                                } else {
                                    alert('No bills found for this customer');
                                }
                            }}
                            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Find Customer Bills
                        </button>
                    </div>
                </div>

                {/* Redeem Credit Note */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <h3 className="font-bold text-gray-800">Redeem Credit Note</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Customer can redeem credit note at any shop by providing mobile number.</p>
                    
                    <div className="space-y-3 text-gray-700">
                        <input 
                            type="tel" 
                            placeholder="Customer Mobile Number" 
                            value={redeemMobile}
                            onChange={(e) => setRedeemMobile(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button 
                            onClick={checkCreditNote}
                            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Check Credit Notes
                        </button>
                        {redeemAmount > 0 && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800 font-medium">💰 Available Credit: ₹{redeemAmount.toLocaleString()}</p>
                                <p className="text-xs text-green-600 mt-1">Apply at billing counter by entering customer mobile</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs for Credit Notes List */}
            <div className="flex gap-1 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'active' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🟢 Active Credit Notes
                </button>
                <button 
                    onClick={() => setActiveTab('redeemed')}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'redeemed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    ✅ Redeemed Credit Notes
                </button>
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'all' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📋 All Credit Notes
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                    type="text" 
                    placeholder="🔍 Search by customer name, mobile, or credit note number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {/* Credit Notes Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Credit Note #</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Original Bill</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valid Until</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            ｜｜DSML｜｜
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-700 divide-gray-100">
                            {filteredCreditNotes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                                        No credit notes found
                                    </td>
                                </tr>
                            ) : (
                                filteredCreditNotes.map(creditNote => {
                                    const isExpired = new Date(creditNote.expiryDate) < new Date();
                                    return (
                                        <tr key={creditNote.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                    {creditNote.creditNoteNumber || creditNote.id}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{creditNote.customerName}</p>
                                                <p className="text-xs text-gray-400">{creditNote.customerMobile}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-gray-600">{creditNote.originalBillNumber}</code>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{creditNote.createdAt}</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">₹{creditNote.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {creditNote.expiryDate || '90 days from creation'}
                                                    {isExpired && <span className="ml-1 text-red-600">(Expired)</span>}
                                                </span>
                                             </td>
                                            <td className="px-6 py-4">
                                                {creditNote.redeemed ? (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Redeemed</span>
                                                ) : isExpired ? (
                                                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Expired</span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                                                )}
                                             </td>
                                            <td className="px-6 py-4">
                                                {!creditNote.redeemed && !isExpired && (
                                                    <button 
                                                        onClick={() => redeemCreditNote(creditNote.id)}
                                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 mr-2"
                                                    >
                                                        Redeem
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        alert(`Credit Note Details:\n\nNumber: ${creditNote.creditNoteNumber}\nCustomer: ${creditNote.customerName}\nAmount: ₹${creditNote.amount}\nItems: ${creditNote.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}\nReason: ${creditNote.reason}`);
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50"
                                                >
                                                    View
                                                </button>
                                             </td>
                                         </tr>
                                    );
                                })
                            )}
                        </tbody>
                     </table>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Create Return & Credit Note</h3>
                            <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <div className="space-y-4 text-gray-700">
                            {/* Bill Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium">Original Bill: {selectedBill.billNumber}</p>
                                <p className="text-sm text-gray-600">Customer: {selectedBill.customerName} ({selectedBill.customerMobile})</p>
                                <p className="text-sm text-gray-600">Date: {selectedBill.date}</p>
                            </div>

                            {/* Items to Return */}
                            <div>
                                <h4 className="font-medium mb-3">Select Items to Return</h4>
                                <div className="space-y-3">
                                    {returnItems.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                                            <input 
                                                type="checkbox" 
                                                checked={item.selected} 
                                                onChange={() => toggleReturnItem(item)}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">Price: ₹{(item.price / item.qty).toFixed(2)} | GST: {item.gst}%</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Qty:</span>
                                                <input 
                                                    type="number" 
                                                    value={item.returnQty} 
                                                    onChange={(e) => updateReturnQty(item, e.target.value)}
                                                    disabled={!item.selected}
                                                    min="0"
                                                    max={item.maxQty}
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                />
                                                <span className="text-xs text-gray-400">/ {item.maxQty}</span>
                                            </div>
                                            <div className="w-24 text-right">
                                                <p className="font-semibold text-gray-800">
                                                    ₹{((item.price / item.qty) * item.returnQty).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Return Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Return Reason</label>
                                <select id="returnReason" className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="Damaged product">Damaged product</option>
                                    <option value="Expired product">Expired product</option>
                                    <option value="Wrong product delivered">Wrong product delivered</option>
                                    <option value="Customer changed mind">Customer changed mind</option>
                                    <option value="Quality issue">Quality issue</option>
                                </select>
                            </div>

                            {/* Summary */}
                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Credit Amount:</span>
                                    <span className="text-green-600">₹{calculateReturnAmount().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button onClick={generateCreditNote} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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