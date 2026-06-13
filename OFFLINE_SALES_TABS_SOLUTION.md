# Offline Sales Tabs — Problem, Root Cause & Robust Solution

> **Scope:** Billing Counter works offline, but **Customers** and **Offline & Sync** tabs fail when there is no internet.  
> **App:** Vyapar frontend (`vy/`) + offline layer (`vy/src/offline/`)

---

## 1. Problem Summary

| Tab | Expected offline behaviour | Current behaviour |
|-----|---------------------------|-------------------|
| **Billing Counter** | Create bills, search products, add offline customers | ✅ Works |
| **Customers** | View offline-created + cached customers | ❌ Tab may not open; even if open, list is empty (API-only) |
| **Offline & Sync** | View pending bills, outbox queue, local sync status | ❌ Tab may not open (JS chunk not cached) |

---

## 2. Root Causes

### 2.1 Lazy-loaded JS chunks (tab does not open at all)

Sales sub-tabs are loaded with `React.lazy()` in `salesTabRegistry.js`:

```js
const BillingTab     = lazy(() => import("./BillingTab"));
const OfflineSyncTab = lazy(() => import("./OfflineSyncTab"));
const CustomersTab   = lazy(() => import("./CustomersTab"));
```

When the user is on **Billing Counter**, only that tab's JavaScript chunk is in memory. Switching to **Customers** or **Offline & Sync** triggers a **dynamic import** — the browser tries to download a separate `.js` file.

- If offline and that chunk is **not in the service worker cache** → tab fails to load (Suspense hangs or error).
- **Billing works** because the user already loaded that chunk.
- In **dev mode** (`npm run dev`), PWA is disabled (`vite.config.js` → `devOptions.enabled: false`), so chunks are never precached.

**Relevant files:**
- `vy/src/Components/TABS/SALES/salesTabRegistry.js`
- `vy/src/Components/shared/SubTabBar.jsx` (wraps tabs in `<Suspense>`)
- `vy/vite.config.js` (VitePWA / Workbox config)

---

### 2.2 Customers tab is online-only (data layer gap)

Billing has offline customer support:

| Feature | Billing | Customers tab |
|---------|---------|---------------|
| Search by mobile | ✅ `CustomerSearch.jsx` → IndexedDB when offline | ❌ Not used |
| Create customer | ✅ `CreateCustomerModal.jsx` → `createOfflineCustomer()` | ❌ API only (`useCreateCustomerMutation`) |
| List customers | N/A | ❌ API only (`useGetCustomersQuery`) |

Offline-created customers **are saved** to IndexedDB via `offlineCustomer.service.js` and queued in the outbox for sync. But **`CustomersTab.jsx` never reads from IndexedDB**.

Additionally, `customerRepository` in `dataRepository.js` has `getByMobile`, `getById`, `bulkUpsert`, `count` — but **no `listAll()` / `listByShop()`** method for listing.

**Relevant files:**
- `vy/src/Components/TABS/SALES/CustomersTab.jsx`
- `vy/src/offline/billing/offlineCustomer.service.js`
- `vy/src/offline/db/repositories/dataRepository.js` (`customerRepository`)
- `vy/src/offline/sync/pullService.js` (pulls server customers into IndexedDB when online)

---

### 2.3 Offline & Sync tab is already offline-first (chunk issue only)

`OfflineSyncTab.jsx` reads from IndexedDB via `useOfflineBillsPanel` — no server call required on mount. It **should work offline** once its JS chunk is available.

Manual **Sync** button correctly requires network (`syncEngine.runFullSync` checks `networkMonitor.isOnline()`).

---

## 3. Architecture (current vs target)

```
┌─────────────────────────────────────────────────────────────┐
│                     SALES TABS (UI)                          │
├──────────────┬──────────────────┬───────────────────────────┤
│ Billing ✅   │ Customers ❌     │ Offline & Sync ⚠️         │
│ local-first  │ API-only         │ local-first (if chunk OK) │
└──────┬───────┴────────┬─────────┴─────────────┬─────────────┘
       │                │                       │
       ▼                ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    IndexedDB (offline DB)                    │
│  shop_stocks │ customers │ local_bills │ outbox │ config   │
└──────────────────────────────┬──────────────────────────────┘
                               │ push / pull (when online)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend sync API (/sync/pull, /sync/push)       │
└─────────────────────────────────────────────────────────────┘
```

**Target:** Customers tab follows the same **local-first** pattern as Billing and Shop Stock.

---

## 4. Robust Solution (3 layers)

### Layer 1 — Ensure tabs open offline (PWA + chunk loading)

**Priority: Critical**

Offline-critical tabs must not depend on a network fetch for their JS bundle.

#### Option A — Eager import (recommended)

In `salesTabRegistry.js`, remove `lazy()` for offline-critical tabs:

```js
import BillingTab from "./BillingTab";
import OfflineSyncTab from "./OfflineSyncTab";
import CustomersTab from "./CustomersTab";

// Keep lazy only for online-only tabs if desired:
const CreditNotesTab = lazy(() => import("./CreditNotesTab"));
const ShopReportTab  = lazy(() => import("./ShopReportTab/ShopReportTab"));
```

#### Option B — Prefetch on Sales dashboard mount

In `SalesDashboard.jsx`:

```js
useEffect(() => {
  import("./OfflineSyncTab");
  import("./CustomersTab");
}, []);
```

#### Option C — Production PWA discipline

- Always test offline with **`npm run build`** + static serve (not `npm run dev`).
- After each deploy, open all sales tabs **once while online** so Workbox precaches chunks.
- Verify in DevTools → **Application → Cache Storage** that JS chunks exist.

---

### Layer 2 — Customers tab: local-first data

**Priority: Critical**

Mirror the pattern used in `useShopStocksForBilling.js` / `useShopStocksForInventory.js`.

#### Step 2.1 — Extend `customerRepository`

Add to `vy/src/offline/db/repositories/dataRepository.js`:

```js
async listAll() {
  const db = await getOfflineDb();
  return db.getAll(OFFLINE_STORES.CUSTOMERS);
},

async listByShop(shopId) {
  const all = await this.listAll();
  return shopId ? all.filter((c) => c.shop_id === shopId) : all;
},
```

#### Step 2.2 — Create `useOfflineCustomersPanel` hook

New file: `vy/src/offline/hooks/useOfflineCustomersPanel.js`

Responsibilities:

- Load customers from IndexedDB when offline (or when API fails).
- When online, prefer RTK Query API response; merge with pending offline rows.
- Expose `loading`, `customers`, `refetch`, `usingOfflineCache`.
- Listen to `OFFLINE_EVENTS.SYNC_COMPLETED` to refresh after sync.

#### Step 2.3 — Wire `CustomersTab.jsx`

| Action | Online | Offline |
|--------|--------|---------|
| List | `useGetCustomersQuery` | `useOfflineCustomersPanel` → IndexedDB |
| Create | `useCreateCustomerMutation` | `createOfflineCustomer()` |
| Edit | API | Disable or queue (Phase 2) |
| Delete | API | Disable (Phase 2) |
| UI badge | — | Show **"Pending sync"** when `is_offline_pending === true` |

Reuse existing utilities:

- `createOfflineCustomer` from `offlineCustomer.service.js`
- `validateCustomerForm`, `buildCustomerSubmitPayload` from `customerForm.utils.js`

#### Step 2.4 — Initial sync requirement

Customers pulled from server are stored during `pullFullSnapshot()` in `pullService.js`.  
**At least one online session** (full sync) is required before offline list includes server customers. Offline-created customers appear immediately in IndexedDB.

---

### Layer 3 — UX polish & edge cases

**Priority: Medium**

1. **Offline banner** on Customers tab (same amber banner as ProductPicker: "Using offline customer catalog").
2. **Disable edit/delete** for `is_offline_pending` customers until synced (avoid conflicts).
3. **Error boundary** around lazy tabs with message: "This section could not load offline. Open it once while online."
4. **Sync tab:** Manual sync button stays disabled offline (expected).

---

## 5. Implementation checklist

### Phase 1 — Tab loading (quick win)

- [ ] Eager-import `BillingTab`, `OfflineSyncTab`, `CustomersTab` in `salesTabRegistry.js`
- [ ] OR add prefetch in `SalesDashboard.jsx`
- [ ] Test with production build offline

### Phase 2 — Customers offline list

- [ ] Add `listAll()` / `listByShop()` to `customerRepository`
- [ ] Create `useOfflineCustomersPanel.js`
- [ ] Update `CustomersTab.jsx` — list + create offline path
- [ ] Add "Pending sync" badge for offline-created rows

### Phase 3 — Hardening

- [ ] Error boundary for failed chunk loads
- [ ] Offline banner on Customers tab
- [ ] Document "open all tabs once online" for shop staff

---

## 6. Testing plan

Run all tests with **production build**, not dev server.

### Setup

```bash
cd vy
npm run build
npm run preview   # or serve dist/ on local network
```

1. Login as shop user.
2. Wait for initial sync (status bar: "Last sync: Just now").
3. Open **all three tabs** once: Billing, Customers, Offline & Sync.
4. Go offline (DevTools → Network → Offline, or disconnect Wi‑Fi).

### Test cases

| # | Test | Expected result |
|---|------|-----------------|
| 1 | Switch Billing → Customers offline | Customers tab opens (no blank/hang) |
| 2 | Switch Billing → Offline & Sync offline | Sync tab opens, shows pending bills |
| 3 | Create customer offline (Billing modal) | Customer searchable in Billing |
| 4 | Open Customers tab offline | Offline-created customer visible with "Pending sync" |
| 5 | Create bill offline with that customer | Bill saved, appears in Offline & Sync |
| 6 | Go online → tap Sync | Customer + bill sync to server |
| 7 | Customers tab after sync | Pending badge removed, server IDs assigned |

### DevTools verification

- **Application → IndexedDB → vyapar-offline → customers** — rows exist after create/sync pull.
- **Application → Cache Storage** — JS chunks for CustomersTab / OfflineSyncTab present.
- **Console** — no `Failed to fetch dynamically imported module` errors.

---

## 7. What is NOT in scope (Phase 2+)

- Offline customer **edit** / **delete** (needs outbox mutations + server handlers).
- Credit Notes, Shop Reports offline (online-only by design).
- True offline-first pagination (client-side filter is enough for typical shop customer counts).

---

## 8. Key file reference

| File | Role |
|------|------|
| `vy/src/Components/TABS/SALES/salesTabRegistry.js` | Tab lazy loading — **fix here first** |
| `vy/src/Components/TABS/SALES/CustomersTab.jsx` | Customer CRUD UI — **needs offline wiring** |
| `vy/src/Components/TABS/SALES/OfflineSyncTab.jsx` | Offline bills + outbox UI — already local-first |
| `vy/src/offline/billing/offlineCustomer.service.js` | Create/search offline customers |
| `vy/src/offline/db/repositories/dataRepository.js` | IndexedDB customer store |
| `vy/src/offline/hooks/useShopStocksForBilling.js` | Reference pattern for local-first hook |
| `vy/src/offline/sync/pullService.js` | Pulls server customers into IndexedDB |
| `vy/vite.config.js` | PWA / Workbox precache config |
| `vy/src/offline/components/OfflineProvider.jsx` | SW registration + initial sync |

---

## 9. Summary

| Issue | Fix |
|-------|-----|
| Tab won't open offline | Eager import or prefetch JS chunks; use production PWA build |
| Customers not visible offline | Read from IndexedDB; add `listAll` + `useOfflineCustomersPanel` |
| Offline Sync tab won't open | Same chunk fix as above; data layer already correct |
| Sync button offline | Expected to be disabled — sync needs server |

**Confidence:** Root causes are confirmed in code. Full robustness requires implementing Layer 1 + Layer 2 and passing the test plan in Section 6.

---

*Last updated: June 2025*
