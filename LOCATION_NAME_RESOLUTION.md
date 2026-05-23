# LOCATION NAME RESOLUTION — CONTEXT

---

## WHAT WE ARE DOING

After login, the backend returns only `warehouse_id` or `shop_id` in the user object.
The dashboard needs to show the actual name (e.g. "Delhi Main Warehouse" not a CUID).
We resolve this name once in `App.jsx` using RTK Query and pass it to `CURRENT_USER.locationName` via `syncCurrentUserFromAuth`.

---

## SINGLE SOURCE OF TRUTH

```
App.jsx → useGetWarehouseByIdQuery / useGetShopByIdQuery
       → enrichedUser.locationName
       → syncCurrentUserFromAuth(enrichedUser)
       → CURRENT_USER.locationName (roles.js)
       → used everywhere in UI
```

`LoginPage.jsx` does NOTHING extra. Just dispatches `setCredentials(payload)`.
`roles.js` just reads what it receives. No fetching anywhere else. Ever.

---

## CURRENT STATE — 100% DONE FOR WAREHOUSE ROLES

```js
// App.jsx
const { data: warehouseData } = useGetWarehouseByIdQuery(
  user?.warehouse_id,
  { skip: !user?.warehouse_id }
);

useEffect(() => {
  if (!user) { syncCurrentUserFromAuth(null); return; }
  const enrichedUser = {
    ...user,
    locationName: warehouseData?.warehouse_name
      || user?.locationName
      || user?.warehouse_id
      || null,
  };
  syncCurrentUserFromAuth(enrichedUser);
}, [user, warehouseData]);
```

Works for: `WH_MANAGER`, `WH_STOCK_LISTER`
Falls back to: `warehouse_id` (CUID) if API fails — no crash

---

## WHAT IS LEFT — SHOP ROLES (0% DONE)

Roles that need shop name: `SHOP_OWNER`, `BILLING_STAFF`, `SHOP_STOCK_LISTER`
These have `shop_id` in user object, `warehouse_id` is null.
Shop API endpoint: `GET /shops/:shopId` → `data.shop_name`

---

## HOW TO COMPLETE IT — EXACT CODE

When shop API is ready, in `App.jsx`:

**Step 1 — add shop query (same file, same pattern):**
```js
import { useGetShopByIdQuery } from "./REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";

const { data: shopData } = useGetShopByIdQuery(
  user?.shop_id,
  { skip: !user?.shop_id }
);
```

**Step 2 — update enrichedUser (one line change):**

Find:
```js
locationName: warehouseData?.warehouse_name
  || user?.locationName
  || user?.warehouse_id
  || null,
```
Replace with:
```js
locationName: warehouseData?.warehouse_name
  || shopData?.shop_name
  || user?.locationName
  || user?.warehouse_id
  || user?.shop_id
  || null,
```

**Step 3 — update useEffect dependency array:**

Find:
```js
}, [user, warehouseData]);
```
Replace with:
```js
}, [user, warehouseData, shopData]);
```

That is literally everything. 3 find-replace operations. Done.

---

## ROLE COVERAGE TABLE

| Role             | Has            | Resolves To         | Status      |
|------------------|----------------|---------------------|-------------|
| SUPER_ADMIN      | neither        | "All Locations"     | ✅ Done     |
| WH_MANAGER       | warehouse_id   | warehouse_name      | ✅ Done     |
| WH_STOCK_LISTER  | warehouse_id   | warehouse_name      | ✅ Done     |
| SHOP_OWNER       | shop_id        | shop_name           | ⏳ Pending  |
| BILLING_STAFF    | shop_id        | shop_name           | ⏳ Pending  |
| SHOP_STOCK_LISTER| shop_id        | shop_name           | ⏳ Pending  |

---

## RULES — NEVER BREAK THESE

1. NEVER fetch location name inside `LoginPage.jsx`
2. NEVER fetch location name inside `roles.js`
3. NEVER use raw `fetch()` — always use RTK Query hooks
4. ONLY `App.jsx` resolves and enriches the user object
5. ONLY `syncCurrentUserFromAuth` writes to `CURRENT_USER`
6. `locationName` always falls back gracefully — never crashes
