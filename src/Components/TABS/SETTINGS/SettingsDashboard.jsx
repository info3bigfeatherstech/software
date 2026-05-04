// TABS/SETTINGS/SettingsDashboard.jsx
//
// Owns the horizontal tab bar for the Settings section.
// Add new sub-tabs in settingsTabRegistry.js only — nothing here changes.

import React, { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { SETTINGS_TAB_REGISTRY } from "./settingsTabRegistry";

const SettingsDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCtab = searchParams.get("ctab") || SETTINGS_TAB_REGISTRY[0]?.id;
    const activeConfig = SETTINGS_TAB_REGISTRY.find(t => t.id === activeCtab) || SETTINGS_TAB_REGISTRY[0];
    const SubComponent = activeConfig?.component ?? null;

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: "settings", ctab: tabId });
    };

    return (
        <div className="w-full">
            {/* ── Horizontal tab bar ─────────────────────────────────────────── */}
            <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
                {SETTINGS_TAB_REGISTRY.map((tab) => {
                    const isActive = activeCtab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-150 cursor-pointer -mb-px ${isActive
                                ? "border-blue-500 text-blue-600 bg-blue-50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <svg className={`w-4 h-4 ${isActive ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                            </svg>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Sub-tab content ─────────────────────────────────────────────── */}
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                {SubComponent
                    ? <SubComponent />
                    : <div className="text-gray-400 text-sm text-center py-20">Sub-tab not found</div>
                }
            </Suspense>
        </div>
    );
};

export default SettingsDashboard;
