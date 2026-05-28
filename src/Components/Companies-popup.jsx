import { useState } from "react";
import {
  Search,
  Upload,
  Plus,
  RotateCcw,
  MoreVertical,
  CalendarDays,
  Cloud,
  CloudOff,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const companies = [
  {
    id: 1,
    initials: "SR",
    name: "Dummy Name 1",
    lastSale: "15 May 2026, 4:47 pm",
    synced: true,
    active: true,
    color: "bg-blue-500",
  },
  {
    id: 2,
    initials: "MM",
    name: "Mehta Mart",
    lastSale: "21 May 2026, 5:02 pm",
    synced: true,
    active: false,
    color: "bg-emerald-500",
  },
  {
    id: 3,
    initials: "93",
    name: "Dummy Name 2",
    lastSale: "20 May 2026, 8:28 pm",
    synced: false,
    active: false,
    color: "bg-yellow-500",
    tag: "Sync off",
  },
  {
    id: 4,
    initials: "KT",
    name: "Krishna Traders",
    lastSale: "18 May 2026, 11:20 am",
    synced: true,
    active: false,
    color: "bg-violet-500",
  },
  {
    id: 5,
    initials: "SG",
    name: "Sharma General Store",
    lastSale: "01 May 2026, 9:15 am",
    synced: false,
    active: false,
    color: "bg-slate-500",
  },
];

export default function CompanySelector() {
  const [selected, setSelected] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("mine");
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!visible) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
        <button
          onClick={() => setVisible(true)}
          className=" bg-[#1e293b] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#0f172a]"
        >
          Open Company Selector
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 font-['satoshi']">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 pt-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Inventory & Billing
              </p>

              <h1 className="text-2xl font-semibold text-slate-800">
                Select a company
              </h1>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-8">
            {["mine", "shared"].map((item) => {
              const active = tab === item;

              return (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`relative pb-4 text-sm transition ${
                    active
                      ? "font-semibold text-slate-800"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item === "mine"
                    && "My companies"
                  }
                  {active && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#1e293b]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={16} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <Upload size={15} />
            Import .vyp
          </button>
        </div>

        {/* COMPANY LIST */}
        <div className="max-h-[420px] space-y-3 overflow-y-auto p-5">

          {filteredCompanies.length === 0 && (
            <div className="py-16 text-center text-sm text-slate-400">
              No companies found
            </div>
          )}

          {filteredCompanies.map((company) => {
            const isSelected = selected === company.id;

            return (
              <div
                key={company.id}
                onClick={() => setSelected(company.id)}
                className={`group flex cursor-pointer items-center gap-4 border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {/* AVATAR */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center text-sm font-semibold text-white ${company.color}`}
                >
                  {company.initials}
                </div>

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-slate-800">
                      {company.name}
                    </h3>

                    {company.active && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        ● Active
                      </span>
                    )}

                    {company.tag && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {company.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays size={13} />
                    <span>Last sale {company.lastSale}</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">

                  {company.synced ? (
                    <Cloud size={18} className="text-emerald-500" />
                  ) : (
                    <CloudOff size={18} className="text-slate-400" />
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(company.id);
                    }}
                    className={` px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "bg-[#1e293b] text-white hover:bg-[#0f172a]"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Open
                  </button>

                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">

          {/* USER */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b] text-sm font-semibold text-white">
              SR
            </div>

            <div>
              <p className="text-[11px] text-slate-400">
                Logged in with phone
              </p>

              <p className="text-sm font-semibold text-slate-700">
                9320001717
              </p>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <RotateCcw size={15} />
              Restore backup
            </button>

            <button onClick={() => { navigate("/company-details")}} className="flex items-center gap-2 bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0f172a]">
              <Plus size={15} />
              New company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}