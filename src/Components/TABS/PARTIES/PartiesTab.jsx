// TABS/PARTIES/PartiesTab.jsx

import React, { useState } from "react";

import {
    Search,
    Plus,
    ChevronRight,
    Filter,
    Upload,
    Users,
} from "lucide-react";

import {
    INITIAL_CUSTOMERS,
    INITIAL_VENDORS,
} from "../../demoData";

const PartiesTab = () => {

    const [activeType, setActiveType] = useState("all");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    // ADD THESE STATES

const [showFilters, setShowFilters] = useState(false);
const [cityFilter, setCityFilter] = useState("all");
const [outstandingOnly, setOutstandingOnly] = useState(false);

    const all = [
        ...INITIAL_CUSTOMERS.map(c => ({
            ...c,
            type: "customer",
        })),

        ...INITIAL_VENDORS.map(v => ({
            ...v,
            type: "vendor",
        })),
    ];

  const filtered = all.filter((p) => {

    const matchSearch =
        p.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||

        p.city
            .toLowerCase()
            .includes(search.toLowerCase());

    const matchType =
        activeType === "all" ||
        p.type === activeType;

    const matchStatus =
        statusFilter === "all" ||
        p.status === statusFilter;

    const matchCity =
        cityFilter === "all" ||
        p.city === cityFilter;

    const matchOutstanding =
        outstandingOnly
            ? p.outstanding > 0
            : true;

    return (
        matchSearch &&
        matchType &&
        matchStatus &&
        matchCity &&
        matchOutstanding
    );
});

    const totalOutstanding =
        INITIAL_CUSTOMERS.reduce(
            (s, c) => s + c.outstanding,
            0
        ) +

        INITIAL_VENDORS.reduce(
            (s, v) => s + v.outstanding,
            0
        );

    return (

        <div className=" bg-[#f3f5f9] min-h-screen -m-4 p-7">

            {/* TOP HEADER */}

            <div
                className="
                    bg-white
                    border
                    border-[#e7ebf3]
                    px-5
                    py-4
                    flex
                    items-center
                    justify-between
                    shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                "
            >

                {/* LEFT */}

                <div className="flex items-center gap-4">

                    <div className="
                        w-12
                        h-12
                        rounded-xl
                        bg-[#111827]
                        flex
                        items-center
                        justify-center
                    ">

                        <Users
                            size={20}
                            className="text-white"
                        />
                    </div>

                    <div>

                        <h2 className="
                            text-[22px]
                            font-[700]
                            text-[#111827]
                            tracking-tight
                        ">
                            Parties Management
                        </h2>

                        <p className="
                            text-sm
                            text-slate-500
                            mt-0.5
                        ">
                            Manage customers, suppliers & outstanding balances
                        </p>
                    </div>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-3">

                    <button
                        className="
                            h-10
                            px-4
                            rounded-xl
                            bg-[#111827]
                            hover:bg-black
                            text-white
                            text-sm
                            font-[600]
                            flex
                            items-center
                            gap-2
                            transition-all
                            cursor-pointer
                        "
                    >
                        <Plus size={15} />
                        Add Party
                    </button>
                </div>
            </div>
            {/* FILTER SIDEBAR */}

{
    showFilters && (

        <div className="
            fixed
            inset-0
            z-50
            bg-black/30
            backdrop-blur-[2px]
            flex
            justify-end
        ">

            {/* PANEL */}

            <div className="
                w-[380px]
                h-full
                bg-white
                shadow-2xl
                border-l
                border-[#e7ebf3]
                p-6
                overflow-y-auto
                animate-[slideIn_.25s_ease]
            ">

                {/* HEADER */}

                <div className="
                    flex
                    items-center
                    justify-between
                    mb-6
                ">

                    <div>

                        <h2 className="
                            text-[22px]
                            font-[700]
                            text-[#111827]
                        ">
                            Filters
                        </h2>

                        <p className="
                            text-sm
                            text-slate-500
                            mt-1
                        ">
                            Refine party records
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setShowFilters(false)
                        }
                        className="
                            w-10
                            h-10
                            rounded-xl
                            bg-[#f3f5f9]
                            hover:bg-[#e7ebf3]
                            text-slate-600
                            transition-all
                            cursor-pointer
                        "
                    >
                        ✕
                    </button>
                </div>

                {/* FILTERS */}

                <div className="space-y-5">

                    {/* TYPE */}

                    <div>

                        <label className="
                            text-sm
                            font-[600]
                            text-[#111827]
                            block
                            mb-2
                        ">
                            Party Type
                        </label>

                        <select
                            value={activeType}
                            onChange={(e) =>
                                setActiveType(e.target.value)
                            }
                            className="
                                w-full
                                h-11
                                px-4
                                rounded-xl
                                border
                                border-[#dbe1ea]
                                bg-white
                                text-sm
                                outline-none
                            "
                        >
                            <option value="all">
                                All Parties
                            </option>

                            <option value="customer">
                                Customers
                            </option>

                            <option value="vendor">
                                Vendors
                            </option>
                        </select>
                    </div>

                    {/* STATUS */}

                    <div>

                        <label className="
                            text-sm
                            font-[600]
                            text-[#111827]
                            block
                            mb-2
                        ">
                            Status
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="
                                w-full
                                h-11
                                px-4
                                rounded-xl
                                border
                                border-[#dbe1ea]
                                bg-white
                                text-sm
                                outline-none
                            "
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>
                    </div>

                    {/* CITY */}

                    <div>

                        <label className="
                            text-sm
                            font-[600]
                            text-[#111827]
                            block
                            mb-2
                        ">
                            City
                        </label>

                        <select
                            value={cityFilter}
                            onChange={(e) =>
                                setCityFilter(e.target.value)
                            }
                            className="
                                w-full
                                h-11
                                px-4
                                rounded-xl
                                border
                                border-[#dbe1ea]
                                bg-white
                                text-sm
                                outline-none
                            "
                        >
                            <option value="all">
                                All Cities
                            </option>

                            {
                                [...new Set(all.map(p => p.city))]
                                    .map(city => (

                                        <option
                                            key={city}
                                            value={city}
                                        >
                                            {city}
                                        </option>
                                    ))
                            }
                        </select>
                    </div>

                    {/* OUTSTANDING */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            p-4
                            rounded-2xl
                            border
                            border-[#e7ebf3]
                        "
                    >

                        <div>

                            <h3 className="
                                text-sm
                                font-[600]
                                text-[#111827]
                            ">
                                Outstanding Only
                            </h3>

                            <p className="
                                text-xs
                                text-slate-500
                                mt-1
                            ">
                                Show pending payment parties
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setOutstandingOnly(
                                    !outstandingOnly
                                )
                            }
                            className={`
                                w-12
                                h-7
                                rounded-full
                                transition-all
                                relative

                                ${
                                    outstandingOnly
                                        ? "bg-[#111827]"
                                        : "bg-slate-300"
                                }
                            `}
                        >

                            <div
                                className={`
                                    absolute
                                    top-1
                                    w-5
                                    h-5
                                    rounded-full
                                    bg-white
                                    transition-all

                                    ${
                                        outstandingOnly
                                            ? "left-6"
                                            : "left-1"
                                    }
                                `}
                            />
                        </button>
                    </div>
                </div>

                {/* FOOTER */}

                <div className="
                    mt-8
                    flex
                    items-center
                    gap-3
                ">

                    <button
                        onClick={() => {

                            setSearch("");
                            setActiveType("all");
                            setStatusFilter("all");
                            setCityFilter("all");
                            setOutstandingOnly(false);
                        }}
                        className="
                            flex-1
                            h-11
                            rounded-xl
                            border
                            border-[#dbe1ea]
                            text-sm
                            font-[600]
                            text-slate-600
                            hover:bg-[#f8fafc]
                            transition-all
                            cursor-pointer
                        "
                    >
                        Reset
                    </button>

                    <button
                        onClick={() =>
                            setShowFilters(false)
                        }
                        className="
                            flex-1
                            h-11
                            rounded-xl
                            bg-[#111827]
                            hover:bg-black
                            text-white
                            text-sm
                            font-[600]
                            transition-all
                            cursor-pointer
                        "
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    )
}

            {/* STATS */}

            <div className="grid grid-cols-4 gap-5 mt-5">

                {[
                    {
                        label: "TOTAL PARTIES",
                        value: all.length,
                        sub: "registered in system",
                    },

                    {
                        label: "CUSTOMERS",
                        value: INITIAL_CUSTOMERS.length,
                        sub: "active buyers",
                    },

                    {
                        label: "SUPPLIERS",
                        value: INITIAL_VENDORS.length,
                        sub: "active vendors",
                    },

                    {
                        label: "TOTAL OUTSTANDING",
                        value:
                            "₹" +
                            (
                                totalOutstanding / 1000
                            ).toFixed(0) +
                            "K",
                        sub: "pending payments",
                        red: true,
                    },
                ].map((s) => (

                    <div
                        key={s.label}
                        className="
                            bg-white
                            border
                            border-[#e7ebf3]
                            px-5
                            py-2
                            shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                        "
                    >

                        <p className="
                            text-[11px]
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                            font-[700]
                        ">
                            {s.label}
                        </p>

                        <h2
                            className={`
                                mt-3
                                text-[36px]
                                leading-none
                                font-[700]

                                ${
                                    s.red
                                        ? "text-[#dc2626]"
                                        : "text-[#111827]"
                                }
                            `}
                        >
                            {s.value}
                        </h2>

                        <p className="
                            mt-2
                            text-sm
                            text-slate-400
                        ">
                            {s.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* MAIN TABLE CARD */}

            <div
                className="
                    mt-5
                    bg-white
                    border
                    border-[#e7ebf3]
                    overflow-hidden
                    shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                "
            >

                {/* HEADER */}

                <div className="
                    bg-[#111827]
                    px-5
                    py-4
                    flex
                    items-center
                    justify-between
                ">

                    <h2 className="
                        text-white
                        text-[18px]
                        font-[700]
                    ">
                        Party List
                    </h2>

                    <div className="flex items-center gap-2">

                       <button
    onClick={() =>
        setShowFilters(!showFilters)
    }
    className="
        h-9
        px-3
        rounded-lg
        bg-white/10
        hover:bg-white/15
        text-white
        text-sm
        font-[500]
        flex
        items-center
        gap-2
        transition-all
        cursor-pointer
    "
>
    <Filter size={14} />
    Filters
</button>

                        <select
                            className="
                                h-9
                                px-3
                                rounded-lg
                                bg-white/10
                                text-white
                                text-sm
                                outline-none
                                border-none
                                cursor-pointer
                            "
                        >
                            <option className="text-black">
                                20 per page
                            </option>

                            <option className="text-black">
                                50 per page
                            </option>
                        </select>
                    </div>
                </div>

                {/* SEARCH + FILTERS */}

                <div className="
                    px-5
                    py-4
                    border-b
                    border-[#eef2f7]
                    flex
                    items-center
                    gap-3
                    flex-wrap
                ">

                    {/* SEARCH */}

                    <div className="relative flex-1 min-w-[250px]">

                        <Search
                            size={16}
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
                            placeholder="Search party name or city..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            className="
                                w-full
                                h-11
                                pl-11
                                pr-4
                                rounded-xl
                                border
                                border-[#dbe1ea]
                                bg-[#fbfcfe]
                                text-sm
                                text-slate-700
                                placeholder:text-slate-400
                                outline-none
                                transition-all

                                focus:border-[#cbd5e1]
                                focus:bg-white
                            "
                        />
                    </div>

                    {/* TYPE */}

                    <select
                        value={activeType}
                        onChange={(e) =>
                            setActiveType(e.target.value)
                        }
                        className="
                            h-11
                            px-4
                            rounded-xl
                            border
                            border-[#dbe1ea]
                            bg-white
                            text-sm
                            text-slate-700
                            outline-none
                            cursor-pointer
                        "
                    >
                        <option value="all">
                            All Parties
                        </option>

                        <option value="customer">
                            Customers
                        </option>

                        <option value="vendor">
                            Vendors
                        </option>
                    </select>

                    {/* STATUS */}

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                        className="
                            h-11
                            px-4
                            rounded-xl
                            border
                            border-[#dbe1ea]
                            bg-white
                            text-sm
                            text-slate-700
                            outline-none
                            cursor-pointer
                        "
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>

                    {/* CLEAR */}

                    <button
                        onClick={() => {
                            setSearch("");
                            setActiveType("all");
                            setStatusFilter("all");
                        }}
                        className="
                            h-11
                            px-4
                            rounded-xl
                            border
                            border-[#dbe1ea]
                            bg-white
                            hover:bg-[#f8fafc]
                            text-sm
                            text-slate-600
                            font-[600]
                            transition-all
                            cursor-pointer
                        "
                    >
                        Clear
                    </button>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1150px]">

                        <thead>

                            <tr className="
                                border-b
                                border-[#eef2f7]
                                bg-[#fafbfd]
                            ">

                                {[
                                    "PARTY",
                                    "TYPE",
                                    "PHONE",
                                    "CITY",
                                    "TOTAL BUSINESS",
                                    "OUTSTANDING",
                                    "GSTIN",
                                    "STATUS",
                                ].map((h) => (

                                    <th
                                        key={h}
                                        className="
                                            px-6
                                            py-4
                                            text-left
                                            text-[11px]
                                            uppercase
                                            tracking-[0.12em]
                                            text-slate-400
                                            font-[700]
                                        "
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {filtered.map((p) => (

                                <tr
                                    key={`${p.type}-${p.id}`}
                                    className="
                                        border-b
                                        border-[#f1f5f9]
                                        hover:bg-[#fafcff]
                                        transition-all
                                        cursor-pointer
                                        group
                                    "
                                >

                                    {/* NAME */}

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-4">

                                            <div
                                                className={`
                                                    w-11
                                                    h-11
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-sm
                                                    font-[700]

                                                    ${
                                                        p.type === "customer"

                                                            ? `
                                                                bg-[#eff6ff]
                                                                text-[#2563eb]
                                                            `

                                                            : `
                                                                bg-[#f5f3ff]
                                                                text-[#7c3aed]
                                                            `
                                                    }
                                                `}
                                            >
                                                {
                                                    p.name
                                                        ?.charAt(0)
                                                }
                                            </div>

                                            <div>

                                                <h3 className="
                                                    text-[15px]
                                                    font-[600]
                                                    text-[#111827]
                                                ">
                                                    {p.name}
                                                </h3>

                                                <p className="
                                                    text-xs
                                                    text-slate-400
                                                    mt-0.5
                                                ">
                                                    {p.id}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* TYPE */}

                                    <td className="px-6 py-5">

                                        <span
                                            className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-xs
                                                font-[600]

                                                ${
                                                    p.type === "customer"

                                                        ? `
                                                            bg-[#eff6ff]
                                                            text-[#2563eb]
                                                        `

                                                        : `
                                                            bg-[#f5f3ff]
                                                            text-[#7c3aed]
                                                        `
                                                }
                                            `}
                                        >
                                            {p.type}
                                        </span>
                                    </td>

                                    {/* PHONE */}

                                    <td className="
                                        px-6
                                        py-5
                                        text-sm
                                        text-slate-600
                                    ">
                                        {p.phone || "—"}
                                    </td>

                                    {/* CITY */}

                                    <td className="
                                        px-6
                                        py-5
                                        text-sm
                                        text-slate-600
                                    ">
                                        {p.city || "—"}
                                    </td>

                                    {/* BUSINESS */}

                                    <td className="px-6 py-5">

                                        <span className="
                                            text-[15px]
                                            font-[600]
                                            text-[#111827]
                                        ">
                                            ₹
                                            {(
                                                p.totalBusiness ||
                                                p.totalPurchased ||
                                                0
                                            ).toLocaleString()}
                                        </span>
                                    </td>

                                    {/* OUTSTANDING */}

                                    <td className="px-6 py-5">

                                        {
                                            p.outstanding > 0

                                                ? (

                                                    <span className="
                                                        text-[#dc2626]
                                                        font-[600]
                                                    ">
                                                        ₹
                                                        {
                                                            p.outstanding
                                                                .toLocaleString()
                                                        }
                                                    </span>
                                                )

                                                : (

                                                    <span className="
                                                        text-[#16a34a]
                                                        font-[600]
                                                        text-sm
                                                    ">
                                                        Cleared
                                                    </span>
                                                )
                                        }
                                    </td>

                                    {/* GST */}

                                    <td className="
                                        px-6
                                        py-5
                                        text-sm
                                        text-slate-500
                                        font-mono
                                    ">
                                        {p.gstin || "—"}
                                    </td>

                                    {/* STATUS */}

                                    <td className="px-6 py-5">

                                        <div className="flex items-center gap-2">

                                            <div
                                                className={`
                                                    w-2
                                                    h-2
                                                    rounded-full

                                                    ${
                                                        p.status === "active"

                                                            ? "bg-[#22c55e]"

                                                            : "bg-slate-300"
                                                    }
                                                `}
                                            />

                                            <span
                                                className={`
                                                    text-sm
                                                    font-[500]

                                                    ${
                                                        p.status === "active"

                                                            ? "text-[#16a34a]"

                                                            : "text-slate-400"
                                                    }
                                                `}
                                            >
                                                {p.status}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ARROW */}

                                    <td className="pr-6">

                                        <ChevronRight
                                            size={18}
                                            className="
                                                text-slate-300
                                                opacity-0
                                                group-hover:opacity-100
                                                transition-all
                                            "
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* EMPTY */}

                    {
                        filtered.length === 0 && (

                            <div className="
                                py-24
                                flex
                                flex-col
                                items-center
                                justify-center
                            ">

                                <div className="
                                    w-16
                                    h-16
                                    rounded-2xl
                                    bg-[#f8fafc]
                                    border
                                    border-[#eef2f7]
                                    flex
                                    items-center
                                    justify-center
                                ">

                                    <Users
                                        size={24}
                                        className="text-slate-400"
                                    />
                                </div>

                                <h3 className="
                                    mt-5
                                    text-lg
                                    font-[700]
                                    text-[#111827]
                                ">
                                    No parties found
                                </h3>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                ">
                                    Add your first party
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default PartiesTab;