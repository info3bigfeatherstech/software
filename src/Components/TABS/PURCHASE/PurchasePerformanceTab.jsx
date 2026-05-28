// PURCHASE_COMPO/PurchasePerformanceTab.jsx

import React from "react";

const PurchasePerformanceTab = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-5 space-y-4 font-['satoshi']">

      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Purchase Performance
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Analyze vendor and purchasing performance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Purchases", value: "₹12.4L" },
          { label: "Avg Order Value", value: "₹8,200" },
          { label: "Top Vendor", value: "Metro" },
          { label: "Stock Turnover", value: "74%" },
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

      <div className="grid lg:grid-cols-2 gap-4">

        <div className="bg-white border border-gray-200 rounded p-5 h-72">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Monthly Purchase Trend
          </h3>

          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Chart Area
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-5 h-72">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Vendor Distribution
          </h3>

          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Analytics Graph
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
            Vendor Performance
          </h3>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Vendor",
                "Orders",
                "Delivery Time",
                "Defect Rate",
                "Total Spend",
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
            {[
              ["Metro Wholesale", 24, "2 Days", "1.2%", "₹2.4L"],
              ["Kiran Traders", 18, "4 Days", "3.1%", "₹1.2L"],
            ].map((v, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {v.map((x, idx) => (
                  <td key={idx} className="px-5 py-4 text-gray-700">
                    {x}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchasePerformanceTab;