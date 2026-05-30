// PURCHASE_COMPO/ExpensesTab.jsx

import React from "react";

const expenses = [
  {
    id: "EXP-001",
    category: "Electricity",
    amount: 4500,
    date: "2026-05-10",
    method: "Bank",
    by: "Admin",
  },
  {
    id: "EXP-002",
    category: "Transport",
    amount: 2200,
    date: "2026-05-12",
    method: "Cash",
    by: "Utkarsh",
  },
];

const ExpensesTab = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

      <div>
        <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track operational and miscellaneous expenses
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Expenses", value: "₹54,300" },
          { label: "Operational", value: "₹21,000" },
          { label: "Utilities", value: "₹11,500" },
          { label: "Transport", value: "₹7,200" },
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          "Rent",
          "Electricity",
          "Packaging",
          "Staff",
          "Transport",
        ].map((item) => (
          <div
            key={item}
            className="bg-white border border-gray-200 rounded p-4 hover:border-gray-400 transition-colors cursor-pointer"
          >
            <p className="text-sm font-semibold text-gray-700">{item}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            Expense Records
          </h3>

          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold">
            + Add Expense
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Expense ID",
                "Category",
                "Amount",
                "Date",
                "Created By",
                "Payment Method",
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

          <tbody className=" text-zinc-800 divide-y divide-gray-100">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-xs">{e.id}</td>
                <td className="px-5 py-4 font-semibold text-gray-800">
                  {e.category}
                </td>
                <td className="px-5 py-4 font-bold text-gray-900">
                  ₹{e.amount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-gray-500">{e.date}</td>
                <td className="px-5 py-4 text-gray-600">{e.by}</td>
                <td className="px-5 py-4 text-gray-600">{e.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesTab;