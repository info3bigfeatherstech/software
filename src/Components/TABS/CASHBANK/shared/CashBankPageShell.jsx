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
        <div className="app-page">
            <div className="app-page-header">
                <div>
                    <h2 className="app-page-title">{title}</h2>
                    {subtitle && <p className="app-page-subtitle">{subtitle}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={isRefreshing}
                            className="app-btn-secondary"
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
    const valueColors = {
        gray: "text-app-text",
        blue: "text-app-accent",
        green: "text-app-success",
        red: "text-app-danger",
        purple: "text-purple-700",
        amber: "text-app-warning",
    };
    return (
        <div className="app-stat-card">
            <p className="app-stat-label">{label}</p>
            <p className={`app-stat-value ${valueColors[tone] || valueColors.gray}`}>{value}</p>
            {hint && <p className="app-stat-hint">{hint}</p>}
        </div>
    );
}

export function EmptyState({ message, detail }) {
    return (
        <div className="app-card-body text-center py-12">
            <p className="text-sm text-app-text-muted">{message}</p>
            {detail && <p className="text-xs text-app-text-muted mt-2 max-w-md mx-auto">{detail}</p>}
        </div>
    );
}

export function PhaseNotice({ children }) {
    return (
        <div className="app-alert-warning text-xs">
            {children}
        </div>
    );
}
