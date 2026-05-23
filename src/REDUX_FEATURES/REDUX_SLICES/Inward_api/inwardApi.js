// REDUX_SLICES/Inward_api/inwardApi.js

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
                data:
                    axiosError.response?.data || {
                        message: axiosError.message || "Request failed",
                    },
            },
        };
    }
};

export const inwardApi = createApi({
    reducerPath: "inwardApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Inward", "InwardItem"],

    endpoints: (builder) => ({

        // ── GET /inwards ────────────────────────────────────────────────────────
        getInwards: builder.query({
            query: ({
                page = 1,
                limit = 20,
                search = "",
                status = "",
                vendor_id = "",
                warehouse_id = "",
            }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (status) params.status = status;
                if (vendor_id) params.vendor_id = vendor_id;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                return { url: "/inwards", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.inwards) {
                    return [
                        ...result.inwards.map(({ inward_id }) => ({
                            type: "Inward",
                            id: inward_id,
                        })),
                        { type: "Inward", id: "LIST" },
                    ];
                }
                return [{ type: "Inward", id: "LIST" }];
            },
            transformResponse: (response) => ({
                inwards: response.data || [],
                meta: response.meta || {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                },
            }),
        }),

        // ── GET /inwards/:inwardId ──────────────────────────────────────────────
        getInwardById: builder.query({
            query: (inwardId) => ({ url: `/inwards/${inwardId}`, method: "GET" }),
            providesTags: (result, error, inwardId) => [
                { type: "Inward", id: inwardId },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── POST /inwards — schedule only ──────────────────────────────────────
        createInward: builder.mutation({
            query: (data) => ({ url: "/inwards", method: "POST", data }),
            invalidatesTags: [{ type: "Inward", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // ── PATCH /inwards/:inwardId/arrival-details ────────────────────────────
        patchArrivalDetails: builder.mutation({
            query: ({ inwardId, ...data }) => ({
                url: `/inwards/${inwardId}/arrival-details`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "Inward", id: inwardId },
                { type: "Inward", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── PATCH /inwards/:inwardId/status — MAPPED or CANCELLED only ──────────
        patchInwardStatus: builder.mutation({
            query: ({ inwardId, status, remarks }) => ({
                url: `/inwards/${inwardId}/status`,
                method: "PATCH",
                data: { status, ...(remarks ? { remarks } : {}) },
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "Inward", id: inwardId },
                { type: "Inward", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── POST /inwards/:inwardId/items ───────────────────────────────────────
        addInwardItem: builder.mutation({
            query: ({ inwardId, ...itemData }) => ({
                url: `/inwards/${inwardId}/items`,
                method: "POST",
                data: itemData,
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "InwardItem", id: inwardId },
                { type: "Inward", id: inwardId },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── PUT /inwards/:inwardId/items/:itemId ────────────────────────────────
        updateInwardItem: builder.mutation({
            query: ({ inwardId, inwardItemId, ...itemData }) => ({
                url: `/inwards/${inwardId}/items/${inwardItemId}`,
                method: "PUT",
                data: itemData,
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "InwardItem", id: inwardId },
                { type: "Inward", id: inwardId },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── DELETE /inwards/:inwardId/items/:itemId ─────────────────────────────
        deleteInwardItem: builder.mutation({
            query: ({ inwardId, inwardItemId }) => ({
                url: `/inwards/${inwardId}/items/${inwardItemId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "InwardItem", id: inwardId },
                { type: "Inward", id: inwardId },
            ],
            transformResponse: (response) => response.data,
        }),

        // ── POST /inwards/:inwardId/items/bulk ───────────────────────────────────────
        addInwardItemsBulk: builder.mutation({
            query: ({ inwardId, items }) => ({
                url: `/inwards/${inwardId}/items/bulk`,
                method: "POST",
                data: { items },
            }),
            invalidatesTags: (result, error, { inwardId }) => [
                { type: "InwardItem", id: inwardId },
                { type: "Inward", id: inwardId },
            ],
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useGetInwardsQuery,
    useGetInwardByIdQuery,
    useCreateInwardMutation,
    usePatchArrivalDetailsMutation,
    usePatchInwardStatusMutation,
    useAddInwardItemMutation,
    useUpdateInwardItemMutation,
    useDeleteInwardItemMutation,
    useAddInwardItemsBulkMutation
} = inwardApi;

// // REDUX_SLICES/Inward_api/inwardApi.js

// import { createApi } from "@reduxjs/toolkit/query/react";
// import AxiosInstance from "../../../SERVICES/AxiosInstance";

// const axiosBaseQuery = () => async ({ url, method, data, params }) => {
//     try {
//         const result = await AxiosInstance({ url, method, data, params });
//         return { data: result.data };
//     } catch (axiosError) {
//         return {
//             error: {
//                 status: axiosError.response?.status || 500,
//                 data:
//                     axiosError.response?.data || {
//                         message: axiosError.message || "Request failed",
//                     },
//             },
//         };
//     }
// };

// export const inwardApi = createApi({
//     reducerPath: "inwardApi",
//     baseQuery: axiosBaseQuery(),
//     tagTypes: ["Inward", "InwardItem"],

//     endpoints: (builder) => ({

//         // ── GET /inwards ────────────────────────────────────────────────────────
//         getInwards: builder.query({
//             query: ({
//                 page = 1,
//                 limit = 20,
//                 search = "",
//                 status = "",
//                 vendor_id = "",
//                 warehouse_id = "",
//             }) => {
//                 const params = { page, limit };
//                 if (search) params.search = search;
//                 if (status) params.status = status;
//                 if (vendor_id) params.vendor_id = vendor_id;
//                 if (warehouse_id) params.warehouse_id = warehouse_id;
//                 return { url: "/inwards", method: "GET", params };
//             },
//             providesTags: (result) => {
//                 if (result?.inwards) {
//                     return [
//                         ...result.inwards.map(({ inward_id }) => ({
//                             type: "Inward",
//                             id: inward_id,
//                         })),
//                         { type: "Inward", id: "LIST" },
//                     ];
//                 }
//                 return [{ type: "Inward", id: "LIST" }];
//             },
//             transformResponse: (response) => ({
//                 inwards: response.data || [],
//                 meta: response.meta || {
//                     total: 0,
//                     page: 1,
//                     limit: 20,
//                     totalPages: 1,
//                 },
//             }),
//         }),

//         // ── GET /inwards/:inwardId ──────────────────────────────────────────────
//         getInwardById: builder.query({
//             query: (inwardId) => ({ url: `/inwards/${inwardId}`, method: "GET" }),
//             providesTags: (result, error, inwardId) => [
//                 { type: "Inward", id: inwardId },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//         // ── POST /inwards — schedule only ──────────────────────────────────────
//         createInward: builder.mutation({
//             query: (data) => ({ url: "/inwards", method: "POST", data }),
//             invalidatesTags: [{ type: "Inward", id: "LIST" }],
//             transformResponse: (response) => response.data,
//         }),

//         // ── PATCH /inwards/:inwardId/arrival-details ────────────────────────────
//         patchArrivalDetails: builder.mutation({
//             query: ({ inwardId, ...data }) => ({
//                 url: `/inwards/${inwardId}/arrival-details`,
//                 method: "PATCH",
//                 data,
//             }),
//             invalidatesTags: (result, error, { inwardId }) => [
//                 { type: "Inward", id: inwardId },
//                 { type: "Inward", id: "LIST" },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//         // ── PATCH /inwards/:inwardId/status — MAPPED or CANCELLED only ──────────
//         patchInwardStatus: builder.mutation({
//             query: ({ inwardId, status, remarks }) => ({
//                 url: `/inwards/${inwardId}/status`,
//                 method: "PATCH",
//                 data: { status, ...(remarks ? { remarks } : {}) },
//             }),
//             invalidatesTags: (result, error, { inwardId }) => [
//                 { type: "Inward", id: inwardId },
//                 { type: "Inward", id: "LIST" },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//         // ── POST /inwards/:inwardId/items ───────────────────────────────────────
//         addInwardItem: builder.mutation({
//             query: ({ inwardId, ...itemData }) => ({
//                 url: `/inwards/${inwardId}/items`,
//                 method: "POST",
//                 data: itemData,
//             }),
//             invalidatesTags: (result, error, { inwardId }) => [
//                 { type: "InwardItem", id: inwardId },
//                 { type: "Inward", id: inwardId },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//         // ── PUT /inwards/:inwardId/items/:itemId ────────────────────────────────
//         updateInwardItem: builder.mutation({
//             query: ({ inwardId, inwardItemId, ...itemData }) => ({
//                 url: `/inwards/${inwardId}/items/${inwardItemId}`,
//                 method: "PUT",
//                 data: itemData,
//             }),
//             invalidatesTags: (result, error, { inwardId }) => [
//                 { type: "InwardItem", id: inwardId },
//                 { type: "Inward", id: inwardId },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//         // ── DELETE /inwards/:inwardId/items/:itemId ─────────────────────────────
//         deleteInwardItem: builder.mutation({
//             query: ({ inwardId, inwardItemId }) => ({
//                 url: `/inwards/${inwardId}/items/${inwardItemId}`,
//                 method: "DELETE",
//             }),
//             invalidatesTags: (result, error, { inwardId }) => [
//                 { type: "InwardItem", id: inwardId },
//                 { type: "Inward", id: inwardId },
//             ],
//             transformResponse: (response) => response.data,
//         }),

//     }),
// });

// export const {
//     useGetInwardsQuery,
//     useGetInwardByIdQuery,
//     useCreateInwardMutation,
//     usePatchArrivalDetailsMutation,
//     usePatchInwardStatusMutation,
//     useAddInwardItemMutation,
//     useUpdateInwardItemMutation,
//     useDeleteInwardItemMutation,
// } = inwardApi;