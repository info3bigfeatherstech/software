// REDUX_SLICES/Shop_api/shopApi.js
//
// Complete Shop CRUD with RTK Query
// Endpoints: GET /shops, GET /shops/:id, GET /shops/me, POST /shops, PUT /shops/:id, DELETE /shops/:id

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

export const shopApi = createApi({
    reducerPath: "shopApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Shop", "MyShop"],

    endpoints: (builder) => ({

        // ── GET /shops ──────────────────────────────────────────────────────────
        getShops: builder.query({
            query: ({ page = 1, limit = 20, search = "", city = "", is_active = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (city) params.city = city;
                if (is_active !== "") params.is_active = is_active;
                return { url: "/shops", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.shops) {
                    return [
                        ...result.shops.map(({ shop_id }) => ({ type: "Shop", id: shop_id })),
                        { type: "Shop", id: "LIST" },
                    ];
                }
                return [{ type: "Shop", id: "LIST" }];
            },
            transformResponse: (response) => ({
                shops: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // ── GET /shops/:shopId ──────────────────────────────────────────────────
        getShopById: builder.query({
            query: (shopId) => ({ url: `/shops/${shopId}`, method: "GET" }),
            providesTags: (result, error, shopId) => [{ type: "Shop", id: shopId }],
            transformResponse: (response) => response.data,
        }),

        // ── GET /shops/me ───────────────────────────────────────────────────────
        getMyShop: builder.query({
            query: () => ({ url: "/shops/me", method: "GET" }),
            providesTags: ["MyShop"],
            transformResponse: (response) => response.data,
        }),

        // ── POST /shops ─────────────────────────────────────────────────────────
        createShop: builder.mutation({
            query: (shopData) => ({
                url: "/shops",
                method: "POST",
                data: shopData,
            }),
            invalidatesTags: [{ type: "Shop", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // ── PUT /shops/:shopId ──────────────────────────────────────────────────
        updateShop: builder.mutation({
            query: ({ shopId, ...shopData }) => ({
                url: `/shops/${shopId}`,
                method: "PUT",
                data: shopData,
            }),
            invalidatesTags: (result, error, { shopId }) => [
                { type: "Shop", id: shopId },
                { type: "Shop", id: "LIST" },
                "MyShop",
            ],
            transformResponse: (response) => response.data,
        }),

        // ── DELETE /shops/:shopId ───────────────────────────────────────────────
        deleteShop: builder.mutation({
            query: (shopId) => ({
                url: `/shops/${shopId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, shopId) => [
                { type: "Shop", id: shopId },
                { type: "Shop", id: "LIST" },
                "MyShop",
            ],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useGetShopsQuery,
    useGetShopByIdQuery,
    useGetMyShopQuery,
    useCreateShopMutation,
    useUpdateShopMutation,
    useDeleteShopMutation,
} = shopApi;