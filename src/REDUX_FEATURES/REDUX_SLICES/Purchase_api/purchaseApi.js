// REDUX_SLICES/Purchase_api/purchaseApi.js
//
// RTK Query for purchase-entries endpoint (read-only purchase history)
// Purchase entries are automatically created when inward is marked MAPPED

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

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Purchase", "PurchaseSummary"],

    endpoints: (builder) => ({

        // ── GET /purchase-entries ──────────────────────────────────────────────
        // List all purchase entries with filters
        getPurchaseEntries: builder.query({
            query: ({
                page = 1,
                limit = 20,
                search = "",
                vendor_id = "",
                warehouse_id = "",
                status = "",
                from_date = "",
                to_date = "",
            }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (vendor_id) params.vendor_id = vendor_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                if (status) params.status = status;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/purchase-entries", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.data) {
                    return [
                        ...result.data.map(({ purchase_id }) => ({ type: "Purchase", id: purchase_id })),
                        { type: "Purchase", id: "LIST" },
                    ];
                }
                return [{ type: "Purchase", id: "LIST" }];
            },
            transformResponse: (response) => ({
                purchases: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // ── GET /purchase-entries/:purchaseId ───────────────────────────────────
        // Get single purchase with items
        getPurchaseById: builder.query({
            query: (purchaseId) => ({
                url: `/purchase-entries/${purchaseId}`,
                method: "GET",
            }),
            providesTags: (result, error, purchaseId) => [
                { type: "Purchase", id: purchaseId },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── GET /purchase-entries/summary/vendor ────────────────────────────────
        // Vendor-wise purchase summary for reports
        getVendorPurchaseSummary: builder.query({
            query: ({ from_date = "", to_date = "" }) => {
                const params = {};
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/purchase-entries/summary/vendor", method: "GET", params };
            },
            providesTags: ["PurchaseSummary"],
            transformResponse: (response) => response.data || [],
        }),

    }),
});

export const {
    useGetPurchaseEntriesQuery,
    useGetPurchaseByIdQuery,
    useGetVendorPurchaseSummaryQuery,
} = purchaseApi;