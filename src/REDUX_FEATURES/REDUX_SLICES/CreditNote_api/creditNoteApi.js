// REDUX_SLICES/CreditNote_api/creditNoteApi.js
//
// Credit Notes APIs
// Endpoints: Create, list, get by ID, redeem, refund, cancel

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

export const creditNoteApi = createApi({
    reducerPath: "creditNoteApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["CreditNote"],

    endpoints: (builder) => ({

        // POST /credit-notes — create credit note
        createCreditNote: builder.mutation({
            query: ({ idempotencyKey, ...data }) => ({
                url: "/credit-notes",
                method: "POST",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: ["CreditNote"],
            transformResponse: (response) => response.data,
        }),

        // GET /credit-notes — list credit notes with filters
        getCreditNotes: builder.query({
            query: ({ page = 1, limit = 20, status = "", shop_id = "", customer_id = "", from_date = "", to_date = "" }) => {
                const params = { page, limit };
                if (status) params.status = status;
                if (shop_id) params.shop_id = shop_id;
                if (customer_id) params.customer_id = customer_id;  // ← ADD THIS
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/credit-notes", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.creditNotes) {
                    return [
                        ...result.creditNotes.map(({ credit_note_id }) => ({ type: "CreditNote", id: credit_note_id })),
                        { type: "CreditNote", id: "LIST" },
                    ];
                }
                return [{ type: "CreditNote", id: "LIST" }];
            },
            transformResponse: (response) => ({
                creditNotes: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /credit-notes/:creditNoteId — get credit note details
        getCreditNoteById: builder.query({
            query: (creditNoteId) => ({
                url: `/credit-notes/${creditNoteId}`,
                method: "GET",
            }),
            providesTags: (result, error, creditNoteId) => [{ type: "CreditNote", id: creditNoteId }],
            transformResponse: (response) => response.data,
        }),

        // PATCH /credit-notes/:creditNoteId/redeem — redeem credit note
        redeemCreditNote: builder.mutation({
            query: ({ creditNoteId, idempotencyKey, ...data }) => ({
                url: `/credit-notes/${creditNoteId}/redeem`,
                method: "PATCH",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { creditNoteId }) => [
                { type: "CreditNote", id: creditNoteId },
                { type: "CreditNote", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // POST /credit-notes/:creditNoteId/refund — refund credit note
        refundCreditNote: builder.mutation({
            query: ({ creditNoteId, idempotencyKey, ...data }) => ({
                url: `/credit-notes/${creditNoteId}/refund`,
                method: "POST",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { creditNoteId }) => [
                { type: "CreditNote", id: creditNoteId },
                { type: "CreditNote", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // PATCH /credit-notes/:creditNoteId/cancel — cancel credit note (admin only)
        cancelCreditNote: builder.mutation({
            query: ({ creditNoteId, idempotencyKey, ...data }) => ({
                url: `/credit-notes/${creditNoteId}/cancel`,
                method: "PATCH",
                data,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { creditNoteId }) => [
                { type: "CreditNote", id: creditNoteId },
                { type: "CreditNote", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // GET /bills — get bills for credit note creation (filter unpaid/not fully returned)
        getBillsForCreditNote: builder.query({
            query: ({ shop_id, page = 1, limit = 20 }) => ({
                url: "/bills",
                method: "GET",
                params: { page, limit, shop_id },
            }),
            providesTags: ["CreditNote"],
            transformResponse: (response) => ({
                bills: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

    }),
});

export const {
    useCreateCreditNoteMutation,
    useGetCreditNotesQuery,
    useGetCreditNoteByIdQuery,
    useLazyGetCreditNoteByIdQuery,
    useRedeemCreditNoteMutation,
    useRefundCreditNoteMutation,
    useCancelCreditNoteMutation,
    useGetBillsForCreditNoteQuery,
    useLazyGetBillsForCreditNoteQuery,
    useLazySearchCustomersQuery
} = creditNoteApi;