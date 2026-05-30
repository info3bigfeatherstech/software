import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Plus, Package, Tag, TrendingUp, Layers, Eye, Upload, FolderPlus, CheckSquare, Square, Pencil, Archive } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useBulkUpdateProductsMutation,
  useBulkArchiveProductsMutation,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
import CategoriesTab from "../../shared/CategoriesTab/CategoriesTab";
import { useGetCategoriesQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categoryApi";
import {
  openAddForm, closeAddForm,
  openEditForm, closeEditForm,
  openViewModal, closeViewModal,
  setSearch, setCategoryFilter, setActiveFilter,
  setCurrentPage, setPageSize, resetFilters,
  setSelectedProductIds,
  clearSelectedProducts,
  toggleSelectAll,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";
import ProductAddForm from "./ProductShared/ProductAddForm";
import ProductEditForm from "./ProductShared/ProductEditForm";
import ProductView from "./ProductShared/ProductView";
import { CURRENT_USER, can } from "../../../Components/roles";
import BulkUploadTab from "./BulkUploadTab/BulkUploadTab";
import BulkActionBar from "././BulkActionBar/BulkActionBar";

/* ── Status badge ── */
const StatusBadge = ({ isActive }) => (
  <span className={` inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${
    isActive
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-400 border-gray-200"
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
    {isActive ? "Active" : "Inactive"}
  </span>
);

export default function InventoryTab() {
  const dispatch = useDispatch();

  const {
    showAddForm, showEditForm, showViewModal,
    formData, formErrors,
    variants, showVariantModal, variantForm, variantErrors,
    editingVariantIndex, selectedProduct,
    search, categoryFilter, activeFilter, currentPage, pageSize,
    selectedProductIds,
  } = useSelector((state) => state.product);

  const warehouseId = CURRENT_USER.role === "SUPER_ADMIN" ? "" : CURRENT_USER.locationId || "";

  const { data, isLoading, isFetching, refetch } = useGetProductsQuery({
    page: currentPage, limit: pageSize,
    search, category_id: categoryFilter,
    is_active: activeFilter, warehouse_id: warehouseId,
  });

  const { data: allData } = useGetProductsQuery({
    page: 1, limit: 100,
    search, category_id: categoryFilter,
    is_active: activeFilter, warehouse_id: warehouseId,
  }, { skip: false });

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { data: categoriesData } = useGetCategoriesQuery({ is_active: true, limit: 100 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [bulkUpdate] = useBulkUpdateProductsMutation();
  const [bulkArchive] = useBulkArchiveProductsMutation();

  const products = data?.products || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const categories = categoriesData?.categories || [];

  const allSelectedOnPage = products.length > 0 &&
    products.every(p => selectedProductIds.includes(p.product_id));
  const someSelected = products.some(p => selectedProductIds.includes(p.product_id));

  const allProducts = allData?.products || [];
  const totalActiveCount = allProducts.filter(p => p.is_active).length;
  const totalMultiVariant = allProducts.filter(p => p.variant_count > 1).length;
  const totalAvgMrp = allProducts.length
    ? Math.round(allProducts.reduce((s, p) => s + (p.mrp || 0), 0) / allProducts.length)
    : 0;

  const handleArchive = async (productId, name) => {
    if (!window.confirm(`Archive "${name}"? This will soft delete the product.`)) return;
    try {
      await deleteProduct(productId).unwrap();
      toast.success(`"${name}" archived successfully`);
      refetch();
      dispatch(clearSelectedProducts());
    } catch (err) {
      toast.error(err?.data?.message || "Failed to archive product");
    }
  };

  const handleBulkAction = async (action, productIds) => {
    if (action === "activate") {
      const items = productIds.map(id => ({ product_id: id, is_active: true }));
      await bulkUpdate(items).unwrap();
    } else if (action === "deactivate") {
      const items = productIds.map(id => ({ product_id: id, is_active: false }));
      await bulkUpdate(items).unwrap();
    } else if (action === "archive") {
      await bulkArchive(productIds).unwrap();
    }
    refetch();
  };

  const toggleSelectProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      dispatch(setSelectedProductIds(selectedProductIds.filter(id => id !== productId)));
    } else {
      dispatch(setSelectedProductIds([...selectedProductIds, productId]));
    }
  };

  const handleSelectAll = () => {
    if (allSelectedOnPage) {
      const remainingIds = selectedProductIds.filter(id => !products.some(p => p.product_id === id));
      dispatch(setSelectedProductIds(remainingIds));
    } else {
      const newIds = [...selectedProductIds];
      products.forEach(p => { if (!newIds.includes(p.product_id)) newIds.push(p.product_id); });
      dispatch(setSelectedProductIds(newIds));
    }
  };

  const handleSaveSuccess = () => {
    dispatch(closeAddForm());
    dispatch(closeEditForm());
    refetch();
    dispatch(clearSelectedProducts());
  };

  const getCategoryName = (id) => categories.find(c => c.category_id === id)?.name || "—";

  const inputCls = " text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-400 transition-colors";

  return (
    <div className=" min-h-screen bg-gray-100 font-['satoshi'] p-5 space-y-4">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border border-gray-200 rounded px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 text-base font-bold leading-tight">Products &amp; Inventory</h1>
            <p className="text-gray-400 text-xs mt-0.5">Manage products, variants, pricing &amp; barcodes</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {can("productMs.category_add") && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className=" inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FolderPlus size={14} /> Add Category
            </button>
          )}
          {can("productMs.bulk_upload") && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className=" inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Upload size={14} /> Bulk Upload
            </button>
          )}
          {can("productMs.create") && (
            <button
              onClick={() => dispatch(openAddForm())}
              className=" inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products",  value: allProducts.length,                    sub: "matching filters" },
          { label: "Active",          value: totalActiveCount,                       sub: "live in system" },
          { label: "Multi-Variant",   value: totalMultiVariant,                      sub: "with 2+ variants" },
          { label: "Avg MRP",         value: `₹${totalAvgMrp.toLocaleString()}`,    sub: "across all products" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-200 rounded px-4 py-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER BAR + TABLE ── */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">

        {/* Table title bar */}
        <div className="bg-gray-800 px-5 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-semibold">Product List</span>
            {selectedProductIds.length > 0 && (
              <span className="text-xs font-semibold text-gray-300 border border-gray-600 rounded px-2 py-0.5">
                {selectedProductIds.length} selected
              </span>
            )}
          </div>
          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className=" text-xs text-gray-300 bg-gray-700 border border-gray-600 rounded px-2.5 py-1 cursor-pointer focus:outline-none"
          >
            {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[180px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
            </svg>
            <input
              value={search}
              onChange={(e) => dispatch(setSearch(e.target.value))}
              placeholder="Search product name or code…"
              className={inputCls + " w-full pl-9"}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className={inputCls + " cursor-pointer"}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>

          <select
            value={activeFilter}
            onChange={(e) => dispatch(setActiveFilter(e.target.value))}
            className={inputCls + " cursor-pointer"}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            onClick={() => dispatch(resetFilters())}
            className=" inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X size={13} /> Clear
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {(can("productMs.edit") || can("productMs.archive")) && (
                  <th className="px-4 py-2.5 w-10">
                    <button onClick={handleSelectAll} className="text-gray-400 hover:text-gray-700 transition-colors">
                      {allSelectedOnPage
                        ? <CheckSquare size={16} className="text-gray-700" />
                        : <Square size={16} />}
                    </button>
                  </th>
                )}
                {["Product", "Vendor", "Category", "Pricing", "Variants", "Status", ""].map((h, i) => (
                  <th key={i} className=" px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* Loading */}
              {(isLoading || isFetching) && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <p className=" text-xs text-gray-400 uppercase tracking-wide">Loading…</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!isLoading && !isFetching && products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    <Package size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className=" text-sm text-gray-400">No products found</p>
                    <button
                      onClick={() => dispatch(openAddForm())}
                      className=" text-gray-600 text-xs font-semibold hover:text-gray-800 underline mt-1 cursor-pointer"
                    >
                      Add your first product
                    </button>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!isLoading && products.map(p => (
                <tr
                  key={p.product_id}
                  className={`transition-colors group ${
                    selectedProductIds.includes(p.product_id)
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  {(can("productMs.edit") || can("productMs.archive")) && (
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelectProduct(p.product_id)} className="text-gray-300 hover:text-gray-600 transition-colors">
                        {selectedProductIds.includes(p.product_id)
                          ? <CheckSquare size={16} className="text-gray-700" />
                          : <Square size={16} />}
                      </button>
                    </td>
                  )}

                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                        {p.primary_variant?.images?.[0]?.url ? (
                          <img src={p.primary_variant.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={13} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className=" font-semibold text-gray-900 text-sm leading-tight">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[10px] text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">{p.product_code}</span>
                          {p.brand_name && <span className="text-xs text-gray-400">{p.brand_name}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Vendor */}
                  <td className="px-4 py-3">
                    {p.primary_vendor?.company_name ? (
                      <div>
                        <p className=" text-sm text-gray-800 font-medium">{p.primary_vendor.company_name}</p>
                        {p.primary_vendor.city && (
                          <p className="text-xs text-gray-400 mt-0.5">{p.primary_vendor.city}</p>
                        )}
                      </div>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className=" px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-xs font-medium">
                      {p.category?.name || getCategoryName(p.category_id)}
                    </span>
                  </td>

                  {/* Pricing */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 w-8">MRP</span>
                        <span className="font-semibold text-gray-800">₹{p.mrp?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 w-8">WS</span>
                        <span className="font-semibold text-gray-700">₹{p.wholesale_price?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 w-8">Retail</span>
                        <span className="font-semibold text-gray-700">₹{p.retail_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>

                  {/* Variants */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={` inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium w-fit ${
                        p.variant_count > 1
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        <Layers size={10} />
                        {p.variant_count || 1} variant{p.variant_count !== 1 ? "s" : ""}
                      </span>
                      {p.primary_variant?.system_barcode && (
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded w-fit">
                          {p.primary_variant.system_barcode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge isActive={p.is_active} />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {can("productMs.read") && (
                        <button
                          onClick={() => dispatch(openViewModal(p))}
                          title="View"
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {can("productMs.edit") && (
                        <button
                          onClick={() => dispatch(openEditForm(p))}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {can("productMs.archive") && (
                        <button
                          onClick={() => handleArchive(p.product_id, p.name)}
                          disabled={isDeleting}
                          title="Archive"
                          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className=" flex justify-between items-center px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">{((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)}</span>
              {" "}of{" "}
              <span className="font-semibold text-gray-700">{meta.total}</span> products
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-white transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-semibold rounded min-w-[56px] text-center">
                {currentPage} / {meta.totalPages}
              </span>
              <button
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                disabled={currentPage === meta.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-white transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BULK ACTION BAR ── */}
      {selectedProductIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedProductIds.length}
          selectedProductIds={selectedProductIds}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* ── MODALS — untouched ── */}
      {showAddForm && (
        <ProductAddForm
          formData={formData} formErrors={formErrors}
          variants={variants} showVariantModal={showVariantModal}
          variantForm={variantForm} variantErrors={variantErrors}
          editingVariantIndex={editingVariantIndex}
          onSave={handleSaveSuccess}
        />
      )}
      {showEditForm && selectedProduct && (
        <ProductEditForm
          formData={formData} formErrors={formErrors}
          selectedProduct={selectedProduct}
          showVariantModal={showVariantModal}
          variantForm={variantForm} variantErrors={variantErrors}
          editingVariantIndex={editingVariantIndex}
          onSave={handleSaveSuccess}
        />
      )}
      {showViewModal && selectedProduct && (
        <ProductView
          productId={selectedProduct.product_id}
          onClose={() => dispatch(closeViewModal())}
        />
      )}
      <BulkUploadTab
        isOpen={showBulkUpload}
        onClose={() => { setShowBulkUpload(false); refetch(); }}
      />
      {showCategoryModal && (
        <CategoriesTab onClose={() => setShowCategoryModal(false)} />
      )}
    </div>
  );
}