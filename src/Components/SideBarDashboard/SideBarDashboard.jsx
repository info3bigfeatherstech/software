// src/Components/SideBarDashboard/SideBarDashboard.jsx
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TAB_REGISTRY } from "../TabRegistry";
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLES, filterSubItemsByRole } from "../roles";
import { useLogoutMutation } from "../../REDUX_FEATURES/REDUX_SLICES/Login_Api/authApi";
import {
    clearCredentials,
    setAuthChecked,
} from "../../REDUX_FEATURES/REDUX_SLICES/Login_Api/authSlice";

const LOGO = "https://www.thebigfeathers.com/static/media/logo.de8b004c787675511bd3.png"
// ─────────────────────────────────────────────────────────────────────────────

const SideBarDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

    // ── Role & permissions ────────────────────────────────────────────────────
    const activeRole = user?.role || ROLES.SUPER_ADMIN;
    const locationId = user?.warehouse_id || user?.shop_id || "";
    const allowedTabIds = ROLE_PERMISSIONS[activeRole] || [];
    const allowedTabs = TAB_REGISTRY.filter((tab) => allowedTabIds.includes(tab.id));
    const defaultTab = allowedTabs[0]?.id || "dashboard";

    // ── Derive activeTab synchronously from URL + permissions ─────────────────
    const tabFromUrl = searchParams.get("tab");
    const activeTab = tabFromUrl && allowedTabIds.includes(tabFromUrl)
        ? tabFromUrl
        : defaultTab;

    const activeCtab = searchParams.get("ctab") || null;

    // ── Dropdown state — MANUAL control only, no auto-expand ───────────────────
    const [expandedTab, setExpandedTab] = useState(() => {
        // Only auto-expand on initial load if the active tab has subitems
        const initialTab = new URLSearchParams(window.location.search).get("tab");
        const entry = allowedTabs.find((t) => t.id === initialTab && t.subItems?.length);
        return entry ? entry.id : null;
    });

    // ── Close mobile menu when window resizes to desktop ──────────────────────
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Keep URL honest ───────────────────────────────────────────────────────
    useEffect(() => {
        const urlTab = searchParams.get("tab");
        const urlIsWrong = !urlTab || !allowedTabIds.includes(urlTab);

        if (urlIsWrong) {
            setSearchParams({ tab: defaultTab }, { replace: true });
        }
    }, [activeRole, locationId, searchParams, setSearchParams, defaultTab, allowedTabIds]);


    console.log("LOCATION_ID", locationId, activeRole);
    // ── Parent tab click ──────────────────────────────────────────────────────
    const handleTabClick = (tab) => {
        if (!allowedTabIds.includes(tab.id)) return;

        const hasSubItems = tab.subItems?.length > 0;
        const isCurrentlyExpanded = expandedTab === tab.id;

        if (hasSubItems) {
            if (isCurrentlyExpanded) {
                // User wants to CLOSE the dropdown
                setExpandedTab(null);
                // Keep the parent tab active, but no sub-item selected
                setSearchParams({ tab: tab.id });
            } else {
                // User wants to OPEN this dropdown
                // First close any other open dropdown
                setExpandedTab(tab.id);
                const firstSub = tab.subItems[0];
                setSearchParams({ tab: tab.id, ctab: firstSub.id });
            }
        } else {
            // Tab without dropdown - close any open dropdown and switch
            setExpandedTab(null);
            setSearchParams({ tab: tab.id });
        }

        // Close mobile menu after selection on mobile
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    // ── Sub-item click (sidebar dropdown) ─────────────────────────────────────
    const handleSubItemClick = (parentId, subId) => {
        if (!allowedTabIds.includes(parentId)) return;
        // Ensure dropdown stays open when clicking sub-items
        setExpandedTab(parentId);
        setSearchParams({ tab: parentId, ctab: subId });

        // Close mobile menu after selection on mobile
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    // ── Switch tab from inside components ─────────────────────────────────────
    const handleSwitchTab = (tabId) => {
        const tab = allowedTabs.find((t) => t.id === tabId);
        if (tab) handleTabClick(tab);
    };

    // ── Toggle sidebar collapse ───────────────────────────────────────────────
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // ── Toggle mobile menu ────────────────────────────────────────────────────
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } catch (_error) {
            // Clear local session even if backend logout fails.
        } finally {
            dispatch(clearCredentials());
            dispatch(setAuthChecked(true));
            setSearchParams({}, { replace: true });
        }
    };

    const activeTabConfig = allowedTabs.find((t) => t.id === activeTab);
    const TabComponent = activeTabConfig?.component ?? null;

    return (
        <div className="flex min-h-screen bg-gray-50 relative">

            {/* ── Mobile Menu Overlay ─────────────────────────────────────────────── */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* ── Sidebar ──────────────────────────────────────────────────────── */}
            <aside
                className={`
    fixed md:sticky top-0 h-screen z-40
    bg-[#022448]
    border-r border-white/5
    flex flex-col
    transition-all duration-300 ease-in-out

    ${isSidebarCollapsed
                        ? "w-20"
                        : "w-[280px]"
                    }

    ${isMobileMenuOpen
                        ? "left-0"
                        : "-left-full md:left-0"
                    }
  `}
            >

                {/* ====================================================== */}
                {/* LOGO / COMPANY SECTION */}
                {/* ====================================================== */}

                <div
                    className={`
    border-b border-white/5

    ${isSidebarCollapsed
                            ? "px-3 py-4"
                            : "px-4 py-4"
                        }
  `}
                >

                    {/* EXPANDED */}

                    {!isSidebarCollapsed ? (

                        <div className="
      flex
      items-center
      gap-3
    ">

                            {/* LOGO */}

                            <div className="
        w-16
        h-16
        rounded-2xl
        bg-[#1b2330]
        border border-white/5
        flex
        items-center
        justify-center
        shrink-0
        overflow-hidden
      ">

                                <img
                                    src={LOGO}
                                    alt="Brand Logo"
                                    className="
            w-28
            h-28
            object-contain
          "
                                />
                            </div>

                            {/* COMPANY INFO */}

                            <div className="
        min-w-0
        flex-1
      ">

                                {/* COMPANY NAME */}

                                <h2 className="
          text-[15px]
          font-[700]
          text-white
          truncate
          leading-none
        ">
                                    Inventory Management
                                </h2>

                                {/* ROLE */}

                            </div>
                        </div>

                    ) : (

                        /* COLLAPSED */

                        <div className="
      flex
      justify-center
    ">

                            <div className="
        w-12
        h-12
        rounded-2xl
        bg-[#1b2330]
        border border-white/5
        flex
        items-center
        justify-center
        overflow-hidden
      ">

                                <img
                                    src={LOGO}
                                    alt="Brand Logo"
                                    className="
            w-8
            h-8
            object-contain
          "
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ====================================================== */}
                {/* TOGGLE */}
                {/* ====================================================== */}

                <button
                    onClick={toggleSidebar}
                    className="
      absolute
      -right-3
      top-20
      w-7
      h-7
      rounded-full
      bg-[#1a1d24]
      border border-white/10
      flex items-center justify-center
      hover:bg-[#232833]
      transition-all
      hidden md:flex
    "
                >

                    <svg
                        className={`
        w-4 h-4
        text-slate-400
        transition-transform duration-300

        ${isSidebarCollapsed
                                ? "rotate-180"
                                : ""
                            }
      `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                {/* ====================================================== */}
                {/* NAVIGATION */}
                {/* ====================================================== */}

                <nav
                    className="
      flex-1
      px-3
      py-5
      space-y-1.5
      overflow-y-auto
    "
                >

                    {allowedTabs.map((tab) => {

                        const isActive =
                            activeTab === tab.id;

                        const hasSubItems =
                            tab.subItems?.length > 0;

                        const isExpanded =
                            expandedTab === tab.id;

                        return (

                            <div key={tab.id}>

                                {/* ====================================================== */}
                                {/* MAIN TAB */}
                                {/* ====================================================== */}

                                <button
                                    onClick={() =>
                                        handleTabClick(tab)
                                    }
                                    title={
                                        isSidebarCollapsed
                                            ? tab.label
                                            : ""
                                    }
                                    className={`
              relative
              w-full
              rounded-2xl
              transition-all
              duration-200
              group
              border

              ${isSidebarCollapsed

                                            ? `
                    h-14
                    flex
                    items-center
                    justify-center
                  `

                                            : `
                    h-14
                    px-4
                    flex
                    items-center
                    justify-between
                  `
                                        }

              ${isActive

                                            ? `
                    bg-[#1e3a5f]
                    border-[#1e3a5f]
                  `

                                            : `
                    border-transparent
                    hover:bg-white/[0.04]
                  `
                                        }
            `}
                                >

                                    {/* LEFT */}

                                    <div className="
              flex
              items-center
              gap-3
            ">

                                        {/* ICON */}

                                        <div
                                            className={`
                  flex
                  items-center
                  justify-center
                  transition-all

                  ${isActive

                                                    ? `
                        text-blue-400
                      `

                                                    : `
                        text-slate-500
                        group-hover:text-slate-300
                      `
                                                }
                `}
                                        >

                                            <svg
                                                className="
                    w-5
                    h-5
                    shrink-0
                  "
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={tab.icon}
                                                />
                                            </svg>
                                        </div>

                                        {/* LABEL */}

                                        {!isSidebarCollapsed && (

                                            <span
                                                className={`
                    text-lg font-medium
                    transition-all ${isActive ? `text-white` : `text-slate-400 group-hover:text-slate-200
                        `
                                                    }
                  `}
                                            >
                                                {tab.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* RIGHT */}

                                    {
                                        hasSubItems &&
                                        !isSidebarCollapsed && (

                                            <svg
                                                className={`
                    w-4 h-4
                    transition-all duration-300

                    ${isExpanded
                                                        ? "rotate-180"
                                                        : ""
                                                    }

                    ${isActive

                                                        ? `
                          text-blue-400
                        `

                                                        : `
                          text-slate-500
                        `
                                                    }
                  `}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        )
                                    }
                                </button>

                                {/* ====================================================== */}
                                {/* SUB ITEMS */}
                                {/* ====================================================== */}

                                {
                                    hasSubItems &&
                                    isExpanded &&
                                    !isSidebarCollapsed && (

                                        <div
                                            className="
                  mt-2
                  ml-6
                  pl-5
                  border-l
                  border-white/5
                  space-y-1.5
                "
                                        >

                                            {
                                                filterSubItemsByRole(
                                                    tab.id,
                                                    tab.subItems
                                                ).map((sub) => {

                                                    const isSubActive =
                                                        isActive &&
                                                        activeCtab === sub.id;

                                                    return (

                                                        <button
                                                            key={sub.id}
                                                            onClick={() =>
                                                                handleSubItemClick(
                                                                    tab.id,
                                                                    sub.id
                                                                )
                                                            }
                                                            className={`
                          w-full
                          h-11
                          px-3
                          rounded-xl
                          flex
                          items-center
                          gap-3
                          text-left
                          transition-all
                          duration-200
                          border
                          group

                          ${isSubActive

                                                                    ? `
                                bg-blue-500/10
                                border-blue-500/20
                              `

                                                                    : `
                                border-transparent
                                hover:bg-white/[0.04]
                              `
                                                                }
                        `}
                                                        >

                                                            {/* ICON */}

                                                            <svg
                                                                className={`
                            w-4
                            h-4
                            shrink-0

                            ${isSubActive

                                                                        ? `
                                  text-blue-400
                                `

                                                                        : `
                                  text-slate-500
                                  group-hover:text-slate-300
                                `
                                                                    }
                          `}
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >

                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d={sub.icon}
                                                                />
                                                            </svg>

                                                            {/* LABEL */}

                                                            <span
                                                                className={`
                            text-[13px]
                            font-[500]

                            ${isSubActive

                                                                        ? `
                                  text-blue-300
                                `

                                                                        : `
                                  text-slate-400
                                  group-hover:text-slate-200
                                `
                                                                    }
                          `}
                                                            >
                                                                {sub.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        );
                    })}
                </nav>

                {/* ====================================================== */}
                {/* FOOTER */}
                {/* ====================================================== */}

                <div
                    className={`
      p-4
      border-t
      border-white/5

      ${isSidebarCollapsed
                            ? "text-center"
                            : ""
                        }
    `}
                >

                    {/* LOGOUT */}

                    <button
                        onClick={handleLogout}
                        disabled={isLogoutLoading}
                        className={`
        w-full
        h-11
        rounded-xl
        border
        border-red-500/20
        bg-red-500/10
        text-red-400
        text-sm
        font-[600]
        hover:bg-red-500/15
        transition-all

        ${isLogoutLoading
                                ? "opacity-70 cursor-not-allowed"
                                : ""
                            }
      `}
                    >
                        {
                            isLogoutLoading
                                ? "Logging out..."
                                : "Logout"
                        }
                    </button>

                    {/* VERSION */}

                    <p
                        className={`
        mt-4
        text-[10px]
        uppercase
        tracking-[0.16em]
        text-slate-600
        font-[700]

        ${isSidebarCollapsed
                                ? "text-center"
                                : ""
                            }
      `}
                    >
                        {
                            isSidebarCollapsed
                                ? "v1.0"
                                : "Vyapar ERP v1.0.0"
                        }
                    </p>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <header className="
  sticky
  top-0
  z-20
  h-[74px]
  bg-white/80
  backdrop-blur-xl
  border-b
  border-slate-200
  flex
  items-center
  justify-between
  px-4
  md:px-8
">

                    {/* ====================================================== */}
                    {/* LEFT */}
                    {/* ====================================================== */}

                    <div className="
    flex
    items-center
    gap-4
  ">

                        {/* MOBILE MENU */}

                        <button
                            onClick={toggleMobileMenu}
                            className="
        md:hidden
        w-11
        h-11
        rounded-2xl
        border
        border-slate-200
        bg-white
        flex
        items-center
        justify-center
        hover:bg-slate-50
        transition-all
      "
                        >

                            <svg
                                className="
          w-5
          h-5
          text-slate-600
        "
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        {/* PAGE TITLE */}

                        <div>

                            <h2 className="
        text-[22px]
        font-[500]
        tracking-tight
        text-[#111827]
        capitalize
      ">
                                {activeTabConfig?.label || "Dashboard"}
                            </h2>

                            <p className="
        mt-0.5
        text-sm
        text-slate-500
      ">
                                Welcome back, manage your business efficiently
                            </p>
                        </div>
                    </div>

                    {/* ====================================================== */}
                    {/* RIGHT */}
                    {/* ====================================================== */}

                    <div className="
    flex
    items-center
    gap-3
  ">

                        {/* SEARCH */}

                        <div className="
      hidden
      lg:flex
      items-center
      relative
    ">

                            {/* ICON */}

                            <svg
                                className="
          absolute
          left-4
          w-4
          h-4
          text-slate-400
        "
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>

                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="
          w-[320px]
          h-11
          border
          border-slate-200
          bg-[#f8fafc]
          pl-11
          pr-4
          text-sm
          text-slate-700
          placeholder:text-slate-400
          outline-none
          focus:border-blue-300
          focus:bg-white
          transition-all
        "
                            />
                        </div>

                        {/* NOTIFICATION */}

                        <button
                            className="
        relative
        w-11
        h-11
        border
        border-slate-200
        bg-white
        flex
        items-center
        justify-center
        hover:bg-slate-50
        transition-all
      "
                        >

                            {/* DOT */}

                            <div className="
        absolute
        top-2.5
        right-2.5
        w-2
        h-2
        rounded-full
        bg-red-500
      " />

                            <svg
                                className="
          w-5
          h-5
          text-slate-600
        "
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </button>

                        {/* PROFILE */}

                        <button
                            className="
        flex
        items-center
        gap-3
        pl-3
        pr-4
        h-11
        border
        border-slate-200
        bg-white
        hover:bg-slate-50
        transition-all
      "
                        >

                            {/* AVATAR */}

                            <div className="
        w-9
        h-9
        rounded-xl
        bg-[#111827]
        flex
        items-center
        justify-center
        text-sm
        font-[800]
        text-white
        shrink-0
      ">
                                {user?.name?.charAt(0) || "A"}
                            </div>

                            {/* INFO */}

                            <div className="
        hidden
        md:block
        text-left
      ">

                                <p className="
          text-sm
          font-[700]
          text-[#111827]
          leading-none
        ">
                                    {user?.name || "Admin"}
                                </p>

                                <p className="
          mt-1
          text-xs
          text-slate-500
        ">
                                    {
                                        ROLE_LABELS[activeRole] ||
                                        activeRole
                                    }
                                </p>
                            </div>

                            {/* ARROW */}

                            <svg
                                className="
          hidden
          md:block
          w-4
          h-4
          text-slate-400
        "
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    }>
                        {TabComponent ? (
                            <TabComponent onSwitchTab={handleSwitchTab} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm font-medium">This section is coming soon</p>
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default SideBarDashboard;

// // src/Components/SideBarDashboard/SideBarDashboard.jsx
// import React, { useState, useEffect, Suspense } from "react";
// import { useSearchParams } from "react-router-dom";
// import { TAB_REGISTRY } from "../TabRegistry";
// import { ROLE_PERMISSIONS, ROLE_LABELS, ROLES } from "../roles";

// // ── HARDCODED ROLE (change this to test different permissions) ───────────────
// const HARDCODED_ROLE = ROLES.OWNER;

// const LOGO = "https://www.thebigfeathers.com/static/media/logo.de8b004c787675511bd3.png"
// // ─────────────────────────────────────────────────────────────────────────────

// const SideBarDashboard = () => {
//     const [searchParams, setSearchParams] = useSearchParams();

//     // ── Role & permissions ────────────────────────────────────────────────────
//     const activeRole = HARDCODED_ROLE;
//     const allowedTabIds = ROLE_PERMISSIONS[activeRole] || [];
//     const allowedTabs = TAB_REGISTRY.filter((tab) => allowedTabIds.includes(tab.id));
//     const defaultTab = allowedTabs[0]?.id || "dashboard";

//     // ── Derive activeTab synchronously from URL + permissions ─────────────────
//     const tabFromUrl = searchParams.get("tab");
//     const activeTab = tabFromUrl && allowedTabIds.includes(tabFromUrl)
//         ? tabFromUrl
//         : defaultTab;

//     const activeCtab = searchParams.get("ctab") || null;

//     // ── Dropdown state — MANUAL control only, no auto-expand ───────────────────
//     const [expandedTab, setExpandedTab] = useState(() => {
//         // Only auto-expand on initial load if the active tab has subitems
//         const initialTab = new URLSearchParams(window.location.search).get("tab");
//         const entry = allowedTabs.find((t) => t.id === initialTab && t.subItems?.length);
//         return entry ? entry.id : null;
//     });

//     // ── Keep URL honest ───────────────────────────────────────────────────────
//     useEffect(() => {
//         const urlTab = searchParams.get("tab");
//         const urlIsWrong = !urlTab || !allowedTabIds.includes(urlTab);

//         if (urlIsWrong) {
//             setSearchParams({ tab: defaultTab }, { replace: true });
//         }
//     }, [activeRole, searchParams, setSearchParams, defaultTab, allowedTabIds]);

//     // ── REMOVED: auto-expand useEffect that was causing the bug ─────────────────
//     // The bug was here - this useEffect kept forcing dropdowns open

//     // ── Parent tab click ──────────────────────────────────────────────────────
//     const handleTabClick = (tab) => {
//         if (!allowedTabIds.includes(tab.id)) return;

//         const hasSubItems = tab.subItems?.length > 0;
//         const isCurrentlyExpanded = expandedTab === tab.id;

//         if (hasSubItems) {
//             if (isCurrentlyExpanded) {
//                 // User wants to CLOSE the dropdown
//                 setExpandedTab(null);
//                 // Keep the parent tab active, but no sub-item selected
//                 // Option A: Clear ctab (show parent overview)
//                 setSearchParams({ tab: tab.id });
//                 // Option B: Keep showing last sub-item (uncomment below)
//                 // Keep current ctab as is, no URL change needed
//             } else {
//                 // User wants to OPEN this dropdown
//                 // First close any other open dropdown
//                 setExpandedTab(tab.id);
//                 const firstSub = tab.subItems[0];
//                 setSearchParams({ tab: tab.id, ctab: firstSub.id });
//             }
//         } else {
//             // Tab without dropdown - close any open dropdown and switch
//             setExpandedTab(null);
//             setSearchParams({ tab: tab.id });
//         }
//     };

//     // ── Sub-item click (sidebar dropdown) ─────────────────────────────────────
//     const handleSubItemClick = (parentId, subId) => {
//         if (!allowedTabIds.includes(parentId)) return;
//         // Ensure dropdown stays open when clicking sub-items
//         setExpandedTab(parentId);
//         setSearchParams({ tab: parentId, ctab: subId });
//     };

//     // ── Switch tab from inside components ─────────────────────────────────────
//     const handleSwitchTab = (tabId) => {
//         const tab = allowedTabs.find((t) => t.id === tabId);
//         if (tab) handleTabClick(tab);
//     };

//     const activeTabConfig = allowedTabs.find((t) => t.id === activeTab);
//     const TabComponent = activeTabConfig?.component ?? null;

//     return (
//         <div className="flex min-h-screen bg-gray-50">

//             {/* ── Sidebar ──────────────────────────────────────────────────────── */}
//             <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen z-20">

//                 {/* Logo / Brand Container */}
//                 <div className="p-6 flex flex-col items-center border-b border-gray-50 bg-white">
//                     <div className="relative group flex items-center justify-center w-24 h-24 mb-4">
//                         <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md" />
//                         <img
//                             src={LOGO}
//                             alt="Brand Logo"
//                             className="relative z-10 w-40 h-40 object-contain"
//                         />
//                     </div>
//                     <div className="text-center">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-widest uppercase">
//                             {ROLE_LABELS[activeRole] || activeRole}
//                         </span>
//                     </div>
//                 </div>

//                 {/* Navigation */}
//                 <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
//                     {allowedTabs.map((tab) => {
//                         const isActive = activeTab === tab.id;
//                         const hasSubItems = tab.subItems?.length > 0;
//                         const isExpanded = expandedTab === tab.id;

//                         return (
//                             <div key={tab.id}>
//                                 <button
//                                     onClick={() => handleTabClick(tab)}
//                                     className={`w-full flex items-center cursor-pointer justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 shadow-sm"
//                                         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//                                         }`}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg
//                                             className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
//                                             fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
//                                         </svg>
//                                         <span>{tab.label}</span>
//                                     </div>

//                                     {hasSubItems && (
//                                         <svg
//                                             className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-500" : "text-gray-400"
//                                                 }`}
//                                             fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                         </svg>
//                                     )}
//                                 </button>

//                                 {hasSubItems && isExpanded && (
//                                     <div className="mt-1 ml-4 pl-4 border-l-2 border-blue-100 space-y-0.5">
//                                         {tab.subItems.map((sub) => {
//                                             const isSubActive = isActive && activeCtab === sub.id;
//                                             return (
//                                                 <button
//                                                     key={sub.id}
//                                                     onClick={() => handleSubItemClick(tab.id, sub.id)}
//                                                     className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer text-left ${isSubActive
//                                                         ? "bg-blue-50 text-blue-700"
//                                                         : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
//                                                         }`}
//                                                 >
//                                                     <svg
//                                                         className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-blue-600" : "text-gray-400"}`}
//                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                                     >
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sub.icon} />
//                                                     </svg>
//                                                     {sub.label}
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </nav>

//                 <div className="p-4 border-t border-gray-100">
//                     <p className="text-[10px] text-gray-400 uppercase mb-2 tracking-widest font-bold">
//                         Vyapar v1.0.0
//                     </p>
//                 </div>
//             </aside>

//             {/* ── Main Content ──────────────────────────────────────────────────── */}
//             <main className="flex-1 overflow-y-auto">
//                 <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
//                     <h2 className="text-lg font-semibold text-gray-800 capitalize">
//                         {activeTabConfig?.label || "Dashboard"}
//                     </h2>
//                 </header>

//                 <div className="p-8">
//                     <Suspense fallback={
//                         <div className="flex items-center justify-center h-64">
//                             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     }>
//                         {TabComponent ? (
//                             <TabComponent onSwitchTab={handleSwitchTab} />
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//                                 <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                                         d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                                 </svg>
//                                 <p className="text-sm font-medium">This section is coming soon</p>
//                             </div>
//                         )}
//                     </Suspense>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default SideBarDashboard;

// // src/Components/SideBarDashboard/SideBarDashboard.jsx
// import React, { useState, useEffect, Suspense } from "react";
// import { useSearchParams } from "react-router-dom";
// import { TAB_REGISTRY } from "../TabRegistry";
// import { ROLE_PERMISSIONS, ROLE_LABELS, ROLES } from "../roles";
// // import LOGO from "../assets/logo.png";

// // ── HARDCODED ROLE (change this to test different permissions) ───────────────
// const HARDCODED_ROLE = ROLES.OWNER;

// const LOGO = "https://www.thebigfeathers.com/static/media/logo.de8b004c787675511bd3.png"
// // ─────────────────────────────────────────────────────────────────────────────

// const SideBarDashboard = () => {
//     const [searchParams, setSearchParams] = useSearchParams();

//     // ── Role & permissions ────────────────────────────────────────────────────
//     const activeRole = HARDCODED_ROLE;
//     const allowedTabIds = ROLE_PERMISSIONS[activeRole] || [];
//     const allowedTabs = TAB_REGISTRY.filter((tab) => allowedTabIds.includes(tab.id));
//     const defaultTab = allowedTabs[0]?.id || "dashboard";

//     // ── Derive activeTab synchronously from URL + permissions ─────────────────
//     const tabFromUrl = searchParams.get("tab");
//     const activeTab = tabFromUrl && allowedTabIds.includes(tabFromUrl)
//         ? tabFromUrl
//         : defaultTab;

//     const activeCtab = searchParams.get("ctab") || null;

//     // ── Dropdown state — auto-expand parent of currently active tab ───────────
//     const [expandedTab, setExpandedTab] = useState(() => {
//         const urlTab = new URLSearchParams(window.location.search).get("tab");
//         const entry = allowedTabs.find((t) => t.id === urlTab && t.subItems?.length);
//         return entry ? entry.id : null;
//     });

//     // ── Keep URL honest ───────────────────────────────────────────────────────
//     useEffect(() => {
//         const urlTab = searchParams.get("tab");
//         const urlIsWrong = !urlTab || !allowedTabIds.includes(urlTab);

//         if (urlIsWrong) {
//             setSearchParams({ tab: defaultTab }, { replace: true });
//         }
//     }, [activeRole, searchParams, setSearchParams, defaultTab, allowedTabIds]);

//     // ── Auto-expand parent when activeTab changes ─────────────────────────────
//     useEffect(() => {
//         const entry = allowedTabs.find((t) => t.id === activeTab && t.subItems?.length);
//         if (entry) {
//             setExpandedTab((prev) => (prev === entry.id ? prev : entry.id));
//         }
//     }, [activeTab, allowedTabs]);

//     // ── Parent tab click ──────────────────────────────────────────────────────
//     const handleTabClick = (tab) => {
//         if (!allowedTabIds.includes(tab.id)) return;

//         if (tab.subItems?.length) {
//             if (expandedTab === tab.id) {
//                 setExpandedTab(null);
//             } else {
//                 setExpandedTab(tab.id);
//                 const firstSub = tab.subItems[0];
//                 setSearchParams({ tab: tab.id, ctab: firstSub.id });
//             }
//         } else {
//             setExpandedTab(null);
//             setSearchParams({ tab: tab.id });
//         }
//     };

//     // ── Sub-item click (sidebar dropdown) ─────────────────────────────────────
//     const handleSubItemClick = (parentId, subId) => {
//         if (!allowedTabIds.includes(parentId)) return;
//         setSearchParams({ tab: parentId, ctab: subId });
//     };

//     // ── Switch tab from inside components ─────────────────────────────────────
//     const handleSwitchTab = (tabId) => {
//         const tab = allowedTabs.find((t) => t.id === tabId);
//         if (tab) handleTabClick(tab);
//     };

//     const activeTabConfig = allowedTabs.find((t) => t.id === activeTab);
//     const TabComponent = activeTabConfig?.component ?? null;

//     return (
//         <div className="flex min-h-screen bg-gray-50">

//             {/* ── Sidebar ──────────────────────────────────────────────────────── */}
//             <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen z-20">

//                 {/* Logo / Brand Container */}
//                 <div className="p-6 flex flex-col items-center border-b border-gray-50 bg-white">
//                     {/* Logo Wrapper */}
//                     <div className="relative group flex items-center justify-center w-24 h-24 mb-4">
//                         {/* Decorative background element for depth */}
//                         <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md" />

//                         {/* Actual Logo */}
//                         <img
//                             src={LOGO}
//                             alt="Brand Logo"
//                             className="relative z-10 w-40 h-40 object-contain"
//                         />
//                     </div>

//                     {/* Identity Section */}
//                     <div className="text-center">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-widest uppercase">
//                             {ROLE_LABELS[activeRole] || activeRole}
//                         </span>
//                     </div>
//                 </div>

//                 {/* Navigation */}
//                 <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
//                     {allowedTabs.map((tab) => {
//                         const isActive = activeTab === tab.id;
//                         const hasSubItems = tab.subItems?.length > 0;
//                         const isExpanded = expandedTab === tab.id;

//                         return (
//                             <div key={tab.id}>
//                                 {/* Parent button */}
//                                 <button
//                                     onClick={() => handleTabClick(tab)}
//                                     className={`w-full flex items-center cursor-pointer justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
//                                         ? "bg-blue-50 text-blue-600 shadow-sm"
//                                         : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//                                         }`}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg
//                                             className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
//                                             fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
//                                         </svg>
//                                         <span>{tab.label}</span>
//                                     </div>

//                                     {/* Chevron for dropdown tabs */}
//                                     {hasSubItems && (
//                                         <svg
//                                             className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-500" : "text-gray-400"
//                                                 }`}
//                                             fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                         </svg>
//                                     )}
//                                 </button>

//                                 {/* Dropdown sub-items */}
//                                 {hasSubItems && isExpanded && (
//                                     <div className="mt-1 ml-4 pl-4 border-l-2 border-blue-100 space-y-0.5">
//                                         {tab.subItems.map((sub) => {
//                                             const isSubActive = isActive && activeCtab === sub.id;
//                                             return (
//                                                 <button
//                                                     key={sub.id}
//                                                     onClick={() => handleSubItemClick(tab.id, sub.id)}
//                                                     className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer text-left ${isSubActive
//                                                         ? "bg-blue-50 text-blue-700"
//                                                         : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
//                                                         }`}
//                                                 >
//                                                     <svg
//                                                         className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-blue-600" : "text-gray-400"}`}
//                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
//                                                     >
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sub.icon} />
//                                                     </svg>
//                                                     {sub.label}
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </div>
//                         );
//                     })}
//                 </nav>

//                 {/* Footer */}
//                 <div className="p-4 border-t border-gray-100">
//                     <p className="text-[10px] text-gray-400 uppercase mb-2 tracking-widest font-bold">
//                         Vyapar v1.0.0
//                     </p>
//                 </div>
//             </aside>

//             {/* ── Main Content ──────────────────────────────────────────────────── */}
//             <main className="flex-1 overflow-y-auto">
//                 <header className="bg-white h-16 border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
//                     <h2 className="text-lg font-semibold text-gray-800 capitalize">
//                         {activeTabConfig?.label || "Dashboard"}
//                     </h2>
//                 </header>

//                 <div className="p-8">
//                     <Suspense fallback={
//                         <div className="flex items-center justify-center h-64">
//                             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     }>
//                         {TabComponent ? (
//                             <TabComponent onSwitchTab={handleSwitchTab} />
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-64 text-gray-400">
//                                 <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                                         d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
//                                 </svg>
//                                 <p className="text-sm font-medium">This section is coming soon</p>
//                             </div>
//                         )}
//                     </Suspense>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default SideBarDashboard;