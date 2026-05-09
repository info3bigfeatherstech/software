import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../REDUX_SLICES/Login_Api/authSlice";
import { authApi } from "../REDUX_SLICES/Login_Api/authApi";
import { vendorApi } from "../REDUX_SLICES/Vendor_api/vendorApi";
import vendorReducer from "../REDUX_SLICES/Vendor_api/vendorSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    vendor: vendorReducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(authApi.middleware,vendorApi.middleware),
});
