// src/Components/roles.js

export const ROLES = {
    OWNER: "owner",
    ACCOUNTANT: "accountant",
    SALES_MANAGER: "sales_manager",
    INVENTORY_MANAGER: "inventory_manager",
    CASHIER: "cashier",
    WH_MANAGER: "wh_manager",
    SHOP_OWNER: "shop_owner",
};

// ─────────────────────────────────────────────────────────────────────────────
// 👇 JUST CHANGE THIS FOR TESTING DIFFERENT ROLES
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENT_USER = {
    role: ROLES.WH_MANAGER,   // OWNER | WH_MANAGER | SHOP_OWNER | CASHIER | etc.
    locationId: 'WH-002',     // WH_MANAGER → 'WH-001'/'WH-002'  |  Shop roles → 'SHP-001' etc.
};

// Role permissions for tabs (controls which tabs appear in sidebar)
export const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: ["dashboard", "sales", "purchase", "inventory", "transfers", "warehouses", "parties", "reports", "settings"],
    [ROLES.ACCOUNTANT]: ["dashboard", "sales", "purchase", "parties", "reports"],
    [ROLES.SALES_MANAGER]: ["dashboard", "sales", "parties", "transfers"],
    [ROLES.INVENTORY_MANAGER]: ["dashboard", "inventory", "transfers"],
    [ROLES.CASHIER]: ["dashboard", "sales"],
    [ROLES.WH_MANAGER]: ["dashboard", "warehouses", "transfers", "inventory", "purchase", "parties", "settings"],
    [ROLES.SHOP_OWNER]: ["dashboard", "sales", "purchase", "inventory", "transfers", "parties", "reports"],
};

export const ROLE_LABELS = {
    [ROLES.OWNER]: "Super Admin / Owner",
    [ROLES.ACCOUNTANT]: "Accountant",
    [ROLES.SALES_MANAGER]: "Sales Manager",
    [ROLES.INVENTORY_MANAGER]: "Inventory Manager",
    [ROLES.CASHIER]: "Cashier / Billing Staff",
    [ROLES.WH_MANAGER]: "Warehouse Manager",
    [ROLES.SHOP_OWNER]: "Shop Owner",
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA FILTERING — Single source of truth for ALL tabs
//
//  Rule:
//    OWNER      → sees ALL data, no filter ever applied
//    WH_MANAGER → item.locationId === CURRENT_USER.locationId  (WH-001 / WH-002)
//    Shop roles → item.shopId    === CURRENT_USER.locationId  (SHP-001 / SHP-002)
//
//  Usage in any tab:
//    filterByLocation(products)               → scoped products
//    filterByLocation(bills, 'shopId')        → scoped bills
//    filterByLocation(purchases, 'shopId')    → scoped purchases
//    filterByLocation(transfers,'fromShopId') → scoped transfers
//    filterLocationList(allShops)             → only their location in selector
// ─────────────────────────────────────────────────────────────────────────────

/** True if the logged-in user is super admin (sees ALL data, no scoping) */
export const isAdmin = () => CURRENT_USER.role === ROLES.OWNER;

/** True if the logged-in user is on the warehouse side */
export const isWarehouseRole = () => CURRENT_USER.role === ROLES.WH_MANAGER;

/**
 * Universal array filter — call this on ANY data list in ANY tab.
 * Admin always gets the full unfiltered array back.
 * Everyone else gets only rows matching their own locationId.
 *
 * @param {Array}  data            - Full dataset from localStorage
 * @param {string} [fieldOverride] - Force a specific field (e.g. 'fromShopId' for transfers)
 */
/**
 * Robust Location Filtering
 * ─────────────────────────────────────────────────────────────────────────────
 * We distinguish between CONTROL (what I own) and VISIBILITY (what I can see).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** 
 * Returns only the locations the user CONTROLs (usually just one).
 * Use this for 'Source' fields or 'My Location' selectors.
 */
export const getControlledLocations = (list) => {
    if (!Array.isArray(list)) return [];
    if (isAdmin()) return list; 
    return list.filter(loc => loc.id === CURRENT_USER.locationId);
};

/** 
 * Returns locations the user is allowed to SEE (potential destinations/sources).
 * - WH Manager: Sees ALL shops (to ship to) and ALL warehouses (to transfer between).
 * - Shop Roles: Sees ALL warehouses (to receive from) but ONLY their own shop.
 */
export const getVisibleLocations = (list) => {
    if (!Array.isArray(list)) return [];
    if (isAdmin()) return list; 

    const isWH = isWarehouseRole();
    const locId = CURRENT_USER.locationId;

    return list.filter(loc => {
        // 1. If it's my own location, I always see it
        if (loc.id === locId) return true;

        // 2. If I'm a WH manager, I can see all other warehouses and all shops
        if (isWH) return true; 

        // 3. If I'm a Shop user, I can see all warehouses (as sources)
        // Check if IDs usually start with WH- for warehouses
        if (loc.id.startsWith('WH-')) return true;

        return false;
    });
};

/**
 * Universal array filter — scopes data (products, bills, transfers) 
 * to the user's specific location.
 */
export const filterByLocation = (data, fieldOverride = null) => {
    if (!Array.isArray(data)) return [];
    if (isAdmin()) return data;

    const id = CURRENT_USER.locationId;

    if (isWarehouseRole()) {
        const field = fieldOverride || 'locationId';
        return data.filter(item => item[field] === id || item.locationId === id);
    }

    const field = fieldOverride || 'shopId';
    return data.filter(item => item[field] === id || item.locationId === id);
};

// Legacy/Compatibility helpers
export const filterLocationList = (list) => getControlledLocations(list);
export const needsLocationFilter = (role) => role !== ROLES.OWNER;
export const getLocationFilterField = (role) => (role === ROLES.WH_MANAGER ? 'locationId' : 'shopId');

// bottom code is working but we try to show now particular shop or warehouse detail which is their id 

// // ─────────────────────────────────────────────────────────────────────────────
// // roles.js — Single source of truth for role-based tab access in BizPro.
// //
// // To give a role access to a new tab  → add the tab id to that role's array.
// // To add a brand new role             → add one key with its allowed tab ids.
// // Nothing else in the codebase needs to change.
// // ─────────────────────────────────────────────────────────────────────────────

// export const ROLES = {
//     OWNER:             "owner",             // Super Admin — full access
//     ACCOUNTANT:        "accountant",        // Finance: sales, purchase, reports, parties
//     SALES_MANAGER:     "sales_manager",     // Sales ops: sales, parties, transfers (own shop)
//     INVENTORY_MANAGER: "inventory_manager", // Stock lister: inventory only
//     CASHIER:           "cashier",           // Billing staff: sales counter only
//     WH_MANAGER:        "wh_manager",        // Warehouse manager: warehouses + transfers
// };

// // Tab IDs must match the `id` field in TabRegistry.js
// export const ROLE_PERMISSIONS = {
//     [ROLES.OWNER]: [
//         "dashboard",
//         "sales",
//         "purchase",
//         "inventory",
//         "transfers",
//         "warehouses",
//         "parties",
//         "reports",
//         "settings",
//     ],
//     [ROLES.ACCOUNTANT]: [
//         "dashboard",
//         "sales",
//         "purchase",
//         "parties",
//         "reports",
//     ],
//     [ROLES.SALES_MANAGER]: [
//         "dashboard",
//         "sales",
//         "parties",
//         "transfers",  // can see transfer history for their shop
//     ],
//     [ROLES.INVENTORY_MANAGER]: [
//         "dashboard",
//         "inventory",
//         "transfers",  // can initiate WH→Shop challans
//     ],
//     [ROLES.CASHIER]: [
//         "dashboard",
//         "sales",      // billing counter only
//     ],
//     [ROLES.WH_MANAGER]: [
//         "dashboard",
//         "warehouses", // full warehouse management
//         "transfers",  // all transfer types
//         "inventory",  // read access
//     ],
// };

// export const ROLE_LABELS = {
//     [ROLES.OWNER]:             "Super Admin / Owner",
//     [ROLES.ACCOUNTANT]:        "Accountant",
//     [ROLES.SALES_MANAGER]:     "Sales Manager",
//     [ROLES.INVENTORY_MANAGER]: "Inventory Manager (Stock Lister)",
//     [ROLES.CASHIER]:           "Cashier / Billing Staff",
//     [ROLES.WH_MANAGER]:        "Warehouse Manager",
// };