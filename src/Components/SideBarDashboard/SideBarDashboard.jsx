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
import AppLoading from "../shared/AppLoading";
import Notification from "../shared/notification/Notification";

const LOGO = "/bigfeathers-logo-cropped.png";

const SIDEBAR_NAV_FOCUS = "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/15 focus-visible:ring-offset-0";
const SIDEBAR_NAV = {
    active: `bg-white/[0.08] text-white font-medium border-l-[3px] border-white/30 pl-2 ${SIDEBAR_NAV_FOCUS}`,
    idle: `text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 border-l-[3px] border-transparent pl-2 ${SIDEBAR_NAV_FOCUS}`,
    subActive: `bg-white/[0.08] text-white font-medium ${SIDEBAR_NAV_FOCUS}`,
    subIdle: `text-slate-500 hover:bg-white/[0.05] hover:text-slate-200 ${SIDEBAR_NAV_FOCUS}`,
};

const SideBarDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

    const activeRole = user?.role || ROLES.SUPER_ADMIN;
    const locationId = user?.warehouse_id || user?.shop_id || "";
    const allowedTabIds = ROLE_PERMISSIONS[activeRole] || [];
    const allowedTabs = TAB_REGISTRY.filter((tab) => allowedTabIds.includes(tab.id));
    const defaultTab = allowedTabs[0]?.id || "dashboard";

    const tabFromUrl = searchParams.get("tab");
    const activeTab = tabFromUrl && allowedTabIds.includes(tabFromUrl)
        ? tabFromUrl
        : defaultTab;

    const activeCtab = searchParams.get("ctab") || null;

    const [expandedTab, setExpandedTab] = useState(() => {
        const initialTab = new URLSearchParams(window.location.search).get("tab");
        const entry = allowedTabs.find((t) => t.id === initialTab && t.subItems?.length);
        return entry ? entry.id : null;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const urlTab = searchParams.get("tab");
        const urlIsWrong = !urlTab || !allowedTabIds.includes(urlTab);

        if (urlIsWrong) {
            setSearchParams({ tab: defaultTab }, { replace: true });
        }
    }, [activeRole, locationId, searchParams, setSearchParams, defaultTab, allowedTabIds]);

    const handleTabClick = (tab) => {
        if (!allowedTabIds.includes(tab.id)) return;

        const hasSubItems = tab.subItems?.length > 0;
        const isCurrentlyExpanded = expandedTab === tab.id;

        if (hasSubItems) {
            if (isCurrentlyExpanded) {
                setExpandedTab(null);
                setSearchParams({ tab: tab.id });
            } else {
                setExpandedTab(tab.id);
                const firstSub = tab.subItems[0];
                setSearchParams({ tab: tab.id, ctab: firstSub.id });
            }
        } else {
            setExpandedTab(null);
            setSearchParams({ tab: tab.id });
        }

        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleSubItemClick = (parentId, subId) => {
        if (!allowedTabIds.includes(parentId)) return;
        setExpandedTab(parentId);
        setSearchParams({ tab: parentId, ctab: subId });

        if (window.innerWidth < 768) {
            setIsMobileMenuOpen(false);
        }
    };

    const handleSwitchTab = (tabId) => {
        const tab = allowedTabs.find((t) => t.id === tabId);
        if (tab) handleTabClick(tab);
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
    const activeSubItem = activeTabConfig?.subItems?.find((s) => s.id === activeCtab);
    const TabComponent = (activeCtab && activeSubItem?.component)
        ? activeSubItem.component
        : activeTabConfig?.component ?? null;

    const activeSubLabel = activeSubItem?.label;
    const headerTitle = activeSubLabel
        ? `${activeTabConfig?.label || "Dashboard"} / ${activeSubLabel}`
        : activeTabConfig?.label || "Dashboard";

    return (
        <div className="flex h-screen overflow-hidden bg-[#f0f2f5] relative">

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed md:relative top-0 h-full z-40
                    flex flex-col shrink-0 bg-[#0c1222] border-r border-slate-700
                    ${isSidebarCollapsed ? "w-[52px]" : "w-[180px]"}
                    ${isMobileMenuOpen ? "left-0" : "-left-full md:left-0"}
                `}
            >
                <div className={`relative shrink-0 border-b border-slate-700 ${isSidebarCollapsed ? "px-1 py-2" : "px-1.5 py-2.5"}`}>
                    <div
                        className={`flex items-center justify-center w-full overflow-hidden bg-[#0c1222] ${
                            isSidebarCollapsed ? "h-10" : "h-[72px]"
                        }`}
                    >
                        <img
                            src={LOGO}
                            alt="BigFeathers"
                            className={`block object-contain object-center ${
                                isSidebarCollapsed
                                    ? "h-full w-auto min-w-[145%]"
                                    : "w-full h-full"
                            }`}
                        />
                    </div>
                    {!isSidebarCollapsed && (
                        <div className="mt-2 text-center">
                            <span className="inline-block px-2 py-0.5 text-[10px] rounded text-slate-300 bg-white/[0.06] border border-white/10">
                                {ROLE_LABELS[activeRole] || activeRole}
                            </span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className="absolute -right-3 bottom-0 translate-y-1/2 rounded-full p-1 hidden md:block z-10 bg-slate-800 border border-slate-600 hover:bg-slate-700"
                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <svg
                            className={`w-3 h-3 text-slate-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 min-h-0 px-2 py-3 overflow-y-auto overflow-x-hidden">
                    <div className="flex flex-col gap-2">
                        {allowedTabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const hasSubItems = tab.subItems?.length > 0;
                            const isExpanded = expandedTab === tab.id;

                            return (
                                <div
                                    key={tab.id}
                                    className={`flex flex-col min-w-0 ${isExpanded && !isSidebarCollapsed ? "pb-1.5" : ""}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick(tab)}
                                        className={`
                                            w-full flex items-center gap-2 min-w-0 rounded text-sm leading-normal
                                            ${isSidebarCollapsed ? "justify-center px-2 py-3" : "px-2.5 py-2.5"}
                                            ${isActive ? SIDEBAR_NAV.active : SIDEBAR_NAV.idle}
                                        `}
                                        title={isSidebarCollapsed ? tab.label : ""}
                                    >
                                        <svg
                                            className="w-4 h-4 shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={tab.icon} />
                                        </svg>
                                        {!isSidebarCollapsed && (
                                            <>
                                                <span className="flex-1 min-w-0 text-left truncate leading-normal">
                                                    {tab.label}
                                                </span>
                                                {hasSubItems && (
                                                    <svg
                                                        className={`w-3 h-3 shrink-0 ml-0.5 ${isExpanded ? "rotate-180" : ""}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </>
                                        )}
                                    </button>

                                    {hasSubItems && isExpanded && !isSidebarCollapsed && (
                                        <div className="mt-1 ml-4 pl-2 border-l border-slate-700 flex flex-col gap-1 min-w-0">
                                            {filterSubItemsByRole(tab.id, tab.subItems).map((sub) => {
                                                const isSubActive = isActive && activeCtab === sub.id;
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        type="button"
                                                        onClick={() => handleSubItemClick(tab.id, sub.id)}
                                                        title={sub.label}
                                                        className={`
                                                            w-full min-w-0 flex items-center px-2 py-2 text-xs text-left rounded truncate leading-normal
                                                            ${isSubActive ? SIDEBAR_NAV.subActive : SIDEBAR_NAV.subIdle}
                                                        `}
                                                    >
                                                        <span className="truncate block w-full">{sub.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                <div className={`p-2 shrink-0 border-t border-slate-700 ${isSidebarCollapsed ? "text-center" : ""}`}>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLogoutLoading}
                        title="Logout"
                        className={`
                            w-full mb-2 text-sm rounded disabled:opacity-50
                            text-red-300 bg-slate-900 border border-red-900/60 hover:bg-red-950/40
                            ${isSidebarCollapsed ? "flex items-center justify-center px-2 py-2.5" : "px-3 py-1.5"}
                        `}
                    >
                        {isLogoutLoading ? (
                            <span>...</span>
                        ) : isSidebarCollapsed ? (
                            <svg
                                className="w-4 h-4 shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.8}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        ) : (
                            "Logout"
                        )}
                    </button>
                    {!isSidebarCollapsed && (
                        <p className="text-[10px] text-center text-slate-500">Vyapar v1.0.0</p>
                    )}
                </div>
            </aside>

            <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
                <header className="bg-white h-11 border-b border-gray-300 flex items-center justify-between px-4 shrink-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={toggleMobileMenu}
                            className="md:hidden p-1.5 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-sm font-semibold text-gray-800 truncate">{headerTitle}</h2>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                        {user?.name && <span className="hidden sm:inline">{user.name}</span>}
                        <Notification />
                    </div>
                </header>

                <div className="flex-1 min-h-0 p-4 overflow-y-auto overflow-x-hidden">
                    <Suspense fallback={<AppLoading />}>
                        {TabComponent ? (
                            <TabComponent onSwitchTab={handleSwitchTab} />
                        ) : (
                            <div className="bg-white border border-gray-300 rounded p-6 text-center text-gray-500">
                                <p className="text-sm">This section is coming soon.</p>
                            </div>
                        )}
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default SideBarDashboard;
