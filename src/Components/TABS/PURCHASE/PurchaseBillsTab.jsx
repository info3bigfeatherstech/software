// PURCHASE_COMPO/PurchaseBillsTab.jsx

import React, { useState } from "react";

const PURCHASE_BILLS = [
  {
    id: "PB-1001",
    vendor: "Metro Wholesale",
    invoice: "INV-4421",
    date: "2026-05-12",
    items: 12,
    amount: 24500,
    payment: "Paid",
    warehouse: "Main Warehouse",
  },
  {
    id: "PB-1002",
    vendor: "Sharma Traders",
    invoice: "INV-7712",
    date: "2026-05-15",
    items: 8,
    amount: 12800,
    payment: "Pending",
    warehouse: "Delhi Warehouse",
  },
  {
    id: "PB-1003",
    vendor: "Kiran Distributors",
    invoice: "INV-9832",
    date: "2026-05-18",
    items: 21,
    amount: 42100,
    payment: "Partial",
    warehouse: "Main Warehouse",
  },
];

const paymentStyles = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-red-50 text-red-600 border-red-200",
  Partial: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const PurchaseBillsTab = () => {
  const [search, setSearch] = useState("");

  const filteredBills = PURCHASE_BILLS.filter(
    (bill) =>
      bill.vendor.toLowerCase().includes(search.toLowerCase()) ||
      bill.id.toLowerCase().includes(search.toLowerCase()) ||
      bill.invoice.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = PURCHASE_BILLS.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Purchase Bills
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage supplier invoices and purchase entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="border border-gray-300 hover:bg-gray-50 text-sm px-4 py-2 rounded font-medium transition-colors">
            Export
          </button>

          <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded font-semibold transition-colors">
            + New Bill
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Bills",
            value: PURCHASE_BILLS.length,
          },
          {
            label: "Total Purchase",
            value: `₹${totalAmount.toLocaleString()}`,
          },
          {
            label: "Pending Bills",
            value: "08",
          },
          {
            label: "Suppliers",
            value: "24",
          },
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

      {/* FILTER BAR */}
      <div className="bg-white  text-zinc-800 border border-gray-200 rounded p-4 flex items-center justify-between gap-3 flex-wrap">

        <div className="flex items-center gap-2 flex-wrap">

          <input
            type="text"
            placeholder="Search bill, vendor, invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 border border-gray-300 rounded px-3 py-2 text-zinc-800 text-sm bg-white focus:outline-none focus:border-gray-500"
          />

          <select className="border border-gray-300 rounded px-3 py-2  text-zinc-800 text-sm bg-white focus:outline-none focus:border-gray-500">
            <option>All Warehouses</option>
            <option>Main Warehouse</option>
            <option>Delhi Warehouse</option>
          </select>

          <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-gray-500">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Partial</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2  text-zinc-800 text-sm"
          />

          <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm transition-colors">
            Filter
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">

        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            Purchase Bills
          </h3>

          <span className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-2.5 py-1 bg-white">
            {filteredBills.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Bill ID",
                  "Vendor",
                  "Invoice",
                  "Warehouse",
                  "Date",
                  "Items",
                  "Amount",
                  "Payment",
                ].map((head) => (
                  <th
                    key={head}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                      {bill.id}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {bill.vendor}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Supplier
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {bill.invoice}
                  </td>

                  <td className="px-5 py-4 text-gray-600">
                    {bill.warehouse}
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {bill.date}
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-gray-700 border border-gray-200 bg-gray-50 px-2.5 py-1 rounded">
                      {bill.items} units
                    </span>
                  </td>

                  <td className="px-5 py-4 font-bold text-gray-900">
                    ₹{bill.amount.toLocaleString()}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold border px-2.5 py-1 rounded ${paymentStyles[bill.payment]}`}
                    >
                      {bill.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillsTab;