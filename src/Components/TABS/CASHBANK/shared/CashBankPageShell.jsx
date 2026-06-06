import React from "react";
import { RefreshCw } from "lucide-react";

export default function CashBankPageShell({
    title,
    subtitle,
    onRefresh,
    isRefreshing,
    actions,
    children,
}) {
    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> Refresh
                        </button>
                    )}
                    {actions}
                </div>
            </div>
            {children}
        </div>
    );
}

export function StatCard({ label, value, hint, tone = "gray" }) {
    const tones = {
        gray: "border-gray-100",
        blue: "border-blue-100",
        green: "border-green-100",
        red: "border-red-100",
        purple: "border-purple-100",
        amber: "border-amber-100",
    };
    return (
        <div className={`bg-white rounded-xl border ${tones[tone] || tones.gray} p-4`}>
            <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

export function EmptyState({ message, detail }) {
    return (
        <div className="px-4 py-12 text-center">
            <p className="text-sm text-gray-500">{message}</p>
            {detail && <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">{detail}</p>}
        </div>
    );
}

export function PhaseNotice({ children }) {
    return (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            <p className="text-xs text-amber-700">{children}</p>
        </div>
    );
}
