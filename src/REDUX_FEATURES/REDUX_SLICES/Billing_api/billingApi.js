// REDUX_SLICES/Billing_api/billingApi.js
//
// Billing APIs
// Endpoints: Create bill, get bill, PDF, payments, cancel
//
// FIX: PDF download — `responseHandler` is an RTK fetch-native option and has NO effect
// on Axios. Axios receives the binary PDF response and either garbles it or parses it as
// text/JSON depending on the Content-Type. The fix is to pass `responseType: "blob"` in
// the Axios config directly when the endpoint is the PDF route, and detect it via a flag
// in the query object. The axiosBaseQuery is updated to forward `responseType` to Axios,
// and getBillPdf passes `responseType: "blob"` so Axios returns a real Blob object.
// UPDATED: Added credit_note_ids to createBill
import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

// FIX: Accept `responseType` from the query config and pass it to Axios.
// Without this, Axios always parses the response as JSON/text, so binary PDF
// data is never returned as a Blob — making `response instanceof Blob` always false.
const axiosBaseQuery = () => async ({ url, method, data, params, headers, responseType }) => {
    try {
        const result = await AxiosInstance({
            url,
            method,
            data,
            params,
            headers,
            // FIX: forward responseType so Axios handles binary responses correctly
            ...(responseType ? { responseType } : {}),
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

export const billingApi = createApi({
    reducerPath: "billingApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Bill"],

    endpoints: (builder) => ({

        // POST /bills — create new bill
         // POST /bills — create new bill (UPDATED: accepts credit_note_ids)
        createBill: builder.mutation({
            query: ({ idempotencyKey, credit_note_ids = [], ...data }) => ({
                url: "/bills",
                method: "POST",
                data: { ...data, credit_note_ids },
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
        // FIX: Removed the fetch-native `responseHandler` option — it has no effect on Axios.
        // Instead, pass `responseType: "blob"` so Axios correctly returns a Blob object.
        // transformResponse is also removed because with responseType "blob", result.data
        // IS the Blob — no transformation needed.
        getBillPdf: builder.query({
            query: (billId) => ({
                url: `/bills/${billId}/pdf`,
                method: "GET",
                responseType: "blob", // FIX: tells Axios to return binary data as a Blob
            }),
            // FIX: result.data is already the Blob from Axios — return it directly.
            // Do NOT call response.data.data — there is no nested .data on a Blob.
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
// // REDUX_SLICES/Billing_api/billingApi.js
// //
// // Billing APIs
// // Endpoints: Create bill, get bill, PDF, payments, cancel

// import { createApi } from "@reduxjs/toolkit/query/react";
// import AxiosInstance from "../../../SERVICES/AxiosInstance";

// const axiosBaseQuery = () => async ({ url, method, data, params, headers }) => {
//     try {
//         const result = await AxiosInstance({ url, method, data, params, headers });
//         return { data: result.data };
//     } catch (axiosError) {
//         return {
//             error: {
//                 status: axiosError.response?.status || 500,
//                 data: axiosError.response?.data || { message: axiosError.message || "Request failed" },
//             },
//         };
//     }
// };

// export const billingApi = createApi({
//     reducerPath: "billingApi",
//     baseQuery: axiosBaseQuery(),
//     tagTypes: ["Bill"],

//     endpoints: (builder) => ({

//         // POST /bills — create new bill
//         createBill: builder.mutation({
//             query: ({ idempotencyKey, ...data }) => ({
//                 url: "/bills",
//                 method: "POST",
//                 data,
//                 headers: { "Idempotency-Key": idempotencyKey },
//             }),
//             invalidatesTags: ["Bill"],
//             transformResponse: (response) => response.data,
//         }),

//         // GET /bills/:billId — get bill details
//         getBillById: builder.query({
//             query: (billId) => ({
//                 url: `/bills/${billId}`,
//                 method: "GET",
//             }),
//             providesTags: (result, error, billId) => [{ type: "Bill", id: billId }],
//             transformResponse: (response) => response.data,
//         }),

//         // GET /bills — list bills with filters
//         getBills: builder.query({
//             query: ({ page = 1, limit = 20, payment_status = "", from_date = "", to_date = "" }) => {
//                 const params = { page, limit };
//                 if (payment_status) params.payment_status = payment_status;
//                 if (from_date) params.from_date = from_date;
//                 if (to_date) params.to_date = to_date;
//                 return { url: "/bills", method: "GET", params };
//             },
//             providesTags: (result) => {
//                 if (result?.bills) {
//                     return [
//                         ...result.bills.map(({ bill_id }) => ({ type: "Bill", id: bill_id })),
//                         { type: "Bill", id: "LIST" },
//                     ];
//                 }
//                 return [{ type: "Bill", id: "LIST" }];
//             },
//             transformResponse: (response) => ({
//                 bills: response.data || [],
//                 meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
//             }),
//         }),

//         // GET /bills/:billId/pdf — download PDF invoice
//         // getBillPdf: builder.query({
//         //     query: (billId) => ({
//         //         url: `/bills/${billId}/pdf`,
//         //         method: "GET",
//         //         responseHandler: (response) => response.blob(),
//         //     }),
//         //     transformResponse: (response) => response,
//         // }),

//         getBillPdf: builder.query({
//             query: (billId) => ({
//                 url: `/bills/${billId}/pdf`,
//                 method: "GET",
//                 responseHandler: (response) => response.blob(),
//             }),
//             transformResponse: (response) => response,
//         }),

//         // POST /bills/:billId/payments — add partial payment
//         addPayment: builder.mutation({
//             query: ({ billId, idempotencyKey, ...data }) => ({
//                 url: `/bills/${billId}/payments`,
//                 method: "POST",
//                 data,
//                 headers: { "Idempotency-Key": idempotencyKey },
//             }),
//             invalidatesTags: (result, error, { billId }) => [{ type: "Bill", id: billId }],
//             transformResponse: (response) => response.data,
//         }),

//         // PATCH /bills/:billId/cancel — cancel bill
//         cancelBill: builder.mutation({
//             query: ({ billId, idempotencyKey, reason }) => ({
//                 url: `/bills/${billId}/cancel`,
//                 method: "PATCH",
//                 data: { reason },
//                 headers: { "Idempotency-Key": idempotencyKey },
//             }),
//             invalidatesTags: (result, error, { billId }) => [{ type: "Bill", id: billId }],
//             transformResponse: (response) => response.data,
//         }),

//     }),
// });

// export const {
//     useCreateBillMutation,
//     useGetBillByIdQuery,
//     useGetBillsQuery,
//     useLazyGetBillPdfQuery,
//     useAddPaymentMutation,
//     useCancelBillMutation,
// } = billingApi;