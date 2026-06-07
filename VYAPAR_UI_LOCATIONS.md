# Vyapar Name — Frontend Locations

Complete audit of **"Vyapar"** / **"vyapar"** in the `software/` frontend (June 2025).

---

## Visible in UI (user-facing text)

These are the only places where **"Vyapar"** appears as text the user can see on screen or in the browser chrome.

| # | File | Line | Location / Screen | What user sees |
|---|------|------|-------------------|----------------|
| 1 | `index.html` | 7 | Browser tab title | **Vyapar - Inventory & Billing** |
| 2 | `src/LOGIN_SEGMENT/LoginPage.jsx` | 49 | Login page — card header | **Vyapar Login** (main heading) |
| 3 | `src/Components/SideBarDashboard/SideBarDashboard.jsx` | 294 | Dashboard — sidebar footer (expanded only) | **Vyapar v1.0.0** (version label above logout) |

**Total visible text occurrences: 3**

---

## Visible as image (brand logo, not text)

| # | File | Line | Location / Screen | Notes |
|---|------|------|-------------------|-------|
| 1 | `src/Components/SideBarDashboard/SideBarDashboard.jsx` | 15, 149–152 | Sidebar top — logo image | PNG from `thebigfeathers.com`; `alt="Logo"` (no "Vyapar" in alt text, but logo graphic may contain brand name) |

Login page does **not** show the logo — only the "Vyapar Login" heading.

---

## Not visible in UI (internal / code-only)

These use `vyapar_*` as **localStorage keys** or **storage constants**. They never render on screen.

| File | Lines | Usage |
|------|-------|-------|
| `src/Components/TABS/WAREHOUSES/WarehouseStockTab.jsx` | 7 | `vyapar_warehouses`, `vyapar_products` |
| `src/Components/TABS/WAREHOUSES/WarehouseReceiveTab.jsx` | 12–15 | `vyapar_warehouses`, `vyapar_vendors`, `vyapar_products`, `vyapar_grns` |
| `src/Components/TABS/SALES/ReturnsTab.jsx` | 6–9 | `vyapar_bills`, `vyapar_products`, `vyapar_credit_notes`, `vyapar_shops` |
| `src/Components/TABS/SALES/InvoicesTab.jsx` | 5–6 | `vyapar_bills`, `vyapar_shops` |
| `src/Components/shared/NetworkStockPanel.jsx` | 13, 33 | `vyapar_shops`, `vyapar_products` |

### Commented code only (inactive, not rendered)

| File | Lines |
|------|-------|
| `src/Components/TABS/WAREHOUSES/WarehouseReceiveTab.jsx` | 945 |
| `src/Components/TABS/WAREHOUSES/WarehouseOverviewTab.jsx` | 326 |
| `src/Components/TABS/SALES/InvoicesTab.jsx` | 203–204 |
| `src/Components/shared/NetworkStockPanel.jsx` | 215–217 |
| `src/Components/TABS/VENDOR/VendorsTab.jsx` | 291, 597 |

---

## Not found elsewhere

Searched across all `.jsx`, `.js`, `.html` under `software/`:

- No "Vyapar" in invoices, PDFs, billing print views, toasts, or dashboard headers
- No "Vyapar" in `App.jsx`, `AppLoading.jsx`, `ContentDashboardTab.jsx`, or tab labels
- Company/shop names in settings and bills come from **backend data** (e.g. shop name, company details), not hardcoded "Vyapar"

---

## Quick rename checklist

If rebranding away from "Vyapar", update these **3 UI strings** + **1 browser title**:

1. `index.html` → `<title>`
2. `LoginPage.jsx` → login heading
3. `SideBarDashboard.jsx` → footer version text
4. `SideBarDashboard.jsx` → logo URL / image asset (if replacing brand graphic)
