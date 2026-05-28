// src/Components/ContentDashboard/ContentDashboardTab.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Sector
} from "recharts";
import { DASHBOARD_STATS, MONTHLY_SALES } from "../demoData";
import { CURRENT_USER, filterByLocation, isAdmin } from "../roles";
import { useGetProductStocksQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetShopsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import NetworkStockPanel from "../shared/NetworkStockPanel";

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, iconBg }) => (
  <div className="bg-white p-6 flex items-start justify-between border border-gray-100">
    <div className="flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 ">{label}</p>
      <p className="text-4xl font-bold text-gray-900  leading-tight">{value}</p>
      {sub && <p className="text-sm text-gray-400  mt-0.5">{sub}</p>}
    </div>
    {icon && (
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
    )}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm ">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <strong className="ml-1">₹{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Top Products Custom Tooltip ───────────────────────────────────────────────
const TopProductsTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 ">
      <p className="text-sm font-semibold text-gray-800">{payload[0].payload.name}</p>
      <p className="text-xs text-indigo-500 font-semibold mt-0.5">
        {payload[0].value} units sold
      </p>
    </div>
  );
};

// ── Pie Custom Tooltip ────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 ">
      <p className="text-sm font-semibold text-gray-800">{d.name}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: d.payload.color }}>
        {d.value}% of total stock
      </p>
    </div>
  );
};

// ── Active Pie Shape (expanded on hover) ──────────────────────────────────────
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent
  } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#1e293b" className=""
        style={{ fontSize: 13, fontWeight: 700 }}>
        {payload.name.split(" ")[0]}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6366f1"
        style={{ fontSize: 14, fontWeight: 700 }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 15}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    Paid:      "bg-[#17C4BB] text-[#17C4BB] bg-opacity-20",
    Pending:   "bg-amber-50 text-amber-600",
    Overdue:   "bg-red-50 text-red-600",
    ARRIVED:   "bg-[#17C4BB] text-[#17C4BB] bg-opacity-20",
    MAPPED:    "bg-blue-50 text-blue-600",
    SCHEDULED: "bg-amber-50 text-amber-600",
    CANCELLED: "bg-red-50 text-red-600",
    Critical:  "bg-red-50 text-red-600",
  };
  return (
    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold  ${map[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ── Section Card wrapper ───────────────────────────────────────────────────────
const Card = ({ title, children, right }) => (
  <div className="bg-white border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-gray-800 ">{title}</h3>
      {right && <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full ">{right}</span>}
    </div>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function ContentDashboardTab() {
  const { user } = useSelector((state) => state.auth);
  const [shopFilter, setShopFilter] = useState("all");
  const [activePieIndex, setActivePieIndex] = useState(0);

  const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 100 });
  const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 });

  const allProducts = stocksData?.stocks?.map(s => ({
    id: s.stock_id,
    name: s.variant?.product?.name || "Unknown Product",
    stock: s.quantity || 0,
    lowStockAlert: s.low_stock_threshold || 10,
    mrp: s.variant?.mrp || 0,
    warehouse_id: s.warehouse_id,
    variant_id: s.variant_id,
  })) || [];

  const shops = shopsData?.shops || [];

  const scopedProducts = user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
    ? allProducts
    : filterByLocation(allProducts, 'warehouse_id');

  const filteredProducts = (isAdmin() && shopFilter !== "all")
    ? scopedProducts.filter(p => p.warehouse_id === shopFilter)
    : scopedProducts;

  const lowStock    = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
  const outOfStock  = filteredProducts.filter(p => p.stock === 0);
  const totalInventoryValue = filteredProducts.reduce((s, p) => s + ((p.stock || 0) * (p.mrp || 0)), 0);

  const locationLabel = isAdmin()
    ? "All Locations"
    : user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
      ? `Shop: ${CURRENT_USER.locationName || CURRENT_USER.shop_id}`
      : `Warehouse: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

  // ── Chart data ──────────────────────────────────────────────────────────────
  const stockMovementData = [
    { day: "Mon", in: 110, out: 75 },
    { day: "Tue", in: 210, out: 125 },
    { day: "Wed", in: 85,  out: 100 },
    { day: "Thu", in: 160, out: 115 },
    { day: "Fri", in: 205, out: 175 },
    { day: "Sat", in: 165, out: 205 },
    { day: "Sun", in: 115, out: 90  },
  ];

  const salesTrendData = MONTHLY_SALES.map(m => ({
    month: m.month,
    Sales: m.sales,
  }));

  const topProducts = [
    { name: "iPhone Case",  value: 150 },
    { name: "USB-C Cable",  value: 130 },
    { name: "Earbuds Pro",  value: 95  },
    { name: "Screen Guard", value: 85  },
    { name: "Power Bank",   value: 55  },
  ];

  const warehousePie = [
    { name: "Delhi WH",     value: 35, color: "#6366f1" },
    { name: "Mumbai WH",    value: 28, color: "#17C4BB" },
    { name: "Bangalore WH", value: 22, color: "#f59e0b" },
    { name: "Kolkata WH",   value: 15, color: "#ef4444" },
  ];

  const recentBills = [
    { name: "Rahul Sharma", bill: "BILL-1040", amount: "₹12,450", status: "Paid"    },
    { name: "Neha Verma",   bill: "BILL-1041", amount: "₹3,290",  status: "Paid"    },
    { name: "Arjun Mehta",  bill: "BILL-1042", amount: "₹8,760",  status: "Pending" },
    { name: "Priya Singh",  bill: "BILL-1043", amount: "₹1,930",  status: "Paid"    },
    { name: "Vikas Kapoor", bill: "BILL-1044", amount: "₹24,500", status: "Paid"    },
  ];

  const lowStockDisplay = lowStock.length > 0
    ? lowStock.slice(0, 4).map(p => ({ name: p.name, sku: `SKU-${p.id}`, current: p.stock, max: p.lowStockAlert || 10, status: "Critical" }))
    : [
        { name: "iPhone 15 Case",   sku: "IPTE-CSE-001", current: 4,  max: 20, status: "Critical" },
        { name: "USB-C Cable 1m",   sku: "USBC-1M",      current: 8,  max: 25, status: "Critical" },
        { name: "Tempered Glass",   sku: "TG-PRO-XL",    current: 12, max: 30, status: "Critical" },
        { name: "Wireless Charger", sku: "WC-15W",        current: 15, max: 40, status: "Critical" },
      ];

  const recentInwards = [
    { vendor: "Apple India",        ref: "INW-20230521-001", items: "4 items",  status: "ARRIVED"   },
    { vendor: "Samsung Trading",    ref: "INW-20230521-214", items: "12 items", status: "MAPPED"     },
    { vendor: "Boat Lifestyle",     ref: "INW-20230521-013", items: "6 items",  status: "SCHEDULED" },
    { vendor: "Xiaomi Distribution",ref: "INW-20230520-009", items: "14 items", status: "MAPPED"     },
    { vendor: "Anker India",        ref: "INW-20230519-007", items: "0 items",  status: "CANCELLED" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-7 ">

      {/* ── Header ── */}
        {/* <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 ">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1 ">
              Business overview · last updated just now ·{" "}
              <span className="text-indigo-500 font-medium">{locationLabel}</span>
            </p>
          </div>
          {isAdmin() && shops.length > 0 && (
            <select
              value={shopFilter}
              onChange={e => setShopFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 text-sm bg-white text-gray-700  outline-none cursor-pointer"
            >
              <option value="all">All Locations</option>
              {shops.map(s => (
                <option key={s.shop_id} value={s.shop_id}>🏪 {s.shop_name}</option>
              ))}
            </select>
          )}
        </div> */}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard
          label="Total Products"
          value={filteredProducts.length || 248}
          sub="Active SKUs across catalog"
          icon=""
          iconBg="bg-indigo-50"
        />
        <StatCard
          label="Stock Value"
          value={totalInventoryValue > 0 ? `₹${(totalInventoryValue).toLocaleString()}` : "₹18,47,500"}
          sub="At purchase cost"
          icon=""
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStock.length || 12}
          sub="Below threshold"
          icon=""
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Today's Sales"
          value={DASHBOARD_STATS?.todaySales ? `₹${DASHBOARD_STATS.todaySales.toLocaleString()}` : "₹84,320"}
          sub="Across all shops"
          icon=""
          iconBg="bg-red-50"
        />
      </div>

      {/* ── Row 2: Stock Movement + Top Selling ── */}
      <div className="grid grid-cols-2 gap-5 mb-6">

        <Card title="Stock Movement · Last 7 days">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stockMovementData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8", fontFamily: "Satoshi" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Satoshi" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8", fontFamily: "Satoshi", paddingTop: 12 }} />
              <Bar dataKey="in"  fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="out" fill="#17C4BB" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Selling Products">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Satoshi" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 160]}
                ticks={[0, 40, 80, 120, 160]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "#64748b", fontFamily: "Satoshi" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip content={<TopProductsTooltip />} cursor={{ fill: "#f1f5f9", radius: 4 }} />
              <Bar
                dataKey="value"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
                background={{ fill: "#f8fafc", radius: [0, 4, 4, 0] }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Row 3: Sales Trend + Stock by Warehouse ── */}
      <div className="grid grid-cols-2 gap-5 mb-6">

        <Card title="Sales Trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesTrendData} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8", fontFamily: "Satoshi" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "Satoshi" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 4, fill: "#fff", stroke: "#6366f1", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Stock by Warehouse">
          <div className="flex items-center justify-center gap-8 py-1">
            <PieChart width={220} height={220}>
              <Pie
                activeIndex={activePieIndex}
                activeShape={renderActiveShape}
                data={warehousePie}
                cx={105}
                cy={105}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={3}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
              >
                {warehousePie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
            <div className="flex flex-col gap-3.5">
              {warehousePie.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onMouseEnter={() => setActivePieIndex(i)}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-125"
                    style={{ background: w.color }}
                  />
                  <span className={`text-sm  transition-colors ${activePieIndex === i ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
                    {w.name}
                  </span>
                  <span className={`text-xs  ml-auto pl-4 font-semibold transition-colors`}
                    style={{ color: activePieIndex === i ? w.color : "#cbd5e1" }}>
                    {w.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Row 4: Recent Bills + Low Stock + Recent Inwards ── */}
      <div className="grid grid-cols-3 gap-5 mb-6">

        {/* Recent Bills */}
        <Card title="Recent Bills">
          <div className="divide-y divide-gray-50">
            {recentBills.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 ">{b.name}</p>
                  <p className="text-xs text-gray-400  mt-0.5">{b.bill}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-gray-800 ">{b.amount}</span>
                  <Badge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Products */}
        <Card title="Low Stock Products">
          <div className="divide-y divide-gray-50">
            {lowStockDisplay.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 ">{p.name}</p>
                  <p className="text-xs text-gray-400  mt-0.5">{p.sku}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-500 ">{p.current} / {p.max}</span>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Inwards */}
        <Card title="Recent Inwards">
          <div className="divide-y divide-gray-50">
            {recentInwards.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800 ">{r.vendor}</p>
                  <p className="text-xs text-gray-400  mt-0.5">{r.ref} · {r.items}</p>
                </div>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Network Stock Panel (Admin only) ── */}
      {isAdmin() && (
        <div className="bg-white border border-gray-100 p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-800 ">Network Stock</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full ">All locations</span>
          </div>
          <NetworkStockPanel />
        </div>
      )}

      {/* ── Out of stock banner ── */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          <p className="text-sm text-red-800 font-semibold ">
            {outOfStock.length} product(s) completely out of stock
          </p>
        </div>
      )}

      {/* ── Coming soon ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
        <p className="text-xs text-blue-600 ">
          📊 Sales bills, transfers, and advanced analytics coming soon. Stock levels are now live from your inventory.
        </p>
      </div>

    </div>
  );
}

// // src/Components/ContentDashboard/ContentDashboardTab.jsx
// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { DASHBOARD_STATS, MONTHLY_SALES } from "../demoData";
// import { CURRENT_USER, filterByLocation, isAdmin } from "../roles";
// import { useGetProductStocksQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
// import { useGetShopsQuery } from "../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
// import NetworkStockPanel from "../shared/NetworkStockPanel";

// const StatCard = ({ label, value, sub, color = "text-gray-800", gradient }) => (
//     <div className={`rounded-xl p-5 shadow-sm ${gradient || "bg-white border border-gray-100"}`}>
//         <p className={`text-xs uppercase tracking-wide mb-2 ${gradient ? "text-white/80" : "text-gray-400"}`}>{label}</p>
//         <p className={`text-2xl font-bold ${gradient ? "text-white" : color}`}>{value}</p>
//         {sub && <p className={`text-xs mt-1 ${gradient ? "text-white/70" : "text-gray-400"}`}>{sub}</p>}
//     </div>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
//             <p className="font-semibold text-gray-700 mb-2">{label}</p>
//             {payload.map((p, i) => (
//                 <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
//                     <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
//                     {p.name}: <span className="font-semibold ml-1">₹{p.value?.toLocaleString()}</span>
//                 </p>
//             ))}
//         </div>
//     );
// };

// export default function ContentDashboardTab() {
//     const { user } = useSelector((state) => state.auth);
//     const [shopFilter, setShopFilter] = useState("all");

//     // ── Real API calls ─────────────────────────────────────────────────────────
//     const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 100 });
//     const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 100 });

//     // Transform stocks to products format
//     const allProducts = stocksData?.stocks?.map(s => ({
//         id: s.stock_id,
//         name: s.variant?.product?.name || "Unknown Product",
//         stock: s.quantity || 0,
//         lowStockAlert: s.low_stock_threshold || 10,
//         mrp: s.variant?.mrp || 0,
//         warehouse_id: s.warehouse_id,
//         variant_id: s.variant_id,
//     })) || [];

//     const shops = shopsData?.shops || [];

//     // ── Scope products to user's location ──────────────────────────────────────
//     // const scopedProducts = filterByLocation(allProducts, 'warehouse_id');
//     // For SHOP_OWNER, show all products (no warehouse filter)
//     // For WH roles, filter by warehouse_id
//     const scopedProducts = user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
//         ? allProducts
//         : filterByLocation(allProducts, 'warehouse_id');

//     // Admin can filter by specific shop (for products, we use warehouse filtering)
//     const filteredProducts = (isAdmin() && shopFilter !== "all")
//         ? scopedProducts.filter(p => p.warehouse_id === shopFilter)
//         : scopedProducts;

//     // ── Derived stats ─────────────────────────────────────────────────────────
//     const lowStock = filteredProducts.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 10));
//     const outOfStock = filteredProducts.filter(p => p.stock === 0);
//     const totalInventoryValue = filteredProducts.reduce((s, p) => s + ((p.stock || 0) * (p.mrp || 0)), 0);

//     // Chart data from demo (no API yet)
//     const chartData = MONTHLY_SALES.map(m => ({
//         month: m.month,
//         Sales: m.sales,
//         Purchase: m.purchase || Math.round(m.sales * 0.65),
//         Profit: m.profit || Math.round(m.sales * 0.28),
//     }));

//     // Location label for display
//     // const locationLabel = isAdmin()
//     //     ? "All Locations"
//     //     : `${CURRENT_USER.locationName || CURRENT_USER.locationId?.startsWith("WH") ? "Warehouse" : "Shop"}: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;
//     // Location label for display
// const locationLabel = isAdmin()
//     ? "All Locations"
//     : user?.role === "SHOP_OWNER" || user?.role === "SHOP_STOCK_LISTER"
//         ? `Shop: ${CURRENT_USER.locationName || CURRENT_USER.shop_id}`
//         : `Warehouse: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

//     return (
//         <div className="space-y-6">

//             {/* ── Top bar ──────────────────────────────────────────────────── */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-lg font-bold text-gray-800">BizPro Dashboard</h1>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         <span className="font-medium text-blue-600">{locationLabel}</span>
//                     </p>
//                 </div>

//                 {/* Admin-only shop/warehouse filter */}
//                 {isAdmin() && shops.length > 0 && (
//                     <div className="flex items-center gap-3">
//                         <span className="text-xs text-gray-400">Filter by location:</span>
//                         <select
//                             value={shopFilter}
//                             onChange={e => setShopFilter(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
//                         >
//                             <option value="all">All Locations</option>
//                             {shops.map(s => (
//                                 <option key={s.shop_id} value={s.shop_id}>
//                                     🏪 {s.shop_name} (Shop)
//                                 </option>
//                             ))}
//                             {/* Add warehouses here when warehouse API is ready */}
//                         </select>
//                     </div>
//                 )}
//             </div>

//             {/* ── KPI Cards ────────────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard
//                     label="Total SKUs"
//                     value={filteredProducts.length}
//                     sub="active stock entries"
//                     gradient="bg-gradient-to-r from-blue-500 to-blue-600"
//                 />
//                 <StatCard
//                     label="Total Units"
//                     value={filteredProducts.reduce((s, p) => s + p.stock, 0).toLocaleString()}
//                     sub="across all products"
//                     gradient="bg-gradient-to-r from-green-500 to-green-600"
//                 />
//                 <StatCard
//                     label="Inventory Value"
//                     value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`}
//                     sub="at MRP"
//                     gradient="bg-gradient-to-r from-purple-500 to-purple-600"
//                 />
//                 <StatCard
//                     label="Low Stock Alerts"
//                     value={lowStock.length}
//                     sub={`${outOfStock.length} out of stock`}
//                     color={lowStock.length > 0 ? "text-red-500" : "text-green-600"}
//                 />
//             </div>

//             {/* ── Secondary KPIs ───────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard
//                     label="Products in Scope"
//                     value={filteredProducts.length}
//                     sub={isAdmin() ? `across ${shops.length} locations` : `at your ${CURRENT_USER.locationName || "location"}`}
//                 />
//                 <StatCard
//                     label="Active Products"
//                     value={filteredProducts.filter(p => p.stock > 0).length}
//                     sub="with positive stock"
//                 />
//                 <StatCard
//                     label="Low Stock Items"
//                     value={lowStock.length}
//                     sub={outOfStock.length > 0 ? `${outOfStock.length} completely out` : "all good"}
//                     color={lowStock.length > 0 ? "text-orange-500" : "text-gray-800"}
//                 />
//                 <StatCard
//                     label={isAdmin() ? "Total Locations" : "Your Location"}
//                     value={isAdmin() ? shops.length : "1"}
//                     sub={isAdmin() ? `${DASHBOARD_STATS?.totalSuppliers || 0} vendors` : CURRENT_USER.locationName || CURRENT_USER.locationId}
//                 />
//             </div>

//             {/* ── Chart + Network Stock Panel ──────────────────────────────── */}
//             <div className="grid grid-cols-3 gap-5">
//                 <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">Monthly Sales vs Purchase vs Profit</h3>
//                         <span className="text-xs text-gray-400">Last 6 months (demo data)</span>
//                     </div>
//                     <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                             <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
//                             <Bar dataKey="Sales" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Purchase" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* NetworkStockPanel — stock-only, visible to ALL roles */}
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-80">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">📦 Network Stock</h3>
//                         <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All locations</span>
//                     </div>
//                     <NetworkStockPanel />
//                 </div>
//             </div>

//             {/* ── Low stock alerts ─────────────────────────────────────────── */}
//             {lowStock.length > 0 && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-3">
//                         <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//                         <h3 className="font-semibold text-orange-800 text-sm">⚠️ Low Stock Alerts ({lowStock.length} items)</h3>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                         {lowStock.slice(0, 10).map(p => (
//                             <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
//                                 {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
//                             </span>
//                         ))}
//                         {lowStock.length > 10 && <span className="text-xs text-orange-600 font-medium">+{lowStock.length - 10} more...</span>}
//                     </div>
//                 </div>
//             )}

//             {/* ── Out of stock banner ───────────────────────────────────────── */}
//             {outOfStock.length > 0 && (
//                 <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3">
//                     <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                         <p className="text-sm text-red-800 font-medium">{outOfStock.length} product(s) completely out of stock</p>
//                     </div>
//                 </div>
//             )}

//             {/* ── Coming Soon Note ──────────────────────────────────────────── */}
//             <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
//                 <p className="text-xs text-blue-700">
//                     📊 Sales bills, transfers, and advanced analytics coming soon.
//                     Stock levels are now live from your inventory.
//                 </p>
//             </div>

//         </div>
//     );
// }



// use upper code 
// // src/Components/ContentDashboard/ContentDashboardTab.jsx
// import React, { useState, useEffect } from "react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { DASHBOARD_STATS, MONTHLY_SALES, INITIAL_BILLS, INITIAL_PRODUCTS, INITIAL_SHOPS, INITIAL_TRANSFERS } from "../demoData";
// import { CURRENT_USER, ROLE_LABELS, filterByLocation, filterLocationList, isAdmin } from "../roles";
// import NetworkStockPanel from "../shared/NetworkStockPanel";

// const SK = { B: "vyapar_bills", P: "vyapar_products", S: "vyapar_shops", T: "vyapar_transfers" };
// const load = (k, d) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : d; } catch { return d; } };

// const StatCard = ({ label, value, sub, color = "text-gray-800", gradient }) => (
//     <div className={`rounded-xl p-5 shadow-sm ${gradient || "bg-white border border-gray-100"}`}>
//         <p className={`text-xs uppercase tracking-wide mb-2 ${gradient ? "text-white/80" : "text-gray-400"}`}>{label}</p>
//         <p className={`text-2xl font-bold ${gradient ? "text-white" : color}`}>{value}</p>
//         {sub && <p className={`text-xs mt-1 ${gradient ? "text-white/70" : "text-gray-400"}`}>{sub}</p>}
//     </div>
// );

// const CustomTooltip = ({ active, payload, label }) => {
//     if (!active || !payload?.length) return null;
//     return (
//         <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
//             <p className="font-semibold text-gray-700 mb-2">{label}</p>
//             {payload.map((p, i) => (
//                 <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
//                     <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
//                     {p.name}: <span className="font-semibold ml-1">₹{p.value?.toLocaleString()}</span>
//                 </p>
//             ))}
//         </div>
//     );
// };

// export default function ContentDashboardTab() {
//     const [bills, setBills] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [shops, setShops] = useState([]);
//     const [transfers, setTransfers] = useState([]);
//     // shopFilter only active for admins — non-admins are locked to their location
//     const [shopFilter, setShopFilter] = useState("all");

//     useEffect(() => {
//         setBills(load(SK.B, INITIAL_BILLS));
//         setProducts(load(SK.P, INITIAL_PRODUCTS));
//         setShops(load(SK.S, INITIAL_SHOPS));
//         setTransfers(load(SK.T, INITIAL_TRANSFERS));
//     }, []);

//     // ── Scope all data to the current user's location ─────────────────────────
//     const scopedBills      = filterByLocation(bills, 'shopId');
//     const scopedProducts   = filterByLocation(products);
//     const scopedTransfers  = filterByLocation(transfers, 'fromShopId');

//     // Admin can further drill-down with the shop selector
//     const visibleBills = (isAdmin() && shopFilter !== "all")
//         ? scopedBills.filter(b => b.shopId === shopFilter)
//         : scopedBills;

//     // ── Derived stats ─────────────────────────────────────────────────────────
//     const today      = new Date().toISOString().split("T")[0];
//     const todayBills = visibleBills.filter(b => b.date === today);
//     const salesToday = todayBills.reduce((s, b) => s + (b.total || 0), 0);
//     const salesMonth = visibleBills.reduce((s, b) => s + (b.total || 0), 0);
//     const lowStock   = scopedProducts.filter(p => p.stock <= (p.lowStockAlert || 10));
//     const outOfStock = scopedProducts.filter(p => p.stock === 0);
//     const pendingTransfers    = scopedTransfers.filter(t => t.status === "pending_approval" || t.status === "pending");
//     const totalInventoryValue = scopedProducts.reduce((s, p) => s + (p.stock * (p.mrp || 0)), 0);

//     const chartData   = MONTHLY_SALES.map(m => ({
//         month: m.month,
//         Sales: m.sales,
//         Purchase: m.purchase || Math.round(m.sales * 0.65),
//         Profit: m.profit || Math.round(m.sales * 0.28),
//     }));
//     const recentBills = [...visibleBills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

//     const statusColors = {
//         paid: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700",
//         overdue: "bg-red-100 text-red-600", cash: "bg-gray-100 text-gray-600",
//         upi: "bg-blue-100 text-blue-700", card: "bg-purple-100 text-purple-700",
//     };

//     const locationLabel = isAdmin()
//         ? "All Locations"
//         : `${CURRENT_USER.locationName || CURRENT_USER.locationId.startsWith("WH") ? "Warehouse" : "Shop"}: ${CURRENT_USER.locationName || CURRENT_USER.locationId}`;

//     return (
//         <div className="space-y-6">

//             {/* ── Top bar ──────────────────────────────────────────────────── */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-lg font-bold text-gray-800">BizPro Dashboard</h1>
//                     <p className="text-xs text-gray-400 mt-0.5">
//                         {/* {ROLE_LABELS[CURRENT_USER.role]} ·{" "} */}
//                         <span className="font-medium text-blue-600">{locationLabel}</span>
//                     </p>
//                 </div>

//                 {/* Admin-only shop filter */}
//                 {isAdmin() ? (
//                     <div className="flex items-center gap-3">
//                         <span className="text-xs text-gray-400">Filter by shop:</span>
//                         <select
//                             value={shopFilter}
//                             onChange={e => setShopFilter(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
//                         >
//                             <option value="all">All Shops</option>
//                             {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//                         </select>
//                     </div>
//                 ) : (
//                     <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
//                         📍 {CURRENT_USER.locationName || CURRENT_USER.locationId}
//                     </span>
//                 )}
//             </div>

//             {/* ── KPI Cards ────────────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard label="Sales Today" value={`₹${salesToday.toLocaleString()}`} sub={`${todayBills.length} bills`} gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
//                 <StatCard label="Total Sales" value={`₹${(salesMonth / 1000).toFixed(0)}K`} sub={`${visibleBills.length} invoices`} gradient="bg-gradient-to-r from-green-500 to-green-600" />
//                 <StatCard label="Inventory Value" value={`₹${(totalInventoryValue / 100000).toFixed(1)}L`} sub="at MRP" gradient="bg-gradient-to-r from-purple-500 to-purple-600" />
//                 <StatCard label="Low Stock Alerts" value={lowStock.length} sub={`${outOfStock.length} out of stock`} color={lowStock.length > 0 ? "text-red-500" : "text-green-600"} />
//             </div>

//             {/* ── Secondary KPIs ───────────────────────────────────────────── */}
//             <div className="grid grid-cols-4 gap-4">
//                 <StatCard label="Products in Scope" value={scopedProducts.length} sub={isAdmin() ? `across ${shops.length} locations` : `at ${CURRENT_USER.locationName || CURRENT_USER.locationId}`} />
//                 <StatCard label="Total Bills" value={visibleBills.length} sub="all time" />
//                 <StatCard label="Pending Transfers" value={pendingTransfers.length} sub="awaiting approval" color={pendingTransfers.length > 0 ? "text-orange-500" : "text-gray-800"} />
//                 <StatCard label={isAdmin() ? "Total Shops" : "Your Location"} value={isAdmin() ? shops.length : "1"} sub={isAdmin() ? `${DASHBOARD_STATS?.totalSuppliers || 8} vendors` : CURRENT_USER.locationName || CURRENT_USER.locationId} />
//             </div>

//             {/* ── Chart + Network Stock Panel ──────────────────────────────── */}
//             <div className="grid grid-cols-3 gap-5">
//                 <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">Monthly Sales vs Purchase vs Profit</h3>
//                         <span className="text-xs text-gray-400">Last 6 months</span>
//                     </div>
//                     <ResponsiveContainer width="100%" height={220}>
//                         <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                             <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
//                             <Tooltip content={<CustomTooltip />} />
//                             <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
//                             <Bar dataKey="Sales" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Purchase" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                             <Bar dataKey="Profit" fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={28} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 </div>

//                 {/* NetworkStockPanel — stock-only, visible to ALL roles */}
//                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-y-auto max-h-80">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-700 text-sm">📦 Network Stock</h3>
//                         <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">All locations</span>
//                     </div>
//                     <NetworkStockPanel />
//                 </div>
//             </div>

//             {/* ── Low stock alerts ─────────────────────────────────────────── */}
//             {lowStock.length > 0 && (
//                 <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 mb-3">
//                         <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//                         <h3 className="font-semibold text-orange-800 text-sm">⚠️ Low Stock Alerts ({lowStock.length} items)</h3>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                         {lowStock.slice(0, 10).map(p => (
//                             <span key={p.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
//                                 {p.name} — {p.stock === 0 ? "OUT" : `${p.stock} left`}
//                             </span>
//                         ))}
//                         {lowStock.length > 10 && <span className="text-xs text-orange-600 font-medium">+{lowStock.length - 10} more...</span>}
//                     </div>
//                 </div>
//             )}

//             {/* ── Pending transfers banner ──────────────────────────────────── */}
//             {pendingTransfers.length > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
//                         <p className="text-sm text-yellow-800 font-medium">{pendingTransfers.length} transfer(s) pending approval</p>
//                     </div>
//                     <span className="text-xs text-yellow-600">Go to Transfers to approve</span>
//                 </div>
//             )}

//             {/* ── Recent bills table ───────────────────────────────────────── */}
//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
//                     <h3 className="font-semibold text-gray-700 text-sm">Recent Bills</h3>
//                     <span className="text-xs text-gray-400">{visibleBills.length} total</span>
//                 </div>
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             {["Bill #", "Customer", "Shop", "Date", "Items", "Total", "Payment"].map(h => (
//                                 <th key={h} className="px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {recentBills.length === 0 ? (
//                             <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">No bills yet for this location.</td></tr>
//                         ) : recentBills.map(b => (
//                             <tr key={b.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer">
//                                 <td className="px-5 py-3 font-mono text-xs text-gray-500">{b.billNumber || b.id}</td>
//                                 <td className="px-5 py-3">
//                                     <p className="font-medium text-gray-700 text-sm">{b.customerName || "Walk-in"}</p>
//                                     <p className="text-xs text-gray-400">{b.customerMobile || "—"}</p>
//                                 </td>
//                                 <td className="px-5 py-3 text-xs text-gray-500">{shops.find(s => s.id === b.shopId)?.name || b.shopId}</td>
//                                 <td className="px-5 py-3 text-xs text-gray-400">{b.date}</td>
//                                 <td className="px-5 py-3 text-gray-500">{b.items?.length || 0}</td>
//                                 <td className="px-5 py-3 font-semibold text-gray-800">₹{(b.total || 0).toFixed(2)}</td>
//                                 <td className="px-5 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
//                                         {(b.paymentMethod || "cash").toUpperCase()}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }