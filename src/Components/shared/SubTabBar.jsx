import React, { Suspense } from "react";
import AppLoading from "./AppLoading";

export default function SubTabBar({ tabs, activeTabId, onTabClick, parentTabId, children }) {
  if (!tabs?.length) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-500">
        No sections available for your role.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* horizontal scroll only — no vertical scroll */}
      <div
        className="overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none border-b mb-4 md:overflow-x-auto"
        style={{
          scrollbarWidth: "thin",
          backgroundColor: "var(--color-app-sidebar)",
          borderColor: "var(--color-app-sidebar)"
        }}
      >
        {/* mobile: icons spread full width | md+: natural width + horizontal scroll */}
        <div className="flex items-stretch flex-nowrap w-full md:w-auto md:min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabClick(tab.id, parentTabId)}
                title={tab.label}
                className={`
                  flex items-center justify-center md:justify-start gap-1.5
                  flex-1 md:flex-none shrink-0 min-w-0
                  px-1 py-2.5 cursor-pointer transition-colors duration-150
                  sm:px-2 md:px-3 lg:px-4 md:gap-2
                  border-r border-white/10 last:border-r-0
                  ${isActive
                    ? "bg-[#17C4BB] text-white font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                  }
                `}
              >
                {tab.icon && (
                  <svg
                    className="w-5 h-5 md:w-4 md:h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                )}
                {/* Step 1: responsive text (md→xl) | Step 2: icon-only below md | Step 3: overflow-x scroll on parent */}
                <span className="hidden md:inline whitespace-nowrap text-[10px] lg:text-xs xl:text-sm leading-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<AppLoading />}>
        {children}
      </Suspense>
    </div>
  );
}
