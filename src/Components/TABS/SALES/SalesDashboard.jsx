// TABS/SALES/SalesDashboard.jsx
//
// Owns the horizontal tab bar for the Sales section.
// Reads `ctab` from URL, renders the matching sub-tab component.
// Add new sub-tabs in salesTabRegistry.js only — nothing here changes.

import React, { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { SALES_TAB_REGISTRY } from "./salesTabRegistry";
import { filterInternalTabsByRole } from "../../../Components/roles";
import { useSelector } from "react-redux";

const SalesDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useSelector((state) => state.auth);
    
    // Filter tabs based on user role
    const filteredTabs = filterInternalTabsByRole("sales", SALES_TAB_REGISTRY);
    
    // If no tabs visible, show nothing
    if (filteredTabs.length === 0) {
        return (
            <div className="text-center py-20 text-gray-400 text-sm">
                No sales tabs available for your role.
            </div>
        );
    }

    const activeCtab = searchParams.get("ctab") || filteredTabs[0]?.id;
    const activeConfig = filteredTabs.find(t => t.id === activeCtab) || filteredTabs[0];
    const SubComponent = activeConfig?.component ?? null;

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: "sales", ctab: tabId });
    };

    return (
        <div className="w-full">
            {/* ── Horizontal tab bar ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
                {filteredTabs.map((tab) => {
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

            {/* ── Sub-tab content ──────────────────────────────────────────────── */}
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

export default SalesDashboard;
// down code is working but upper code handle roles plus visible tabs even internal tabs
// // TABS/SALES/SalesDashboard.jsx
// //
// // Owns the horizontal tab bar for the Sales section.
// // Reads `ctab` from URL, renders the matching sub-tab component.
// // Add new sub-tabs in salesTabRegistry.js only — nothing here changes.

// import React, { Suspense } from "react";
// import { useSearchParams } from "react-router-dom";
// import { SALES_TAB_REGISTRY } from "./salesTabRegistry";

// const SalesDashboard = () => {
//     const [searchParams, setSearchParams] = useSearchParams();

//     const activeCtab = searchParams.get("ctab") || SALES_TAB_REGISTRY[0]?.id;
//     const activeConfig = SALES_TAB_REGISTRY.find(t => t.id === activeCtab) || SALES_TAB_REGISTRY[0];
//     const SubComponent = activeConfig?.component ?? null;

//     const handleTabClick = (tabId) => {
//         setSearchParams({ tab: "sales", ctab: tabId });
//     };

//     return (
//         <div className="w-full">
//             {/* ── Horizontal tab bar ───────────────────────────────────────────── */}
//             <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
//                 {SALES_TAB_REGISTRY.map((tab) => {
//                     const isActive = activeCtab === tab.id;
//                     return (
//                         <button
//                             key={tab.id}
//                             onClick={() => handleTabClick(tab.id)}
//                             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-150 cursor-pointer -mb-px ${isActive
//                                 ? "border-blue-500 text-blue-600 bg-blue-50"
//                                 : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                                 }`}
//                         >
//                             <svg className={`w-4 h-4 ${isActive ? "text-blue-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
//                             </svg>
//                             {tab.label}
//                         </button>
//                     );
//                 })}
//             </div>

//             {/* ── Sub-tab content ──────────────────────────────────────────────── */}
//             <Suspense fallback={
//                 <div className="flex items-center justify-center h-64">
//                     <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                 </div>
//             }>
//                 {SubComponent
//                     ? <SubComponent />
//                     : <div className="text-gray-400 text-sm text-center py-20">Sub-tab not found</div>
//                 }
//             </Suspense>
//         </div>
//     );
// };

// export default SalesDashboard;