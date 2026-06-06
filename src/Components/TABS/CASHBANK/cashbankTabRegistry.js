// TABS/CASHBANK/cashbankTabRegistry.js
//
// Role-based sub-tabs: shop roles see collections/receivables; WH roles see payables/payments.
// Permissions in roles.js → cashbank.internal.<tab-id>

import { lazy } from "react";

const CollectionsTab = lazy(() => import("./CollectionsTab/CollectionsTab"));
const CustomerDueTab = lazy(() => import("./CustomerDueTab/CustomerDueTab"));
const CashInHandTab = lazy(() => import("./CashInHandTab/CashInHandTab"));
const ShopBankStatementTab = lazy(() => import("./BankStatementTab/ShopBankStatementTab"));
const ChequesReceivedTab = lazy(() => import("./ChequesTab/ChequesReceivedTab"));

const VendorPayablesTab = lazy(() => import("./VendorPayablesTab/VendorPayablesTab"));
const VendorPaymentsTab = lazy(() => import("./VendorPaymentsTab/VendorPaymentsTab"));
const WarehouseBankStatementTab = lazy(() => import("./BankStatementTab/WarehouseBankStatementTab"));
const ChequesIssuedTab = lazy(() => import("./ChequesTab/ChequesIssuedTab"));
const PettyCashTab = lazy(() => import("./PettyCashTab/PettyCashTab"));

const LoanAccountTab = lazy(() => import("./LoanAccountTab/LoanAccountTab"));

export const CASHBANK_TAB_REGISTRY = [
    // ── Shop level (money in) ──
    {
        id: "collections",
        label: "Collections",
        scope: "shop",
        icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
        component: CollectionsTab,
    },
    {
        id: "customer-due",
        label: "Customer Due",
        scope: "shop",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        component: CustomerDueTab,
    },
    {
        id: "cash-in-hand",
        label: "Cash In Hand",
        scope: "shop",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        component: CashInHandTab,
    },
    {
        id: "bank-statement-shop",
        label: "Bank (Shop)",
        scope: "shop",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        component: ShopBankStatementTab,
    },
    {
        id: "cheques-received",
        label: "Cheques Received",
        scope: "shop",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: ChequesReceivedTab,
    },

    // ── Warehouse level (money out) ──
    {
        id: "vendor-payables",
        label: "Vendor Payables",
        scope: "warehouse",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: VendorPayablesTab,
    },
    {
        id: "vendor-payments",
        label: "Vendor Payments",
        scope: "warehouse",
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        component: VendorPaymentsTab,
    },
    {
        id: "bank-statement-wh",
        label: "Bank (Warehouse)",
        scope: "warehouse",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        component: WarehouseBankStatementTab,
    },
    {
        id: "cheques-issued",
        label: "Cheques Issued",
        scope: "warehouse",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: ChequesIssuedTab,
    },
    {
        id: "petty-cash",
        label: "Petty Cash",
        scope: "warehouse",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        component: PettyCashTab,
    },

    // ── Organisation level ──
    {
        id: "loan-account",
        label: "Loans",
        scope: "org",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: LoanAccountTab,
    },
];
