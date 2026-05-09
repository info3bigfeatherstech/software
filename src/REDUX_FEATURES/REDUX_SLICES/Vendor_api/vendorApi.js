// features/vendors/vendorApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

// Custom baseQuery using your existing AxiosInstance
const axiosBaseQuery = () => async ({ url, method, data, params }) => {
  try {
    const result = await AxiosInstance({
      url: url,
      method: method,
      data: data,
      params: params,
    });
    
    // Your backend returns { success, message, data, meta }
    // RTK Query expects the actual data in the response
    return { data: result.data };
  } catch (axiosError) {
    return {
      error: {
        status: axiosError.response?.status || 500,
        data: axiosError.response?.data || { message: axiosError.message || "Request failed" },
      },
    };
  }
};

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Vendor'],
  endpoints: (builder) => ({
    // Get all vendors with pagination, search, filters
    getVendors: builder.query({
      query: ({ page = 1, limit = 10, search = '', business_type = '', city = '', is_active = '' }) => {
        const params = {};
        params.page = page;
        params.limit = limit;
        if (search) params.search = search;
        if (business_type) params.business_type = business_type;
        if (city) params.city = city;
        if (is_active !== '') params.is_active = is_active;
        
        return {
          url: "/vendors",
          method: "GET",
          params: params,
        };
      },
      providesTags: (result) => {
        if (result?.data?.vendors) {
          return [
            ...result.data.vendors.map(({ vendor_id }) => ({ type: 'Vendor', id: vendor_id })),
            { type: 'Vendor', id: 'LIST' }
          ];
        }
        return [{ type: 'Vendor', id: 'LIST' }];
      },
      transformResponse: (response) => {
        // Your backend returns: { success, message, data, meta }
        return {
          vendors: response.data || [],
          meta: response.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
        };
      },
    }),

    // Get single vendor by ID
    getVendorById: builder.query({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}`,
        method: "GET",
      }),
      providesTags: (result, error, vendorId) => [{ type: 'Vendor', id: vendorId }],
      transformResponse: (response) => response.data,
    }),

    // Create new vendor
    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: "/vendors",
        method: "POST",
        data: vendorData,
      }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    // Update vendor
    updateVendor: builder.mutation({
      query: ({ vendorId, ...vendorData }) => ({
        url: `/vendors/${vendorId}`,
        method: "PUT",
        data: vendorData,
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        { type: 'Vendor', id: 'LIST' }
      ],
      transformResponse: (response) => response.data,
    }),

    // Delete/Deactivate vendor
    deleteVendor: builder.mutation({
      query: (vendorId) => ({
        url: `/vendors/${vendorId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, vendorId) => [
        { type: 'Vendor', id: vendorId },
        { type: 'Vendor', id: 'LIST' }
      ],
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;