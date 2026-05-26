// TABS/SALES/BillingTab.jsx
//
// Main Billing Tab - Thin orchestrator
// Composes ProductPicker, CustomerSearch, CartPanel, CheckoutPanel

import React from "react";
import { useSelector } from "react-redux";
import ProductPicker from "./BillingTab_Compo/ProductPicker";
import CustomerSearch from "./BillingTab_Compo/CustomerSearch";
import CartPanel from "./BillingTab_Compo/CartPanel";
import CheckoutPanel from "./BillingTab_Compo/CheckoutPanel";
import VariantPickerModal from "./BillingTab_Compo/VariantPickerModal";
import CreateCustomerModal from "./BillingTab_Compo/CreateCustomerModal";

export default function BillingTab() {
    const { user } = useSelector((state) => state.auth);
    const shop_id = user?.shop_id || "";

    return (
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
            {/* Left Panel - Product Entry */}
            <div className="col-span-7 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
                <ProductPicker shop_id={shop_id} />
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="col-span-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
                <CustomerSearch />
                <CartPanel />
                <CheckoutPanel shop_id={shop_id} />
            </div>

            {/* Modals */}
            <VariantPickerModal />
            <CreateCustomerModal />
        </div>
    );
}

// import React, { useState, useEffect } from 'react';
// import BarcodeScanner from './BillingTab_Compo/BarcodeScanner';

// // ─── Storage helpers ──────────────────────────────────────────────────────────
// const STORAGE_KEYS = {
//   PRODUCTS: 'vyapar_products',
//   BILLS: 'vyapar_bills',
//   CUSTOMERS: 'vyapar_customers',
//   CREDIT_NOTES: 'vyapar_credit_notes',
//   SHOPS: 'vyapar_shops',
// };

// const getData = (key, initialData) => {
//   const stored = localStorage.getItem(key);
//   if (stored) {
//     try { return JSON.parse(stored); } catch (_) {}
//   }
//   localStorage.setItem(key, JSON.stringify(initialData));
//   return initialData;
// };

// const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// // Safe number parser — prevents "0" + 5 = "05" bugs
// const toNumber = (value, defaultValue = 0) => {
//   const num = Number(value);
//   return isNaN(num) ? defaultValue : num;
// };

// // ─── BillingTab ───────────────────────────────────────────────────────────────
// const BillingTab = () => {
//   const [products, setProducts] = useState([]);
//   const [shops, setShops] = useState([]);
//   const [selectedShop, setSelectedShop] = useState('SHP-001');
//   const [cart, setCart] = useState([]);
//   const [customerMobile, setCustomerMobile] = useState('');
//   const [customerName, setCustomerName] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('cash');
//   const [appliedCredit, setAppliedCredit] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [bills, setBills] = useState([]);
//   const [isGstBill, setIsGstBill] = useState(true);
//   const [selectedGstNumber, setSelectedGstNumber] = useState('');
//   const [showScanner, setShowScanner] = useState(false);

//   // ── Load data on shop change ───────────────────────────────────────────────
//   useEffect(() => {
//     const allProducts = getData(STORAGE_KEYS.PRODUCTS, []);
//     const allShops = getData(STORAGE_KEYS.SHOPS, []);
//     const allBills = getData(STORAGE_KEYS.BILLS, []);

//     // FIX: guard against undefined barcode/name before filtering
//     const shopProducts = allProducts.filter(
//       (p) => p.shopId === selectedShop && p.isActive !== false,
//     );
//     setProducts(shopProducts);
//     setShops(allShops);
//     setBills(allBills);

//     const currentShop = allShops.find((s) => s.id === selectedShop);
//     if (currentShop?.gstNumbers?.length > 0) {
//       setSelectedGstNumber(currentShop.gstNumbers[0]);
//     } else {
//       setSelectedGstNumber('');
//     }
//   }, [selectedShop]);

//   // ── Add to cart ────────────────────────────────────────────────────────────
//   // This is what BarcodeScanner calls via onProductFound — product goes to RIGHT panel
//   const addToCart = (product) => {
//     const existing = cart.find((c) => c.productId === product.id);
//     const priceValue = toNumber(product.retail || product.mrp || 0);

//     if (existing) {
//       if (existing.quantity + 1 > toNumber(product.stock)) {
//         alert(`Only ${product.stock} in stock`);
//         return;
//       }
//       setCart(
//         cart.map((c) =>
//           c.productId === product.id
//             ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.price }
//             : c,
//         ),
//       );
//     } else {
//       if (toNumber(product.stock) < 1) {
//         alert('Out of stock');
//         return;
//       }
//       setCart([
//         ...cart,
//         {
//           productId: product.id,
//           name: product.name,
//           quantity: 1,
//           priceType: 'retail',
//           price: priceValue,
//           gst: toNumber(product.gst),
//           total: priceValue,
//           productRef: product,
//         },
//       ]);
//     }
//   };

//   // ── Update quantity ────────────────────────────────────────────────────────
//   const updateQuantity = (productId, newQuantity) => {
//     const parsedQty = toNumber(newQuantity);
//     const product = products.find((p) => p.id === productId);
//     if (!product) return;

//     if (parsedQty > toNumber(product.stock)) {
//       alert(`Only ${product.stock} available`);
//       return;
//     }
//     if (parsedQty <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart(
//       cart.map((c) =>
//         c.productId === productId
//           ? { ...c, quantity: parsedQty, total: parsedQty * c.price }
//           : c,
//       ),
//     );
//   };

//   // ── Update price type ──────────────────────────────────────────────────────
//   const updatePriceType = (productId, newPriceType) => {
//     setCart(
//       cart.map((c) => {
//         if (c.productId !== productId) return c;
//         const newPrice = toNumber(c.productRef[newPriceType] || c.productRef.mrp || 0);
//         return { ...c, priceType: newPriceType, price: newPrice, total: c.quantity * newPrice };
//       }),
//     );
//   };

//   // ── Remove from cart ───────────────────────────────────────────────────────
//   const removeFromCart = (productId) =>
//     setCart(cart.filter((c) => c.productId !== productId));

//   // ── Calculations ───────────────────────────────────────────────────────────
//   const calculateSubtotal = () =>
//     cart.reduce((sum, c) => sum + toNumber(c.total), 0);

//   const calculateGST = () =>
//     isGstBill
//       ? cart.reduce((sum, c) => sum + (toNumber(c.total) * toNumber(c.gst)) / 100, 0)
//       : 0;

//   const calculateTotal = () => calculateSubtotal() + calculateGST();

//   const getFinalTotal = () => {
//     const total = calculateTotal();
//     if (appliedCredit) return Math.max(0, total - toNumber(appliedCredit.amount));
//     return total;
//   };

//   const [customerHistory, setCustomerHistory] = useState(null);

//   // ── Check customer credit & history ─────────────────────────────────────────
//   const checkCustomerInfo = (mobile) => {
//     if (mobile.length !== 10) return;
    
//     // Check Credit
//     const creditNotes = getData(STORAGE_KEYS.CREDIT_NOTES, []);
//     const activeCredit = creditNotes.find(
//       (cn) => cn.customerMobile === mobile && !cn.redeemed,
//     );
//     if (activeCredit) {
//       const normalized = { ...activeCredit, amount: toNumber(activeCredit.amount) };
//       setAppliedCredit(normalized);
//     } else {
//       setAppliedCredit(null);
//     }

//     // Check History
//     const allBills = getData(STORAGE_KEYS.BILLS, []);
//     const customerBills = allBills.filter(b => b.customerMobile === mobile);
//     if (customerBills.length > 0) {
//       const totalSpend = customerBills.reduce((s, b) => s + b.total, 0);
//       const lastVisit = customerBills[customerBills.length - 1].date;
//       const frequentItemIds = customerBills.flatMap(b => b.items.map(i => i.productId));
//       const mostFrequent = frequentItemIds.sort((a,b) =>
//           frequentItemIds.filter(v => v===a).length - frequentItemIds.filter(v => v===b).length
//       ).pop();
      
//       setCustomerHistory({
//         totalBills: customerBills.length,
//         totalSpend,
//         lastVisit,
//         frequentItem: products.find(p => p.id === mostFrequent)?.name || 'N/A'
//       });
//     } else {
//       setCustomerHistory(null);
//     }
//   };

//   // ── Print receipt ──────────────────────────────────────────────────────────
//   const printReceipt = (bill) => {
//     const printWindow = window.open('', '_blank');
//     const shopInfo = shops.find((s) => s.id === bill.shopId);

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Receipt - ${bill.billNumber}</title>
//           <style>
//             body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 10px; margin: 0 auto; color: #000; }
//             .center { text-align: center; }
//             .bold { font-weight: bold; }
//             .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { text-align: left; font-size: 12px; padding: 2px 0; }
//             .right { text-align: right; }
//             .header-text { font-size: 16px; margin: 0 0 5px 0; }
//             .sub-text { font-size: 12px; margin: 0 0 2px 0; }
//           </style>
//         </head>
//         <body>
//           <div class="center border-bottom">
//             <h2 class="header-text bold">BizPro Retail</h2>
//             <p class="sub-text">${shopInfo?.name || 'Store'}</p>
//             ${bill.gstBill ? `<p class="sub-text">GSTIN: ${bill.gstNumberUsed}</p>` : ''}
//           </div>
//           <div class="border-bottom" style="font-size:12px;">
//             <p class="sub-text">Bill No: ${bill.billNumber}</p>
//             <p class="sub-text">Date: ${bill.date} ${bill.time}</p>
//             <p class="sub-text">Customer: ${bill.customerName}</p>
//             <p class="sub-text">Mobile: ${bill.customerMobile}</p>
//             ${!bill.gstBill ? '<p class="sub-text bold" style="margin-top:5px;">ESTIMATE / NON-GST</p>' : ''}
//           </div>
//           <table class="border-bottom">
//             <thead>
//               <tr>
//                 <th>Item</th><th>Qty</th>
//                 <th class="right">Price</th><th class="right">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${bill.items
//                 .map(
//                   (item) => `
//                 <tr>
//                   <td>${item.name.substring(0, 15)}</td>
//                   <td>${item.qty}</td>
//                   <td class="right">${item.price.toFixed(2)}</td>
//                   <td class="right">${item.total.toFixed(2)}</td>
//                 </tr>`,
//                 )
//                 .join('')}
//             </tbody>
//           </table>
//           <div class="border-bottom" style="font-size:12px;">
//             <table style="width:100%">
//               <tr><td>Subtotal:</td><td class="right">₹${bill.subtotal.toFixed(2)}</td></tr>
//               ${bill.gstBill ? `<tr><td>GST:</td><td class="right">₹${bill.gstAmount.toFixed(2)}</td></tr>` : ''}
//               ${bill.creditApplied > 0 ? `<tr><td>Credit Applied:</td><td class="right">-₹${bill.creditApplied.toFixed(2)}</td></tr>` : ''}
//               <tr class="bold">
//                 <td style="font-size:14px;padding-top:5px;">TOTAL:</td>
//                 <td class="right" style="font-size:14px;padding-top:5px;">₹${bill.total.toFixed(2)}</td>
//               </tr>
//             </table>
//           </div>
//           <div class="center" style="font-size:12px;">
//             <p class="sub-text">Payment: ${bill.paymentMethod.toUpperCase()}</p>
//             <p class="sub-text" style="margin-top:10px;">Thank You! Visit Again.</p>
//           </div>
//           <script>
//             window.onload = function() {
//               setTimeout(function() { window.print(); window.close(); }, 250);
//             }
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   // ── Save bill ──────────────────────────────────────────────────────────────
//   const saveBill = () => {
//     if (cart.length === 0) { alert('Add items to cart'); return; }

//     const allProducts = getData(STORAGE_KEYS.PRODUCTS, []);
//     const allBills = getData(STORAGE_KEYS.BILLS, []);
//     const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, []);

//     const subtotal = calculateSubtotal();
//     const gstAmount = calculateGST();
//     const originalTotal = calculateTotal();
//     const finalTotal = getFinalTotal();

//     const newBill = {
//       id: `BILL-${Date.now()}`,
//       billNumber: `INV-${Date.now().toString().slice(-8)}`,
//       shopId: selectedShop,
//       customerMobile: customerMobile || 'WALKIN',
//       customerName: customerName || 'Walk-in Customer',
//       subtotal,
//       gstAmount,
//       total: toNumber(finalTotal),
//       originalTotal,
//       creditApplied: toNumber(appliedCredit?.amount || 0),
//       paymentMethod,
//       gstBill: isGstBill,
//       gstNumberUsed: isGstBill ? selectedGstNumber : null,
//       date: new Date().toISOString().split('T')[0],
//       time: new Date().toLocaleTimeString(),
//       items: cart.map((c) => ({
//         productId: c.productId,
//         name: c.name,
//         qty: c.quantity,
//         price: c.price,
//         priceType: c.priceType,
//         gst: c.gst,
//         total: c.total,
//       })),
//     };

//     // Deduct stock
//     const updatedProducts = allProducts.map((p) => {
//       const cartItem = cart.find((c) => c.productId === p.id);
//       if (cartItem && p.shopId === selectedShop) {
//         return { ...p, stock: toNumber(p.stock) - cartItem.quantity };
//       }
//       return p;
//     });
//     saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);

//     // Upsert customer
//     if (customerMobile && customerMobile !== 'WALKIN') {
//       const existing = allCustomers.find((c) => c.mobile === customerMobile);
//       if (existing) {
//         saveData(
//           STORAGE_KEYS.CUSTOMERS,
//           allCustomers.map((c) =>
//             c.mobile === customerMobile
//               ? { ...c, totalPurchases: toNumber(c.totalPurchases || 0) + newBill.total, lastPurchase: newBill.date }
//               : c,
//           ),
//         );
//       } else {
//         saveData(STORAGE_KEYS.CUSTOMERS, [
//           ...allCustomers,
//           {
//             id: `CUST-${Date.now()}`,
//             name: customerName,
//             mobile: customerMobile,
//             totalPurchases: newBill.total,
//             lastPurchase: newBill.date,
//           },
//         ]);
//       }
//     }

//     // Mark credit note redeemed
//     if (appliedCredit) {
//       const allCN = getData(STORAGE_KEYS.CREDIT_NOTES, []);
//       saveData(
//         STORAGE_KEYS.CREDIT_NOTES,
//         allCN.map((cn) =>
//           cn.id === appliedCredit.id
//             ? { ...cn, redeemed: true, redeemedAt: newBill.id, redeemedAtShop: selectedShop }
//             : cn,
//         ),
//       );
//     }

//     saveData(STORAGE_KEYS.BILLS, [...allBills, newBill]);
//     printReceipt(newBill);

//     // Reset
//     setCart([]);
//     setCustomerMobile('');
//     setCustomerName('');
//     setAppliedCredit(null);
//     setProducts(updatedProducts.filter((p) => p.shopId === selectedShop && p.isActive !== false));
//   };

//   // ── Product search filter — FIX: guard undefined barcode/name ──────────────
//   const filteredProducts = products.filter((p) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       (p.name || '').toLowerCase().includes(term) ||
//       (p.barcode || '').toLowerCase().includes(term)
//     );
//   });

//   const currentShopObj = shops.find((s) => s.id === selectedShop);

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">

//       {/* ════════════════════════════════════════════════════════════════════
//           LEFT PANEL — Product Entry & Barcode Scanner
//       ════════════════════════════════════════════════════════════════════ */}
//       <div className="col-span-7 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//             <span className="text-xl">📱</span> Product Entry
//           </h3>
//           <select
//             value={selectedShop}
//             onChange={(e) => setSelectedShop(e.target.value)}
//             className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium bg-gray-50 focus:ring-blue-500"
//           >
//             {shops.map((shop) => (
//               <option key={shop.id} value={shop.id}>{shop.name}</option>
//             ))}
//           </select>
//         </div>

//         {/*
//          * BarcodeScanner:
//          *   onProductFound={addToCart}  ← when scan succeeds, addToCart runs,
//          *   product appears in the RIGHT panel cart instantly.
//          */}
//         <BarcodeScanner
//           products={products}
//           onProductFound={addToCart}
//           showScanner={showScanner}
//           setShowScanner={setShowScanner}
//           disabled={false}
//         />

//         {/* Product name search */}
//         <div className="relative mb-3">
//           <input
//             type="text"
//             placeholder="🔍 Or search product by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
//           />
//         </div>

//         {/* Product grid */}
//         <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 pb-2 flex-1">
//           {filteredProducts.length === 0 ? (
//             <div className="col-span-3 text-center text-gray-400 py-8">
//               No products found in this shop. Add products in Inventory.
//             </div>
//           ) : (
//             filteredProducts.map((product) => (
//               <button
//                 key={product.id}
//                 onClick={() => addToCart(product)}
//                 disabled={toNumber(product.stock) === 0}
//                 className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between h-24 ${
//                   toNumber(product.stock) === 0
//                     ? 'opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed'
//                     : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer'
//                 }`}
//               >
//                 <p className="font-medium text-sm text-gray-800 line-clamp-2">{product.name}</p>
//                 <div className="mt-auto flex justify-between items-end w-full">
//                   <div>
//                     <p className="text-xs text-gray-500 font-mono">
//                       {(product.barcode || '').slice(-6)}
//                     </p>
//                     <p className="font-bold text-blue-600">
//                       ₹{toNumber(product.retail || product.mrp).toFixed(2)}
//                     </p>
//                   </div>
//                   <span
//                     className={`text-xs px-1.5 py-0.5 rounded font-medium ${
//                       toNumber(product.stock) <= toNumber(product.lowStockAlert)
//                         ? 'bg-red-100 text-red-700'
//                         : 'bg-green-100 text-green-700'
//                     }`}
//                   >
//                     {product.stock} left
//                   </span>
//                 </div>
//               </button>
//             ))
//           )}
//         </div>
//       </div>

//       {/* ════════════════════════════════════════════════════════════════════
//           RIGHT PANEL — Cart & Checkout
//           Products scanned on the left appear here automatically via addToCart
//       ════════════════════════════════════════════════════════════════════ */}
//       <div className="col-span-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-full">

//         {/* Bill header */}
//         <div className="space-y-3 mb-4 flex-shrink-0">
//           <div className="flex justify-between items-center border-b pb-3">
//             <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
//               🛒 Checkout
//             </h3>
//             {/* GST / Estimate toggle */}
//             <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
//               <button
//                 onClick={() => setIsGstBill(false)}
//                 className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
//                   !isGstBill ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 Estimate
//               </button>
//               <button
//                 onClick={() => setIsGstBill(true)}
//                 className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
//                   isGstBill ? 'bg-blue-600 shadow text-white' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 GST Bill
//               </button>
//             </div>
//           </div>

//           {/* GSTIN selector (multi-GST shops) */}
//           {isGstBill && currentShopObj?.gstNumbers?.length > 1 && (
//             <div>
//               <label className="block text-xs text-gray-500 mb-1">Select Shop GSTIN</label>
//               <select
//                 value={selectedGstNumber}
//                 onChange={(e) => setSelectedGstNumber(e.target.value)}
//                 className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
//               >
//                 {currentShopObj.gstNumbers.map((gst) => (
//                   <option key={gst} value={gst}>{gst}</option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Customer inputs */}
//           <div className="grid grid-cols-2 gap-3">
//             <input
//               type="tel"
//               placeholder="Customer Mobile"
//               value={customerMobile}
//               onChange={(e) => {
//                 setCustomerMobile(e.target.value);
//                 if (e.target.value.length === 10) checkCustomerInfo(e.target.value);
//               }}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             />
//             <input
//               type="text"
//               placeholder="Customer Name"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             />
//           </div>

//           {/* Customer Intelligence Banner */}
//           {customerHistory && (
//             <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
//               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">💡</div>
//               <div className="flex-1">
//                 <p className="text-xs font-bold text-blue-800">Customer Intelligence</p>
//                 <div className="flex gap-4 mt-1">
//                   <div>
//                     <p className="text-[10px] text-blue-500 uppercase">Frequent Item</p>
//                     <p className="text-xs font-medium text-blue-900">{customerHistory.frequentItem}</p>
//                   </div>
//                   <div>
//                     <p className="text-[10px] text-blue-500 uppercase">Total Spend</p>
//                     <p className="text-xs font-medium text-blue-900">₹{customerHistory.totalSpend.toFixed(0)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Credit note banner */}
//           {appliedCredit && (
//             <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
//               <div>
//                 <p className="text-sm text-green-800 font-bold">💰 Credit Applied</p>
//                 <p className="text-xs text-green-600">From Return Note</p>
//               </div>
//               <p className="text-lg font-bold text-green-700">
//                 -₹{toNumber(appliedCredit.amount).toFixed(2)}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Cart table */}
//         <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
//           <table className="w-full text-sm">
//             <thead className="bg-white sticky top-0 border-b border-gray-200 shadow-sm z-10">
//               <tr>
//                 <th className="px-3 py-2 text-left text-xs text-gray-500 font-semibold">Item & Price Type</th>
//                 <th className="px-3 py-2 text-center text-xs text-gray-500 font-semibold w-24">Qty</th>
//                 <th className="px-3 py-2 text-right text-xs text-gray-500 font-semibold">Total</th>
//                 <th className="px-2 py-2"></th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {cart.length === 0 ? (
//                 <tr>
//                   <td colSpan="4" className="text-center py-10 text-gray-400">
//                     Scan barcode or click a product to add items
//                   </td>
//                 </tr>
//               ) : (
//                 cart.map((item) => (
//                   <tr key={item.productId} className="bg-white">
//                     <td className="px-3 py-3">
//                       <p className="font-semibold text-gray-800 text-xs">{item.name}</p>
//                       <div className="flex items-center gap-2 mt-1">
//                         <select
//                           value={item.priceType}
//                           onChange={(e) => updatePriceType(item.productId, e.target.value)}
//                           className="text-[10px] py-0.5 px-1 border border-gray-300 rounded bg-gray-50"
//                         >
//                           <option value="retail">Retail (₹{toNumber(item.productRef.retail || 0)})</option>
//                           <option value="wholesale">Wholesale (₹{toNumber(item.productRef.wholesale || 0)})</option>
//                           <option value="mrp">MRP (₹{toNumber(item.productRef.mrp || 0)})</option>
//                           <option value="online">Online (₹{toNumber(item.productRef.online || 0)})</option>
//                         </select>
//                         {isGstBill && (
//                           <span className="text-[10px] text-gray-400">GST: {item.gst}%</span>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-3 py-3">
//                       <div className="flex items-center justify-center border border-gray-300 rounded bg-white">
//                         <button
//                           onClick={() => updateQuantity(item.productId, item.quantity - 1)}
//                           className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
//                         >-</button>
//                         <input
//                           type="number"
//                           value={item.quantity}
//                           onChange={(e) => updateQuantity(item.productId, e.target.value)}
//                           className="w-10 text-center text-sm font-semibold border-x border-gray-300 py-0.5 p-0 focus:ring-0"
//                         />
//                         <button
//                           onClick={() => updateQuantity(item.productId, item.quantity + 1)}
//                           className="px-2 py-0.5 text-gray-500 hover:bg-gray-100"
//                         >+</button>
//                       </div>
//                     </td>
//                     <td className="px-3 py-3 text-right">
//                       <p className="font-bold text-gray-800">₹{toNumber(item.total).toFixed(2)}</p>
//                       <p className="text-[10px] text-gray-400">@ ₹{toNumber(item.price).toFixed(2)}</p>
//                     </td>
//                     <td className="px-2 py-3 text-center">
//                       <button
//                         onClick={() => removeFromCart(item.productId)}
//                         className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md"
//                       >🗑️</button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Totals & checkout footer */}
//         <div className="mt-4 pt-3 border-t border-gray-200 flex-shrink-0">
//           <div className="space-y-1 mb-3">
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Subtotal:</span>
//               <span className="font-medium text-gray-800">₹{calculateSubtotal().toFixed(2)}</span>
//             </div>
//             {isGstBill && (
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-500">Total GST:</span>
//                 <span className="font-medium text-gray-800">₹{calculateGST().toFixed(2)}</span>
//               </div>
//             )}
//             {appliedCredit && (
//               <div className="flex justify-between text-sm text-green-600 font-bold">
//                 <span>Credit Note Applied:</span>
//                 <span>-₹{toNumber(appliedCredit.amount).toFixed(2)}</span>
//               </div>
//             )}
//             <div className="flex justify-between items-center pt-2">
//               <span className="text-lg font-bold text-gray-800">NET PAYABLE:</span>
//               <span className="text-2xl font-black text-blue-600">
//                 ₹{getFinalTotal().toFixed(2)}
//               </span>
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <select
//               value={paymentMethod}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//               className="w-1/3 px-3 py-3 border border-gray-300 rounded-xl text-sm font-semibold bg-gray-50"
//             >
//               <option value="cash">💵 Cash</option>
//               <option value="upi">📱 UPI</option>
//               <option value="card">💳 Card</option>
//             </select>

//             <button
//               onClick={() => {
//                 saveBill();
//                 // Simulate WhatsApp
//                 setTimeout(() => {
//                    alert(`📱 WhatsApp Sent to ${customerMobile || 'Customer'}!\nInvoice PDF has been delivered.`);
//                 }, 1000);
//               }}
//               disabled={cart.length === 0}
//               className={`flex-1 py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
//                 cart.length === 0
//                   ? 'bg-gray-300 cursor-not-allowed shadow-none'
//                   : 'bg-green-600 hover:bg-green-700 hover:shadow-lg active:transform active:scale-95'
//               }`}
//             >
//               <span>🖨️</span> Print & WhatsApp
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillingTab;