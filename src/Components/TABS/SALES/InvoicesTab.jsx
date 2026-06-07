// src/Components/TABS/SALES/InvoicesTab.jsx
import React, { useState, useEffect } from 'react';

const STORAGE_KEYS = {
    BILLS: 'vyapar_bills',
    SHOPS: 'vyapar_shops'
};

const getData = (key, initialData) => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

const InvoicesTab = () => {
    const [bills, setBills] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        const allBills = getData(STORAGE_KEYS.BILLS, []);
        const allShops = getData(STORAGE_KEYS.SHOPS, []);
        setBills(allBills);
        setShops(allShops);
    }, []);

    const filteredBills = bills.filter(bill => {
        if (selectedShop !== 'all' && bill.shopId !== selectedShop) return false;
        if (dateFilter && bill.date !== dateFilter) return false;
        return true;
    });

    const getShopName = (shopId) => {
        const shop = shops.find(s => s.id === shopId);
        return shop ? shop.name : shopId;
    };

    const totalSales = filteredBills.reduce((sum, b) => sum + b.total, 0);
    const totalGST = filteredBills.reduce((sum, b) => sum + b.gstAmount, 0);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Filter by Shop</label>
                        <select 
                            value={selectedShop} 
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="all">All Shops</option>
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Filter by Date</label>
                        <input 
                            type="date" 
                            value={dateFilter} 
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Summary</label>
                        <div className="flex gap-4">
                            <div><p className="text-xs text-gray-400">Total Sales</p><p className="font-bold text-blue-600">₹{totalSales.toLocaleString()}</p></div>
                            <div><p className="text-xs text-gray-400">Total GST</p><p className="font-bold text-green-600">₹{totalGST.toLocaleString()}</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] lg:min-w-0">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Bill #</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Shop</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredBills.map(bill => (
                                    <tr key={bill.id} className="text-gray-700 hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{bill.billNumber}</code>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{getShopName(bill.shopId)}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{bill.customerName}</p>
                                            <p className="text-xs text-gray-400">{bill.customerMobile}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{bill.date}</td>
                                        <td className="px-6 py-4 text-right font-semibold">₹{bill.total.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                bill.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                                                bill.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {bill.paymentMethod.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedBill(bill)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bill Details Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center text-gray-700 justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Invoice Details</h3>
                            <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500">Bill Number:</span> <span className="font-mono">{selectedBill.billNumber}</span></div>
                                <div><span className="text-gray-500">Date:</span> {selectedBill.date}</div>
                                <div><span className="text-gray-500">Customer:</span> {selectedBill.customerName}</div>
                                <div><span className="text-gray-500">Mobile:</span> {selectedBill.customerMobile}</div>
                                <div><span className="text-gray-500">Shop:</span> {getShopName(selectedBill.shopId)}</div>
                                <div><span className="text-gray-500">Payment:</span> {selectedBill.paymentMethod.toUpperCase()}</div>
                            </div>

                            <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                            <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Item</th>
                                        <th className="px-4 py-2 text-center">Qty</th>
                                        <th className="px-4 py-2 text-right">Price</th>
                                        <th className="px-4 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBill.items.map((item, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2 text-center">{item.qty}</td>
                                            <td className="px-4 py-2 text-right">₹{item.price}</td>
                                            <td className="px-4 py-2 text-right">₹{item.total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t">
                                    <tr><td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal:</td><td className="px-4 py-2 text-right">₹{selectedBill.subtotal}</td></tr>
                                    <tr><td colSpan="3" className="px-4 py-2 text-right font-medium">GST:</td><td className="px-4 py-2 text-right">₹{selectedBill.gstAmount.toFixed(2)}</td></tr>
                                    {selectedBill.creditApplied > 0 && (
                                        <tr><td colSpan="3" className="px-4 py-2 text-right font-medium text-green-600">Credit Applied:</td><td className="px-4 py-2 text-right text-green-600">-₹{selectedBill.creditApplied}</td></tr>
                                    )}
                                    <tr><td colSpan="3" className="px-4 py-2 text-right font-bold">TOTAL:</td><td className="px-4 py-2 text-right font-bold text-blue-600">₹{selectedBill.total.toFixed(2)}</td></tr>
                                </tfoot>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesTab;
// // src/Components/TABS/SALES/InvoicesTab.jsx
// import React, { useState, useEffect } from 'react';

// const STORAGE_KEYS = {
//     BILLS: 'vyapar_bills',
//     SHOPS: 'vyapar_shops'
// };

// const getData = (key, initialData) => {
//     const stored = localStorage.getItem(key);
//     if (stored) return JSON.parse(stored);
//     localStorage.setItem(key, JSON.stringify(initialData));
//     return initialData;
// };

// const InvoicesTab = () => {
//     const [bills, setBills] = useState([]);
//     const [shops, setShops] = useState([]);
//     const [selectedShop, setSelectedShop] = useState('all');
//     const [dateFilter, setDateFilter] = useState('');
//     const [selectedBill, setSelectedBill] = useState(null);

//     useEffect(() => {
//         const allBills = getData(STORAGE_KEYS.BILLS, []);
//         const allShops = getData(STORAGE_KEYS.SHOPS, []);
//         setBills(allBills);
//         setShops(allShops);
//     }, []);

//     const filteredBills = bills.filter(bill => {
//         if (selectedShop !== 'all' && bill.shopId !== selectedShop) return false;
//         if (dateFilter && bill.date !== dateFilter) return false;
//         return true;
//     });

//     const getShopName = (shopId) => {
//         const shop = shops.find(s => s.id === shopId);
//         return shop ? shop.name : shopId;
//     };

//     const totalSales = filteredBills.reduce((sum, b) => sum + b.total, 0);
//     const totalGST = filteredBills.reduce((sum, b) => sum + b.gstAmount, 0);

//     return (
//         <div className="space-y-6">
//             {/* Filters */}
//             <div className="bg-white border border-gray-200 rounded-xl p-4">
//                 <div className="grid grid-cols-3 gap-4">
//                     <div>
//                         <label className="block text-xs text-gray-500 mb-1">Filter by Shop</label>
//                         <select 
//                             value={selectedShop} 
//                             onChange={(e) => setSelectedShop(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         >
//                             <option value="all">All Shops</option>
//                             {shops.map(shop => (
//                                 <option key={shop.id} value={shop.id}>{shop.name}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-xs text-gray-500 mb-1">Filter by Date</label>
//                         <input 
//                             type="date" 
//                             value={dateFilter} 
//                             onChange={(e) => setDateFilter(e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-xs text-gray-500 mb-1">Summary</label>
//                         <div className="flex gap-4">
//                             <div><p className="text-xs text-gray-400">Total Sales</p><p className="font-bold text-blue-600">₹{totalSales.toLocaleString()}</p></div>
//                             <div><p className="text-xs text-gray-400">Total GST</p><p className="font-bold text-green-600">₹{totalGST.toLocaleString()}</p></div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Bills Table */}
//             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Bill #</th>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Shop</th>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
//                                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Amount</th>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Payment</th>
//                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {filteredBills.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
//                                         No invoices found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredBills.map(bill => (
//                                     <tr key={bill.id} className="hover:bg-gray-50">
//                                         <td className="px-6 py-4">
//                                             <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{bill.billNumber}</code>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">{getShopName(bill.shopId)}</td>
//                                         <td className="px-6 py-4">
//                                             <p className="text-sm font-medium">{bill.customerName}</p>
//                                             <p className="text-xs text-gray-400">{bill.customerMobile}</p>
//                                         </td>
//                                         <td className="px-6 py-4 text-sm">{bill.date}</td>
//                                         <td className="px-6 py-4 text-right font-semibold">₹{bill.total.toLocaleString()}</td>
//                                         <td className="px-6 py-4">
//                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                                 bill.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
//                                                 bill.paymentMethod === 'upi' ? 'bg-blue-100 text-blue-700' :
//                                                 'bg-purple-100 text-purple-700'
//                                             }`}>
//                                                 {bill.paymentMethod.toUpperCase()}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <button 
//                                                 onClick={() => setSelectedBill(bill)}
//                                                 className="text-blue-600 hover:text-blue-800 text-sm"
//                                             >
//                                                 View Details
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Bill Details Modal */}
//             {selectedBill && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//                         <div className="flex justify-between items-center mb-4">
//                             <h3 className="font-bold text-lg">Invoice Details</h3>
//                             <button onClick={() => setSelectedBill(null)} className="text-gray-400 hover:text-gray-600">✕</button>
//                         </div>
                        
//                         <div className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4 text-sm">
//                                 <div><span className="text-gray-500">Bill Number:</span> <span className="font-mono">{selectedBill.billNumber}</span></div>
//                                 <div><span className="text-gray-500">Date:</span> {selectedBill.date}</div>
//                                 <div><span className="text-gray-500">Customer:</span> {selectedBill.customerName}</div>
//                                 <div><span className="text-gray-500">Mobile:</span> {selectedBill.customerMobile}</div>
//                                 <div><span className="text-gray-500">Shop:</span> {getShopName(selectedBill.shopId)}</div>
//                                 <div><span className="text-gray-500">Payment:</span> {selectedBill.paymentMethod.toUpperCase()}</div>
//                             </div>

//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-4 py-2 text-left">Item</th>
//                                         <th className="px-4 py-2 text-center">Qty</th>
//                                         <th className="px-4 py-2 text-right">Price</th>
//                                         <th className="px-4 py-2 text-right">Total</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {selectedBill.items.map((item, idx) => (
//                                         <tr key={idx} className="border-t">
//                                             <td className="px-4 py-2">{item.name}</td>
//                                             <td className="px-4 py-2 text-center">{item.qty}</td>
//                                             <td className="px-4 py-2 text-right">₹{item.price}</td>
//                                             <td className="px-4 py-2 text-right">₹{item.total}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                                 <tfoot className="border-t">
//                                     <tr><td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal:</td><td className="px-4 py-2 text-right">₹{selectedBill.subtotal}</td></tr>
//                                     <tr><td colSpan="3" className="px-4 py-2 text-right font-medium">GST:</td><td className="px-4 py-2 text-right">₹{selectedBill.gstAmount.toFixed(2)}</td></tr>
//                                     {selectedBill.creditApplied > 0 && (
//                                         <tr><td colSpan="3" className="px-4 py-2 text-right font-medium text-green-600">Credit Applied:</td><td className="px-4 py-2 text-right text-green-600">-₹{selectedBill.creditApplied}</td></tr>
//                                     )}
//                                     <tr><td colSpan="3" className="px-4 py-2 text-right font-bold">TOTAL:</td><td className="px-4 py-2 text-right font-bold text-blue-600">₹{selectedBill.total.toFixed(2)}</td></tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InvoicesTab;