import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const axiosBaseQuery = () => async ({ url, method, params }) => {
    try {
        const result = await AxiosInstance({ url, method, params });
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

export const shopWarehouseCatalogApi = createApi({
    reducerPath: "shopWarehouseCatalogApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["ShopWarehouseCatalog"],

    endpoints: (builder) => ({
        getWarehouseStockCatalog: builder.query({
            query: ({ shopId, warehouse_id, mode = "all", search = "", page = 1, limit = 50 }) => {
                const params = { warehouse_id, mode, page, limit };
                if (search) params.search = search;
                return {
                    url: `/shops/${shopId}/warehouse-stock-catalog`,
                    method: "GET",
                    params,
                };
            },
            providesTags: ["ShopWarehouseCatalog"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetWarehouseStockCatalogQuery, useLazyGetWarehouseStockCatalogQuery } =
    shopWarehouseCatalogApi;
