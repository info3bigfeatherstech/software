// REDUX_SLICES/ShopStock_api/shopStockApi.js
//
// Shop Stock Management APIs
// Endpoints: GET /shop-stocks, GET /shop-stocks/low-stock, PATCH /shop-stocks/:variantId, PATCH /shop-stocks/bulk

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

export const shopStockApi = createApi({
    reducerPath: "shopStockApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["ShopStock", "LowStockAlerts"],

    endpoints: (builder) => ({

        // ─────────────────────────────────────────────────────────────
        // READ OPERATIONS
        // ─────────────────────────────────────────────────────────────

        // GET /shop-stocks — list shop stocks with filters
        getShopStocks: builder.query({
            query: ({
                page = 1,
                limit = 20,
                shop_id = "",
                variant_id = "",
                min_quantity = "",
                low_stock_only = false,
            }) => {
                const params = { page, limit };
                if (shop_id) params.shop_id = shop_id;
                if (variant_id) params.variant_id = variant_id;
                if (min_quantity) params.min_quantity = min_quantity;
                if (low_stock_only) params.low_stock_only = true;
                return { url: "/shop-stocks", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.stocks) {
                    return [
                        ...result.stocks.map(({ shop_stock_id }) => ({ type: "ShopStock", id: shop_stock_id })),
                        { type: "ShopStock", id: "LIST" },
                    ];
                }
                return [{ type: "ShopStock", id: "LIST" }];
            },
            transformResponse: (response) => ({
                stocks: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /shop-stocks/low-stock — get low stock alerts
        getLowStockAlerts: builder.query({
            query: ({ shop_id = "" }) => {
                const params = {};
                if (shop_id) params.shop_id = shop_id;
                return { url: "/shop-stocks/low-stock", method: "GET", params };
            },
            providesTags: ["LowStockAlerts"],
            transformResponse: (response) => response.data,
        }),

        // GET /shop-stocks/:variantId — get stock by variant
        getShopStockByVariant: builder.query({
            query: ({ variantId, shop_id = "" }) => {
                const params = {};
                if (shop_id) params.shop_id = shop_id;
                return { url: `/shop-stocks/${variantId}`, method: "GET", params };
            },
            providesTags: (result, error, { variantId }) => [{ type: "ShopStock", id: variantId }],
            transformResponse: (response) => response.data,
        }),

        // ─────────────────────────────────────────────────────────────
        // WRITE OPERATIONS
        // ─────────────────────────────────────────────────────────────

        // PATCH /shop-stocks/:variantId — update single stock (set/increment/decrement)
        updateShopStock: builder.mutation({
            query: ({ variantId, ...data }) => ({
                url: `/shop-stocks/${variantId}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: (result, error, { variantId }) => [
                { type: "ShopStock", id: variantId },
                { type: "ShopStock", id: "LIST" },
                "LowStockAlerts",
            ],
            transformResponse: (response) => response.data,
        }),

        // PATCH /shop-stocks/bulk — bulk update multiple stocks
        bulkUpdateShopStocks: builder.mutation({
            query: ({ shop_id, items }) => ({
                url: "/shop-stocks/bulk",
                method: "PATCH",
                data: { shop_id, items },
            }),
            invalidatesTags: [{ type: "ShopStock", id: "LIST" }, "LowStockAlerts"],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    // Queries
    useGetShopStocksQuery,
    useGetLowStockAlertsQuery,
    useGetShopStockByVariantQuery,
    // Mutations
    useUpdateShopStockMutation,
    useBulkUpdateShopStocksMutation,
} = shopStockApi;