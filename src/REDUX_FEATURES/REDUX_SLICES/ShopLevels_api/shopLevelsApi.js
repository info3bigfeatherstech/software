// REDUX_SLICES/ShopLevels_api/shopLevelsApi.js
//
// Shop Product Min-Max Levels & Reorder Suggestions
// POST /shop-product-levels, GET /shop-reorder-suggestions

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

export const shopLevelsApi = createApi({
    reducerPath: "shopLevelsApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["ShopLevels", "ReorderSuggestions"],

    endpoints: (builder) => ({

        // POST /shop-product-levels — set min/max levels for shop
        setProductLevels: builder.mutation({
            query: ({ shop_id, items }) => ({
                url: "/shop-product-levels",
                method: "POST",
                data: { shop_id, items },
            }),
            invalidatesTags: ["ShopLevels", "ReorderSuggestions"],
            transformResponse: (response) => response.data,
        }),

        // GET /shop-reorder-suggestions — get reorder suggestions
        getReorderSuggestions: builder.query({
            query: ({ shop_id = "", warehouse_id = "" }) => {
                const params = {};
                if (shop_id) params.shop_id = shop_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/shop-reorder-suggestions", method: "GET", params };
            },
            providesTags: ["ReorderSuggestions"],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useSetProductLevelsMutation,
    useGetReorderSuggestionsQuery,
} = shopLevelsApi;