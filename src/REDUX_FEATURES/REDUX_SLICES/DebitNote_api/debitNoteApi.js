// REDUX_SLICES/DebitNote_api/debitNoteApi.js
// Warehouse debit notes against vendors (purchase returns)

import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const axiosBaseQuery = () => async ({ url, method, data, params, headers, responseType }) => {
    try {
        const result = await AxiosInstance({
            url,
            method,
            data,
            params,
            ...(responseType ? { responseType } : {}),
            ...(headers ? { headers } : {}),
        });
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

export const debitNoteApi = createApi({
    reducerPath: "debitNoteApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["DebitNote", "PurchaseReturnable"],

    endpoints: (builder) => ({
        createDebitNote: builder.mutation({
            query: ({ idempotencyKey, ...body }) => ({
                url: "/debit-notes",
                method: "POST",
                data: body,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: ["DebitNote", "PurchaseReturnable", { type: "Purchase", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        getDebitNotes: builder.query({
            query: ({
                page = 1,
                limit = 20,
                search = "",
                vendor_id = "",
                warehouse_id = "",
                status = "",
                type = "",
                from_date = "",
                to_date = "",
            }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (vendor_id) params.vendor_id = vendor_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                if (status) params.status = status;
                if (type) params.type = type;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/debit-notes", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.debitNotes?.length) {
                    return [
                        ...result.debitNotes.map(({ debit_note_id }) => ({
                            type: "DebitNote",
                            id: debit_note_id,
                        })),
                        { type: "DebitNote", id: "LIST" },
                    ];
                }
                return [{ type: "DebitNote", id: "LIST" }];
            },
            transformResponse: (response) => ({
                debitNotes: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
                summary: response.meta?.summary || {},
            }),
        }),

        getDebitNoteById: builder.query({
            query: (debitNoteId) => ({
                url: `/debit-notes/${debitNoteId}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "DebitNote", id }],
            transformResponse: (response) => response.data,
        }),

        getPurchaseReturnableLines: builder.query({
            query: (purchaseId) => ({
                url: `/debit-notes/purchase/${purchaseId}/returnable-lines`,
                method: "GET",
            }),
            providesTags: (result, error, purchaseId) => [
                { type: "PurchaseReturnable", id: purchaseId },
            ],
            transformResponse: (response) => response.data,
        }),

        cancelDebitNote: builder.mutation({
            query: ({ debitNoteId, idempotencyKey, ...body }) => ({
                url: `/debit-notes/${debitNoteId}/cancel`,
                method: "PATCH",
                data: body,
                headers: { "Idempotency-Key": idempotencyKey },
            }),
            invalidatesTags: (result, error, { debitNoteId }) => [
                { type: "DebitNote", id: debitNoteId },
                { type: "DebitNote", id: "LIST" },
                "PurchaseReturnable",
            ],
            transformResponse: (response) => response.data,
        }),

        downloadDebitNotePdf: builder.query({
            query: (debitNoteId) => ({
                url: `/debit-notes/${debitNoteId}/pdf`,
                method: "GET",
                responseType: "blob",
            }),
        }),
    }),
});

export const {
    useCreateDebitNoteMutation,
    useGetDebitNotesQuery,
    useGetDebitNoteByIdQuery,
    useGetPurchaseReturnableLinesQuery,
    useLazyGetPurchaseReturnableLinesQuery,
    useCancelDebitNoteMutation,
    useLazyDownloadDebitNotePdfQuery,
} = debitNoteApi;
