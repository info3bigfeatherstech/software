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
                data: axiosError.response?.data || {
                    message: axiosError.message || "Request failed",
                },
            },
        };
    }
};

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["Category"],

    endpoints: (builder) => ({
        // GET all categories
        getCategories: builder.query({
            query: ({ page = 1, limit = 100, search = "", is_active } = {}) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (is_active !== undefined) params.is_active = is_active;
                return { url: "/categories", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.data) {
                    return [
                        ...result.data.map(({ category_id }) => ({ type: "Category", id: category_id })),
                        { type: "Category", id: "LIST" }
                    ];
                }
                return [{ type: "Category", id: "LIST" }];
            },
            transformResponse: (response) => ({
                categories: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 100, totalPages: 1 }
            })
        }),

        // GET single category
        getCategoryById: builder.query({
            query: (categoryId) => ({ url: `/categories/${categoryId}`, method: "GET" }),
            providesTags: (result, error, categoryId) => [{ type: "Category", id: categoryId }],
            transformResponse: (response) => response.data
        }),

        // CREATE category
        createCategory: builder.mutation({
            query: (data) => ({ url: "/categories", method: "POST", data }),
            invalidatesTags: [{ type: "Category", id: "LIST" }],
            transformResponse: (response) => response.data
        }),

        // UPDATE category
        updateCategory: builder.mutation({
            query: ({ categoryId, ...data }) => ({
                url: `/categories/${categoryId}`,
                method: "PUT",
                data
            }),
            invalidatesTags: (result, error, { categoryId }) => [
                { type: "Category", id: categoryId },
                { type: "Category", id: "LIST" }
            ],
            transformResponse: (response) => response.data
        }),

        // DELETE (soft delete) category
        deleteCategory: builder.mutation({
            query: (categoryId) => ({ url: `/categories/${categoryId}`, method: "DELETE" }),
            invalidatesTags: (result, error, categoryId) => [
                { type: "Category", id: categoryId },
                { type: "Category", id: "LIST" }
            ],
            transformResponse: (response) => response.data
        })
    })
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} = categoryApi;