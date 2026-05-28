// src/Components/TABS/SALES/CustomersTab.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_BILLS } from '../../demoData';
import { Users, Activity, TrendingUp, Search, Receipt } from 'lucide-react';

const STORAGE_KEYS = {
    CUSTOMERS: 'vyapar_customers',
    BILLS: 'vyapar_bills',
    SHOPS: 'vyapar_shops'
};

const getData = (key, initialData) => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

const CustomersTab = () => {
    const [customers, setCustomers] = useState([]);
    const [bills, setBills] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState('all');

    useEffect(() => {
        const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
        const allBills = getData(STORAGE_KEYS.BILLS, INITIAL_BILLS);
        const allShops = getData(STORAGE_KEYS.SHOPS, []);
        
        // Ensure all customers have required fields with defaults
        const safeCustomers = allCustomers.map(c => ({
            ...c,
            totalPurchases: c.totalPurchases || 0,
            lastPurchase: c.lastPurchase || 'No purchases',
            name: c.name || 'Unknown',
            mobile: c.mobile || 'N/A'
        }));
        
        setCustomers(safeCustomers);
        setBills(allBills);
        setShops(allShops);
    }, []);

    // Filter customers based on search and shop
    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.mobile.includes(searchTerm);
        return matchesSearch;
    });

    // Get customer bills
    const getCustomerBills = (mobile) => {
        if (!mobile) return [];
        let filtered = bills.filter(b => b.customerMobile === mobile);
        
        // Apply shop filter
        if (selectedShop !== 'all') {
            filtered = filtered.filter(b => b.shopId === selectedShop);
        }
        
        // Sort by date (newest first)
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    // Calculate customer total spent across all shops
    const getTotalSpent = (mobile) => {
        const customerBills = bills.filter(b => b.customerMobile === mobile);
        return customerBills.reduce((sum, b) => sum + (b.total || 0), 0);
    };

    // Get shop name by ID
    const getShopName = (shopId) => {
        const shop = shops.find(s => s.id === shopId);
        return shop?.name || shopId || 'Unknown Shop';
    };

    // Format currency safely
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '₹0';
        return `₹${amount.toLocaleString()}`;
    };

    // Get customer stats
    const getCustomerStats = () => {
        const totalCustomers = customers.length;
        const activeCustomers = customers.filter(c => {
            const lastPurchase = c.lastPurchase;
            if (!lastPurchase || lastPurchase === 'No purchases') return false;
            const daysSinceLast = (new Date() - new Date(lastPurchase)) / (1000 * 3600 * 24);
            return daysSinceLast <= 30;
        }).length;
        const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
        
        return { totalCustomers, activeCustomers, totalRevenue };
    };

    const stats = getCustomerStats();

   return (
  <div className="space-y-5 font-['Satoshi']">

    {/* ====================================================== */}
    {/* TOP STATS */}
    {/* ====================================================== */}

    <div className="
      grid
      grid-cols-3
      gap-5
    ">

      {/* TOTAL CUSTOMERS */}

      <div className="
        bg-white
        border
        border-slate-200
        p-5
        shadow-[0_10px_30px_rgba(15,23,42,0.04)]
        relative
        overflow-hidden
      ">

        <div className="
          absolute
          top-0
          right-0
          w-40
          h-40
          bg-blue-50
          blur-3xl
          rounded-full
        " />

        <div className="relative">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-blue-50
            border
            border-blue-100
            flex
            items-center
            justify-center
          ">
            <Users
              size={22}
              className="text-blue-500"
            />
          </div>

          <p className="
            mt-5
            text-[11px]
            uppercase
            tracking-[0.14em]
            text-slate-400
            font-[700]
          ">
            Total Customers
          </p>

          <h2 className="
            mt-2
            text-[34px]
            leading-none
            font-[900]
            tracking-tight
            text-[#111827]
          ">
            {stats.totalCustomers}
          </h2>

          <p className="
            mt-2
            text-sm
            text-slate-500
          ">
            Registered customer profiles
          </p>
        </div>
      </div>

      {/* ACTIVE */}

      <div className="
        bg-white
        border
        border-slate-200
        p-5
        shadow-[0_10px_30px_rgba(15,23,42,0.04)]
        relative
        overflow-hidden
      ">

        <div className="
          absolute
          top-0
          right-0
          w-40
          h-40
          bg-emerald-50
          blur-3xl
          rounded-full
        " />

        <div className="relative">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-[#17C4BB] text-[#17C4BB] bg-opacity-20
            border
            border-[#17C4BB] border-opacity-30
            flex
            items-center
            justify-center
          ">
            <Activity
              size={22}
              className="text-emerald-500"
            />
          </div>

          <p className="
            mt-5
            text-[11px]
            uppercase
            tracking-[0.14em]
            text-slate-400
            font-[700]
          ">
            Active Customers
          </p>

          <h2 className="
            mt-2
            text-[34px]
            leading-none
            font-[900]
            tracking-tight
            text-[#111827]
          ">
            {stats.activeCustomers}
          </h2>

          <p className="
            mt-2
            text-sm
            text-slate-500
          ">
            Active in last 30 days
          </p>
        </div>
      </div>

      {/* REVENUE */}

      <div className="
        p-5
        relative
        border border-slate-200
         bg-white
        overflow-hidden
      ">

        <div className="
          absolute
          top-0
          right-0
          w-52
          h-52
          blur-3xl
          rounded-full
        " />

        <div className="relative">

          <div className="
            w-12
            h-12
            rounded-2xl
            bg-white/10
            border
            border-zinc-200
            flex
            items-center
            justify-center
          ">
            <TrendingUp
              size={22}
              className="text-red-400"
            />
          </div>

          <p className="
            mt-5
            text-[11px]
            uppercase
            tracking-[0.14em]
            text-slate-500
            font-[700]
          ">
            Total Revenue
          </p>

          <h2 className="
            mt-2
            text-[34px]
            leading-none
            font-[900]
            tracking-tight
            text-zinc-900
          ">
            {formatCurrency(stats.totalRevenue)}
          </h2>

          <p className="
            mt-2
            text-sm
            text-slate-800
          ">
            Customer generated revenue
          </p>
        </div>
      </div>
    </div>

    {/* ====================================================== */}
    {/* SEARCH + FILTER */}
    {/* ====================================================== */}

    <div className="
      bg-white
      border
      border-slate-200
      p-5
      shadow-[0_10px_30px_rgba(15,23,42,0.04)]
    ">

      <div className="
        flex
        items-center
        gap-4
      ">

        {/* SEARCH */}

        <div className="
          flex-1
          relative
        ">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder="Search customers by name or mobile..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="
              w-full
              h-12
              rounded-2xl
              border
              border-slate-200
              bg-[#fbfbfc]
              pl-12
              pr-4
              text-sm
              text-[#111827]
              placeholder:text-slate-400
              outline-none
              focus:border-red-300
              focus:bg-white
              transition-all
            "
          />
        </div>

        {/* FILTER */}

        <select
          value={selectedShop}
          onChange={(e) =>
            setSelectedShop(
              e.target.value
            )
          }
          className="
            h-12
            min-w-[180px]
            rounded-2xl
            border
            border-slate-200
            bg-[#fbfbfc]
            px-4
            text-sm
            font-[600]
            text-slate-700
            outline-none
            focus:border-red-300
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
    </div>

    {/* ====================================================== */}
    {/* MAIN GRID */}
    {/* ====================================================== */}

    <div className="
      grid
      grid-cols-12
      gap-5
    ">

      {/* ====================================================== */}
      {/* CUSTOMER LIST */}
      {/* ====================================================== */}

      <div className="
        col-span-7
        bg-white
        border
        border-slate-200
        overflow-hidden
        shadow-[0_10px_30px_rgba(15,23,42,0.04)]
      ">

        {/* HEADER */}

        <div className="
          px-6
          py-5
          border-b
          border-slate-200
          flex
          items-center
          justify-between
        ">

          <div>

            <h3 className="
              text-[20px]
              font-[800]
              tracking-tight
              text-[#111827]
            ">
              Customer Directory
            </h3>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Manage customer profiles & activity
            </p>
          </div>

          <div className="
            px-3
            py-2
            rounded-2xl
            bg-red-50
            border
            border-red-100
            text-sm
            font-[700]
            text-red-500
          ">
            {filteredCustomers.length} Customers
          </div>
        </div>

        {/* LIST */}

        <div className="
          max-h-[650px]
          overflow-y-auto
        ">

          {filteredCustomers.length === 0 ? (

            <div className="
              py-24
              text-center
            ">

              <Users
                size={42}
                className="
                  mx-auto
                  text-slate-300
                "
              />

              <p className="
                mt-4
                text-sm
                text-slate-500
              ">
                No customers found
              </p>
            </div>

          ) : (

            <div className="
              divide-y
              divide-slate-100
            ">

              {filteredCustomers.map(c => {

                const isSelected =
                  selectedCustomer?.mobile === c.mobile;

                const totalSpent =
                  getTotalSpent(c.mobile);

                return (

                  <div
                    key={c.id || c.mobile}
                    onClick={() =>
                      setSelectedCustomer(c)
                    }
                    className={`
                      px-6
                      py-5
                      cursor-pointer
                      transition-all
                      hover:bg-[#fcfcfd]

                      ${
                        isSelected

                          ? `
                            bg-red-50/50
                            border-l-[3px]
                            border-red-500
                          `

                          : ''
                      }
                    `}
                  >

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      {/* LEFT */}

                      <div className="flex-1">

                        <div className="
                          flex
                          items-center
                          gap-3
                        ">

                          {/* AVATAR */}

                          <div className="
                            w-12
                            h-12
                            bg-[#111827]
                            text-white
                            flex
                            items-center
                            justify-center
                            text-sm
                            font-[800]
                            shrink-0
                          ">
                            {c.name?.charAt(0)}
                          </div>

                          <div>

                            <p className="
                              text-sm
                              font-[800]
                              text-[#111827]
                            ">
                              {c.name}
                            </p>

                            <p className="
                              mt-1
                              text-sm
                              text-slate-500
                            ">
                              {c.mobile}
                            </p>
                          </div>
                        </div>

                        {/* BOTTOM */}

                        <div className="
                          flex
                          items-center
                          gap-3
                          mt-4
                        ">

                          <div className="
                            px-3
                            py-1.5
                            rounded-xl
                            bg-slate-100
                            text-[11px]
                            font-[700]
                            text-slate-600
                          ">
                            {getCustomerBills(c.mobile).length} Orders
                          </div>

                          <div className="
                            px-3
                            py-1.5
                            rounded-xl
                            bg-blue-50
                            text-[11px]
                            font-[700]
                            text-blue-600
                          ">
                            Last: {c.lastPurchase}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div className="text-right">

                        <p className="
                          text-[22px]
                          font-[900]
                          tracking-tight
                          text-[#111827]
                        ">
                          {formatCurrency(totalSpent)}
                        </p>

                        <p className="
                          mt-1
                          text-xs
                          text-slate-400
                        ">
                          Total Spent
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* HISTORY */}
      {/* ====================================================== */}

      <div className="
        col-span-5
        bg-white
        border
        border-slate-200
        overflow-hidden
        shadow-[0_10px_30px_rgba(15,23,42,0.04)]
      ">

        {/* HEADER */}

        <div className="
          px-6
          py-5
          border-b
          border-slate-200
        ">

          <h3 className="
            text-[20px]
            font-[800]
            tracking-tight
            text-[#111827]
          ">
            Purchase History
          </h3>

          {selectedCustomer ? (

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              {selectedCustomer.name}
              {" • "}
              {selectedCustomer.mobile}
            </p>

          ) : (

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Select customer to view purchases
            </p>
          )}
        </div>

        {/* CONTENT */}

        <div className="
          max-h-[650px]
          overflow-y-auto
          p-5
        ">

          {!selectedCustomer ? (

            <div className="
              h-[500px]
              flex
              flex-col
              items-center
              justify-center
              text-center
            ">

              <Receipt
                size={44}
                className="text-slate-300"
              />

              <p className="
                mt-4
                text-sm
                text-slate-500
              ">
                Select a customer to view invoices
              </p>
            </div>

          ) : (() => {

            const customerBills =
              getCustomerBills(
                selectedCustomer.mobile
              );

            if (customerBills.length === 0) {

              return (

                <div className="
                  h-[500px]
                  flex
                  items-center
                  justify-center
                ">

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    No purchases yet
                  </p>
                </div>
              );
            }

            return (

              <div className="space-y-4">

                {customerBills.map(bill => (

                  <div
                    key={bill.id}
                    className="
                      rounded-[24px]
                      border
                      border-slate-200
                      bg-white
                      p-5
                      transition-all
                      hover:shadow-md
                    "
                  >

                    {/* TOP */}

                    <div className="
                      flex
                      items-start
                      justify-between
                    ">

                      <div>

                        <div className="
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
                        </div>

                        <p className="
                          mt-3
                          text-sm
                          text-slate-500
                        ">
                          {bill.date}
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="
                          text-[24px]
                          font-[900]
                          tracking-tight
                          text-[#111827]
                        ">
                          {formatCurrency(bill.total)}
                        </p>

                        <p className="
                          mt-1
                          text-xs
                          text-slate-400
                        ">
                          Total Amount
                        </p>
                      </div>
                    </div>

                    {/* ITEMS */}

                    <div className="
                      mt-5
                      flex
                      flex-wrap
                      gap-2
                    ">

                      {bill.items?.slice(0, 3).map((item, idx) => (

                        <div
                          key={idx}
                          className="
                            px-3
                            py-1.5
                            rounded-xl
                            bg-slate-100
                            text-xs
                            font-[600]
                            text-slate-600
                          "
                        >
                          {item.name} × {item.qty}
                        </div>
                      ))}

                      {bill.items?.length > 3 && (

                        <div className="
                          px-3
                          py-1.5
                          rounded-xl
                          bg-red-50
                          text-xs
                          font-[700]
                          text-red-500
                        ">
                          +{bill.items.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}

                    <div className="
                      mt-5
                      pt-4
                      border-t
                      border-slate-100
                      flex
                      items-center
                      justify-between
                    ">

                      <p className="
                        text-xs
                        text-slate-400
                      ">
                        {getShopName(bill.shopId)}
                      </p>

                      <div
                        className={`
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
                        {bill.paymentMethod?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  </div>
);
};

export default CustomersTab;
// // TABS/SALES/CustomersTab.jsx
// import React, { useState } from "react";
// import { CUSTOMERS } from "../../demoData";

// const statusColors = {
//     active: "bg-green-100 text-green-700",
//     inactive: "bg-gray-100 text-gray-500",
// };

// const CustomersTab = () => {
//     const [search, setSearch] = useState("");
//     const [filter, setFilter] = useState("all");
//     const [selected, setSelected] = useState(null);

//     const filtered = CUSTOMERS.filter(c => {
//         const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
//             c.phone.includes(search) ||
//             c.city.toLowerCase().includes(search.toLowerCase());
//         const matchFilter = filter === "all" ? true : c.status === filter;
//         return matchSearch && matchFilter;
//     });

//     return (
//         <div>
//             {/* Stats row */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { label: "Total Customers", value: CUSTOMERS.length, color: "text-blue-600" },
//                     { label: "Active", value: CUSTOMERS.filter(c => c.status === "active").length, color: "text-green-600" },
//                     { label: "Total Business", value: "₹" + (CUSTOMERS.reduce((s, c) => s + c.totalBusiness, 0) / 100000).toFixed(1) + "L", color: "text-purple-600" },
//                     { label: "Outstanding", value: "₹" + (CUSTOMERS.reduce((s, c) => s + c.outstanding, 0) / 1000).toFixed(0) + "K", color: "text-red-500" },
//                 ].map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Filters */}
//             <div className="flex items-center gap-3 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search by name, phone, city..."
//                     value={search}
//                     onChange={e => setSearch(e.target.value)}
//                     className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                 />
//                 <select
//                     value={filter}
//                     onChange={e => setFilter(e.target.value)}
//                     className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
//                 >
//                     <option value="all">All status</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                 </select>
//                 <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                     + Add Customer
//                 </button>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             {["Customer", "Phone", "City", "Total Business", "Outstanding", "Last Purchase", "Status"].map(h => (
//                                 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {filtered.map(c => (
//                             <tr
//                                 key={c.id}
//                                 onClick={() => setSelected(selected?.id === c.id ? null : c)}
//                                 className="hover:bg-blue-50/40 cursor-pointer transition-colors"
//                             >
//                                 <td className="px-4 py-3">
//                                     <div className="font-medium text-gray-800">{c.name}</div>
//                                     <div className="text-xs text-gray-400">{c.id}</div>
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-600">{c.phone}</td>
//                                 <td className="px-4 py-3 text-gray-600">{c.city}</td>
//                                 <td className="px-4 py-3 font-medium text-gray-700">₹{c.totalBusiness.toLocaleString()}</td>
//                                 <td className="px-4 py-3">
//                                     {c.outstanding > 0
//                                         ? <span className="text-red-500 font-medium">₹{c.outstanding.toLocaleString()}</span>
//                                         : <span className="text-green-500 text-xs font-medium">Cleared</span>
//                                     }
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-500 text-xs">{c.lastPurchase}</td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status]}`}>
//                                         {c.status}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {filtered.length === 0 && (
//                     <div className="py-12 text-center text-gray-400 text-sm">No customers found</div>
//                 )}
//             </div>

//             {/* Detail panel */}
//             {selected && (
//                 <div className="mt-4 bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
//                     <div className="flex items-center justify-between mb-3">
//                         <h3 className="font-semibold text-gray-800">{selected.name}</h3>
//                         <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs">✕ Close</button>
//                     </div>
//                     <div className="grid grid-cols-3 gap-4 text-sm">
//                         <div><span className="text-gray-400">Phone:</span> <span className="ml-1 text-gray-700">{selected.phone}</span></div>
//                         <div><span className="text-gray-400">Email:</span> <span className="ml-1 text-gray-700">{selected.email}</span></div>
//                         <div><span className="text-gray-400">City:</span> <span className="ml-1 text-gray-700">{selected.city}</span></div>
//                         <div><span className="text-gray-400">GSTIN:</span> <span className="ml-1 text-gray-700">{selected.gstin || "—"}</span></div>
//                         <div><span className="text-gray-400">Total Business:</span> <span className="ml-1 font-medium text-gray-700">₹{selected.totalBusiness.toLocaleString()}</span></div>
//                         <div><span className="text-gray-400">Outstanding:</span> <span className={`ml-1 font-medium ${selected.outstanding > 0 ? "text-red-500" : "text-green-500"}`}>{selected.outstanding > 0 ? "₹" + selected.outstanding.toLocaleString() : "Cleared"}</span></div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CustomersTab;