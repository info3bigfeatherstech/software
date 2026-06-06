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

export const purchaseFinanceApi = createApi({
    reducerPath: "purchaseFinanceApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["WarehouseExpense", "VendorPayment", "PurchasePerformance"],

    endpoints: (builder) => ({
        getWarehouseExpenses: builder.query({
            query: ({ page = 1, limit = 50, search = "", category = "", from_date = "", to_date = "", warehouse_id = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (category) params.category = category;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/warehouse-expenses", method: "GET", params };
            },
            providesTags: [{ type: "WarehouseExpense", id: "LIST" }],
            transformResponse: (response) => ({
                expenses: response.data || [],
                meta: response.meta || {},
            }),
        }),

        createWarehouseExpense: builder.mutation({
            query: (body) => ({ url: "/warehouse-expenses", method: "POST", data: body }),
            invalidatesTags: [{ type: "WarehouseExpense", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        updateWarehouseExpense: builder.mutation({
            query: ({ expenseId, ...body }) => ({
                url: `/warehouse-expenses/${expenseId}`,
                method: "PUT",
                data: body,
            }),
            invalidatesTags: [{ type: "WarehouseExpense", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        cancelWarehouseExpense: builder.mutation({
            query: (expenseId) => ({
                url: `/warehouse-expenses/${expenseId}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: [{ type: "WarehouseExpense", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        getVendorPayments: builder.query({
            query: ({ page = 1, limit = 50, search = "", vendor_id = "", status = "", from_date = "", to_date = "", warehouse_id = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (vendor_id) params.vendor_id = vendor_id;
                if (status) params.status = status;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/vendor-payments", method: "GET", params };
            },
            providesTags: [{ type: "VendorPayment", id: "LIST" }],
            transformResponse: (response) => ({
                payments: response.data || [],
                meta: response.meta || {},
            }),
        }),

        getPayablePurchases: builder.query({
            query: ({ vendor_id, warehouse_id = "" }) => {
                const params = { vendor_id };
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/vendor-payments/payable-purchases", method: "GET", params };
            },
            transformResponse: (response) => response.data || [],
        }),

        createVendorPayment: builder.mutation({
            query: (body) => ({ url: "/vendor-payments", method: "POST", data: body }),
            invalidatesTags: [
                { type: "VendorPayment", id: "LIST" },
                { type: "PurchasePerformance", id: "SUMMARY" },
            ],
            transformResponse: (response) => response.data,
        }),

        updateVendorPaymentStatus: builder.mutation({
            query: ({ paymentId, status }) => ({
                url: `/vendor-payments/${paymentId}/status`,
                method: "PATCH",
                data: { status },
            }),
            invalidatesTags: [{ type: "VendorPayment", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        cancelVendorPayment: builder.mutation({
            query: (paymentId) => ({
                url: `/vendor-payments/${paymentId}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: [{ type: "VendorPayment", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        getPurchasePerformance: builder.query({
            query: ({ from_date = "", to_date = "", vendor_id = "", warehouse_id = "" }) => {
                const params = {};
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (vendor_id) params.vendor_id = vendor_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/purchase-entries/performance", method: "GET", params };
            },
            providesTags: [{ type: "PurchasePerformance", id: "SUMMARY" }],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetWarehouseExpensesQuery,
    useCreateWarehouseExpenseMutation,
    useUpdateWarehouseExpenseMutation,
    useCancelWarehouseExpenseMutation,
    useGetVendorPaymentsQuery,
    useGetPayablePurchasesQuery,
    useCreateVendorPaymentMutation,
    useUpdateVendorPaymentStatusMutation,
    useCancelVendorPaymentMutation,
    useGetPurchasePerformanceQuery,
} = purchaseFinanceApi;
