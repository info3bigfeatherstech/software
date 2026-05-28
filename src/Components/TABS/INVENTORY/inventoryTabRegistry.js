// inventoryTabRegistry.js

import { lazy } from "react";

const BarcodeGeneratorTab = lazy(() => import("./BarcodeGeneratorTab"));
const ProductDetailsTab = lazy(() => import("./ProductDetailsTab"));

export const INVENTORY_TAB_REGISTRY = [
    {
        id: "product-details",
        label: "Product Details",
        icon: "M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4",
        component: ProductDetailsTab,
    },
    {
        id: "barcode-generator",
        label: "Barcode Generator",
        icon: "M4 7v10M7 7v10M10 7v10M14 7v10M17 7v10M20 7v10",
        component: BarcodeGeneratorTab,
    },
];