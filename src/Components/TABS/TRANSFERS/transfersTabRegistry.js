// TABS/TRANSFERS/transfersTabRegistry.js
// Add new transfer sub-tabs here only — nothing else needs to change.
import { lazy } from "react";

const WHToShopTab        = lazy(() => import("./WHToShopTab"));
const ShopToShopTab      = lazy(() => import("./ShopToShopTab"));
const WHToWHTab          = lazy(() => import("./WHToWHTab"));
const TransferHistoryTab = lazy(() => import("./TransferHistoryTab"));

export const TRANSFERS_TAB_REGISTRY = [
    {
        id: "wh-to-shop",
        label: "WH → Shop",
        icon: "M19 14l-7 7m0 0l-7-7m7 7V3",
        component: WHToShopTab,
    },
    {
        id: "shop-to-shop",
        label: "Shop → Shop",
        icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        component: ShopToShopTab,
    },
    {
        id: "wh-to-wh",
        label: "WH → WH",
        icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        component: WHToWHTab,
    },
    {
        id: "history",
        label: "Transfer History",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: TransferHistoryTab,
    },
];
