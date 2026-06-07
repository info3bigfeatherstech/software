// TABS/BACKUP/RestoreBackupTab/RestoreBackupTab.jsx

import React, { useState } from "react";
import { RotateCcw, Upload, AlertTriangle, FileText, X } from "lucide-react";

const RESTORE_HISTORY = [
    { id: "RST-002", file: "backup_2026-04-28.zip", by: "Super Admin", date: "28 Apr 2026", status: "Completed", statusClass: "bg-green-50 text-green-700 border border-green-200" },
    { id: "RST-001", file: "backup_2026-03-15.zip", by: "Super Admin", date: "15 Mar 2026", status: "Completed", statusClass: "bg-green-50 text-green-700 border border-green-200" },
];

export default function RestoreBackupTab() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [restoring, setRestoring] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div className="space-y-5 bg-gray-50 min-h-screen px-1 py-1">
            <div className="pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <RotateCcw size={20} className="text-gray-400" />
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Restore Backup</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Restore your data from a previous backup file</p>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex gap-3">
                <AlertTriangle className="text-red-500 flex-shrink-0" size={22} />
                <div>
                    <p className="text-sm font-semibold text-red-700">Warning: Restoring will overwrite ALL current data</p>
                    <p className="text-xs text-red-500 mt-1">
                        This action cannot be undone. All current sales, purchases, stock, and party data will be replaced with data from the backup file.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Select Backup File</h3>
                {!selectedFile ? (
                    <button
                        type="button"
                        onClick={() => setSelectedFile({ name: "backup_2026-05-28.zip", size: "24.5 MB" })}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center gap-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                        <Upload size={32} className="text-gray-300" />
                        <p className="text-sm text-gray-400">Drop your backup .zip file here</p>
                        <p className="text-xs text-gray-400">or click to browse</p>
                    </button>
                ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <FileText className="text-green-500" size={20} />
                            <div>
                                <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
                                <p className="text-xs text-green-500">{selectedFile.size}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => { setSelectedFile(null); setConfirmed(false); }} className="text-green-600 hover:text-green-800">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {selectedFile && (
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="mt-1 rounded border-gray-300" />
                        <span className="text-sm text-gray-600">I understand this will permanently overwrite all current data and cannot be undone</span>
                    </label>
                )}

                {selectedFile && confirmed && (
                    <button
                        type="button"
                        disabled={restoring}
                        onClick={() => {
                            setRestoring(true);
                            setTimeout(() => {
                                setRestoring(false);
                                setSelectedFile(null);
                                setConfirmed(false);
                            }, 3000);
                        }}
                        className={`w-full bg-red-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-red-700 transition-colors ${restoring ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                        {restoring ? "Restoring... Please wait" : "Restore Backup Now"}
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[720px] lg:min-w-0 text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["Restore ID", "File Used", "Restored By", "Date", "Status"].map((h) => (
                                <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {RESTORE_HISTORY.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.id}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.file}</td>
                                <td className="px-4 py-3 text-gray-600">{row.by}</td>
                                <td className="px-4 py-3 text-xs text-gray-400">{row.date}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.statusClass}`}>{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
