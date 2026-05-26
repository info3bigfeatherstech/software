// src/Components/TabRegistry.js
//
// Central registry for ALL top-level sidebar tabs.
// To add a new top-level tab: add one entry here + add its id to roles.js.
// Nothing else needs to change.

import { lazy } from "react";
import ArchiveTab from "./TABS/INVENTORY/ArchiveTab/ArchiveTab";

const ContentDashboardTab = lazy(() => import("./ContentDashboard/ContentDashboardTab"));
const SalesDashboard = lazy(() => import("./TABS/SALES/SalesDashboard"));
const PurchaseTab = lazy(() => import("./TABS/PURCHASE/PurchaseTab"));
const InventoryDashboard = lazy(() => import("./TABS/INVENTORY/InventoryDashboard"));
const PartiesTab = lazy(() => import("./TABS/PARTIES/PartiesTab"));
const ReportsTab = lazy(() => import("./TABS/REPORTS/ReportsTab"));
const TransfersDashboard = lazy(() => import("./TABS/TRANSFERS/TransfersDashboard"));
const TransferRequestsTab = lazy(() => import("./TABS/TRANSFERS/TransferRequestsTab/TransferRequestsTab"));
const WarehousesDashboard = lazy(() => import("./TABS/WAREHOUSES/WarehousesDashboard"));
const SettingsDashboard = lazy(() => import("./TABS/SETTINGS/SettingsDashboard"));
const VendorsTab = lazy(() => import("./TABS/VENDOR/VendorsTab"));

export const TAB_REGISTRY = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        component: ContentDashboardTab,
    },
    {
        id: "sales",
        label: "Sales",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        component: SalesDashboard,
        subItems: [
            { id: "billing", label: "Billing Counter", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { id: "invoices", label: "Invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { id: "customers", label: "Customers", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm7-3a3 3 0 010 6M21 21v-2a4 4 0 00-3-3.87" },
            { id: "wholesale", label: "Wholesale", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" },
            { id: "returns", label: "Returns", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
            { id: "credit-notes", label: "Credit Notes", icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" },
        ],
    },
    {
        id: "purchase",
        label: "Purchase",
        icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
        component: PurchaseTab,
    },
    {
        id: "inventory",
        label: "Inventory",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10",
        component: InventoryDashboard,
    },
    {
        id: "archive",
        label: "Archive",
        icon: "M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8M23 3H1v5h22zM10 12h4",
        component: ArchiveTab,
    },
    {
        id: "transfers",
        label: "Transfers",
        icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        component: TransfersDashboard,
        subItems: [
            {
              id: "transfer-requests",
              label: "Transfer Requests",
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      
          },
    {
        id: "bulk-requests",
        label: "Bulk Requests",
        icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    },
            // { id: "transferrequests", label: "Transfer Requests", icon: "M17 11l4-4m0 0l-4-4m4 4H3m4 6l-4 4m0 0l4 4m-4-4h18", component: TransferRequestsTab }
        ],
    },
    {
        id: "warehouses",
        label: "Warehouses",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: WarehousesDashboard,
        subItems: [
            { id: "overview", label: "Overview", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
            // { id: "stock", label: "Stock View", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" },
            { id: "receive", label: "Receive Goods", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
        ],
    },
    {
        id: "parties",
        label: "Parties",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: PartiesTab,
    },
    {
        id: "reports",
        label: "Reports",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        component: ReportsTab,
    },
    {
        id: "vendors",
        label: "Vendors",
        icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
        component: VendorsTab,
    },
    {
        id: "settings",
        label: "Settings",
        icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
        component: SettingsDashboard,
        subItems: [
            { id: "users", label: "Users & Roles", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
            { id: "shops", label: "Shops", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
            { id: "vendors", label: "Vendors", icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" },
        ],
    },
];