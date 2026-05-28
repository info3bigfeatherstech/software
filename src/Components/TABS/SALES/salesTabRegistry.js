// TABS/SALES/salesTabRegistry.js
// Add new sales sub-tabs here only — nothing else in the codebase needs to change.
import { lazy } from "react";

const BillingTab    = lazy(() => import("./BillingTab"));
const InvoicesTab   = lazy(() => import("./InvoicesTab"));
const CustomersTab  = lazy(() => import("./CustomersTab"));
const CreditNotesTab = lazy(() => import("./CreditNotesTab"));

export const SALES_TAB_REGISTRY = [
    {
        id: "billing",
        label: "Billing Counter",
        icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z",
        component: BillingTab,
    },
    {
        id: "customers",
        label: "Customers",
        icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm7-3a3 3 0 010 6M21 21v-2a4 4 0 00-3-3.87",
        component: CustomersTab,
    },
    {
        id: "creditnote",
        label: "Returns / Credit Notes",
        icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
        component: CreditNotesTab,
    },
];
