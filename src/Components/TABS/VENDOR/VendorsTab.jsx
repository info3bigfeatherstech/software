// TABS/SETTINGS/VendorsTab.jsx

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  Plus,
  Filter,
  Search,
  Upload,
} from "lucide-react";

import { useGetVendorsQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";

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
  setBusinessTypeFilter,
  setCityFilter,
  setActiveFilter,
  setCurrentPage,
  setPageSize,
  resetFilters,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorSlice";

import VendorTable from "./VendorTable";
import VendorAddForm from "./VendorAddForm";
import VendorEditForm from "./VendorEditForm";
import VendorDetailsModal from "./VendorDetailsModal";

import {
  BUSINESS_TYPES,
  PAGE_SIZE_OPTIONS,
} from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorConstants";

import { can } from "../../../Components/roles";

export default function VendorsTab() {

  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);

  // REDUX STATE

  const {
    showAddForm,
    showEditForm,
    showDetailsModal,
    selectedVendor,
    formData,
    formErrors,
    search,
    businessTypeFilter,
    cityFilter,
    activeFilter,
    currentPage,
    pageSize,
  } = useSelector((state) => state.vendor);

  // API

  const {
    data: vendorsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetVendorsQuery({
    page: currentPage,
    limit: pageSize,
    search: search,
    business_type: businessTypeFilter,
    city: cityFilter,
    is_active: activeFilter,
  });

  const vendors = vendorsData?.vendors || [];
  const meta = vendorsData?.meta;

  const totalPages = meta?.totalPages || 1;
  const totalItems = meta?.total || 0;

  const uniqueCities = [
    ...new Set(
      vendors
        .map((v) => v.city)
        .filter(Boolean)
    ),
  ];

  // STATS

  const stats = {
    total: totalItems,

    active: vendors.filter(
      (v) => v.is_active === true
    ).length,

    outstanding: 0,

    totalBusiness: 0,
  };

  // HANDLERS

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

  const handleToggleActive = () => {
    refetch();
  };

  return (

    <div className=" bg-[#f4f7fb] min-h-screen font-['satoshi'] -m-4 p-7 space-y-5">

      {/* HEADER */}

      <div
        className="
          bg-white
          border
          border-[#e8edf5]
          px-6
          py-5
          flex
          items-center
          justify-between
          shadow-[0_1px_2px_rgba(16,24,40,0.04)]
        "
      >

        {/* LEFT */}

        <div>

          <h2
            className="
              text-[26px]
              font-[700]
              tracking-tight
              text-[#111827]
            "
          >
            Vendor Master
          </h2>

          <p
            className="
              text-sm
              text-slate-500
              mt-1
            "
          >
            Manage vendor profiles, GSTIN and business records
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-3">

          {can("vendor.create") && (

            <button
              onClick={() =>
                dispatch(openAddForm())
              }
              className="
                h-11
                px-5
\                bg-[#111827]
                hover:bg-black
                text-white
                text-sm
                font-[600]
                flex
                items-center
                gap-2
                transition-all
                cursor-pointer
              "
            >
              <Plus size={16} />
              Add Vendor
            </button>
          )}
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-5">

        {[
          {
            label: "TOTAL VENDORS",
            value: stats.total,
            sub: "registered vendors",
          },

          {
            label: "ACTIVE",
            value: stats.active,
            sub: "currently active",
            green: true,
          },

          {
            label: "OUTSTANDING",
            value: "₹0",
            sub: "pending payments",
            red: true,
          },

          {
            label: "TOTAL BUSINESS",
            value: "₹0",
            sub: "overall transactions",
            blue: true,
          },
        ].map((s) => (

          <div
            key={s.label}
            className="
              bg-white
              border
              border-[#e8edf5]
              p-5
              shadow-[0_1px_2px_rgba(16,24,40,0.04)]
            "
          >

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.14em]
                text-slate-400
                font-[700]
              "
            >
              {s.label}
            </p>

            <h2
              className={`
                mt-4
                text-[36px]
                leading-none
                font-[700]

                ${
                  s.green
                    ? "text-[#17C4BB]"
                    : s.red
                    ? "text-[#dc2626]"
                    : s.blue
                    ? "text-[#2563eb]"
                    : "text-[#111827]"
                }
              `}
            >
              {s.value}
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* MAIN CARD */}

      <div
        className="
          bg-white
          border
          border-[#e8edf5]
          overflow-hidden
          shadow-[0_1px_2px_rgba(16,24,40,0.04)]
        "
      >

        {/* TOP */}

        <div
          className="
            px-6
            py-5
            border-b
            border-[#eef2f7]
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h3
              className="
                text-[18px]
                font-[700]
                text-[#111827]
              "
            >
              Vendors
            </h3>

            <p
              className="
                text-sm
                text-slate-400
                mt-1
              "
            >
              {totalItems} vendor records
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* FILTER */}

            <button
              onClick={() =>
                setShowFilters(true)
              }
              className="
                h-11
                px-4
                rounded-xl
                border
                border-[#dbe3ee]
                bg-white
                hover:bg-[#f8fafc]
                text-sm
                text-slate-700
                font-[600]
                flex
                items-center
                gap-2
                transition-all
                cursor-pointer
              "
            >
              <Filter size={15} />
              Filters
            </button>

            {/* PAGE SIZE */}

            <select
              value={pageSize}
              onChange={(e) =>
                dispatch(
                  setPageSize(
                    Number(e.target.value)
                  )
                )
              }
              className="
                h-11
                px-4
                rounded-xl
                border
                border-[#dbe3ee]
                bg-white
                text-sm
                text-slate-700
                outline-none
                cursor-pointer
              "
            >
              {
                PAGE_SIZE_OPTIONS.map(size => (

                  <option
                    key={size}
                    value={size}
                  >
                    {size} / page
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="
            px-6
            py-5
            border-b
            border-[#eef2f7]
            space-y-4
          "
        >

          {/* SEARCH INPUT */}

          <div className="relative">

            <Search
              size={17}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                dispatch(
                  setSearch(e.target.value)
                )
              }
              placeholder="Search by vendor name, city, phone..."
              className="
                w-full
                h-12
                pl-12
                pr-4
                rounded-2xl
                border
                border-[#dbe3ee]
                bg-[#fbfcfe]
                text-sm
                text-slate-700
                placeholder:text-slate-400
                outline-none
                transition-all

                focus:border-[#cbd5e1]
                focus:bg-white
              "
            />
          </div>

          {/* ACTIVE FILTERS */}

          {
            (
              businessTypeFilter ||
              cityFilter ||
              activeFilter
            ) && (

              <div className="
                flex
                items-center
                gap-2
                flex-wrap
              ">

                {/* BUSINESS TYPE */}

                {
                  businessTypeFilter && (

                    <div
                      className="
                        h-9
                        px-4
                        rounded-full
                        bg-[#f3f5f9]
                        border
                        border-[#e2e8f0]
                        text-sm
                        font-[600]
                        text-slate-700
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {businessTypeFilter}

                      <button
                        onClick={() =>
                          dispatch(
                            setBusinessTypeFilter("")
                          )
                        }
                        className="
                          text-slate-400
                          hover:text-slate-700
                        "
                      >
                        ✕
                      </button>
                    </div>
                  )
                }

                {/* CITY */}

                {
                  cityFilter && (

                    <div
                      className="
                        h-9
                        px-4
                        rounded-full
                        bg-[#f3f5f9]
                        border
                        border-[#e2e8f0]
                        text-sm
                        font-[600]
                        text-slate-700
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {cityFilter}

                      <button
                        onClick={() =>
                          dispatch(
                            setCityFilter("")
                          )
                        }
                        className="
                          text-slate-400
                          hover:text-slate-700
                        "
                      >
                        ✕
                      </button>
                    </div>
                  )
                }

                {/* STATUS */}

                {
                  activeFilter && (

                    <div
                      className="
                        h-9
                        px-4
                        rounded-full
                        bg-[#f3f5f9]
                        border
                        border-[#e2e8f0]
                        text-sm
                        font-[600]
                        text-slate-700
                        flex
                        items-center
                        gap-2
                      "
                    >

                      {
                        activeFilter === "true"
                          ? "Active"
                          : "Inactive"
                      }

                      <button
                        onClick={() =>
                          dispatch(
                            setActiveFilter("")
                          )
                        }
                        className="
                          text-slate-400
                          hover:text-slate-700
                        "
                      >
                        ✕
                      </button>
                    </div>
                  )
                }

                {/* CLEAR */}

                <button
                  onClick={() =>
                    dispatch(resetFilters())
                  }
                  className="
                    text-sm
                    font-[600]
                    text-red-500
                    hover:text-red-600
                    ml-1
                  "
                >
                  Clear all
                </button>
              </div>
            )
          }
        </div>

        {/* ERROR */}

        {
          error && (

            <div
              className="
                mx-6
                mt-6
                bg-red-50
                border
                border-red-200
                rounded-2xl
                p-4
              "
            >

              <p className="text-red-600 text-sm">

                Error loading vendors:
                {" "}
                {
                  error.data?.message ||
                  "Please try again"
                }
              </p>
            </div>
          )
        }

        {/* TABLE */}

        <VendorTable
          vendors={vendors}
          onEdit={(vendor) =>
            dispatch(
              openEditForm(vendor)
            )
          }
          onView={(vendor) =>
            dispatch(
              openDetailsModal(vendor)
            )
          }
          onToggleActive={
            handleToggleActive
          }
          isLoading={
            isLoading || isFetching
          }
        />

        {/* PAGINATION */}

        {
          totalPages > 1 && (

            <div
              className="
                px-6
                py-5
                border-t
                border-[#eef2f7]
                flex
                items-center
                justify-between
              "
            >

              <div
                className="
                  text-sm
                  text-slate-500
                "
              >
                Showing
                {" "}

                {
                  ((currentPage - 1) * pageSize) + 1
                }

                {" "}to{" "}

                {
                  Math.min(
                    currentPage * pageSize,
                    totalItems
                  )
                }

                {" "}of{" "}

                {totalItems}
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    dispatch(
                      setCurrentPage(
                        currentPage - 1
                      )
                    )
                  }
                  disabled={currentPage === 1}
                  className="
                    h-10
                    px-4
                    border
                    border-[#dbe3ee]
                    rounded-xl
                    text-sm
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    hover:bg-[#f8fafc]
                  "
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    dispatch(
                      setCurrentPage(
                        currentPage + 1
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="
                    h-10
                    px-4
                    border
                    border-[#dbe3ee]
                    rounded-xl
                    text-sm
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    hover:bg-[#f8fafc]
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )
        }
      </div>

      {/* FILTER SIDEBAR */}

      {
        showFilters && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/20
              backdrop-blur-[2px]
              flex
              justify-end
            "
          >

            {/* PANEL */}

            <div
              className="
                w-[380px]
                h-full
                bg-white
                border-l
                border-[#edf1f7]
                flex
                flex-col
              "
            >

              {/* HEADER */}

              <div
                className="
                  px-6
                  py-5
                  border-b
                  border-[#eef2f7]
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                      text-[20px]
                      font-[700]
                      text-[#111827]
                    "
                  >
                    Filters
                  </h2>

                  <p
                    className="
                      text-sm
                      text-slate-400
                      mt-1
                    "
                  >
                    Refine vendor records
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowFilters(false)
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    hover:bg-[#f8fafc]
                    text-slate-500
                    transition-all
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                  "
                >
                  ✕
                </button>
              </div>

              {/* CONTENT */}

              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-6
                  py-6
                  space-y-7
                "
              >

                {/* BUSINESS TYPE */}

                <div>

                  <div className="mb-3">

                    <h3
                      className="
                        text-sm
                        font-[700]
                        text-[#111827]
                      "
                    >
                      Business Type
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-1
                      "
                    >
                      Filter vendors by category
                    </p>
                  </div>

                  <div className="
                    flex
                    flex-wrap
                    gap-2
                  ">

                    <button
                      onClick={() =>
                        dispatch(
                          setBusinessTypeFilter("")
                        )
                      }
                      className={`
                        h-10
                        px-4
                        rounded-xl
                        text-sm
                        font-[600]
                        transition-all
                        border

                        ${
                          businessTypeFilter === ""

                            ? `
                              bg-[#111827]
                              border-[#111827]
                              text-white
                            `

                            : `
                              bg-white
                              border-[#e2e8f0]
                              text-slate-600
                            `
                        }
                      `}
                    >
                      All
                    </button>

                    {
                      BUSINESS_TYPES.map(type => (

                        <button
                          key={type.value}
                          onClick={() =>
                            dispatch(
                              setBusinessTypeFilter(
                                type.value
                              )
                            )
                          }
                          className={`
                            h-10
                            px-4
                            rounded-xl
                            text-sm
                            font-[600]
                            transition-all
                            border

                            ${
                              businessTypeFilter === type.value

                                ? `
                                  bg-[#111827]
                                  border-[#111827]
                                  text-white
                                `

                                : `
                                  bg-white
                                  border-[#e2e8f0]
                                  text-slate-600
                                `
                            }
                          `}
                        >
                          {type.label}
                        </button>
                      ))
                    }
                  </div>
                </div>

                {/* STATUS */}

                <div>

                  <div className="mb-3">

                    <h3
                      className="
                        text-sm
                        font-[700]
                        text-[#111827]
                      "
                    >
                      Vendor Status
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-1
                      "
                    >
                      Filter by account status
                    </p>
                  </div>

                  <div className="space-y-2">

                    {[
                      {
                        label: "All Vendors",
                        value: "",
                      },

                      {
                        label: "Active Vendors",
                        value: "true",
                      },

                      {
                        label: "Inactive Vendors",
                        value: "false",
                      },
                    ].map((item) => (

                      <button
                        key={item.value}
                        onClick={() =>
                          dispatch(
                            setActiveFilter(
                              item.value
                            )
                          )
                        }
                        className={`
                          w-full
                          h-12
                          px-4
                          rounded-2xl
                          border
                          flex
                          items-center
                          justify-between
                          transition-all

                          ${
                            activeFilter === item.value

                              ? `
                                bg-[#111827]
                                border-[#111827]
                                text-white
                              `

                              : `
                                bg-white
                                border-[#e2e8f0]
                                text-slate-700
                              `
                          }
                        `}
                      >

                        <span
                          className="
                            text-sm
                            font-[600]
                          "
                        >
                          {item.label}
                        </span>

                        {
                          activeFilter === item.value && (

                            <div
                              className="
                                w-2
                                h-2
                                rounded-full
                                bg-white
                              "
                            />
                          )
                        }
                      </button>
                    ))}
                  </div>
                </div>

                {/* CITY */}

                <div>

                  <div className="mb-3">

                    <h3
                      className="
                        text-sm
                        font-[700]
                        text-[#111827]
                      "
                    >
                      City
                    </h3>

                    <p
                      className="
                        text-xs
                        text-slate-400
                        mt-1
                      "
                    >
                      Select vendor location
                    </p>
                  </div>

                  <div
                    className="
                      max-h-[220px]
                      overflow-y-auto
                      space-y-2
                      pr-1
                    "
                  >

                    <button
                      onClick={() =>
                        dispatch(
                          setCityFilter("")
                        )
                      }
                      className={`
                        w-full
                        h-11
                        px-4
                        rounded-xl
                        text-sm
                        font-[600]
                        flex
                        items-center
                        justify-between
                        border
                        transition-all

                        ${
                          cityFilter === ""

                            ? `
                              bg-[#111827]
                              border-[#111827]
                              text-white
                            `

                            : `
                              bg-white
                              border-[#e2e8f0]
                              text-slate-700
                            `
                        }
                      `}
                    >
                      All Cities
                    </button>

                    {
                      uniqueCities.map(city => (

                        <button
                          key={city}
                          onClick={() =>
                            dispatch(
                              setCityFilter(city)
                            )
                          }
                          className={`
                            w-full
                            h-11
                            px-4
                            rounded-xl
                            text-sm
                            font-[600]
                            flex
                            items-center
                            justify-between
                            border
                            transition-all

                            ${
                              cityFilter === city

                                ? `
                                  bg-[#111827]
                                  border-[#111827]
                                  text-white
                                `

                                : `
                                  bg-white
                                  border-[#e2e8f0]
                                  text-slate-700
                                `
                            }
                          `}
                        >
                          {city}
                        </button>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div
                className="
                  p-6
                  border-t
                  border-[#eef2f7]
                  bg-white
                  flex
                  items-center
                  gap-3
                "
              >

                <button
                  onClick={() =>
                    dispatch(resetFilters())
                  }
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    border
                    border-[#e2e8f0]
                    bg-white
                    hover:bg-[#f8fafc]
                    text-sm
                    font-[600]
                    text-slate-600
                    transition-all
                    cursor-pointer
                  "
                >
                  Reset
                </button>

                <button
                  onClick={() =>
                    setShowFilters(false)
                  }
                  className="
                    flex-1
                    h-11
                    rounded-xl
                    bg-[#111827]
                    hover:bg-black
                    text-white
                    text-sm
                    font-[600]
                    transition-all
                    cursor-pointer
                  "
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* MODALS */}

      {
        showAddForm && (

          <VendorAddForm
            formData={formData}
            setFormData={(data) =>
              dispatch(
                updateFormData(data)
              )
            }
            onSave={handleAddSuccess}
            onCancel={() =>
              dispatch(closeAddForm())
            }
            formErrors={formErrors}
            setFormErrors={(errors) =>
              dispatch(
                setFormErrors(errors)
              )
            }
          />
        )
      }

      {
        showEditForm && (

          <VendorEditForm
            formData={formData}
            setFormData={(data) =>
              dispatch(
                updateFormData(data)
              )
            }
            onSave={handleEditSuccess}
            onCancel={() =>
              dispatch(closeEditForm())
            }
            selectedVendor={selectedVendor}
            formErrors={formErrors}
            setFormErrors={(errors) =>
              dispatch(
                setFormErrors(errors)
              )
            }
          />
        )
      }

      {
        showDetailsModal && (

          <VendorDetailsModal
            vendor={selectedVendor}
            onClose={() =>
              dispatch(
                closeDetailsModal()
              )
            }
          />
        )
      }
    </div>
  );
}

// // TABS/SETTINGS/VendorsTab.jsx
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Plus, Filter, X } from "lucide-react";
// import { useGetVendorsQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
// import {
//   openAddForm,
//   closeAddForm,
//   openEditForm,
//   closeEditForm,
//   openDetailsModal,
//   closeDetailsModal,
//   updateFormData,
//   setFormErrors,
//   clearFormErrors,
//   setSearch,
//   setBusinessTypeFilter,
//   setCityFilter,
//   setActiveFilter,
//   setCurrentPage,
//   setPageSize,
//   resetFilters,
// } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorSlice";
// import VendorTable from "./VendorTable";
// import VendorAddForm from "./VendorAddForm";
// import VendorEditForm from "./VendorEditForm";
// import VendorDetailsModal from "./VendorDetailsModal";
// import { BUSINESS_TYPES, PAGE_SIZE_OPTIONS } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorConstants";
// import { can } from "../../../Components/roles";
// export default function VendorsTab() {
//   const dispatch = useDispatch();
  
//   // Redux State
//   const {
//     showAddForm,
//     showEditForm,
//     showDetailsModal,
//     selectedVendor,
//     formData,
//     formErrors,
//     search,
//     businessTypeFilter,
//     cityFilter,
//     activeFilter,
//     currentPage,
//     pageSize,
//   } = useSelector((state) => state.vendor);

//   // Fetch vendors with filters
//   const {
//     data: vendorsData,
//     isLoading,
//     isFetching,
//     error,
//     refetch,
//   } = useGetVendorsQuery({
//     page: currentPage,
//     limit: pageSize,
//     search: search,
//     business_type: businessTypeFilter,
//     city: cityFilter,
//     is_active: activeFilter,
//   });

//   const vendors = vendorsData?.vendors || [];
//   const meta = vendorsData?.meta;
//   const totalPages = meta?.totalPages || 1;
//   const totalItems = meta?.total || 0;

//   // Stats calculations
//   const stats = {
//     total: totalItems,
//     active: vendors.filter(v => v.is_active === true).length,
//     outstanding: 0, // Will come from backend if available
//     totalBusiness: 0, // Will come from backend if available
//   };

//   const handleAddSuccess = () => {
//     dispatch(closeAddForm());
//     dispatch(clearFormErrors());
//     refetch();
//   };

//   const handleEditSuccess = () => {
//     dispatch(closeEditForm());
//     dispatch(clearFormErrors());
//     refetch();
//   };

//   const handleToggleActive = () => {
//     refetch(); // Refresh the list after toggle
//   };

//   const uniqueCities = [...new Set(vendors.map(v => v.city).filter(Boolean))];

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-base font-semibold text-gray-800">Vendor Master</h2>
//           <p className="text-xs text-gray-400 mt-0.5">Manage all vendor/supplier records, GSTIN, and outstanding balances</p>
//         </div>
//        {can("vendor.create") && (
//   <button
//     onClick={() => dispatch(openAddForm())}
//     className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
//   >
//     <Plus size={16} /> Add Vendor
//   </button>
// )}
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Vendors</p>
//           <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Active</p>
//           <p className="text-2xl font-bold text-green-600">{stats.active}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Outstanding</p>
//           <p className="text-2xl font-bold text-red-600">₹0</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Business</p>
//           <p className="text-2xl font-bold text-blue-600">₹0</p>
//         </div>
//       </div>

//       {/* Search and Filters Bar */}
//       <div className="bg-white text-gray-700 rounded-xl border border-gray-200 p-4 space-y-3">
//         <div className="flex gap-3">
//           <div className="flex-1">
//             <input
//               value={search}
//               onChange={(e) => dispatch(setSearch(e.target.value))}
//               placeholder="Search by name, vendor ID, city, or phone..."
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
//             />
//           </div>
//           <button
//             onClick={() => dispatch(resetFilters())}
//             className="px-4 py-2 border border-gray-300 cursor-pointer rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
//           >
//             <X size={14} /> Clear Filters
//           </button>
//         </div>

//         <div className="flex gap-3 flex-wrap text-gray-700">
//           {/* Business Type Filter */}
//           <select
//             value={businessTypeFilter}
//             onChange={(e) => dispatch(setBusinessTypeFilter(e.target.value))}
//             className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
//           >
//             <option value="" >All Business Types</option>
//             {BUSINESS_TYPES.map(type => (
//               <option  key={type.value} value={type.value}>{type.label}</option>
//             ))}
//           </select>

//           {/* City Filter */}
//           <select
//             value={cityFilter}
//             onChange={(e) => dispatch(setCityFilter(e.target.value))}
//             className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           >
//             <option value="">All Cities</option>
//             {uniqueCities.map(city => (
//               <option key={city} value={city}>{city}</option>
//             ))}
//           </select>

//           {/* Status Filter */}
//           <select
//             value={activeFilter}
//             onChange={(e) => dispatch(setActiveFilter(e.target.value))}
//             className="px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer"
//           >
//             <option value="">All Status</option>
//             <option value="true">Active</option>
//             <option value="false">Inactive</option>
//           </select>

//           {/* Page Size Selector */}
//           <select
//             value={pageSize}
//             onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
//             className="px-3 py-2 border border-gray-300 rounded-lg text-sm ml-auto"
//           >
//             {PAGE_SIZE_OPTIONS.map(size => (
//               <option key={size} value={size}>{size} per page</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-600 text-sm">Error loading vendors: {error.data?.message || "Please try again"}</p>
//         </div>
//       )}

//       {/* Table */}
//       <VendorTable
//         vendors={vendors}
//         onEdit={(vendor) => dispatch(openEditForm(vendor))}
//         onView={(vendor) => dispatch(openDetailsModal(vendor))}
//         onToggleActive={handleToggleActive}
//         isLoading={isLoading || isFetching}
//       />

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
//           <div className="text-sm text-gray-600">
//             Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} vendors
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => dispatch(setCurrentPage(currentPage - 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//             >
//               Previous
//             </button>
//             <span className="px-3 py-1 text-sm">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => dispatch(setCurrentPage(currentPage + 1))}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Add Form Modal */}
//       {showAddForm && (
//         <VendorAddForm
//           formData={formData}
//           setFormData={(data) => dispatch(updateFormData(data))}
//           onSave={handleAddSuccess}
//           onCancel={() => dispatch(closeAddForm())}
//           formErrors={formErrors}
//           setFormErrors={(errors) => dispatch(setFormErrors(errors))}
//         />
//       )}

//       {/* Edit Form Modal */}
//       {showEditForm && (
//         <VendorEditForm
//           formData={formData}
//           setFormData={(data) => dispatch(updateFormData(data))}
//           onSave={handleEditSuccess}
//           onCancel={() => dispatch(closeEditForm())}
//           selectedVendor={selectedVendor}
//           formErrors={formErrors}
//           setFormErrors={(errors) => dispatch(setFormErrors(errors))}
//         />
//       )}

//       {/* Details Modal */}
//       {showDetailsModal && (
//         <VendorDetailsModal
//           vendor={selectedVendor}
//           onClose={() => dispatch(closeDetailsModal())}
//         />
//       )}
//     </div>
//   );
// }
// upper code have api intgration  

// // TABS/SETTINGS/VendorsTab.jsx
// import React, { useState, useEffect } from "react";
// import { Plus } from "lucide-react";
// import VendorTable from "./VendorTable";
// import VendorAddForm from "./VendorAddForm";
// import VendorEditForm from "./VendorEditForm";
// import VendorDetailsModal from "./VendorDetailsModal";

// const STORAGE_KEY = "vyapar_vendors";

// const INITIAL_VENDORS = [
//   {
//     vendor_id: "VEN-001",
//     company_name: "ABC Traders",
//     contact_person: "Rajesh Kumar",
//     phone: "9876543210",
//     whatsapp: "9876543210",
//     email: "rajesh@abctraders.com",
//     gst_number: "27AAAAA1234A1Z",
//     vendor_type: "Raw Material",
//     supply_city: "Mumbai",
//     business_type: "WHOLESALER",
//     city: "Mumbai",
//     address: "123, Market Street",
//     is_active: true,
//     remarks: "Regular supplier",
//     outstanding: 25000,
//     total_purchased: 500000,
//     created_at: "2024-01-15",
//     updated_at: "2024-01-15"
//   },
//   {
//     vendor_id: "VEN-002",
//     company_name: "XYZ Enterprises",
//     contact_person: "Priya Sharma",
//     phone: "9988776655",
//     whatsapp: "9988776655",
//     email: "priya@xyz.com",
//     gst_number: "27BBBBB5678B2Y",
//     vendor_type: "Packaging",
//     supply_city: "Delhi",
//     business_type: "DISTRIBUTOR",
//     city: "Delhi",
//     address: "456, Industrial Area",
//     is_active: true,
//     remarks: "",
//     outstanding: 0,
//     total_purchased: 350000,
//     created_at: "2024-02-20",
//     updated_at: "2024-02-20"
//   },
//   {
//     vendor_id: "VEN-003",
//     company_name: "PQR Suppliers",
//     contact_person: "Amit Verma",
//     phone: "8899776655",
//     whatsapp: "",
//     email: "amit@pqr.com",
//     gst_number: "27CCCCC9012C3X",
//     vendor_type: "Electronics",
//     supply_city: "Bangalore",
//     business_type: "RETAILER",
//     city: "Bangalore",
//     address: "789, Tech Park",
//     is_active: false,
//     remarks: "Inactive due to quality issues",
//     outstanding: 5000,
//     total_purchased: 120000,
//     created_at: "2024-03-10",
//     updated_at: "2024-03-10"
//   }
// ];

// const loadVendors = () => {
//   const stored = localStorage.getItem(STORAGE_KEY);
//   if (stored) return JSON.parse(stored);
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VENDORS));
//   return INITIAL_VENDORS;
// };

// const saveVendors = (data) => {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
// };

// const BLANK_VENDOR = {
//   company_name: "",
//   contact_person: "",
//   phone: "",
//   whatsapp: "",
//   email: "",
//   gst_number: "",
//   vendor_type: "",
//   supply_city: "",
//   business_type: "",
//   city: "",
//   address: "",
//   is_active: true,
//   remarks: ""
// };

// export default function VendorsTab() {
//   const [vendors, setVendors] = useState([]);
//   const [search, setSearch] = useState("");
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   const [formData, setFormData] = useState(BLANK_VENDOR);

//   useEffect(() => {
//     setVendors(loadVendors());
//   }, []);

//   const filteredVendors = vendors.filter(vendor => {
//     if (!search) return true;
//     const searchLower = search.toLowerCase();
//     return (
//       vendor.company_name?.toLowerCase().includes(searchLower) ||
//       vendor.phone?.includes(search) ||
//       vendor.city?.toLowerCase().includes(searchLower) ||
//       vendor.vendor_id?.toLowerCase().includes(searchLower)
//     );
//   });

//   const stats = {
//     total: vendors.length,
//     active: vendors.filter(v => v.is_active === true).length,
//     outstanding: vendors.reduce((sum, v) => sum + (v.outstanding || 0), 0),
//     totalBusiness: vendors.reduce((sum, v) => sum + (v.total_purchased || 0), 0)
//   };

//   const handleAddVendor = () => {
//     if (!formData.company_name || !formData.phone) {
//       alert("Company Name and Phone are required!");
//       return;
//     }

//     const allVendors = loadVendors();
//     const phoneExists = allVendors.some(v => v.phone === formData.phone);
//     if (phoneExists) {
//       alert("Phone number already exists!");
//       return;
//     }

//     const newVendor = {
//       ...formData,
//       vendor_id: `VEN-${Date.now().toString().slice(-6)}`,
//       outstanding: 0,
//       total_purchased: 0,
//       created_at: new Date().toISOString().split("T")[0],
//       updated_at: new Date().toISOString().split("T")[0]
//     };

//     const updated = [...allVendors, newVendor];
//     saveVendors(updated);
//     setVendors(updated);
//     setShowAddForm(false);
//     setFormData(BLANK_VENDOR);
//     alert("✅ Vendor added successfully!");
//   };

//   const handleEditVendor = () => {
//     if (!formData.company_name || !formData.phone) {
//       alert("Company Name and Phone are required!");
//       return;
//     }

//     const allVendors = loadVendors();
//     const phoneExists = allVendors.some(v => v.phone === formData.phone && v.vendor_id !== selectedVendor?.vendor_id);
    
//     if (phoneExists) {
//       alert("Phone number already exists for another vendor!");
//       return;
//     }

//     const updated = allVendors.map(v => 
//       v.vendor_id === selectedVendor.vendor_id 
//         ? { ...formData, vendor_id: v.vendor_id, created_at: v.created_at, updated_at: new Date().toISOString().split("T")[0], outstanding: v.outstanding, total_purchased: v.total_purchased }
//         : v
//     );

//     saveVendors(updated);
//     setVendors(updated);
//     setShowEditForm(false);
//     setSelectedVendor(null);
//     setFormData(BLANK_VENDOR);
//     alert("✅ Vendor updated successfully!");
//   };

//   const handleToggleActive = (vendor) => {
//     const allVendors = loadVendors();
//     const updated = allVendors.map(v =>
//       v.vendor_id === vendor.vendor_id
//         ? { ...v, is_active: !v.is_active, updated_at: new Date().toISOString().split("T")[0] }
//         : v
//     );
//     saveVendors(updated);
//     setVendors(updated);
//     alert(vendor.is_active ? "Vendor deactivated" : "Vendor activated");
//   };

//   const openEditForm = (vendor) => {
//     setSelectedVendor(vendor);
//     setFormData({
//       company_name: vendor.company_name,
//       contact_person: vendor.contact_person || "",
//       phone: vendor.phone,
//       whatsapp: vendor.whatsapp || "",
//       email: vendor.email || "",
//       gst_number: vendor.gst_number || "",
//       vendor_type: vendor.vendor_type || "",
//       supply_city: vendor.supply_city || "",
//       business_type: vendor.business_type || "",
//       city: vendor.city || "",
//       address: vendor.address || "",
//       is_active: vendor.is_active,
//       remarks: vendor.remarks || ""
//     });
//     setShowEditForm(true);
//   };

//   const openDetailsModal = (vendor) => {
//     setSelectedVendor(vendor);
//     setShowDetailsModal(true);
//   };

//   return (
//     <div className="space-y-5">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-base font-semibold text-gray-800">Vendor Master</h2>
//           <p className="text-xs text-gray-400 mt-0.5">Manage all vendor/supplier records, GSTIN, and outstanding balances</p>
//         </div>
//         <button
//           onClick={() => { setShowAddForm(true); setFormData(BLANK_VENDOR); }}
//           className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-2"
//         >
//           <Plus size={16} /> Add Vendor
//         </button>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-4 gap-4">
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Vendors</p>
//           <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Active</p>
//           <p className="text-2xl font-bold text-green-600">{stats.active}</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Outstanding</p>
//           <p className="text-2xl font-bold text-red-600">₹{(stats.outstanding / 1000).toFixed(0)}K</p>
//         </div>
//         <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//           <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Business</p>
//           <p className="text-2xl font-bold text-blue-600">₹{(stats.totalBusiness / 100000).toFixed(1)}L</p>
//         </div>
//       </div>

//       {/* Search */}
//       <input
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         placeholder="Search vendors by name, vendor ID, city, or phone..."
//         className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
//       />

//       {/* Table */}
//       <VendorTable
//         vendors={filteredVendors}
//         onEdit={openEditForm}
//         onView={openDetailsModal}
//         onToggleActive={handleToggleActive}
//       />

//       {/* Add Form Modal */}
//       {showAddForm && (
//         <VendorAddForm
//           formData={formData}
//           setFormData={setFormData}
//           onSave={handleAddVendor}
//           onCancel={() => { setShowAddForm(false); setFormData(BLANK_VENDOR); }}
//         />
//       )}

//       {/* Edit Form Modal */}
//       {showEditForm && (
//         <VendorEditForm
//           formData={formData}
//           setFormData={setFormData}
//           onSave={handleEditVendor}
//           onCancel={() => { setShowEditForm(false); setSelectedVendor(null); setFormData(BLANK_VENDOR); }}
//         />
//       )}

//       {/* Details Modal */}
//       {showDetailsModal && (
//         <VendorDetailsModal
//           vendor={selectedVendor}
//           onClose={() => { setShowDetailsModal(false); setSelectedVendor(null); }}
//         />
//       )}
//     </div>
//   );
// }
// we need to match with backend schmema plus we start making components independent  
// // TABS/SETTINGS/VendorsTab.jsx
// // Full vendor master CRUD with outstanding balances and purchase history
// import React, { useState, useEffect } from "react";
// import { INITIAL_VENDORS } from "../../demoData";

// const SK = "vyapar_vendors";
// const load = () => { const s = localStorage.getItem(SK); if (s) return JSON.parse(s); localStorage.setItem(SK, JSON.stringify(INITIAL_VENDORS)); return INITIAL_VENDORS; };
// const save = (d) => localStorage.setItem(SK, JSON.stringify(d));

// const BLANK = { name: "", phone: "", email: "", city: "", address: "", gstin: "", contactPerson: "", creditDays: "30", isActive: true };

// export default function VendorsTab() {
//     const [vendors, setVendors] = useState([]);
//     const [selected, setSelected] = useState(null);
//     const [showForm, setShowForm] = useState(false);
//     const [form, setForm] = useState(BLANK);
//     const [editingId, setEditingId] = useState(null);
//     const [search, setSearch] = useState("");

//     useEffect(() => setVendors(load()), []);

//     const filtered = vendors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.city?.toLowerCase().includes(search.toLowerCase()) || v.phone?.includes(search));

//     const saveVendor = () => {
//         if (!form.name || !form.phone) { alert("Name and phone required."); return; }
//         const all = load();
//         if (editingId) {
//             const updated = all.map(v => v.id === editingId ? { ...v, ...form } : v);
//             save(updated);
//             setVendors(updated);
//         } else {
//             const newV = { id: `VEN-${Date.now().toString().slice(-6)}`, ...form, outstanding: 0, totalPurchased: 0, createdAt: new Date().toISOString().split("T")[0] };
//             save([...all, newV]);
//             setVendors(prev => [...prev, newV]);
//         }
//         setForm(BLANK); setEditingId(null); setShowForm(false);
//         alert(editingId ? "✅ Vendor updated!" : "✅ Vendor added!");
//     };

//     const startEdit = (v) => {
//         setForm({ name: v.name, phone: v.phone, email: v.email || "", city: v.city || "", address: v.address || "", gstin: v.gst || v.gstin || "", contactPerson: v.contactPerson || "", creditDays: v.creditDays || "30", isActive: v.isActive !== false });
//         setEditingId(v.id);
//         setShowForm(true);
//         setSelected(null);
//     };

//     const toggleActive = (id) => {
//         const all = load();
//         const updated = all.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
//         save(updated);
//         setVendors(updated);
//         if (selected?.id === id) setSelected(updated.find(v => v.id === id));
//     };

//     const stats = {
//         total: vendors.length,
//         active: vendors.filter(v => v.isActive !== false).length,
//         outstanding: vendors.reduce((s, v) => s + (v.outstanding || 0), 0),
//         totalBusiness: vendors.reduce((s, v) => s + (v.totalPurchased || 0), 0),
//     };

//     return (
//         <div className="space-y-5">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h2 className="text-base font-semibold text-gray-800">Vendor Master</h2>
//                     <p className="text-xs text-gray-400 mt-0.5">Manage all vendor/supplier records, GSTIN, and outstanding balances</p>
//                 </div>
//                 <button onClick={() => { setForm(BLANK); setEditingId(null); setShowForm(v => !v); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">+ Add Vendor</button>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-4 gap-4">
//                 {[
//                     { l: "Total Vendors", v: stats.total, c: "text-gray-800" },
//                     { l: "Active", v: stats.active, c: "text-green-600" },
//                     { l: "Total Outstanding", v: `₹${(stats.outstanding / 1000).toFixed(0)}K`, c: "text-red-600" },
//                     { l: "Total Business", v: `₹${(stats.totalBusiness / 100000).toFixed(1)}L`, c: "text-blue-600" },
//                 ].map(s => (
//                     <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.l}</p>
//                         <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
//                     </div>
//                 ))}
//             </div>

//             {showForm && (
//                 <div className="bg-white text-gray-700 border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
//                     <p className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{editingId ? "Edit Vendor" : "Add New Vendor"}</p>
//                     <div className="grid grid-cols-2 gap-4">
//                         {[
//                             { k: "name", l: "Vendor / Company Name *" },
//                             { k: "phone", l: "Phone *" },
//                             { k: "email", l: "Email" },
//                             { k: "city", l: "City" },
//                             { k: "address", l: "Address" },
//                             { k: "gstin", l: "GSTIN" },
//                             { k: "contactPerson", l: "Contact Person" },
//                             { k: "creditDays", l: "Credit Days" },
//                         ].map(f => (
//                             <div key={f.k}>
//                                 <label className="block text-xs text-gray-500 mb-1">{f.l}</label>
//                                 <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
//                             </div>
//                         ))}
//                     </div>
//                     <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//                         <button onClick={() => { setShowForm(false); setForm(BLANK); setEditingId(null); }} className="px-4 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">Cancel</button>
//                         <button onClick={saveVendor} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">{editingId ? "Update Vendor" : "Add Vendor"}</button>
//                     </div>
//                 </div>
//             )}

//             <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors by name, city, or phone..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />

//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50"><tr>
//                         {["Vendor", "Contact", "City", "GSTIN", "Outstanding", "Credit Days", "Status", "Actions"].map(h => (
//                             <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                         ))}
//                     </tr></thead>
//                     <tbody className="divide-y divide-gray-100">
//                         {filtered.length === 0
//                             ? <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No vendors found</td></tr>
//                             : filtered.map(v => (
//                                 <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${v.isActive === false ? "opacity-60" : ""}`}>
//                                     <td className="px-4 py-3">
//                                         <p className="font-medium text-gray-800">{v.name}</p>
//                                         <p className="text-xs text-gray-400">{v.contactPerson || "—"}</p>
//                                     </td>
//                                     <td className="px-4 py-3 text-xs">
//                                         <p className="text-gray-600">{v.phone}</p>
//                                         <p className="text-gray-400">{v.email || "—"}</p>
//                                     </td>
//                                     <td className="px-4 py-3 text-gray-600">{v.city || "—"}</td>
//                                     <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.gst || v.gstin || "—"}</td>
//                                     <td className="px-4 py-3">
//                                         {(v.outstanding || 0) > 0
//                                             ? <span className="text-red-600 font-medium">₹{v.outstanding?.toLocaleString()}</span>
//                                             : <span className="text-green-600 text-xs font-medium">Cleared</span>}
//                                     </td>
//                                     <td className="px-4 py-3 text-gray-500 text-xs">{v.creditDays || 30} days</td>
//                                     <td className="px-4 py-3">
//                                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
//                                             {v.isActive !== false ? "Active" : "Inactive"}
//                                         </span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex gap-2">
//                                             <button onClick={() => startEdit(v)} className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium">Edit</button>
//                                             <button onClick={() => toggleActive(v.id)} className={`text-xs cursor-pointer font-medium ${v.isActive !== false ? "text-red-500 hover:text-red-700" : "text-green-600 hover:text-green-800"}`}>
//                                                 {v.isActive !== false ? "Deactivate" : "Activate"}
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }
