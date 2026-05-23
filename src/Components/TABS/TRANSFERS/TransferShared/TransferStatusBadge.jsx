// TABS/TRANSFERS/TransferShared/TransferStatusBadge.jsx
//
// Reusable status badge component

import React from "react";

const STATUS_CONFIG = {
    completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: "✅" },
    dispatched: { label: "Dispatched", color: "bg-blue-100 text-blue-700", icon: "🚚" },
    pending_approval: { label: "Pending Approval", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
    approved: { label: "Approved", color: "bg-indigo-100 text-indigo-700", icon: "✓" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-600", icon: "✗" },
    in_transit: { label: "In Transit", color: "bg-purple-100 text-purple-700", icon: "🚛" },
    received: { label: "Received", color: "bg-emerald-100 text-emerald-700", icon: "📦" },
};

export default function TransferStatusBadge({ status, showIcon = true }) {
    const config = STATUS_CONFIG[status] || {
        label: status?.replace(/_/g, " ") || "Unknown",
        color: "bg-gray-100 text-gray-600",
        icon: "📋",
    };
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {showIcon && <span>{config.icon}</span>}
            {config.label}
        </span>
    );
}