// TABS/PARTIES/partiesTabRegistry.js
// Add new sales sub-tabs here only — nothing else in the codebase needs to change.
import { lazy } from "react";

const PartyDetailsTab = lazy(() => import("./PartyDetailsTab/PartyDetailsTab"));
const LoyaltyPointsTab = lazy(() => import("./LoyaltyPointsTab/LoyaltyPointsTab"));

export const PARTIES_TAB_REGISTRY = [
    {
        id: "partyDetails",
        label: "Party Details",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: PartyDetailsTab,
    },
    {
        id: "loyaltyPoints",
        label: "Loyalty Points",
        icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
        component: LoyaltyPointsTab,
    },
    
];
