
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Plus, Package, Tag, TrendingUp, Layers, Eye, Upload, FolderPlus, CheckSquare, Square } from "lucide-react";
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
import { CURRENT_USER,can  } from "../../../Components/roles";
import BulkUploadTab from "./BulkUploadTab/BulkUploadTab";
import BulkActionBar from "././BulkActionBar/BulkActionBar";

const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
    isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
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
    selectedProductIds, // ADD THIS
  } = useSelector((state) => state.product);

  const warehouseId = CURRENT_USER.role === "SUPER_ADMIN" ? "" : CURRENT_USER.locationId || "";

  const { data, isLoading, isFetching, refetch } = useGetProductsQuery({
    page: currentPage, limit: pageSize,
    search, category_id: categoryFilter,
    is_active: activeFilter, warehouse_id: warehouseId,
  });

  // ADD THIS - same query, just get all for stats
  const { data: allData } = useGetProductsQuery({
    page: 1, limit: 100,  // Get all records
    search, category_id: categoryFilter,
    is_active: activeFilter, warehouse_id: warehouseId,
  }, { skip: false }); // Always fetch

  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { data: categoriesData } = useGetCategoriesQuery({ is_active: true, limit: 100 });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [bulkUpdate] = useBulkUpdateProductsMutation();
  const [bulkArchive] = useBulkArchiveProductsMutation();

  const products = data?.products || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const categories = categoriesData?.categories || [];

  // Check if all products on current page are selected
  const allSelectedOnPage = products.length > 0 && 
    products.every(p => selectedProductIds.includes(p.product_id));
  
  // Some selected on page
  const someSelected = products.some(p => selectedProductIds.includes(p.product_id));

// Then use allData?.products for stats
const allProducts = allData?.products || [];
const totalActiveCount = allProducts.filter(p => p.is_active).length;
const totalMultiVariant = allProducts.filter(p => p.variant_count > 1).length;
const totalAvgMrp = allProducts.length
  ? Math.round(allProducts.reduce((s, p) => s + (p.mrp || 0), 0) / allProducts.length)
  : 0;

  // ── Handle individual product archive (replaces deactivate) ──
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

  // ── Handle bulk actions ──
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

  // ── Toggle individual product selection ──
  const toggleSelectProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      dispatch(setSelectedProductIds(selectedProductIds.filter(id => id !== productId)));
    } else {
      dispatch(setSelectedProductIds([...selectedProductIds, productId]));
    }
  };

  // ── Toggle select all on current page ──
  const handleSelectAll = () => {
    if (allSelectedOnPage) {
      // Deselect all on current page
      const remainingIds = selectedProductIds.filter(id => !products.some(p => p.product_id === id));
      dispatch(setSelectedProductIds(remainingIds));
    } else {
      // Select all on current page
      const newIds = [...selectedProductIds];
      products.forEach(p => {
        if (!newIds.includes(p.product_id)) {
          newIds.push(p.product_id);
        }
      });
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

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Products & Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage products, variants, pricing matrices, and master barcode configurations.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {can("productMs.category_add") && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
            >
              <FolderPlus size={16} /> Add Category
            </button>
          )}
          
          {can("productMs.bulk_upload") && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
            >
              <Upload size={16} className="text-gray-500" /> Bulk Upload
            </button>
          )}
          
          {can("productMs.create") && (
          <button
            onClick={() => dispatch(openAddForm())}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 border border-blue-700 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
          >
            <Plus size={16} /> Add Product
          </button>
        )}
        </div>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
<div className="grid grid-cols-4 gap-4">
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Total Products</p>
      <Package size={16} className="opacity-60" />
    </div>
    <p className="text-3xl font-bold">{allProducts.length}</p>
    <p className="text-xs opacity-60 mt-1">matching filters</p>
  </div>
  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Active</p>
      <Tag size={16} className="opacity-60" />
    </div>
    <p className="text-3xl font-bold">{allProducts.filter(p => p.is_active).length}</p>
    <p className="text-xs opacity-60 mt-1">total in system</p>
  </div>
  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white shadow-md">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Multi-Variant</p>
      <Layers size={16} className="opacity-60" />
    </div>
    <p className="text-3xl font-bold">{allProducts.filter(p => p.variant_count > 1).length}</p>
    <p className="text-xs opacity-60 mt-1">total in system</p>
  </div>
  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs opacity-75 uppercase tracking-wide font-medium">Avg MRP</p>
      <TrendingUp size={16} className="opacity-60" />
    </div>
    <p className="text-3xl font-bold">
      ₹{allProducts.length 
        ? Math.round(allProducts.reduce((s, p) => s + (p.mrp || 0), 0) / allProducts.length).toLocaleString() 
        : 0}
    </p>
    <p className="text-xs opacity-60 mt-1">across all products</p>
  </div>
</div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search by product name or code…"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <X size={14} /> Clear
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => dispatch(setActiveFilter(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 ml-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {/* Checkbox column */}
              {/* Bulk select checkbox column — only show if user can perform bulk actions */}
            {(can("productMs.edit") || can("productMs.archive")) && (
              <th className="px-4 py-3 w-10">
                <button
                  onClick={handleSelectAll}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {allSelectedOnPage ? (
                    <CheckSquare size={18} />
                  ) : someSelected ? (
                    <Square size={18} className="text-blue-500" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
              </th>
            )}
              {["Product", "Vendor", "Category", "Pricing", "Variants", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">

            {(isLoading || isFetching) && (
              <tr><td colSpan={8} className="px-4 py-10 text-center">
                <div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              </td></tr>
            )}

            {!isLoading && !isFetching && products.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-14 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Package size={32} className="text-gray-300" />
                  <p className="text-gray-400 text-sm">No products found</p>
                  <button onClick={() => dispatch(openAddForm())} className="text-blue-600 text-xs font-medium hover:underline cursor-pointer">Add your first product</button>
                </div>
              </td></tr>
            )}

            {!isLoading && products.map(p => (
              <tr key={p.product_id} className="hover:bg-gray-50 transition-colors">
                {/* Checkbox */}
                {/* Row checkbox — only show if user can perform bulk actions */}
                {(can("productMs.edit") || can("productMs.archive")) && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelectProduct(p.product_id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {selectedProductIds.includes(p.product_id) ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </td>
                )}

                {/* Product */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {p.primary_variant?.images?.[0]?.url ? (
                        <img src={p.primary_variant.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-gray-400">{p.product_code}</span>
                        {p.brand_name && <span className="text-xs text-gray-400">· {p.brand_name}</span>}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Vendor */}
                <td className="px-4 py-3">
                  {p.primary_vendor?.company_name ? (
                    <div>
                      <p className="text-sm text-gray-700 font-medium">{p.primary_vendor.company_name}</p>
                      {p.primary_vendor.city && <p className="text-xs text-gray-400">{p.primary_vendor.city}</p>}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {p.category?.name || getCategoryName(p.category_id)}
                  </span>
                </td>

                {/* Pricing */}
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 w-14">MRP</span>
                      <span className="text-sm font-bold text-red-600">₹{p.mrp?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 w-14">Wholesale</span>
                      <span className="text-xs font-semibold text-green-600">₹{p.wholesale_price?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 w-14">Retail</span>
                      <span className="text-xs font-semibold text-blue-600">₹{p.retail_price?.toLocaleString()}</span>
                    </div>
                  </div>
                </td>

                {/* Variants */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                      p.variant_count > 1 ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      <Layers size={10} />
                      {p.variant_count || 1} variant{p.variant_count !== 1 ? "s" : ""}
                    </span>
                    {p.primary_variant?.system_barcode && (
                      <span className="text-xs font-mono text-gray-400">{p.primary_variant.system_barcode}</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge isActive={p.is_active} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {can("productMs.read") && (
                  <button
                    onClick={() => dispatch(openViewModal(p))}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                )}
                    {can("productMs.edit") && (
                      <button
                        onClick={() => dispatch(openEditForm(p))}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {/* Archive button replaces Deactivate */}
                     {can("productMs.archive") && (
                        <button
                          onClick={() => handleArchive(p.product_id, p.name)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors disabled:opacity-40"
                        >
                          Archive
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
        <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {meta.totalPages}</span>
            <button onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={currentPage === meta.totalPages} className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedProductIds.length}
          selectedProductIds={selectedProductIds}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Modals */}
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
        onClose={() => {
          setShowBulkUpload(false);
          refetch();
        }}
      />

      {showCategoryModal && (                 
        <CategoriesTab onClose={() => setShowCategoryModal(false)} />
      )}

    </div>
  );
}