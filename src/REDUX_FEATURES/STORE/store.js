import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../REDUX_SLICES/Login_Api/authSlice";
import { authApi } from "../REDUX_SLICES/Login_Api/authApi";
import { vendorApi } from "../REDUX_SLICES/Vendor_api/vendorApi";
import vendorReducer from "../REDUX_SLICES/Vendor_api/vendorSlice";
import { warehouseApi } from "../REDUX_SLICES/Warehouse_api/warehouseApi";
import warehouseReducer from "../REDUX_SLICES/Warehouse_api/warehouseSlice";
import { userApi } from "../REDUX_SLICES/User_Api/userApi";
import userReducer from "../REDUX_SLICES/User_Api/userSlice";
import { inwardApi } from "../REDUX_SLICES/Inward_api/inwardApi";
import inwardReducer from "../REDUX_SLICES/Inward_api/inwardSlice";
import { categoryApi } from "../REDUX_SLICES/Category_api/categoryApi";
import categoryReducer from "../REDUX_SLICES/Category_api/categorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    vendor: vendorReducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    warehouse: warehouseReducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    inward: inwardReducer,
    [inwardApi.reducerPath]: inwardApi.reducer,
    category: categoryReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      vendorApi.middleware,
      warehouseApi.middleware,
      userApi.middleware,
      inwardApi.middleware,
      categoryApi.middleware,
    ),
});
