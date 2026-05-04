// src/Components/SideBarDashboard/SideBarDashboard.jsx
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { TAB_REGISTRY } from "../TabRegistry";
import { ROLE_PERMISSIONS, ROLE_LABELS, ROLES, CURRENT_USER, } from "../roles";

// ── HARDCODED ROLE (change this to test different permissions) ───────────────
// const HARDCODED_ROLE = ROLES.WH_MANAGER;
const HARDCODED_ROLE = CURRENT_USER.role;
const LOCATION_ID = CURRENT_USER.locationId;

const LOGO = "https://www.thebigfeathers.com/static/media/logo.de8b004c787675511bd3.png"
// ─────────────────────────────────────────────────────────────────────────────

const SideBarDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ── Role & permissions ────────────────────────────────────────────────────
    const activeRole = HARDCODED_ROLE;
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
    }, [activeRole, LOCATION_ID, searchParams, setSearchParams, defaultTab, allowedTabIds]);


    console.log("LOCATION_ID", LOCATION_ID, activeRole);
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
                    fixed md:sticky top-0 h-screen z-40 bg-white border-r border-gray-200 
                    flex flex-col transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed ? 'w-20' : 'w-64'}
                    ${isMobileMenuOpen ? 'left-0' : '-left-full md:left-0'}
                `}
            >
                {/* Logo / Brand Container */}
                <div className={`p-6 flex flex-col items-center border-b border-gray-50 bg-white transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
                    <div className="relative group flex items-center justify-center mb-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md" />
                        <img
                            src={LOGO}
                            alt="Brand Logo"
                            className={`relative z-10 object-contain transition-all duration-300 ${isSidebarCollapsed ? 'w-16 h-16' : 'w-40 h-40'}`}
                        />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="text-center transition-all duration-300">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 tracking-widest uppercase">
                                {ROLE_LABELS[activeRole] || activeRole + "-" + LOCATION_ID}
                            </span>
                        </div>
                    )}
                    {isSidebarCollapsed && (
                        <div className="text-center transition-all duration-300">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {ROLE_LABELS[activeRole]?.charAt(0) || activeRole?.charAt(0) + "-" + LOCATION_ID}
                            </span>
                        </div>
                    )}
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-all duration-200 hidden md:block"
                >
                    <svg
                        className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
                    {allowedTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const hasSubItems = tab.subItems?.length > 0;
                        const isExpanded = expandedTab === tab.id;

                        return (
                            <div key={tab.id}>
                                <button
                                    onClick={() => handleTabClick(tab)}
                                    className={`
                                        w-full flex items-center cursor-pointer rounded-lg transition-all duration-200
                                        ${isActive
                                            ? "bg-blue-50 text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }
                                        ${isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'}
                                    `}
                                    title={isSidebarCollapsed ? tab.label : ""}
                                >
                                    <div className={`flex items-center space-x-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                                        <svg
                                            className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                        </svg>
                                        {!isSidebarCollapsed && <span>{tab.label}</span>}
                                    </div>

                                    {hasSubItems && !isSidebarCollapsed && (
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${isActive ? "text-blue-500" : "text-gray-400"
                                                }`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>

                                {hasSubItems && isExpanded && !isSidebarCollapsed && (
                                    <div className="mt-1 ml-4 pl-4 border-l-2 border-blue-100 space-y-0.5">
                                        {tab.subItems.map((sub) => {
                                            const isSubActive = isActive && activeCtab === sub.id;
                                            return (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => handleSubItemClick(tab.id, sub.id)}
                                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer text-left ${isSubActive
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                                        }`}
                                                >
                                                    <svg
                                                        className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? "text-blue-600" : "text-gray-400"}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sub.icon} />
                                                    </svg>
                                                    {sub.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className={`p-4 border-t border-gray-100 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                    <p className={`text-[10px] text-gray-400 uppercase tracking-widest font-bold ${isSidebarCollapsed ? 'text-center' : 'mb-2'}`}>
                        {isSidebarCollapsed ? 'v1.0' : 'Vyapar v1.0.0'}
                    </p>
                </div>
            </aside>

            {/* ── Main Content ──────────────────────────────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <h2 className="text-lg font-semibold text-gray-800 capitalize">
                        {activeTabConfig?.label || "Dashboard"}
                    </h2>

                    {/* Placeholder for right side actions if needed */}
                    <div className="w-8 md:w-0"></div>
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