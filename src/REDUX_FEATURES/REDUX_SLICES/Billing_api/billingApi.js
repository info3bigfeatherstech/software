// REDUX_SLICES/Billing_api/billingApi.js
//
// Billing APIs
// Endpoints: Create bill, get bill, PDF, payments, cancel

import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const axiosBaseQuery = () => async ({ url, method, data, params, headers }) => {
    try {
        const result = await AxiosInstance({ url, method, data, params, headers });
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

export const billingApi = createApi({
    reducerPath: "billingApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Bill"],

    endpoints: (builder) => ({

        // POST /bills — create new bill
        createBill: builder.mutation({
            query: ({ idempotencyKey, ...data }) => ({
                url: "/bills",
                method: "POST",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: ["Bill"],
            transformResponse: (response) => response.data,
        }),

        // GET /bills/:billId — get bill details
        getBillById: builder.query({
            query: (billId) => ({
                url: `/bills/${billId}`,
                method: "GET",
            }),
            providesTags: (result, error, billId) => [{ type: "Bill", id: billId }],
            transformResponse: (response) => response.data,
        }),

        // GET /bills — list bills with filters
        getBills: builder.query({
            query: ({ page = 1, limit = 20, payment_status = "", from_date = "", to_date = "" }) => {
                const params = { page, limit };
                if (payment_status) params.payment_status = payment_status;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/bills", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.bills) {
                    return [
                        ...result.bills.map(({ bill_id }) => ({ type: "Bill", id: bill_id })),
                        { type: "Bill", id: "LIST" },
                    ];
                }
                return [{ type: "Bill", id: "LIST" }];
            },
            transformResponse: (response) => ({
                bills: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /bills/:billId/pdf — download PDF invoice
        // getBillPdf: builder.query({
        //     query: (billId) => ({
        //         url: `/bills/${billId}/pdf`,
        //         method: "GET",
        //         responseHandler: (response) => response.blob(),
        //     }),
        //     transformResponse: (response) => response,
        // }),

        getBillPdf: builder.query({
            query: (billId) => ({
                url: `/bills/${billId}/pdf`,
                method: "GET",
                responseHandler: (response) => response.blob(),
            }),
            transformResponse: (response) => response,
        }),

        // POST /bills/:billId/payments — add partial payment
        addPayment: builder.mutation({
            query: ({ billId, idempotencyKey, ...data }) => ({
                url: `/bills/${billId}/payments`,
                method: "POST",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { billId }) => [{ type: "Bill", id: billId }],
            transformResponse: (response) => response.data,
        }),

        // PATCH /bills/:billId/cancel — cancel bill
        cancelBill: builder.mutation({
            query: ({ billId, idempotencyKey, reason }) => ({
                url: `/bills/${billId}/cancel`,
                method: "PATCH",
                data: { reason },
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { billId }) => [{ type: "Bill", id: billId }],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useCreateBillMutation,
    useGetBillByIdQuery,
    useGetBillsQuery,
    useLazyGetBillPdfQuery,
    useAddPaymentMutation,
    useCancelBillMutation,
} = billingApi;