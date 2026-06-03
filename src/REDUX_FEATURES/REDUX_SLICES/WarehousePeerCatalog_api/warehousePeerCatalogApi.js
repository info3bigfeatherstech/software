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

export const warehousePeerCatalogApi = createApi({
    reducerPath: "warehousePeerCatalogApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["WarehousePeerCatalog"],

    endpoints: (builder) => ({
        getPeerStockCatalog: builder.query({
            query: ({ destWarehouseId, from_warehouse_id, mode = "all", search = "", page = 1, limit = 50 }) => {
                const params = { from_warehouse_id, mode, page, limit };
                if (search) params.search = search;
                return {
                    url: `/warehouses/${destWarehouseId}/peer-stock-catalog`,
                    method: "GET",
                    params,
                };
            },
            providesTags: ["WarehousePeerCatalog"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetPeerStockCatalogQuery, useLazyGetPeerStockCatalogQuery } = warehousePeerCatalogApi;
