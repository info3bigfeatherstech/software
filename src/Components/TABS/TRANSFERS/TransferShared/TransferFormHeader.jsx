// TABS/TRANSFERS/TransferShared/TransferFormHeader.jsx
//
// Reusable form header for From/To location selects

import React from "react";

export default function TransferFormHeader({
    fromLabel = "From",
    toLabel = "To",
    fromValue,
    toValue,
    onFromChange,
    onToChange,
    fromOptions = [],
    toOptions = [],
    fromDisabled = false,
    toDisabled = false,
    fromPlaceholder = "Select source",
    toPlaceholder = "Select destination",
    showReason = true,
    reasonValue = "",
    onReasonChange,
    reasonPlaceholder = "e.g., Stock replenishment",
    showRemarks = false,
    remarksValue = "",
    onRemarksChange,
    remarksPlaceholder = "Additional notes",
    errors = {},
}) {
    
    return (
        <div className="grid grid-cols-2 gap-4">
            {/* From Location */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    {fromLabel} <span className="text-red-500">*</span>
                </label>
                <select
                    value={fromValue}
                    onChange={(e) => onFromChange(e.target.value)}
                    disabled={fromDisabled}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.from ? "border-red-400" : "border-gray-300"
                    } ${fromDisabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                >
                    <option value="">— {fromPlaceholder} —</option>
                    {fromOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name} {opt.city ? `— ${opt.city}` : ""}
                        </option>
                    ))}
                </select>
                {errors.from && <p className="text-xs text-red-500 mt-1">{errors.from}</p>}
            </div>
            
            {/* To Location */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    {toLabel} <span className="text-red-500">*</span>
                </label>
                <select
                    value={toValue}
                    onChange={(e) => onToChange(e.target.value)}
                    disabled={toDisabled}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.to ? "border-red-400" : "border-gray-300"
                    } ${toDisabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
                >
                    <option value="">— {toPlaceholder} —</option>
                    {toOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>
                            {opt.name} {opt.city ? `— ${opt.city}` : ""}
                        </option>
                    ))}
                </select>
                {errors.to && <p className="text-xs text-red-500 mt-1">{errors.to}</p>}
            </div>
            
            {/* Reason */}
            {showReason && (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={reasonValue}
                        onChange={(e) => onReasonChange(e.target.value)}
                        placeholder={reasonPlaceholder}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.reason ? "border-red-400" : "border-gray-300"
                        }`}
                    />
                    {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                </div>
            )}
            
            {/* Remarks */}
            {showRemarks && (
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                    <textarea
                        value={remarksValue}
                        onChange={(e) => onRemarksChange(e.target.value)}
                        rows={2}
                        placeholder={remarksPlaceholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            )}
        </div>
    );
}