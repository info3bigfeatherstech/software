// TABS/BACKUP/BackupToDriveTab/BackupToDriveTab.jsx

import React, { useState } from "react";
import { Cloud, Link } from "lucide-react";

const SYNC_HISTORY = [
    { id: "SYN-018", file: "backup_2026-05-28.zip", size: "24.5 MB", status: "Uploaded", statusClass: "bg-green-50 text-green-700 border border-green-200", synced: "28 May 2026 02:05" },
    { id: "SYN-017", file: "backup_2026-05-27.zip", size: "24.1 MB", status: "Uploaded", statusClass: "bg-green-50 text-green-700 border border-green-200", synced: "27 May 2026 02:03" },
    { id: "SYN-016", file: "backup_2026-05-25.zip", size: "23.8 MB", status: "Failed", statusClass: "bg-red-50 text-red-600 border border-red-200", synced: "25 May 2026 02:00" },
];

function Toggle({ enabled, onToggle }) {
    return (
        <button type="button" role="switch" aria-checked={enabled} onClick={onToggle} className={`relative rounded-full w-10 h-6 transition-colors ${enabled ? "bg-gray-900" : "bg-gray-200"}`}>
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
    );
}

export default function BackupToDriveTab() {
    const [connected, setConnected] = useState(false);
    const [autoSync, setAutoSync] = useState(false);

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Cloud size={20} className="text-gray-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Backup To Drive</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Sync your backups automatically to Google Drive or cloud storage</p>
                    </div>
                    <Link size={16} className="text-gray-300 ml-auto hidden sm:block" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                {!connected ? (
                    <div className="flex flex-col items-center text-center py-6 gap-3">
                        <Cloud size={40} className="text-gray-300" />
                        <p className="text-base font-semibold text-gray-500">Not Connected</p>
                        <p className="text-sm text-gray-400">Connect your Google Drive to enable cloud backups</p>
                        <button type="button" onClick={() => setConnected(true)} className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2 mt-2">
                            Connect Google Drive
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-semibold text-green-700">Connected to Google Drive</span>
                            </div>
                            <button type="button" onClick={() => setConnected(false)} className="bg-white border border-red-200 text-red-500 text-sm px-4 py-2 rounded-lg hover:bg-red-50 inline-flex items-center gap-2 transition-colors">
                                Disconnect
                            </button>
                        </div>
                        <p className="text-sm text-gray-500">account@gmail.com · 2.4 GB used of 15 GB free</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Auto sync on every backup</span>
                            <Toggle enabled={autoSync} onToggle={() => setAutoSync(!autoSync)} />
                        </div>
                        <p className="text-xs text-gray-400">Last synced: 28 May 2026, 2:05 AM</p>
                        <button type="button" className="bg-white border border-green-200 text-green-600 text-sm px-4 py-2 rounded-lg hover:bg-green-50 inline-flex items-center gap-2 transition-colors">
                            Sync Now
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Sync ID", "File Name", "Size", "Status", "Synced At"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {SYNC_HISTORY.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.file}</td>
                                <td className="px-4 py-3 text-gray-600">{row.size}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.statusClass}`}>{row.status}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.synced}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-600">
                    Cloud backups are stored in a folder named &apos;OfferWaleBaba_Backups&apos; in your Google Drive. Storage used counts against your Google account quota.
                </p>
            </div>
        </div>
    );
}
