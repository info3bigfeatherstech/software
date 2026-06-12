import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  lastSyncAt: null,
  lastSyncError: null,
  pendingCounts: {
    pending: 0,
    syncing: 0,
    conflict: 0,
    error: 0,
    synced: 0,
  },
  pullProgress: null,
  dbReady: false,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setNetworkStatus: (state, action) => {
      state.isOnline = Boolean(action.payload);
    },
    setDbReady: (state, action) => {
      state.dbReady = Boolean(action.payload);
    },
    setSyncing: (state, action) => {
      state.isSyncing = Boolean(action.payload);
    },
    setSyncSummary: (state, action) => {
      const { lastSyncAt, lastSyncError, pendingCounts } = action.payload || {};
      if (lastSyncAt !== undefined) state.lastSyncAt = lastSyncAt;
      if (lastSyncError !== undefined) state.lastSyncError = lastSyncError;
      if (pendingCounts) state.pendingCounts = { ...state.pendingCounts, ...pendingCounts };
    },
    setPullProgress: (state, action) => {
      state.pullProgress = action.payload ?? null;
    },
  },
});

export const {
  setNetworkStatus,
  setDbReady,
  setSyncing,
  setSyncSummary,
  setPullProgress,
} = offlineSlice.actions;

export default offlineSlice.reducer;
