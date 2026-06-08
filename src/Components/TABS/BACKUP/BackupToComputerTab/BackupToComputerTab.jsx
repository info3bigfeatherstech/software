// TABS/BACKUP/BackupToComputerTab/BackupToComputerTab.jsx

import React, { useState } from "react";
import { HardDrive, Download } from "lucide-react";

const RECENT_DOWNLOADS = [
    { file: "backup_2026-05-26.zip", size: "48.2 MB", includes: "Data + Images", by: "Admin", date: "26 May 2026" },
    { file: "backup_2026-05-10.zip", size: "24.1 MB", includes: "Data only", by: "Admin", date: "10 May 2026" },
    { file: "backup_2026-04-28.zip", size: "47.8 MB", includes: "Data + Images", by: "Super Admin", date: "28 Apr 2026" },
];

export default function BackupToComputerTab() {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [includeImages, setIncludeImages] = useState(true);
    const [includeReports, setIncludeReports] = useState(false);

    const estimatedSize = includeImages ? "48.2" : "24.5";

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <HardDrive size={20} className="text-gray-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Backup To Computer</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Download a full backup of your data to your local machine</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-blue-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-blue-400">Database Size</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">24.5 MB</p>
                    <p className="text-xs text-gray-400 mt-1">current data size</p>
                </div>
                <div className="bg-white rounded-xl border border-green-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-green-500">Last Download</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">26 May 2026</p>
                    <p className="text-xs text-gray-400 mt-1">by Admin</p>
                </div>
                <div className="bg-white rounded-xl border border-purple-100 p-4">
                    <p className="text-xs uppercase tracking-wide font-medium text-purple-400">Total Downloads</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">8</p>
                    <p className="text-xs text-gray-400 mt-1">all time</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Backup Options</h3>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={includeImages} onChange={() => setIncludeImages(!includeImages)} className="rounded border-gray-300" />
                    Include product images
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-3">
                    <input type="checkbox" checked={includeReports} onChange={() => setIncludeReports(!includeReports)} className="rounded border-gray-300" />
                    Include generated reports (PDF)
                </label>
                <p className="text-xs text-gray-400 mt-3">Estimated backup size: ~{estimatedSize} MB</p>
                <button
                    type="button"
                    disabled={isBackingUp}
                    onClick={() => {
                        setIsBackingUp(true);
                        setTimeout(() => setIsBackingUp(false), 3000);
                    }}
                    className={`mt-4 w-full bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 ${isBackingUp ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    <Download size={16} />
                    {isBackingUp ? "Preparing backup..." : "Download Backup to Computer"}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["File Name", "Size", "Includes", "Downloaded By", "Date"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RECENT_DOWNLOADS.map((row) => (
                            <tr key={row.file} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.file}</td>
                                <td className="px-4 py-3 text-gray-600">{row.size}</td>
                                <td className="px-4 py-3 text-gray-600">{row.includes}</td>
                                <td className="px-4 py-3 text-gray-600">{row.by}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-700">
                    Keep your backup file in a safe location. Anyone with this file can restore your entire business data. Do not share it.
                </p>
            </div>
        </div>
    );
}
