// REDUX_SLICES/Transfer_api/transferApi.js
//
// Stock Ledger APIs
// All endpoints from backend docs

import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const axiosBaseQuery = () => async ({ url, method, data, params, headers }) => {
    try {
        const result = await AxiosInstance({ url, method, data, params, headers });
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

// Generate unique idempotency key for transfer requests
export const generateIdempotencyKey = () => {
    return `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export const transferApi = createApi({
    reducerPath: "transferApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Transfer", "StockLedger", "ProductStock"],

    endpoints: (builder) => ({

      



        // POST /stock/transfer/reconcile (SUPER_ADMIN only)
        reconcileStock: builder.mutation({
            query: ({ idempotencyKey, ...data }) => ({
                url: "/stock/transfer/reconcile",
                method: "POST",
                data,
                headers: {
                    "Idempotency-Key": idempotencyKey,
                },
            }),
            invalidatesTags: ["Transfer", "StockLedger", "ProductStock"],
            transformResponse: (response) => response.data,
        }),

        // ─────────────────────────────────────────────────────────────
        // STOCK LEDGER QUERIES (read-only audit trail)
        // ─────────────────────────────────────────────────────────────

        // GET /stock/ledger — list all ledger entries
        getStockLedger: builder.query({
            query: ({
                page = 1,
                limit = 20,
                movement_type = "",
                variant_id = "",
                product_id = "",
                reference_id = "",
                from_date = "",
                to_date = "",
            }) => {
                const params = { page, limit };
                if (movement_type) params.movement_type = movement_type;
                if (variant_id) params.variant_id = variant_id;
                if (product_id) params.product_id = product_id;
                if (reference_id) params.reference_id = reference_id;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/stock/ledger", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.data) {
                    return [
                        ...result.data.map(({ ledger_id }) => ({ type: "StockLedger", id: ledger_id })),
                        { type: "StockLedger", id: "LIST" },
                    ];
                }
                return [{ type: "StockLedger", id: "LIST" }];
            },
            transformResponse: (response) => ({
                ledger: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /stock/ledger/variant/:variantId
        getVariantLedger: builder.query({
            query: ({ variantId, page = 1, limit = 20, from_date = "", to_date = "" }) => {
                const params = { page, limit };
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: `/stock/ledger/variant/${variantId}`, method: "GET", params };
            },
            providesTags: (result, error, { variantId }) => [
                { type: "StockLedger", id: variantId },
            ],
            transformResponse: (response) => ({
                ledger: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /stock/ledger/warehouse/:warehouseId
        getWarehouseLedger: builder.query({
            query: ({ warehouseId, page = 1, limit = 20, from_date = "", to_date = "" }) => {
                const params = { page, limit };
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: `/stock/ledger/warehouse/${warehouseId}`, method: "GET", params };
            },
            providesTags: (result, error, { warehouseId }) => [
                { type: "StockLedger", id: warehouseId },
            ],
            transformResponse: (response) => ({
                ledger: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /stock/ledger/shop/:shopId
        getShopLedger: builder.query({
            query: ({ shopId, page = 1, limit = 20, from_date = "", to_date = "" }) => {
                const params = { page, limit };
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: `/stock/ledger/shop/${shopId}`, method: "GET", params };
            },
            providesTags: (result, error, { shopId }) => [
                { type: "StockLedger", id: shopId },
            ],
            transformResponse: (response) => ({
                ledger: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

    }),
});

export const {
    // Mutations
    useReconcileStockMutation,
    // Queries
    useGetStockLedgerQuery,
    useGetVariantLedgerQuery,
    useGetWarehouseLedgerQuery,
    useGetShopLedgerQuery,
} = transferApi;