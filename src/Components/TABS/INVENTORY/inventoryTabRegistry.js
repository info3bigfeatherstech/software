// TABS/INVENTORY/inventoryTabRegistry.js
import { lazy } from "react";
const InventoryStockTab = lazy(() => import("./../WAREHOUSES/INVENTORY_STOCK/InventoryStockTab"));
const ShopStockTab = lazy(() => import("./ShopStockTab/ShopStockTab"));
const InventoryTab = lazy(() => import("./InventoryTab"));



export const INVENTORY_TAB_REGISTRY = [

    {
        id: "products",
        label: "Products",
        icon: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
        component: InventoryTab,
    },
    {
        id: "shopstock",
        label: "Shop Stock",
        icon: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
        component: ShopStockTab,
    },
    {
        id: "inventorystock",
        label: "Inventory Stock",
        icon: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
        component: InventoryStockTab,
    },

];
