// TABS/TRANSFERS/transfersTabRegistry.js
// Add new transfer sub-tabs here only — nothing else needs to change.
import { lazy } from "react";

const WHToShopTab        = lazy(() => import("./WHToShopTab"));
const ShopToShopTab      = lazy(() => import("./ShopToShopTab"));
const WHToWHTab          = lazy(() => import("./WHToWHTab"));
const TransferHistoryTab = lazy(() => import("./TransferHistoryTab"));
const TransferRequestsTab = lazy(() => import("./TransferRequestsTab/TransferRequestsTab"));
const BulkTransferRequestsTab = lazy(() => import("./TransferRequestsTab/BulkTransferRequestsTab"));
const ReorderSuggestionsTab = lazy(() => import("./TransferRequestsTab/ReorderSuggestionsTab"));
const StockSearchTab = lazy(() => import("./TransferRequestsTab/StockSearchTab"));

export const TRANSFERS_TAB_REGISTRY = [
    {
        id: "stock-search",
        label: "🔍 Stock Search",
        icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        component: StockSearchTab,
    },
     {
        id: "transfer-requests",
        label: "📋 Transfer Requests",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: TransferRequestsTab,
    },
    {
        id: "bulk-requests",
        label: "📦 Bulk Requests",
        icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        component: BulkTransferRequestsTab,
    },
    {
        id: "reorder-suggestions",
        label: "📊 Reorder Suggestions",
        icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        component: ReorderSuggestionsTab,
    },
    // {
    //     id: "wh-to-shop",
    //     label: "WH → Shop",
    //     icon: "M19 14l-7 7m0 0l-7-7m7 7V3",
    //     component: WHToShopTab,
    // },
    // {
    //     id: "shop-to-shop",
    //     label: "Shop → Shop",
    //     icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    //     component: ShopToShopTab,
    // },
    // {
    //     id: "wh-to-wh",
    //     label: "WH → WH",
    //     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    //     component: WHToWHTab,
    // },
    {
        id: "history",
        label: "Transfer History",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: TransferHistoryTab,
    },
    // {
    //     id: "transferrequests",
    //     label: "Transfer Requests",
    //     icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    //     component: TransferRequestsTab,
    // },
];
