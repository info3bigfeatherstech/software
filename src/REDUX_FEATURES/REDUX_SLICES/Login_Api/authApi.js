import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

const extractAuthPayload = (responseBody) => {
  const data = responseBody?.data || responseBody;
  return {
    accessToken: data?.accessToken || data?.access_token || null,
    user: data?.user || null,
  };
};

const axiosBaseQuery =
  () =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await AxiosInstance({
        url,
        method,
        data,
        params,
        headers,
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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      transformResponse: (response) => extractAuthPayload(response),
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response) => extractAuthPayload(response),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      transformResponse: (response) => response?.data || response,
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
