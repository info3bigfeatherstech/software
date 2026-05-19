// TABS/WAREHOUSES/warehousesTabRegistry.js
import { lazy } from "react";

const WarehouseOverviewTab = lazy(() => import("./WarehouseOverviewTab"));
const WarehouseReceiveTab = lazy(() => import("./WarehouseReceiveTab"));
const InwardTab = lazy(() => import("./INWARDS/InwardTab"));
// const WarehouseTable  = lazy(() => import("./WarehouseShared/WarehouseTable"));

export const WAREHOUSES_TAB_REGISTRY = [
    {
        id: "overview",
        label: "Overview",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: WarehouseOverviewTab,
    },
    // {
    //     id: "stock",
    //     label: "Stock View",
    //     icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10",
    //     component: WarehouseStockTab,              dont touch we use in future 
    // },
    // {
    //     id: "receive",
    //     label: "Receive Goods",
    //     icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
    //     component: WarehouseTable,
    // },
    {
        id: "receive",
        label: "Receive Goods",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        component: WarehouseReceiveTab,
    },
    {
        id: "inward",
        label: "Inward",
        icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12",
        component: InwardTab,
    },
];
