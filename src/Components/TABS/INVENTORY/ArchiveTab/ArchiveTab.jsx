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
    <div className="space-y-5 ">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="
      bg-white
      border
      px-5
      py-5
    ">

        <div className="
        flex
        items-start
        justify-between
        gap-4
      ">

          {/* LEFT */}

          <div className="
          flex
          items-start
          gap-4
        ">

            <div className="
            w-12
            h-12
            rounded-xl
            border
            flex
            items-center
            justify-center
            shrink-0
          ">

              <AlertTriangle
                size={20}
                className="text-red-500"
              />
            </div>

            <div>

              <h2 className="
              text-[20px]
              font-[700]
              text-[#111827]
            ">
                Archive Products
              </h2>

              <p className="
              mt-1
              text-sm
              text-slate-500
              max-w-[650px]
            ">
                Archived products can be restored anytime or permanently deleted.
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="
          hidden
          md:flex
          items-center
          gap-3
        ">

            <div className="
            px-4
            py-2
            border
            bg-red-50
          ">

              <p className="
              text-[11px]
              uppercase
              tracking-[0.12em]
              text-red-400
              font-[700]
            ">
                Total Archived
              </p>

              <h3 className="
              mt-1
              text-lg
              font-[700]
              text-[#111827]
            ">
                {meta.total}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="
      bg-white
      border
      p-4
    ">

        <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        gap-3
      ">

          {/* SEARCH */}

          <input
            value={search}
            onChange={(e) =>
              dispatch(setSearch(e.target.value))
            }
            placeholder="Search archived products..."
            className="
            flex-1
            h-11
            rounded-xl
            border
            bg-white
            px-4
            text-sm
            text-[#111827]
            placeholder:text-slate-400
            outline-none
          "
          />

          {/* PAGE SIZE */}

          <select
            value={pageSize}
            onChange={(e) => {
              dispatch(setPageSize(Number(e.target.value)));
              setSelectedProductIds([]);
            }}
            className="
            h-11
            rounded-xl
            border
            bg-white
            px-4
            text-sm
            text-slate-600
            outline-none
          "
          >
            {[10, 20, 50].map((s) => (
              <option
                key={s}
                value={s}
              >
                {s} per page
              </option>
            ))}
          </select>

          {/* CLEAR */}

          <button
            onClick={() => {
              dispatch(resetFilters());
              dispatch(setSearch(""));
              setSelectedProductIds([]);
            }}
            className="
            h-11
            px-4
            rounded-xl
            border
            bg-white
            hover:bg-red-50
            text-sm
            font-[600]
            text-slate-700
            transition-all
            flex
            items-center
            gap-2
          "
          >
            <X size={14} />
            Clear
          </button>

          {/* DELETE */}

          {can("product.permanent_delete") && (

            <button
              onClick={() =>
                setShowPermanentModal(true)
              }
              className="
              h-11
              px-4
              bg-red-500
              hover:bg-red-600
              text-white
              text-sm
              font-[600]
              transition-all
              flex
              items-center
              gap-2
            "
            >
              <Trash2 size={15} />
              Permanent Delete
            </button>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="
      overflow-hidden
      border
      bg-white
    ">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* ====================================================== */}
            {/* HEAD */}
            {/* ====================================================== */}

            <thead className="
            border-b
            bg-red-50/50
          ">

              <tr>

                <th className="
                px-5
                py-4
                w-12
              ">

                  {products.length > 0 && (

                    <button
                      onClick={handleSelectAll}
                      className="
                      text-slate-400
                      hover:text-red-500
                    "
                    >
                      {
                        allSelectedOnPage

                          ? <CheckSquare size={18} />

                          : <Square size={18} />
                      }
                    </button>
                  )}
                </th>

                {[
                  "Product",
                  "Archived Date",
                  "Status",
                  "Actions",
                ].map((h) => (

                  <th
                    key={h}
                    className="
                    px-5
                    py-4
                    text-left
                    text-[11px]
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                    font-[700]
                  "
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ====================================================== */}
            {/* BODY */}
            {/* ====================================================== */}

            <tbody className="
            divide-y
            divide-red-50
          ">

              {!isLoading && products.map((p) => (

                <tr
                  key={p.product_id}
                  className="
                  hover:bg-red-50/40
                  transition-all
                "
                >

                  {/* CHECKBOX */}

                  <td className="
                  px-5
                  py-4
                ">

                    <button
                      onClick={() =>
                        toggleSelectProduct(
                          p.product_id
                        )
                      }
                      className="
                      text-slate-400
                      hover:text-red-500
                    "
                    >

                      {
                        selectedProductIds.includes(
                          p.product_id
                        )

                          ? (
                            <CheckSquare
                              size={18}
                              className="text-red-500"
                            />
                          )

                          : (
                            <Square size={18} />
                          )
                      }
                    </button>
                  </td>

                  {/* PRODUCT */}

                  <td className="
                  px-5
                  py-4
                ">

                    <div>

                      <p className="
                      font-[600]
                      text-[#111827]
                    ">
                        {p.name}
                      </p>

                      <p className="
                      mt-1
                      text-xs
                      text-slate-500
                    ">
                        {p.product_code}
                      </p>
                    </div>
                  </td>

                  {/* DATE */}

                  <td className="
                  px-5
                  py-4
                  text-sm
                  text-slate-500
                ">
                    {
                      p.deleted_at
                        ? new Date(
                          p.deleted_at
                        ).toLocaleDateString()
                        : "-"
                    }
                  </td>

                  {/* STATUS */}

                  <td className="
                  px-5
                  py-4
                ">

                    <span className="
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    rounded-full
                    text-xs
                    font-[700]
                    bg-red-50
                    border
                    text-red-500
                  ">

                      <span className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-red-500
                    " />

                      Archived
                    </span>
                  </td>

                  {/* ACTIONS */}

                  <td className="
                  px-5
                  py-4
                ">

                    <div className="
                    flex
                    items-center
                    gap-2
                  ">

                      {/* VIEW */}

                      <button
                        onClick={() =>
                          dispatch(
                            openViewModal(p)
                          )
                        }
                        className="
                        w-10
                        h-10
                        rounded-xl
                        border
                        bg-white
                        hover:bg-red-50
                        text-slate-500
                        hover:text-red-500
                        transition-all
                        flex
                        items-center
                        justify-center
                      "
                      >
                        <Eye size={16} />
                      </button>

                      {/* RESTORE */}

                      <button
                        onClick={() =>
                          handleSingleRestore(
                            p.product_id
                          )
                        }
                        disabled={isRestoring}
                        className="
                        h-10
                        px-4
                        rounded-xl
                        border
                        bg-white
                        hover:bg-red-50
                        text-red-500
                        text-sm
                        font-[600]
                        transition-all
                        flex
                        items-center
                        gap-2
                      "
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}