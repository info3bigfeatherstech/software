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

export const cashbankApi = createApi({
    reducerPath: "cashbankApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["CashbankCollections", "CashbankReceivables", "CashbankCash", "CashbankBank"],

    endpoints: (builder) => ({
        getShopCollections: builder.query({
            query: ({
                shop_id = "",
                from_date = "",
                to_date = "",
                payment_method = "",
                search = "",
                page = 1,
                limit = 50,
            }) => {
                const params = { page, limit };
                if (shop_id) params.shop_id = shop_id;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (payment_method) params.payment_method = payment_method;
                if (search) params.search = search;
                return { url: "/cashbank/shop/collections", method: "GET", params };
            },
            providesTags: ["CashbankCollections"],
            transformResponse: (response) => ({
                payments: response.data || [],
                meta: response.meta || {},
            }),
        }),

        getShopReceivables: builder.query({
            query: ({
                shop_id = "",
                from_date = "",
                to_date = "",
                search = "",
                page = 1,
                limit = 50,
            }) => {
                const params = { page, limit };
                if (shop_id) params.shop_id = shop_id;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (search) params.search = search;
                return { url: "/cashbank/shop/receivables", method: "GET", params };
            },
            providesTags: ["CashbankReceivables"],
            transformResponse: (response) => ({
                bills: response.data || [],
                meta: response.meta || {},
            }),
        }),

        getShopCashSummary: builder.query({
            query: ({ shop_id = "", from_date = "", to_date = "", opening_balance = 0 }) => {
                const params = { opening_balance };
                if (shop_id) params.shop_id = shop_id;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                return { url: "/cashbank/shop/cash-summary", method: "GET", params };
            },
            providesTags: ["CashbankCash"],
            transformResponse: (response) => response.data,
        }),

        getShopBankTransactions: builder.query({
            query: ({ shop_id = "", from_date = "", to_date = "", bank_account_id = "" }) => {
                const params = {};
                if (shop_id) params.shop_id = shop_id;
                if (from_date) params.from_date = from_date;
                if (to_date) params.to_date = to_date;
                if (bank_account_id) params.bank_account_id = bank_account_id;
                return { url: "/cashbank/shop/bank-transactions", method: "GET", params };
            },
            providesTags: ["CashbankBank"],
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetShopCollectionsQuery,
    useGetShopReceivablesQuery,
    useGetShopCashSummaryQuery,
    useGetShopBankTransactionsQuery,
} = cashbankApi;
