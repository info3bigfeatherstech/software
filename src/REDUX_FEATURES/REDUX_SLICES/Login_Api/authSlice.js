import { createSlice } from "@reduxjs/toolkit";
import { setGlobalAccessToken, clearGlobalAccessToken } from "../../../SERVICES/AxiosInstance";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  authChecked: false,
  isOfflineSession: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, isOfflineSession } = action.payload || {};
      state.user = user ? {
        ...user,
        locationName: user.locationName || user.warehouse_id || user.shop_id || null
      } : null;
      state.accessToken = accessToken || null;
      state.isOfflineSession = Boolean(isOfflineSession);
      state.isAuthenticated = Boolean(user && (accessToken || isOfflineSession));
      
      // ✅ Set token in AxiosInstance (memory, not cookie)
      if (accessToken) {
        setGlobalAccessToken(accessToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isOfflineSession = false;
      
      // ✅ Clear token from AxiosInstance
      clearGlobalAccessToken();
    },
    setAuthChecked: (state, action) => {
      state.authChecked = Boolean(action.payload);
    },
  },
});

export const { setCredentials, clearCredentials, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
// down code store acces token in cokkie we change it to store in redux 
// import { createSlice } from "@reduxjs/toolkit";
// import {
//   clearAccessTokenCookie,
//   getAccessTokenCookie,
//   setAccessTokenCookie,
// } from "../../../SERVICES/AxiosInstance";

// const bootToken = getAccessTokenCookie();

// const initialState = {
//   user: null,
//   accessToken: bootToken,
//   isAuthenticated: Boolean(bootToken),
//   authChecked: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       const { user, accessToken } = action.payload || {};
//       // state.user = user || null;
//       state.user = user ? {
//         ...user,
//         locationName: user.locationName || user.warehouse_id || user.shop_id || null
//       } : null;
//       state.accessToken = accessToken || null;
//       state.isAuthenticated = Boolean(accessToken && user);
//       if (accessToken) {
//         setAccessTokenCookie(accessToken);
//       }
//     },
//     clearCredentials: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       state.isAuthenticated = false;
//       clearAccessTokenCookie();
//     },
//     setAuthChecked: (state, action) => {
//       state.authChecked = Boolean(action.payload);
//     },
//   },
// });

// export const { setCredentials, clearCredentials, setAuthChecked } = authSlice.actions;
// export default authSlice.reducer;
