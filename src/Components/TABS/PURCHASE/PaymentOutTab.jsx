// PURCHASE_COMPO/PaymentOutTab.jsx

import React, { useState } from "react";

const PAYMENTS = [
  {
    id: "PAY-1001",
    vendor: "Sharma Traders",
    bill: "INV-4432",
    date: "2026-05-12",
    amount: 24500,
    mode: "Bank",
    status: "Paid",
  },
  {
    id: "PAY-1002",
    vendor: "Metro Wholesale",
    bill: "INV-9211",
    date: "2026-05-14",
    amount: 12000,
    mode: "Cash",
    status: "Pending",
  },
  {
    id: "PAY-1003",
    vendor: "Kiran Distributors",
    bill: "INV-7712",
    date: "2026-05-17",
    amount: 8500,
    mode: "UPI",
    status: "Partial",
  },
];

const statusStyles = {
  Paid: "bg-green-50 text-green-700 border-green-200",
  Pending: "bg-red-50 text-red-600 border-red-200",
  Partial: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const PaymentOutTab = () => {
  const [search, setSearch] = useState("");

  const filtered = PAYMENTS.filter(
    (p) =>
      p.vendor.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Payment Out</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vendor payments and outstanding balances
          </p>
        </div>

        <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold">
          + Record Payment
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Payable", value: "₹1,24,500" },
          { label: "Paid This Month", value: "₹74,200" },
          { label: "Pending", value: "₹32,000" },
          { label: "Partial", value: "₹18,300" },
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

      <div className="bg-white  text-zinc-800 border border-gray-200 rounded p-4 flex items-center justify-between gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search payment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        />

        <div className="flex items-center gap-2">
          <select className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Partial</option>
          </select>

          <button className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm">
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Payment ID",
                "Vendor",
                "Bill Ref",
                "Date",
                "Amount",
                "Mode",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-xs text-gray-600">
                  {p.id}
                </td>

                <td className="px-5 py-4 font-semibold text-gray-800">
                  {p.vendor}
                </td>

                <td className="px-5 py-4 text-gray-500">{p.bill}</td>

                <td className="px-5 py-4 text-gray-500">{p.date}</td>

                <td className="px-5 py-4 font-bold text-gray-900">
                  ₹{p.amount.toLocaleString()}
                </td>

                <td className="px-5 py-4 text-gray-600">{p.mode}</td>

                <td className="px-5 py-4">
                  <span
                    className={`text-xs font-semibold border px-2 py-1 rounded ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};



export default PaymentOutTab;