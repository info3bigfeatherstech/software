// REDUX_SLICES/User_api/userApi.js

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

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: axiosBaseQuery(),
    tagTypes: ["User"],

    endpoints: (builder) => ({

        // GET /users — paginated, searchable, filterable
        getUsers: builder.query({
            query: ({ page = 1, limit = 20, search = "", role = "", warehouse_id = "", shop_id = "", is_active = "" }) => {
                const params = { page, limit };
                if (search) params.search = search;
                if (role) params.role = role;
                if (warehouse_id) params.warehouse_id = warehouse_id;
                if (shop_id) params.shop_id = shop_id;
                if (is_active !== "") params.is_active = is_active;
                return { url: "/users", method: "GET", params };
            },
            providesTags: (result) => {
                if (result?.users) {
                    return [
                        ...result.users.map(({ user_id }) => ({ type: "User", id: user_id })),
                        { type: "User", id: "LIST" },
                    ];
                }
                return [{ type: "User", id: "LIST" }];
            },
            transformResponse: (response) => ({
                users: response.data || [],
                meta: response.meta || { total: 0, page: 1, limit: 20, totalPages: 1 },
            }),
        }),

        // GET /users/:userId
        getUserById: builder.query({
            query: (userId) => ({ url: `/users/${userId}`, method: "GET" }),
            providesTags: (result, error, userId) => [{ type: "User", id: userId }],
            transformResponse: (response) => response.data,
        }),

        // POST /users
        createUser: builder.mutation({
            query: (userData) => ({ url: "/users", method: "POST", data: userData }),
            invalidatesTags: [{ type: "User", id: "LIST" }],
            transformResponse: (response) => response.data,
        }),

        // PUT /users/:userId — role/assignment aware
        updateUser: builder.mutation({
            query: ({ userId, ...userData }) => ({
                url: `/users/${userId}`,
                method: "PUT",
                data: userData,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: "User", id: userId },
                { type: "User", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // PATCH /users/:userId/status — activate / deactivate
        patchUserStatus: builder.mutation({
            query: ({ userId, is_active }) => ({
                url: `/users/${userId}/status`,
                method: "PATCH",
                data: { is_active },
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: "User", id: userId },
                { type: "User", id: "LIST" },
            ],
            transformResponse: (response) => response.data,
        }),

        // POST /users/:userId/reset-password
        resetUserPassword: builder.mutation({
            query: ({ userId, new_password }) => ({
                url: `/users/${userId}/reset-password`,
                method: "POST",
                data: { new_password },
            }),
            transformResponse: (response) => response.data,
        }),

    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    usePatchUserStatusMutation,
    useResetUserPasswordMutation,
} = userApi;