# Graph Report - vy  (2026-05-23)

## Corpus Check
- 105 files · ~138,917 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 260 nodes · 190 edges · 10 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `isAdmin()` - 12 edges
2. `isWarehouseRole()` - 6 edges
3. `filterInternalTabsByRole()` - 5 edges
4. `getVisibleLocations()` - 5 edges
5. `ShopToShopTab()` - 5 edges
6. `WHToWHTab()` - 5 edges
7. `filterByLocation()` - 4 edges
8. `PurchaseTab()` - 4 edges
9. `can()` - 3 edges
10. `getControlledLocations()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `isAdmin()` --calls--> `WarehouseReceiveTab()`  [INFERRED]
  src\Components\roles.js → src\Components\TABS\WAREHOUSES\WarehouseReceiveTab.jsx
- `filterInternalTabsByRole()` --calls--> `SalesDashboard()`  [INFERRED]
  src\Components\roles.js → src\Components\TABS\SALES\SalesDashboard.jsx
- `filterInternalTabsByRole()` --calls--> `SettingsDashboard()`  [INFERRED]
  src\Components\roles.js → src\Components\TABS\SETTINGS\SettingsDashboard.jsx
- `filterInternalTabsByRole()` --calls--> `TransfersDashboard()`  [INFERRED]
  src\Components\roles.js → src\Components\TABS\TRANSFERS\TransfersDashboard.jsx
- `filterInternalTabsByRole()` --calls--> `WarehousesDashboard()`  [INFERRED]
  src\Components\roles.js → src\Components\TABS\WAREHOUSES\WarehousesDashboard.jsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (14): filterByLocation(), filterLocationList(), getControlledLocations(), getVisibleLocations(), isAdmin(), isWarehouseRole(), ContentDashboardTab(), InventoryTab() (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.22
Nodes (5): filterInternalTabsByRole(), SalesDashboard(), SettingsDashboard(), TransfersDashboard(), WarehousesDashboard()

### Community 2 - "Community 2"
Cohesion: 0.33
Nodes (2): fmtDate(), PurchaseTab()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (2): buildBasePayload(), buildCompleteVariantsArray()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (1): WarehouseReceiveTab()

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (2): buildFormDataFromProduct(), extractImagesWithIds()

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (3): ArchiveTab(), can(), VendorsTab()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (2): BillingTab(), toNumber()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (2): fmt(), InwardEditForm()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): fmtDateTime(), PurchaseDetailModal()

## Knowledge Gaps
- **Thin community `Community 2`** (7 nodes): `fmtDate()`, `fmtDateTime()`, `getData()`, `PurchaseTab()`, `saveData()`, `PurchaseTab.jsx`, `PurchaseTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (6 nodes): `buildBasePayload()`, `buildCompleteVariantsArray()`, `buildMultipartFormData()`, `hasAnyImages()`, `ProductAddForm()`, `ProductAddForm.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (6 nodes): `WarehouseReceiveTab.jsx`, `load()`, `ManualProductSelector()`, `save()`, `Toast()`, `WarehouseReceiveTab()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (6 nodes): `buildFormDataFromProduct()`, `buildVariantsFromProduct()`, `extractImagesWithIds()`, `getVariantThumbnail()`, `resetFormImageTracking()`, `productSlice.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (5 nodes): `BillingTab()`, `getData()`, `saveData()`, `toNumber()`, `BillingTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (4 nodes): `fmt()`, `InwardEditForm()`, `ReadField()`, `InwardEditForm.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `fmtDateTime()`, `InfoRow()`, `PurchaseDetailModal()`, `PurchaseDetailModal.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `isAdmin()` connect `Community 0` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `filterInternalTabsByRole()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `PurchaseTab()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `isAdmin()` (e.g. with `ContentDashboardTab()` and `PurchaseTab()`) actually correct?**
  _`isAdmin()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `isWarehouseRole()` (e.g. with `ShopToShopTab()` and `WHToShopTab()`) actually correct?**
  _`isWarehouseRole()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `filterInternalTabsByRole()` (e.g. with `SalesDashboard()` and `SettingsDashboard()`) actually correct?**
  _`filterInternalTabsByRole()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `getVisibleLocations()` (e.g. with `ShopToShopTab()` and `WHToWHTab()`) actually correct?**
  _`getVisibleLocations()` has 2 INFERRED edges - model-reasoned connections that need verification._