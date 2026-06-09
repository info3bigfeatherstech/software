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

export const dashboardApi = createApi({
    reducerPath: "dashboardApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["DashboardOverview"],
    endpoints: (builder) => ({
        getMonthlyOverview: builder.query({
            query: ({ months = 6, shop_id = "", warehouse_id = "" } = {}) => {
                const params = { months };
                if (shop_id) params.shop_id = shop_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/dashboard/monthly-overview", method: "GET", params };
            },
            providesTags: [{ type: "DashboardOverview", id: "MONTHLY" }],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const { useGetMonthlyOverviewQuery } = dashboardApi;
