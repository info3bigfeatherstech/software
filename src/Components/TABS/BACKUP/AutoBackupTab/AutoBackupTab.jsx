// TABS/BACKUP/AutoBackupTab/AutoBackupTab.jsx

import React, { useState } from "react";
import { RefreshCw, Download, Trash2 } from "lucide-react";

const BACKUP_HISTORY = [
    { id: "BKP-042", type: "Auto", size: "24.5 MB", status: "Success", statusClass: "bg-green-50 text-green-700 border border-green-200", duration: "1m 12s", created: "28 May 2026 02:00", canDownload: true },
    { id: "BKP-041", type: "Auto", size: "24.1 MB", status: "Success", statusClass: "bg-green-50 text-green-700 border border-green-200", duration: "1m 08s", created: "27 May 2026 02:00", canDownload: true },
    { id: "BKP-040", type: "Auto", size: "23.8 MB", status: "Success", statusClass: "bg-green-50 text-green-700 border border-green-200", duration: "1m 05s", created: "26 May 2026 02:00", canDownload: true },
    { id: "BKP-039", type: "Auto", size: "23.8 MB", status: "Failed", statusClass: "bg-red-50 text-red-600 border border-red-200", duration: "—", created: "25 May 2026 02:00", canDownload: false },
    { id: "BKP-038", type: "Auto", size: "23.5 MB", status: "Success", statusClass: "bg-green-50 text-green-700 border border-green-200", duration: "58s", created: "24 May 2026 02:00", canDownload: true },
];

function Toggle({ enabled, onToggle }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            className={`relative rounded-full w-10 h-6 transition-colors ${enabled ? "bg-blue-600" : "bg-gray-200"}`}
        >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
    );
}

export default function AutoBackupTab() {
    const [enabled, setEnabled] = useState(true);
    const [frequency, setFrequency] = useState("daily");
    const [time, setTime] = useState("02:00");
    const [retention, setRetention] = useState("30");

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Auto Backup</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Automatically backup your data on a schedule</p>
                </div>
                <button type="button" className="bg-white border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 inline-flex items-center gap-1.5 transition-colors">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Last Backup</p>
                    <p className="text-base font-semibold text-green-600 mt-1">28 May 2026, 2:00 AM</p>
                    <p className="text-xs text-gray-400 mt-1">completed successfully</p>
                </div>
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Next Backup</p>
                    <p className="text-base font-semibold text-blue-700 mt-1">29 May 2026, 2:00 AM</p>
                    <p className="text-xs text-gray-400 mt-1">scheduled</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Total Backups</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">42</p>
                    <p className="text-xs text-gray-400 mt-1">stored backups</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Auto Backup Settings</h3>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Enable Auto Backup</span>
                    <Toggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
                </div>
                {enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Frequency</label>
                            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Time</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Retention</label>
                            <select value={retention} onChange={(e) => setRetention(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
                                <option value="7">7 days</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="365">1 year</option>
                            </select>
                        </div>
                    </div>
                )}
                <div className="flex justify-end pt-2">
                    <button type="button" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                        Save Settings
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Backup History</span>
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">5 records</span>
                </div>
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Backup ID", "Type", "Size", "Status", "Duration", "Created At", "Actions"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {BACKUP_HISTORY.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                                <td className="px-4 py-3 text-gray-600">{row.type}</td>
                                <td className="px-4 py-3 text-gray-600">{row.size}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.statusClass}`}>{row.status}</span>
                                </td>
                                <td className="px-4 py-3 text-gray-500">{row.duration}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.created}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                        {row.canDownload && (
                                            <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" aria-label="Download">
                                                <Download size={14} />
                                            </button>
                                        )}
                                        <button type="button" className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" aria-label="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-600">
                    Auto backups run silently in the background. Failed backups are retried once after 30 minutes. Backups older than the retention period are deleted automatically.
                </p>
            </div>
        </div>
    );
}
