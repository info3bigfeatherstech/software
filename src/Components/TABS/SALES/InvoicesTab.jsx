// src/Components/TABS/SALES/InvoicesTab.jsx
import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';

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
  <div className="space-y-5 font-['satoshi'] ">

    {/* ====================================================== */}
    {/* TOP SECTION */}
    {/* ====================================================== */}

    <div className="
      grid
      grid-cols-12
      gap-5
    ">

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="
        col-span-8
        bg-white
        border
        border-slate-200
        p-5
        shadow-[0_10px_30px_rgba(15,23,42,0.05)]
    ">

        {/* HEADER */}

        <div className="
          flex
          items-start
          justify-between
          gap-4
          mb-6
        ">

          <div>

            <h2 className="
              text-[24px]
              font-[800]
              tracking-tight
              text-[#111827]
            ">
              Invoice Management
            </h2>

            <p className="
              mt-1.5
              text-sm
              text-slate-500
            ">
              Manage customer invoices and billing history
            </p>
          </div>

          {/* QUICK STAT */}

          <div className="
            px-4
            py-3
            border
            border-red-100
            bg-gradient-to-br
            from-red-50
            to-white
          ">

            <p className="
              text-[10px]
              uppercase
              tracking-[0.14em]
              text-red-400
              font-[700]
            ">
              Total Invoices
            </p>

            <h3 className="
              mt-1
              text-2xl
              font-[900]
              tracking-tight
              text-[#111827]
            ">
              {filteredBills.length}
            </h3>
          </div>
        </div>

        {/* FILTER GRID */}

        <div className="
          grid
          grid-cols-3
          gap-4
        ">

          {/* SHOP */}

          <div>

            <label className="
              block
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-slate-400
              font-[700]
              mb-2
            ">
              Shop
            </label>

            <select
              value={selectedShop}
              onChange={(e) =>
                setSelectedShop(
                  e.target.value
                )
              }
              className="
                w-full
                h-12
                border
                border-slate-200
                bg-[#fbfbfc]
                px-4
                text-sm
                font-[600]
                text-slate-700
                outline-none
                focus:border-red-300
                focus:bg-white
                transition-all
              "
            >

              <option value="all">
                All Shops
              </option>

              {shops.map(shop => (

                <option
                  key={shop.id}
                  value={shop.id}
                >
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}

          <div>

            <label className="
              block
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-slate-400
              font-[700]
              mb-2
            ">
              Date
            </label>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value
                )
              }
              className="
                w-full
                h-12
                rounded-2xl
                border
                border-slate-200
                bg-[#fbfbfc]
                px-4
                text-sm
                text-slate-700
                outline-none
                focus:border-red-300
                focus:bg-white
                transition-all
              "
            />
          </div>

          {/* SEARCH */}

          <div>

            <label className="
              block
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-slate-400
              font-[700]
              mb-2
            ">
              Search
            </label>

            <input
              type="text"
              placeholder="Search invoice..."
              className="
                w-full
                h-12
                rounded-2xl
                border
                border-slate-200
                bg-[#fbfbfc]
                px-4
                text-sm
                text-slate-700
                placeholder:text-slate-400
                outline-none
                focus:border-red-300
                focus:bg-white
                transition-all
              "
            />
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SUMMARY */}
      {/* ====================================================== */}

   {/* ====================================================== */}
{/* SUMMARY */}
{/* ====================================================== */}

<div className="
  col-span-4
  bg-white
  border
  border-slate-200
  p-5
  shadow-[0_10px_30px_rgba(15,23,42,0.05)]
">

  {/* TOP */}

  <div className="
    flex
    items-start
    justify-between
    gap-4
  ">

    <div>

      <p className="
        text-[11px]
        uppercase
        tracking-[0.14em]
        text-slate-400
        font-[700]
      ">
        Revenue Overview
      </p>

      <h2 className="
        mt-3
        text-[36px]
        leading-none
        font-[900]
        tracking-tight
        text-[#111827]
      ">
        ₹{totalSales.toLocaleString()}
      </h2>

      <p className="
        mt-2
        text-sm
        text-slate-500
      ">
        Total invoice revenue generated
      </p>
    </div>

    {/* ICON */}

    <div className="
      w-14
      h-14
      rounded-2xl
      bg-red-50
      border
      border-red-100
      flex
      items-center
      justify-center
      shrink-0
    ">

      <TrendingUp
        size={24}
        className="text-red-500"
      />
    </div>
  </div>

  {/* STATS */}

  <div className="
    mt-6
    grid
    grid-cols-2
    gap-3
  ">

    {/* GST */}

    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-[#fcfcfd]
      p-4
    ">

      <p className="
        text-[10px]
        uppercase
        tracking-[0.12em]
        text-slate-400
        font-[700]
      ">
        GST Collected
      </p>

      <p className="
        mt-2
        text-xl
        font-[800]
        text-[#111827]
      ">
        ₹{totalGST.toLocaleString()}
      </p>
    </div>

    {/* BILLS */}

    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-[#fcfcfd]
      p-4
    ">

      <p className="
        text-[10px]
        uppercase
        tracking-[0.12em]
        text-slate-400
        font-[700]
      ">
        Total Bills
      </p>

      <p className="
        mt-2
        text-xl
        font-[800]
        text-[#111827]
      ">
        {filteredBills.length}
      </p>
    </div>
  </div>

  {/* BOTTOM STRIP */}

  <div className="
    mt-5
    rounded-2xl
    border
    border-red-100
    bg-gradient-to-r
    from-red-50
    to-white
    px-4
    py-3
    flex
    items-center
    justify-between
  ">

    <div>

      <p className="
        text-[10px]
        uppercase
        tracking-[0.12em]
        text-red-400
        font-[700]
      ">
        Today's Growth
      </p>

      <p className="
        mt-1
        text-sm
        font-[700]
        text-[#111827]
      ">
        +12.4% Revenue
      </p>
    </div>

    <div className="
      px-3
      py-1.5
      rounded-xl
      bg-white
      border
      border-red-100
      text-sm
      font-[700]
      text-red-500
    ">
      Healthy
    </div>
  </div>
</div>
    </div>

    {/* ====================================================== */}
    {/* TABLE */}
    {/* ====================================================== */}

    <div className="
      bg-white
      border
      border-slate-200
      rounded-[30px]
      overflow-hidden
      shadow-[0_10px_30px_rgba(15,23,42,0.05)]
    ">

      <div className="overflow-x-auto">

        <table className="w-full">

          {/* ====================================================== */}
          {/* HEAD */}
          {/* ====================================================== */}

          <thead className="
            sticky
            top-0
            z-10
            bg-[#f8fafc]
            border-b
            border-slate-200
          ">

            <tr>

              {[
                "Bill #",
                "Shop",
                "Customer",
                "Date",
                "Amount",
                "Payment",
                "Actions",
              ].map((h) => (

                <th
                  key={h}
                  className="
                    px-6
                    py-4
                    text-left
                    text-[11px]
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                    font-[700]
                  "
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* ====================================================== */}
          {/* BODY */}
          {/* ====================================================== */}

          <tbody className="
            divide-y
            divide-slate-100
          ">

            {filteredBills.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="
                    px-6
                    py-24
                    text-center
                  "
                >

                  <p className="
                    text-sm
                    text-slate-400
                  ">
                    No invoices found
                  </p>
                </td>
              </tr>

            ) : (

              filteredBills.map((bill) => (

                <tr
                  key={bill.id}
                  className="
                    h-[74px]
                    hover:bg-[#fcfcfd]
                    hover:shadow-sm
                    transition-all
                  "
                >

                  {/* BILL */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <code className="
                      inline-flex
                      items-center
                      rounded-xl
                      bg-[#111827]
                      px-3
                      py-2
                      text-[11px]
                      font-[700]
                      tracking-wide
                      text-white
                    ">
                      {bill.billNumber}
                    </code>
                  </td>

                  {/* SHOP */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <p className="
                      text-sm
                      font-[700]
                      text-[#111827]
                    ">
                      {getShopName(bill.shopId)}
                    </p>
                  </td>

                  {/* CUSTOMER */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <p className="
                      text-sm
                      font-[700]
                      text-[#111827]
                    ">
                      {bill.customerName}
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      text-slate-400
                    ">
                      {bill.customerMobile}
                    </p>
                  </td>

                  {/* DATE */}

                  <td className="
                    px-6
                    py-5
                    text-sm
                    text-slate-500
                  ">
                    {bill.date}
                  </td>

                  {/* AMOUNT */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <p className="
                      text-lg
                      font-[800]
                      text-[#111827]
                    ">
                      ₹{bill.total.toLocaleString()}
                    </p>
                  </td>

                  {/* PAYMENT */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <span
                      className={`
                        inline-flex
                        items-center
                        px-3
                        py-1.5
                        rounded-full
                        text-[11px]
                        font-[700]

                        ${
                          bill.paymentMethod === 'cash'

                            ? `
                              bg-slate-100
                              text-slate-700
                            `

                            : bill.paymentMethod === 'upi'

                            ? `
                              bg-blue-50
                              text-blue-600
                            `

                            : `
                              bg-purple-50
                              text-purple-600
                            `
                        }
                      `}
                    >
                      {bill.paymentMethod.toUpperCase()}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td className="
                    px-6
                    py-5
                  ">

                    <button
                      onClick={() =>
                        setSelectedBill(bill)
                      }
                      className="
                        h-10
                        px-4
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        hover:bg-red-50
                        hover:border-red-100
                        text-sm
                        font-[600]
                        text-slate-700
                        transition-all
                      "
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