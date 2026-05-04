// TABS/SETTINGS/settingsTabRegistry.js
import { lazy } from "react";

const UsersTab          = lazy(() => import("./UsersTab"));
const ShopsSettingsTab  = lazy(() => import("./ShopsSettingsTab"));
const VendorsTab        = lazy(() => import("./VendorsTab"));

export const SETTINGS_TAB_REGISTRY = [
    {
        id: "users",
        label: "Users & Roles",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: UsersTab,
    },
    {
        id: "shops",
        label: "Shops",
        icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
        component: ShopsSettingsTab,
    },
    {
        id: "vendors",
        label: "Vendors",
        icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
        component: VendorsTab,
    },
];
