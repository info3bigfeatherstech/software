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

  const warehouses = warehouseData?.warehouses || [];
  const meta       = warehouseData?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalItems = meta?.total      || 0;

  const activeCount  = warehouses.filter(w => w.is_active).length;
  const uniqueCities = [...new Set(warehouses.map(w => w.city).filter(Boolean))];

  const handleAddSuccess = () => { dispatch(closeAddForm()); dispatch(clearFormErrors()); refetch(); };
  const handleEditSuccess = () => { dispatch(closeEditForm()); dispatch(clearFormErrors()); refetch(); };

  const handleDeactivate = async (warehouseId) => {
    if (!window.confirm("Deactivate this warehouse?")) return;
    try {
      await deleteWarehouse(warehouseId).unwrap();
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to deactivate warehouse");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-7  space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 ">Warehouses</h1>
          <p className="text-sm text-gray-400 mt-0.5 ">All warehouse locations and their current status</p>
        </div>
        <button
          onClick={() => dispatch(openAddForm())}
          className="px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition  cursor-pointer"
        >
          + Add Warehouse
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Warehouses', value: totalItems },
          { label: 'Active (this page)', value: activeCount },
          { label: 'Cities Covered', value: uniqueCities.length },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 ">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900  leading-tight">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 border border-gray-200 rounded-xl">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search by name or code…"
              className="flex-1 text-sm bg-transparent outline-none text-gray-700  placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => dispatch(resetFilters())}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50  flex items-center gap-2 transition cursor-pointer"
          >
            <X size={14} /> Clear
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={cityFilter}
            onChange={(e) => dispatch(setCityFilter(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600  outline-none bg-white cursor-pointer"
          >
            <option value="">All Cities</option>
            {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={activeFilter}
            onChange={(e) => dispatch(setActiveFilter(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600  outline-none bg-white cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600  outline-none bg-white ml-auto cursor-pointer"
          >
            {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3">
          <p className="text-sm text-red-500 ">
            Error loading warehouses: {error.data?.message || "Please try again"}
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {(isLoading || isFetching) && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !isFetching && warehouses.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
          <p className="text-sm text-gray-400 ">No warehouses found</p>
          <p className="text-xs text-gray-300 mt-1 ">Try adjusting your filters or add a new warehouse</p>
        </div>
      )}

      {/* ── Warehouse Cards Grid ── */}
      {!isLoading && warehouses.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {warehouses.map(wh => (
            <div
              key={wh.warehouse_id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 transition-all p-5 group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-300">{wh.warehouse_code}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900  leading-snug">{wh.warehouse_name}</h3>
                  <p className="text-xs text-gray-400  mt-0.5 truncate">{wh.city}{wh.address ? ` · ${wh.address}` : ''}</p>
                </div>
                <span className={`ml-3 flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold  ${
                  wh.is_active
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {wh.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Meta rows */}
              <div className="space-y-1.5 mb-4">
                {wh.manager_name && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400  w-16 flex-shrink-0">Manager</span>
                    <span className="text-xs font-medium text-gray-700 ">{wh.manager_name}</span>
                  </div>
                )}
                {wh.remarks && (
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-400  w-16 flex-shrink-0">Remarks</span>
                    <span className="text-xs text-gray-400 italic ">{wh.remarks}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400  w-16 flex-shrink-0">ID</span>
                  <span className="text-xs font-mono text-gray-300">{wh.warehouse_id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => dispatch(openEditForm(wh))}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50  transition cursor-pointer"
                >
                  Edit
                </button>
                {wh.is_active && (
                  <button
                    onClick={() => handleDeactivate(wh.warehouse_id)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-400 hover:border-red-200 hover:text-red-400 hover:bg-red-50  transition cursor-pointer"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-100 px-5 py-3.5">
          <p className="text-sm text-gray-400 ">
            Showing{' '}
            <span className="text-gray-700 font-semibold">{((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalItems)}</span>
            {' '}of <span className="text-gray-700 font-semibold">{totalItems}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600  disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-500 ">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600  disabled:opacity-30 hover:bg-gray-50 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Add Form Modal ── */}
      {showAddForm && (
        <WarehouseAddForm formData={formData} formErrors={formErrors} onSave={handleAddSuccess} />
      )}

      {/* ── Edit Form Modal ── */}
      {showEditForm && (
        <WarehouseEditForm formData={formData} formErrors={formErrors} selectedWarehouse={selectedWarehouse} onSave={handleEditSuccess} />
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
