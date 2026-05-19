// TABS/WAREHOUSES/WarehouseOverviewTab.jsx
//
// Drives the Overview sub-tab.
// All data from GET /warehouses — zero localStorage, zero fake data.
// Form open/close state lives in warehouseSlice.

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { X } from "lucide-react";
import { useGetWarehousesQuery, useDeleteWarehouseMutation } from "../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import {
  openAddForm,
  closeAddForm,
  openEditForm,
  closeEditForm,
  openDetailsModal,
  closeDetailsModal,
  updateFormData,
  setFormErrors,
  clearFormErrors,
  setSearch,
  setCityFilter,
  setActiveFilter,
  setCurrentPage,
  setPageSize,
  resetFilters,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseSlice";
import WarehouseAddForm from "./WarehouseShared/WarehouseAddForm";
import WarehouseEditForm from "./WarehouseShared/WarehouseEditForm";

export default function WarehouseOverviewTab() {
  const dispatch = useDispatch();

  // ── Slice state ──────────────────────────────────────────────────────────
  const {
    showAddForm,
    showEditForm,
    showDetailsModal,
    selectedWarehouse,
    formData,
    formErrors,
    search,
    cityFilter,
    activeFilter,
    currentPage,
    pageSize,
  } = useSelector((state) => state.warehouse);

  // ── API ──────────────────────────────────────────────────────────────────
  const {
    data: warehouseData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetWarehousesQuery({
    page: currentPage,
    limit: pageSize,
    search,
    city: cityFilter,
    is_active: activeFilter,
  });

  const [deleteWarehouse] = useDeleteWarehouseMutation();

  const warehouses  = warehouseData?.warehouses || [];
  const meta        = warehouseData?.meta;
  const totalPages  = meta?.totalPages || 1;
  const totalItems  = meta?.total      || 0;

  // ── Derived stats from current page data ────────────────────────────────
  const activeCount  = warehouses.filter(w => w.is_active).length;
  const uniqueCities = [...new Set(warehouses.map(w => w.city).filter(Boolean))];

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddSuccess = () => {
    dispatch(closeAddForm());
    dispatch(clearFormErrors());
    refetch();
  };

  const handleEditSuccess = () => {
    dispatch(closeEditForm());
    dispatch(clearFormErrors());
    refetch();
  };

  const handleDeactivate = async (warehouseId) => {
    if (!window.confirm("Deactivate this warehouse?")) return;
    try {
      await deleteWarehouse(warehouseId).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to deactivate warehouse");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Warehouse Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">All warehouse locations and their current status</p>
        </div>
        <button
          onClick={() => dispatch(openAddForm())}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          + Add Warehouse
        </button>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-xs opacity-80 uppercase tracking-wide">Total Warehouses</p>
          <p className="text-3xl font-bold mt-1">{totalItems}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-xs opacity-80 uppercase tracking-wide">Active (this page)</p>
          <p className="text-3xl font-bold mt-1">{activeCount}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-xs opacity-80 uppercase tracking-wide">Cities Covered</p>
          <p className="text-3xl font-bold mt-1">{uniqueCities.length}</p>
        </div>
      </div>

      {/* ── Filters Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search by name or code…"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => dispatch(resetFilters())}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
          >
            <X size={14} /> Clear
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* City filter (derived from current page) */}
          <select
            value={cityFilter}
            onChange={(e) => dispatch(setCityFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
          >
            <option value="">All Cities</option>
            {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status filter */}
          <select
            value={activeFilter}
            onChange={(e) => dispatch(setActiveFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer"
          >
            {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">
            Error loading warehouses: {error.data?.message || "Please try again"}
          </p>
        </div>
      )}

      {/* ── Loading Spinner ──────────────────────────────────────────────── */}
      {(isLoading || isFetching) && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Warehouse Cards Grid ─────────────────────────────────────────── */}
      {!isLoading && !isFetching && warehouses.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No warehouses found</div>
      )}

      {!isLoading && warehouses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {warehouses.map(wh => (
            <div
              key={wh.warehouse_id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md p-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{wh.warehouse_id}</p>
                  <p className="text-xs text-gray-400 font-mono">{wh.warehouse_code}</p>
                  <h3 className="font-semibold text-gray-800 mt-0.5">{wh.warehouse_name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{wh.city} — {wh.address}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  wh.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {wh.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Manager */}
              {wh.manager_name && (
                <p className="text-xs text-gray-400 mb-3">
                  Manager: <span className="text-gray-600 font-medium">{wh.manager_name}</span>
                </p>
              )}

              {/* Remarks */}
              {wh.remarks && (
                <p className="text-xs text-gray-400 italic mb-3">{wh.remarks}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => dispatch(openEditForm(wh))}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Edit
                </button>
                {wh.is_active && (
                  <button
                    onClick={() => handleDeactivate(wh.warehouse_id)}
                    className="flex-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Add Form Modal ───────────────────────────────────────────────── */}
      {showAddForm && (
        <WarehouseAddForm
          formData={formData}
          formErrors={formErrors}
          onSave={handleAddSuccess}
        />
      )}

      {/* ── Edit Form Modal ──────────────────────────────────────────────── */}
      {showEditForm && (
        <WarehouseEditForm
          formData={formData}
          formErrors={formErrors}
          selectedWarehouse={selectedWarehouse}
          onSave={handleEditSuccess}
        />
      )}

    </div>
  );
}
// upper code have api integration 
// // TABS/WAREHOUSES/WarehouseOverviewTab.jsx
// import React, { useState, useEffect } from "react";
// import { INITIAL_WAREHOUSES, INITIAL_PRODUCTS } from "../../demoData";
// import { CURRENT_USER, filterLocationList, filterByLocation, isAdmin } from "../../roles";

// const SK = { W: "vyapar_warehouses", P: "vyapar_products" };
// const load = (k, d) => { const s = localStorage.getItem(k); if (s) return JSON.parse(s); localStorage.setItem(k, JSON.stringify(d)); return d; };

// export default function WarehouseOverviewTab() {
//     const [warehouses, setWarehouses] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [selected, setSelected] = useState(null);
//     const [showAdd, setShowAdd] = useState(false);
//     const [formData, setFormData] = useState({ name: "", city: "", address: "", manager: "" });

//     useEffect(() => {
//         const wh = filterLocationList(load(SK.W, INITIAL_WAREHOUSES));
//         setWarehouses(wh);
//         setProducts(filterByLocation(load(SK.P, INITIAL_PRODUCTS)));
        
//         if (!isAdmin() && wh.length > 0) {
//             setSelected(wh[0]);
//         }
//     }, []);

//     const getStats = (whId) => {
//         const whProducts = products.filter(p => p.warehouseId === whId || p.shopId === whId);
//         const totalItems = whProducts.length;
//         const lowStock = whProducts.filter(p => p.stock <= (p.lowStockAlert || 10)).length;
//         const totalValue = whProducts.reduce((s, p) => s + (p.stock * (p.mrp || 0)), 0);
//         return { totalItems, lowStock, totalValue };
//     };

//     const saveWarehouse = () => {
//         if (!formData.name || !formData.city) return alert("Fill name and city");
//         const newWH = { id: `WH-${Date.now()}`, ...formData, isActive: true, rooms: ["General"], racks: ["A1"] };
//         const updated = [...warehouses, newWH];
//         localStorage.setItem(SK.W, JSON.stringify(updated));
//         setWarehouses(updated);
//         setShowAdd(false);
//         setFormData({ name: "", city: "", address: "", manager: "" });
//     };

//     return (
//         <div className="space-y-5">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-base font-semibold text-gray-800">Warehouse Overview</h2>
//                     <p className="text-xs text-gray-400 mt-0.5">All warehouse locations and their current status</p>
//                 </div>
//                 {isAdmin() && (
//                     <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ Add Warehouse</button>
//                 )}
//             </div>

//             {showAdd && (
//                 <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
//                     <p className="font-semibold text-sm">Add New Warehouse</p>
//                     <div className="grid grid-cols-2 gap-4">
//                         <input placeholder="WH Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
//                         <input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
//                         <input placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2 px-3 py-2 border rounded-lg text-sm" />
//                         <input placeholder="Manager" value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} className="px-3 py-2 border rounded-lg text-sm" />
//                     </div>
//                     <div className="flex justify-end gap-2">
//                         <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 border rounded-lg text-sm">Cancel</button>
//                         <button onClick={saveWarehouse} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">Save</button>
//                     </div>
//                 </div>
//             )}

//             {/* Summary cards */}
//             <div className="grid grid-cols-3 gap-4">
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Total Warehouses</p>
//                     <p className="text-3xl font-bold mt-1">{warehouses.length}</p>
//                 </div>
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Active</p>
//                     <p className="text-3xl font-bold mt-1">{warehouses.filter(w => w.isActive !== false).length}</p>
//                 </div>
//                 <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Cities Covered</p>
//                     <p className="text-3xl font-bold mt-1">{new Set(warehouses.map(w => w.city)).size}</p>
//                 </div>
//             </div>

//             {/* Warehouse cards */}
//             <div className="grid grid-cols-2 gap-4">
//                 {warehouses.map(wh => {
//                     const stats = getStats(wh.id);
//                     const isSelected = selected?.id === wh.id;
//                     return (
//                         <div key={wh.id} onClick={() => isAdmin() && setSelected(isSelected ? null : wh)}
//                             className={`bg-white rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md p-5 ${isSelected ? "border-blue-400" : "border-gray-200 hover:border-gray-300"}`}>
//                             <div className="flex items-start justify-between mb-3">
//                                 <div>
//                                     <h3 className="font-semibold text-gray-800">{wh.name}</h3>
//                                     <p className="text-xs text-gray-400 mt-0.5">{wh.city} — {wh.address}</p>
//                                 </div>
//                                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${wh.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
//                                     {wh.isActive !== false ? "Active" : "Inactive"}
//                                 </span>
//                             </div>
//                             <div className="grid grid-cols-3 gap-3 mt-3">
//                                 <div className="bg-gray-50 rounded-lg p-2.5 text-center">
//                                     <p className="text-xs text-gray-400">Products</p>
//                                     <p className="text-lg font-bold text-gray-700 mt-0.5">{stats.totalItems}</p>
//                                 </div>
//                                 <div className="bg-red-50 rounded-lg p-2.5 text-center">
//                                     <p className="text-xs text-gray-400">Low Stock</p>
//                                     <p className={`text-lg font-bold mt-0.5 ${stats.lowStock > 0 ? "text-red-600" : "text-green-600"}`}>{stats.lowStock}</p>
//                                 </div>
//                                 <div className="bg-blue-50 rounded-lg p-2.5 text-center">
//                                     <p className="text-xs text-gray-400">Value</p>
//                                     <p className="text-sm font-bold text-blue-700 mt-0.5">₹{(stats.totalValue / 1000).toFixed(0)}K</p>
//                                 </div>
//                             </div>
//                             {wh.manager && <p className="text-xs text-gray-400 mt-3">Manager: <span className="text-gray-600 font-medium">{wh.manager}</span></p>}
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* Detail panel */}
//             {selected && (
//                 <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
//                     <div className="flex items-center justify-between mb-4">
//                         <h3 className="font-semibold text-gray-800">{selected.name} — Details</h3>
//                         <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">✕ Close</button>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                         <div>
//                             <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Location</p>
//                             <p className="text-gray-700">{selected.address}</p>
//                             <p className="text-gray-500 mt-1">{selected.city}</p>
//                         </div>
//                         {selected.rooms && (
//                             <div>
//                                 <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Rooms / Zones</p>
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {selected.rooms.map(r => <span key={r} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{r}</span>)}
//                                 </div>
//                             </div>
//                         )}
//                         {selected.racks && (
//                             <div className="col-span-2">
//                                 <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Racks / Shelves</p>
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {selected.racks.map(r => <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{r}</span>)}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
