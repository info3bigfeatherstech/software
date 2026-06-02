// TABS/UTILITIES/UtilitiesTabRegistry.js
// Add new sales sub-tabs here only — nothing else in the codebase needs to change.
import { lazy } from "react";

const ImportItemsTab = lazy(() => import("./ImportItemsTab/ImportItemsTab"));
const SetUpBillPerformaTab = lazy(() => import("./SetUpBillPerformaTab/SetUpBillPerformaTab"));
const PettyCashBookTab = lazy(() => import("./PettyCashBookTab/PettyCashBookTab"));

export const UTILITIES_TAB_REGISTRY = [
    {
        id: "importitems",
        label: "Import Items",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: ImportItemsTab,
    },
    {
        id: "setUpbillperforma",
        label: "Set Up Bill Performance",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: SetUpBillPerformaTab,
    },
    {
        id: "pettycashbook",
        label: "Petty Cash Book",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: PettyCashBookTab,
    },
    
];
