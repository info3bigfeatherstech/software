import { createApi } from "@reduxjs/toolkit/query/react";
import AxiosInstance from "../../../SERVICES/AxiosInstance";

// Custom baseQuery using your AxiosInstance
const axiosBaseQuery = () => async ({ url, method, data, params }) => {
  try {
    const response = await AxiosInstance({
      url,
      method,
      data,
      params,
    });
    return { data: response.data };
  } catch (error) {
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      },
    };
  }
};

export const bulkUploadApi = createApi({
  reducerPath: "bulkUploadApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    // Preview endpoint (validate only)
    previewBulkCsv: builder.mutation({
      query: ({ csvFile }) => {
        const formData = new FormData();
        formData.append("file", csvFile);
        return {
          url: "/products/bulk/csv?preview=true",
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
    }),
    // Final import (CSV + optional ZIP)
    importBulkCsv: builder.mutation({
      query: ({ csvFile, zipFile }) => {
        const formData = new FormData();
        formData.append("file", csvFile);
        if (zipFile) formData.append("imagesZip", zipFile);
        return {
          url: "/products/bulk/csv",
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
    }),
  }),
});

export const { usePreviewBulkCsvMutation, useImportBulkCsvMutation } = bulkUploadApi;