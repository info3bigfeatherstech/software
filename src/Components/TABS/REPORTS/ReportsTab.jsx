import React, { useState } from "react";
import { MONTHLY_SALES, CATEGORY_SALES, PROFIT_LOSS, GST_SUMMARY } from "../../demoData";

const ReportsTab = () => {
  const [activeSection, setActiveSection] = useState("pl");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const sections = [
    { id: "pl",    label: "Profit & Loss" },
    { id: "sales", label: "Sales Summary" },
    { id: "gst",   label: "GST Summary"   },
  ];

  const statCards = [
    { label: "Total Revenue",   value: `₹${(PROFIT_LOSS.revenue / 1000).toFixed(0)}K`,    change: "+18.2%", up: true  },
    { label: "Net Profit",      value: `₹${(PROFIT_LOSS.netProfit / 1000).toFixed(0)}K`,  change: "+8.4%",  up: true  },
    { label: "GST Payable",     value: `₹${(GST_SUMMARY.gstPayable / 1000).toFixed(0)}K`, change: "-2.1%",  up: false },
    { label: "Avg Order Value", value: "₹8.6K",                                             change: "+4.3%",  up: true  },
  ];

  const marginPct = ((PROFIT_LOSS.netProfit / PROFIT_LOSS.revenue) * 100).toFixed(1);

  const breakdownRows = [
    { label: "Revenue",      value: PROFIT_LOSS.revenue,       pct: 100,                                                                          highlight: false },
    { label: "COGS",         value: PROFIT_LOSS.cogs,          pct: Math.round((PROFIT_LOSS.cogs / PROFIT_LOSS.revenue) * 100),          highlight: false },
    { label: "Gross Profit", value: PROFIT_LOSS.grossProfit,   pct: Math.round((PROFIT_LOSS.grossProfit / PROFIT_LOSS.revenue) * 100),   highlight: false },
    { label: "Expenses",     value: PROFIT_LOSS.totalExpenses, pct: Math.round((PROFIT_LOSS.totalExpenses / PROFIT_LOSS.revenue) * 100), highlight: false },
    { label: "Net Profit",   value: PROFIT_LOSS.netProfit,     pct: Math.round((PROFIT_LOSS.netProfit / PROFIT_LOSS.revenue) * 100),     highlight: true  },
  ];

  return (
    <div className=" min-h-screen bg-gray-50 font-['satoshi'] p-6 space-y-4">

      {/* ── TOP BAR ── */}
      <div className="bg-white border border-gray-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-[18px] font-bold text-gray-900 leading-tight">Reports & Analytics</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Business performance, sales & profitability</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className=" text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 cursor-pointer outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="all">All Shops & Warehouses</option>
            <option value="SHP-001">Karol Bagh Shop</option>
            <option value="SHP-002">Connaught Place Shop</option>
            <option value="WH-001">Delhi Warehouse</option>
          </select>

          <select
            value={selectedPlatform}
            onChange={e => setSelectedPlatform(e.target.value)}
            className=" text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 cursor-pointer outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value="all">All Platforms</option>
            <option value="offline">In-Store (POS)</option>
            <option value="online">Online (Website/App)</option>
          </select>

          <button className=" inline-flex items-center gap-2 text-[13px] font-semibold bg-gray-900 text-white px-4 py-2 hover:bg-gray-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white border border-gray-200 px-5 py-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
            <p className="text-[26px] font-black text-gray-900 leading-none">{card.value}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${card.up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {card.change}
              </span>
              <span className="text-[11px] text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CARD ── */}
      <div className="bg-white border border-gray-200 overflow-hidden">

        {/* Tab bar */}
        <div className="bg-gray-900 px-5 flex items-center justify-between">
          <div className="flex items-center">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={` text-[13px] font-semibold px-5 py-3.5 border-none cursor-pointer transition-colors ${
                  activeSection === s.id
                    ? "text-white bg-white/10"
                    : "text-gray-500 hover:text-gray-300 bg-transparent"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {["April 2025", "Monthly"].map(c => (
              <span key={c} className="text-[11px] text-gray-200 bg-gray-800 rounded px-2.5 py-1">{c}</span>
            ))}
          </div>
        </div>

        {/* ══ P&L ══ */}
        {activeSection === "pl" && (
          <div className="grid grid-cols-[1fr_280px]">

            {/* Left */}
            <div className="p-6 border-r border-gray-100">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-[14px] font-bold text-gray-900">Profit & Loss Statement</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">April 2025</p>
                </div>
                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded tracking-widest">MONTHLY</span>
              </div>

              {[
                { label: "Revenue (Sales)",    value: `₹${PROFIT_LOSS.revenue.toLocaleString()}`,  cls: "text-gray-900" },
                { label: "Cost of Goods Sold", value: `− ₹${PROFIT_LOSS.cogs.toLocaleString()}`,   cls: "text-red-500"  },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-[13px] text-gray-500">{r.label}</span>
                  <span className={`text-[13px] font-bold ${r.cls}`}>{r.value}</span>
                </div>
              ))}

              <div className="flex justify-between items-center px-3.5 py-3 my-2 bg-green-50 border border-green-100 rounded-lg">
                <span className="text-[13px] font-bold text-green-800">Gross Profit</span>
                <span className="text-[13px] font-bold text-green-600">₹{PROFIT_LOSS.grossProfit.toLocaleString()}</span>
              </div>

              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest py-3">Expenses</p>
              {PROFIT_LOSS.expenses.map(e => (
                <div key={e.label} className="flex justify-between items-center py-2.5 pl-3 border-b border-gray-50">
                  <span className="text-[13px] text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
                    {e.label}
                  </span>
                  <span className="text-[13px] font-bold text-red-400">− ₹{e.amount.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-1">
                <span className="text-[13px] font-bold text-gray-600">Total Expenses</span>
                <span className="text-[13px] font-bold text-red-500">− ₹{PROFIT_LOSS.totalExpenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center px-4 py-3.5 bg-gray-900 mt-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Net Profit</span>
                <span className="text-[20px] font-black text-emerald-400">₹{PROFIT_LOSS.netProfit.toLocaleString()}</span>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="p-5 bg-gray-50 flex flex-col gap-3">

              <div className="bg-gray-900 p-5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Profit Margin</p>
                <p className="text-[40px] font-black text-white leading-none">
                  {marginPct}<span className="text-[20px] text-emerald-400">%</span>
                </p>
                <p className="text-[11px] text-gray-600 mt-1.5">Net profit as % of revenue</p>
              </div>

              <div className="bg-white border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">Financial Breakdown</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Revenue & cost distribution</p>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded">Monthly</span>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide pb-2">Item</th>
                      <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide pb-2">Amount</th>
                      <th className="text-right text-[11px] font-bold text-gray-400 uppercase tracking-wide pb-2">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownRows.map((row, i) => (
                      <tr key={row.label} className={i < breakdownRows.length - 1 ? "border-b border-gray-50" : ""}>
                        <td className="text-[12px] text-gray-600 font-semibold py-2.5">{row.label}</td>
                        <td className="text-[12px] font-bold text-gray-900 text-right py-2.5">
                          ₹{(row.value / 1000).toFixed(0)}K
                        </td>
                        <td className="text-right py-2.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${row.highlight ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {row.pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Performance</p>
                    <p className="text-[12px] font-bold text-green-600 mt-0.5">Healthy Growth</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Margin</p>
                    <p className="text-[13px] font-black text-gray-900 mt-0.5">{marginPct}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ SALES SUMMARY ══ */}
        {activeSection === "sales" && (
          <div className="grid grid-cols-2 divide-x divide-gray-100">

            <div className="p-6">
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">Monthly Trend</p>
              <p className="text-[12px] text-gray-400 mb-5">Sales & profit by month</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Month", "Sales", "Profit", "Margin"].map((h, i) => (
                      <th key={h} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide pb-2.5 ${i === 0 ? "text-left" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_SALES.map((m, i) => {
                    const isLatest = i === MONTHLY_SALES.length - 1;
                    const margin = ((m.profit / m.sales) * 100).toFixed(1);
                    return (
                      <tr key={m.month} className={`border-b border-gray-50 ${isLatest ? "bg-gray-50" : ""}`}>
                        <td className={`py-3 text-[13px] ${isLatest ? "font-bold text-gray-900" : "font-semibold text-gray-500"}`}>
                          {isLatest && <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-900 mr-2 align-middle" />}
                          {m.month}
                        </td>
                        <td className="py-3 text-right text-[13px] font-bold text-gray-900">₹{(m.sales / 1000).toFixed(0)}K</td>
                        <td className={`py-3 text-right text-[13px] font-bold ${m.profit > 70000 ? "text-green-600" : "text-gray-400"}`}>
                          +₹{(m.profit / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{margin}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-6">
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">By Category</p>
              <p className="text-[12px] text-gray-400 mb-5">Revenue share per category</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Category", "Revenue", "Share"].map((h, i) => (
                      <th key={h} className={`text-[11px] font-bold text-gray-400 uppercase tracking-wide pb-2.5 ${i === 0 ? "text-left" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CATEGORY_SALES.map((c, i) => (
                    <tr key={c.category} className="border-b border-gray-50">
                      <td className="py-3 text-[13px] font-semibold text-gray-600">{c.category}</td>
                      <td className="py-3 text-right text-[13px] font-bold text-gray-900">₹{(c.amount / 1000).toFixed(0)}K</td>
                      <td className="py-3 text-right">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${i === 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {c.percent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ GST SUMMARY ══ */}
        {activeSection === "gst" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[14px] font-bold text-gray-900">GST Summary</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{GST_SUMMARY.period}</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ITC Available</p>
                  <p className="text-[14px] font-black text-blue-600 mt-0.5">₹{GST_SUMMARY.itcAvailable.toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-200" />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Payable</p>
                  <p className="text-[14px] font-black text-red-500 mt-0.5">₹{GST_SUMMARY.gstPayable.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Tax Rate", "Collected (Sales)", "ITC (Purchase)", "Net Payable"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i === 0 ? "text-left" : "text-right"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.keys(GST_SUMMARY.salesTaxCollected).map(rate => {
                    const collected = GST_SUMMARY.salesTaxCollected[rate];
                    const itc = GST_SUMMARY.purchaseTaxPaid[rate];
                    const net = collected - itc;
                    return (
                      <tr key={rate} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-[12px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded">{rate}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-green-600">₹{collected.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-blue-500">₹{itc.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-800">₹{net.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-900">
                    <td className="px-4 py-3.5 text-[13px] font-bold text-white">Total</td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                      ₹{Object.values(GST_SUMMARY.salesTaxCollected).reduce((s, v) => s + v, 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-blue-300">₹{GST_SUMMARY.itcAvailable.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right text-[18px] font-black text-white">₹{GST_SUMMARY.gstPayable.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;