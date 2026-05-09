import { createSlice } from "@reduxjs/toolkit";
import {
  clearAccessTokenCookie,
  getAccessTokenCookie,
  setAccessTokenCookie,
} from "../../../SERVICES/AxiosInstance";

const bootToken = getAccessTokenCookie();

const initialState = {
  user: null,
  accessToken: bootToken,
  isAuthenticated: Boolean(bootToken),
  authChecked: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload || {};
      state.user = user || null;
      state.accessToken = accessToken || null;
      state.isAuthenticated = Boolean(accessToken && user);
      if (accessToken) {
        setAccessTokenCookie(accessToken);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      clearAccessTokenCookie();
    },
    setAuthChecked: (state, action) => {
      state.authChecked = Boolean(action.payload);
    },
  },
});

export const { setCredentials, clearCredentials, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
