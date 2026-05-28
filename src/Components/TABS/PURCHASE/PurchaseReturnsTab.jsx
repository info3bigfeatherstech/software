// PURCHASE_COMPO/PurchaseReturnsTab.jsx

import React from "react";

const RETURNS = [
  {
    id: "RET-001",
    vendor: "Metro Wholesale",
    reason: "Damaged Products",
    amount: 8500,
    status: "Pending",
    date: "2026-05-12",
  },
  {
    id: "RET-002",
    vendor: "Kiran Traders",
    reason: "Wrong Item",
    amount: 2400,
    status: "Approved",
    date: "2026-05-16",
  },
];

const styles = {
  Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Approved: "bg-blue-50 text-blue-700 border-blue-200",
};

const PurchaseReturnsTab = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Purchase Returns / Dr. Notes
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage damaged and returned inventory
          </p>
        </div>

        <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-semibold">
          + Create Return
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Returns", value: "42" },
          { label: "Pending", value: "8" },
          { label: "Approved", value: "27" },
          { label: "Returned Amount", value: "₹84,000" },
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

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Return ID",
                "Vendor",
                "Reason",
                "Amount",
                "Status",
                "Date",
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
            {RETURNS.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-xs">{r.id}</td>

                <td className="px-5 py-4 font-semibold text-gray-800">
                  {r.vendor}
                </td>

                <td className="px-5 py-4 text-gray-600">{r.reason}</td>

                <td className="px-5 py-4 font-bold text-gray-900">
                  ₹{r.amount.toLocaleString()}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`text-xs font-semibold border px-2 py-1 rounded ${styles[r.status]}`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-gray-500">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseReturnsTab;