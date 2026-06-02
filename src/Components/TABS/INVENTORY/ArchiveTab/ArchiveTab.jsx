import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Package, Eye, RotateCcw, Trash2, AlertTriangle, X, Square, CheckSquare } from "lucide-react";
import {
  useGetInactiveProductsQuery,
  useBulkRestoreProductsMutation,
  useHardDeleteProductsByDateMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
import {
  openViewModal,
  closeViewModal,
  setSearch,
  setCurrentPage,
  setPageSize,
  resetFilters,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";
import ProductView from "../ProductShared/ProductView";
import { can, CURRENT_USER } from "../../../roles";

export default function ArchiveTab() {
  const dispatch = useDispatch();
  const {
    showViewModal,
    selectedProduct,
    search,
    currentPage,
    pageSize,
  } = useSelector((state) => state.product);

  const warehouseId = CURRENT_USER.role === "SUPER_ADMIN" ? "" : CURRENT_USER.locationId || "";
  const [showPermanentModal, setShowPermanentModal] = useState(false);
  const [dateToDelete, setDateToDelete] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Fetch all products
  const { data, isLoading, isFetching, refetch } = useGetInactiveProductsQuery({
    page: currentPage,
    limit: pageSize,
    search,
    warehouse_id: warehouseId,
  });



  const [bulkRestore, { isLoading: isRestoring }] = useBulkRestoreProductsMutation();
  const [hardDeleteByDate, { isLoading: isDeleting }] = useHardDeleteProductsByDateMutation();

  // Filter to show ONLY archived products (deleted_at exists)
  // No filtering needed
  const products = data?.products || [];
  const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const allSelectedOnPage = products.length > 0 && products.every(p => selectedProductIds.includes(p.product_id));
  const someSelected = products.some(p => selectedProductIds.includes(p.product_id));

  const toggleSelectProduct = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.product_id));
    }
  };

  const handleSingleRestore = async (productId) => {
    if (!window.confirm("Restore this product from archive?")) return;
    try {
      await bulkRestore([productId]).unwrap();
      toast.success("Product restored successfully");
      refetch();
      setSelectedProductIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to restore product");
    }
  };

  const handleBulkRestore = async () => {
    if (selectedProductIds.length === 0) {
      toast.warning("No products selected");
      return;
    }

    if (!window.confirm(`Restore ${selectedProductIds.length} product(s) from archive?`)) return;

    try {
      await bulkRestore(selectedProductIds).unwrap();
      toast.success(`${selectedProductIds.length} product(s) restored successfully`);
      refetch();
      setSelectedProductIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to restore products");
    }
  };

  const handlePermanentDeleteByDate = async () => {
    if (!dateToDelete) {
      toast.warning("Please select a date");
      return;
    }

    if (!window.confirm(`Permanently delete ALL products archived before ${dateToDelete}? This cannot be undone!`)) {
      return;
    }

    try {
      const result = await hardDeleteByDate({ date: dateToDelete }).unwrap();
      toast.success(`${result.deleted} product(s) permanently deleted`);
      setShowPermanentModal(false);
      setDateToDelete("");
      refetch();
      setSelectedProductIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete products");
    }
  };

  const clearSelection = () => {
    setSelectedProductIds([]);
  };


  return (
    <div className="space-y-5">
      {/* Archive Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={24} className="text-red-500" />
          <div>
            <h3 className="font-semibold text-red-800">Archive Zone</h3>
            <p className="text-sm text-red-600">
              Products in archive are soft-deleted. You can restore them or permanently delete by date.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-gray-600 space-y-3">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search archived products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => {
              dispatch(resetFilters());
              dispatch(setSearch(""));
              setSelectedProductIds([]);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <X size={14} /> Clear
          </button>
        </div>

        <div className="flex justify-between items-center">
          <select
            value={pageSize}
            onChange={(e) => {
              dispatch(setPageSize(Number(e.target.value)));
              setSelectedProductIds([]);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
          </select>

          {can("product.permanent_delete") && (
            <button
              onClick={() => setShowPermanentModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={16} /> Permanent Delete by Date
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar - Shows when items selected */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 px-4 py-3 flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedProductIds.length} product{selectedProductIds.length !== 1 ? "s" : ""} selected
            </span>
            <div className="w-px h-6 bg-gray-700" />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
              >
                Bulk Actions
                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg border z-50 overflow-hidden">
                    <button onClick={handleBulkRestore} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50">
                      <RotateCcw size={16} /> Restore Selected
                    </button>

                    {/* Only show Permanent Delete for SUPER_ADMIN */}
                    {can("product.permanent_delete") && (
                      <>
                        <div className="border-t border-gray-100" />
                        <button onClick={() => { setIsDropdownOpen(false); setShowPermanentModal(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50">
                          <Trash2 size={16} /> Permanent Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <button onClick={clearSelection} className="p-1.5 hover:bg-gray-800 rounded-lg">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl text-gray-700 border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                {products.length > 0 && (
                  <button onClick={handleSelectAll} className="text-gray-700 hover:text-red-600">
                    {allSelectedOnPage ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                )}
              </th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Archived Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(isLoading || isFetching) && (
              <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
            )}

            {!isLoading && products.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">No archived products found</td></tr>
            )}

            {!isLoading && products.map((p) => (
              <tr key={p.product_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelectProduct(p.product_id)}>
                    {selectedProductIds.includes(p.product_id) ?
                      <CheckSquare size={18} className="text-red-600" /> :
                      <Square size={18} />
                    }
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.product_code}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {p.deleted_at ? new Date(p.deleted_at).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Archived
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch(openViewModal(p))}
                      className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleSingleRestore(p.product_id)}
                      disabled={isRestoring}
                      className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg"
                    >
                      <RotateCcw size={12} className="inline mr-1" /> Restore
                    </button>
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
            <button
              onClick={() => {
                dispatch(setCurrentPage(currentPage - 1));
                setSelectedProductIds([]);
              }}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">{currentPage} / {meta.totalPages}</span>
            <button
              onClick={() => {
                dispatch(setCurrentPage(currentPage + 1));
                setSelectedProductIds([]);
              }}
              disabled={currentPage === meta.totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {showPermanentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Permanent Delete Products</h3>
            <p className="text-sm text-gray-600 mb-4">
              Delete all products archived before this date. This action cannot be undone.
            </p>
            <input
              type="date"
              value={dateToDelete}
              onChange={(e) => setDateToDelete(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPermanentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDeleteByDate}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedProduct && (
        <ProductView productId={selectedProduct.product_id} onClose={() => dispatch(closeViewModal())} />
      )}
    </div>
  );
}