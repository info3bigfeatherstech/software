// REDUX_SLICES/Warehouse_api/warehouseApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const axiosBaseQuery = () => async ({ url, method, data, params }) => {
    try {
        const result = await AxiosInstance({ url, method, data, params });
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

export const warehouseApi = createApi({
    reducerPath: "warehouseApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Warehouse", "MyWarehouse"],

    endpoints: (builder) => ({

        // GET /warehouses — paginated, searchable, filterable
        getWarehouses: builder.query({
            query: ({ page = 1, limit = 10, search = "", city = "", is_active = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (city) params.city = city;
                if (is_active !== "") params.is_active = is_active;
                return { url: "/warehouses", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.warehouses) {
                    return [
                        ...result.warehouses.map(({ warehouse_id }) => ({ type: "Warehouse", id: warehouse_id })),
                        { type: "Warehouse", id: "LIST" },
                    ];
                }
                return [{ type: "Warehouse", id: "LIST" }];
            },
            transformResponse: (response) => ({
                warehouses: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
            }),
        }),

        getMyWarehouse: builder.query({
            query: () => ({ url: "/warehouses/me", method: "GET" }),
            providesTags: ["MyWarehouse"],
            transformResponse: (response) => response.data,
        }),

        updateMyWarehouse: builder.mutation({
            query: (warehouseData) => ({
                url: "/warehouses/me",
                method: "PUT",
                data: warehouseData,
            }),
            invalidatesTags: ["MyWarehouse"],
            transformResponse: (response) => response.data,
        }),

        // GET /warehouses/:warehouseId
        getWarehouseById: builder.query({
            query: (warehouseId) => ({
                url: `/warehouses/${warehouseId}`,
                method: "GET",
            }),
            providesTags: (result, error, warehouseId) => [{ type: "Warehouse", id: warehouseId }],
            transformResponse: (response) => response.data,
        }),

        // POST /warehouses
        createWarehouse: builder.mutation({
            query: (warehouseData) => ({
                url: "/warehouses",
                method: "POST",
                data: warehouseData,
            }),
            invalidatesTags: [{ type: "Warehouse", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // PUT /warehouses/:warehouseId
        updateWarehouse: builder.mutation({
            query: ({ warehouseId, ...warehouseData }) => ({
                url: `/warehouses/${warehouseId}`,
                method: "PUT",
                data: warehouseData,
            }),
            invalidatesTags: (result, error, { warehouseId }) => [
                { type: "Warehouse", id: warehouseId },
                { type: "Warehouse", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // DELETE /warehouses/:warehouseId  (soft delete → is_active: false)
        deleteWarehouse: builder.mutation({
            query: (warehouseId) => ({
                url: `/warehouses/${warehouseId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, warehouseId) => [
                { type: "Warehouse", id: warehouseId },
                { type: "Warehouse", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useGetWarehousesQuery,
    useGetMyWarehouseQuery,
    useUpdateMyWarehouseMutation,
    useGetWarehouseByIdQuery,
    useCreateWarehouseMutation,
    useUpdateWarehouseMutation,
    useDeleteWarehouseMutation,
} = warehouseApi;