// TABS/SALES/salesTabRegistry.js
// Add new sales sub-tabs here only — nothing else in the codebase needs to change.
import { lazy } from "react";

const BillingTab    = lazy(() => import("./BillingTab"));
const InvoicesTab   = lazy(() => import("./InvoicesTab"));
const CustomersTab  = lazy(() => import("./CustomersTab"));
const WholesaleTab  = lazy(() => import("./WholesaleTab"));
const ReturnsTab    = lazy(() => import("./ReturnsTab"));

export const SALES_TAB_REGISTRY = [
    {
        id: "billing",
        label: "Billing Counter",
        icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z",
        component: BillingTab,
    },
    {
        id: "invoices",
        label: "Invoices",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        component: InvoicesTab,
    },
    {
        id: "customers",
        label: "Customers",
        icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm7-3a3 3 0 010 6M21 21v-2a4 4 0 00-3-3.87",
        component: CustomersTab,
    },
    {
        id: "wholesale",
        label: "Wholesale",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10",
        component: WholesaleTab,
    },
    {
        id: "returns",
        label: "Returns / Credit Notes",
        icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
        component: ReturnsTab,
    },
];
