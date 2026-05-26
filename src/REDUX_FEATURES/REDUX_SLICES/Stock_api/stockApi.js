// REDUX_SLICES/Stock_api/stockApi.js
//
// RTK Query for product-stocks endpoint
// Supports: READ, CREATE, UPDATE, DELETE, BULK operations
// Stock ledger entries are auto-created by backend on quantity changes

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

export const stockApi = createApi({
    reducerPath: "stockApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Stock", "StockList"],

    endpoints: (builder) => ({

        // ─────────────────────────────────────────────────────────────
        // READ OPERATIONS
        // ─────────────────────────────────────────────────────────────

        // GET /product-stocks — list stock records with filters
        getProductStocks: builder.query({
            query: ({
                page = 1,
                limit = 20,
                search = "",
                warehouse_id = "",
                variant_id = "",
                product_id = "",
                batch_number = "",
            }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                if (variant_id) params.variant_id = variant_id;
                if (product_id) params.product_id = product_id;
                if (batch_number) params.batch_number = batch_number;
                return { url: "/product-stocks", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.stocks) {
                    return [
                        ...result.stocks.map(({ stock_id }) => ({ type: "Stock", id: stock_id })),
                        { type: "StockList", id: "LIST" },
                    ];
                }
                return [{ type: "StockList", id: "LIST" }];
            },
            transformResponse: (response) => ({
                stocks: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /product-stocks/:stockId — get single stock record
        getStockById: builder.query({
            query: (stockId) => ({
                url: `/product-stocks/${stockId}`,
                method: "GET",
            }),
            providesTags: (result, error, stockId) => [{ type: "Stock", id: stockId }],
            transformResponse: (response) => response.data,
        }),

        // GET all stocks for stats (unpaginated)
        getAllProductStocks: builder.query({
            query: ({ warehouse_id = "" }) => {
                const params = { page: 1, limit: 10 };
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/product-stocks", method: "GET", params };
            },
            transformResponse: (response) => response.data || [],
        }),

        // ─────────────────────────────────────────────────────────────
        // WRITE OPERATIONS - SINGLE
        // ─────────────────────────────────────────────────────────────

        // POST /product-stocks — manual stock creation
        createStock: builder.mutation({
            query: (stockData) => ({
                url: "/product-stocks",
                method: "POST",
                data: stockData,
            }),
            invalidatesTags: [{ type: "StockList", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // PUT /product-stocks/:stockId — full update
        updateStock: builder.mutation({
            query: ({ stockId, ...stockData }) => ({
                url: `/product-stocks/${stockId}`,
                method: "PUT",
                data: stockData,
            }),
            invalidatesTags: (result, error, { stockId }) => [
                { type: "Stock", id: stockId },
                { type: "StockList", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // PUT /product-stocks/:stockId — partial update (preferred)
        patchStock: builder.mutation({
            query: ({ stockId, ...stockData }) => ({
                url: `/product-stocks/${stockId}`,
                method: "PUT",
                data: stockData,
            }),
            invalidatesTags: (result, error, { stockId }) => [
                { type: "Stock", id: stockId },
                { type: "StockList", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // DELETE /product-stocks/:stockId — hard delete
        deleteStock: builder.mutation({
            query: (stockId) => ({
                url: `/product-stocks/${stockId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, stockId) => [
                { type: "Stock", id: stockId },
                { type: "StockList", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // ─────────────────────────────────────────────────────────────
        // BULK OPERATIONS
        // ─────────────────────────────────────────────────────────────

        // PATCH /product-stocks/bulk — bulk update (location, threshold, etc.)
        bulkUpdateStocks: builder.mutation({
            query: ({ items }) => ({
                url: "/product-stocks/bulk",
                method: "PATCH",
                data: { items },
            }),
            invalidatesTags: [{ type: "StockList", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // DELETE /product-stocks/bulk — bulk hard delete
        bulkDeleteStocks: builder.mutation({
            query: ({ stock_ids }) => ({
                url: "/product-stocks/bulk",
                method: "DELETE",
                data: { stock_ids },
            }),
            invalidatesTags: [{ type: "StockList", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // POST /product-stocks/bulk/csv — bulk CSV import
        bulkImportStocks: builder.mutation({
            query: ({ formData, warehouse_id }) => {
                const params = warehouse_id ? { warehouse_id } : {};
                return {
                    url: "/product-stocks/bulk/csv",
                    method: "POST",
                    data: formData,
                    params,
                    headers: { "Content-Type": "multipart/form-data" },
                };
            },
            invalidatesTags: [{ type: "StockList", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

    }),
});

// Export all hooks
export const {
    // Queries
    useGetProductStocksQuery,
    useGetStockByIdQuery,
    useGetAllProductStocksQuery,
    // Mutations - Single
    useCreateStockMutation,
    useUpdateStockMutation,
    usePatchStockMutation,
    useDeleteStockMutation,
    // Mutations - Bulk
    useBulkUpdateStocksMutation,
    useBulkDeleteStocksMutation,
    useBulkImportStocksMutation,
} = stockApi;