// TABS/WAREHOUSES/warehousesTabRegistry.js
import { lazy } from "react";
const WarehouseOverviewTab = lazy(() => import("./WarehouseOverviewTab"));
// const WarehouseReceiveTab = lazy(() => import("./WarehouseReceiveTab"));
const InwardTab = lazy(() => import("./INWARDS/InwardTab"));
const InventoryStockTab = lazy(() => import("./INVENTORY_STOCK/InventoryStockTab"));
const PurchaseTab = lazy(() => import("./PURCHASE/PurchaseTab"));


export const WAREHOUSES_TAB_REGISTRY = [
    {
        id: "overview",
        label: "Overview",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: WarehouseOverviewTab,
    },
   
    // {
    //     id: "receive",
    //     label: "Receive Goods",
    //     icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    //     component: WarehouseReceiveTab,
    // },
    {
        id: "inward",
        label: "Inward",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        component: InwardTab,
    },
    {
        id: "inventory",
        label: "Inventory Stock",
        icon: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
        component: InventoryStockTab,
    },
    {
        id: "purchase",
        label: "Purchase Summary",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 3v5h5M16 13H8M16 17H8M10 9H8",
        component: PurchaseTab,
    },
];
