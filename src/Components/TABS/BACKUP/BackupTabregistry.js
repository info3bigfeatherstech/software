// TABS/BACKUP/BackupTabregistry.js
// Add new sales sub-tabs here only — nothing else in the codebase needs to change.
import { lazy } from "react";

const AutoBackupTab = lazy(() => import("./AutoBackupTab/AutoBackupTab"));
const BackupToComputerTab = lazy(() => import("./BackupToComputerTab/BackupToComputerTab"));
const BackupToDriveTab = lazy(() => import("./BackupToDriveTab/BackupToDriveTab"));
const RestoreBackupTab = lazy(() => import("./RestoreBackupTab/RestoreBackupTab"));

export const BACKUP_TAB_REGISTRY = [
    {
        id: "autobackup",
        label: "Auto Backup",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: AutoBackupTab,
    },
    {
        id: "backuptocomputer",
        label: "Backup to Computer",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: BackupToComputerTab,
    },
    {
        id: "backuptodrive",
        label: "Backup to Drive",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: BackupToDriveTab,
    },
    {
        id: "restorebackup",
        label: "Restore Backup",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: RestoreBackupTab,
    },
    
];
