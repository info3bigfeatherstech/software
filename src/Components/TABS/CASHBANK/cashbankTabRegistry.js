// TABS/CASHBANK/cashbankTabRegistry.js
import { lazy } from "react";

const BankStatementTab = lazy(() => import("./BankStatementTab/BankStatementTab"));
const CashInHandTab = lazy(() => import("./CashInHandTab/CashInHandTab"));
const ChequesTab = lazy(() => import("./ChequesTab/ChequesTab"));
const LoanAccountTab = lazy(() => import("./LoanAccountTab/LoanAccountTab"));

export const CASHBANK_TAB_REGISTRY = [
    {
        id: "bank-statement",
        label: "Bank Statement",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        component: BankStatementTab,
    },
    {
        id: "cash-in-hand",
        label: "Cash In Hand",
        icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        component: CashInHandTab,
    },
    {
        id: "cheques",
        label: "Cheques",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        component: ChequesTab,
    },
    {
        id: "loan-account",
        label: "Loan Account",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        component: LoanAccountTab,
    },
];
