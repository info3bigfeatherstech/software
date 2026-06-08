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
    tagTypes: ["WarehouseExpense", "ShopExpense", "VendorPayment", "PurchasePerformance"],

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

        getShopExpenses: builder.query({
            query: ({ page = 1, limit = 50, search = "", category = "", from_date = "", to_date = "", shop_id = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (category) params.category = category;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (shop_id) params.shop_id = shop_id;
                return { url: "/shop-expenses", method: "GET", params };
            },
            providesTags: [{ type: "ShopExpense", id: "LIST" }],
            transformResponse: (response) => ({
                expenses: response.data || [],
                meta: response.meta || {},
            }),
        }),

        createShopExpense: builder.mutation({
            query: (body) => ({ url: "/shop-expenses", method: "POST", data: body }),
            invalidatesTags: [{ type: "ShopExpense", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        updateShopExpense: builder.mutation({
            query: ({ expenseId, ...body }) => ({
                url: `/shop-expenses/${expenseId}`,
                method: "PUT",
                data: body,
            }),
            invalidatesTags: [{ type: "ShopExpense", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        cancelShopExpense: builder.mutation({
            query: (expenseId) => ({
                url: `/shop-expenses/${expenseId}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: [{ type: "ShopExpense", id: "LIST" }],
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
            query: ({ vendor_id, warehouse_id = "", exclude_payment_id = "" }) => {
                const params = { vendor_id };
                if (warehouse_id) params.warehouse_id = warehouse_id;
                if (exclude_payment_id) params.exclude_payment_id = exclude_payment_id;
                return { url: "/vendor-payments/payable-purchases", method: "GET", params };
            },
            providesTags: [{ type: "VendorPayment", id: "PAYABLE" }],
            transformResponse: (response) => response.data || [],
        }),

        getVendorPaymentById: builder.query({
            query: (paymentId) => ({
                url: `/vendor-payments/${paymentId}`,
                method: "GET",
            }),
            providesTags: (_result, _err, paymentId) => [{ type: "VendorPayment", id: paymentId }],
            transformResponse: (response) => response.data,
        }),

        getPurchasePaymentHistory: builder.query({
            query: (purchaseId) => ({
                url: `/vendor-payments/by-purchase/${purchaseId}`,
                method: "GET",
            }),
            providesTags: (_result, _err, purchaseId) => [{ type: "VendorPayment", id: `PURCHASE-${purchaseId}` }],
            transformResponse: (response) => response.data,
        }),

        getBillSettlementStatus: builder.query({
            query: ({ page = 1, limit = 50, search = "", vendor_id = "", warehouse_id = "", balance_filter = "all" }) => {
                const params = { page, limit, balance_filter };
                if (search) params.search = search;
                if (vendor_id) params.vendor_id = vendor_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/vendor-payments/settlement-status", method: "GET", params };
            },
            providesTags: [{ type: "VendorPayment", id: "SETTLEMENT" }],
            transformResponse: (response) => ({
                bills: response.data || [],
                meta: response.meta || {},
            }),
        }),

        createVendorPayment: builder.mutation({
            query: (body) => ({ url: "/vendor-payments", method: "POST", data: body }),
            invalidatesTags: [
                { type: "VendorPayment", id: "LIST" },
                { type: "VendorPayment", id: "PAYABLE" },
                { type: "VendorPayment", id: "SETTLEMENT" },
                { type: "PurchasePerformance", id: "SUMMARY" },
            ],
            transformResponse: (response) => response.data,
        }),

        updateVendorPayment: builder.mutation({
            query: ({ paymentId, ...body }) => ({
                url: `/vendor-payments/${paymentId}`,
                method: "PUT",
                data: body,
            }),
            invalidatesTags: (_result, _err, { paymentId }) => [
                { type: "VendorPayment", id: "LIST" },
                { type: "VendorPayment", id: "PAYABLE" },
                { type: "VendorPayment", id: "SETTLEMENT" },
                { type: "VendorPayment", id: paymentId },
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
            invalidatesTags: (_result, _err, { paymentId }) => [
                { type: "VendorPayment", id: "LIST" },
                { type: "VendorPayment", id: "PAYABLE" },
                { type: "VendorPayment", id: "SETTLEMENT" },
                { type: "VendorPayment", id: paymentId },
            ],
            transformResponse: (response) => response.data,
        }),

        cancelVendorPayment: builder.mutation({
            query: (paymentId) => ({
                url: `/vendor-payments/${paymentId}/cancel`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _err, paymentId) => [
                { type: "VendorPayment", id: "LIST" },
                { type: "VendorPayment", id: "PAYABLE" },
                { type: "VendorPayment", id: "SETTLEMENT" },
                { type: "VendorPayment", id: paymentId },
            ],
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
    useGetShopExpensesQuery,
    useCreateShopExpenseMutation,
    useUpdateShopExpenseMutation,
    useCancelShopExpenseMutation,
    useGetVendorPaymentsQuery,
    useGetPayablePurchasesQuery,
    useGetVendorPaymentByIdQuery,
    useGetPurchasePaymentHistoryQuery,
    useGetBillSettlementStatusQuery,
    useCreateVendorPaymentMutation,
    useUpdateVendorPaymentMutation,
    useUpdateVendorPaymentStatusMutation,
    useCancelVendorPaymentMutation,
    useGetPurchasePerformanceQuery,
} = purchaseFinanceApi;
