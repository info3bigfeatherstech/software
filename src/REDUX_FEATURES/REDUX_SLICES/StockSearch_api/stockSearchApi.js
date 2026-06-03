// REDUX_SLICES/StockSearch_api/stockSearchApi.js
//
// Emergency Stock Search API
// GET /stock/search — search across all locations

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

export const stockSearchApi = createApi({
    reducerPath: "stockSearchApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["StockSearch"],

    endpoints: (builder) => ({

        // GET /stock/search — emergency stock search
        searchStock: builder.query({
            query: ({ 
                variant_id = "", 
                product_code = "", 
                sku = "", 
                barcode = "", 
                city = "", 
                nearby_only = false,
                request_type = "",
            }) => {
                const params = {};
                if (variant_id) params.variant_id = variant_id;
                if (product_code) params.product_code = product_code;
                if (sku) params.sku = sku;
                if (barcode) params.barcode = barcode;
                if (city) params.city = city;
                if (nearby_only) params.nearby_only = true;
                if (request_type) params.request_type = request_type;
                return { url: "/stock/search", method: "GET", params };
            },
            providesTags: ["StockSearch"],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useSearchStockQuery,
    useLazySearchStockQuery,
} = stockSearchApi;