import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerSW } from 'virtual:pwa-register';
import { toast } from '../../Components/shared/ToastConfig';
import {
  setNetworkStatus,
  setDbReady,
  setSyncing,
  setSyncSummary,
  setPullProgress,
} from '../../REDUX_FEATURES/REDUX_SLICES/Offline_api/offlineSlice';
import { store } from '../../REDUX_FEATURES/STORE/store';
import {
  getOfflineDb,
  resetOfflineDb,
  metaRepository,
  setupAutoSync,
  syncEngine,
  networkMonitor,
  isShopOfflineEligible,
  getUserShopId,
  OFFLINE_EVENTS,
} from '../index';

/**
 * Bootstraps PWA service worker, IndexedDB, and background sync for shop users.
 * Does not alter online API behaviour — existing RTK Query flows remain unchanged.
 */
export default function OfflineProvider({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const initialSyncDoneRef = useRef(false);
  const lastShopIdRef = useRef(null);
  const lastIssueToastAtRef = useRef(0);

  const goToSyncIssues = () => {
    navigate('/dashboard?tab=sales&ctab=offline-sync&syncFilter=failed');
  };

  const maybeShowSyncIssuesToast = (pendingCounts, pushResults) => {
    const issueCount = (pendingCounts?.conflict || 0) + (pendingCounts?.error || 0);
    if (issueCount <= 0) return;

    const hasFreshFailure = Array.isArray(pushResults)
      ? pushResults.some((r) => r.status === 'conflict' || r.status === 'error')
      : true;

    if (!hasFreshFailure) return;

    const now = Date.now();
    if (now - lastIssueToastAtRef.current < 4000) return;
    lastIssueToastAtRef.current = now;

    toast.warning(
      `${issueCount} sync issue${issueCount > 1 ? 's' : ''} — tap to view & fix`,
      {
        autoClose: 6000,
        onClick: goToSyncIssues,
      }
    );
  };

  useEffect(() => {
    registerSW({
      immediate: true,
      onRegistered(registration) {
        console.info('[pwa] service worker registered', registration?.scope);
      },
      onRegisterError(error) {
        console.error('[pwa] service worker registration failed', error);
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        await getOfflineDb();
        if (!cancelled) dispatch(setDbReady(true));
      } catch (err) {
        console.error('[offline] database init failed', err);
      }
    };

    boot();
    networkMonitor.start();
    dispatch(setNetworkStatus(networkMonitor.isOnline()));

    const unsubNetwork = networkMonitor.subscribe((online) => {
      dispatch(setNetworkStatus(online));
    });

    const unsubAutoSync = setupAutoSync(() => user);

    return () => {
      cancelled = true;
      unsubNetwork();
      unsubAutoSync();
    };
  }, [dispatch, user]);

  useEffect(() => {
    const onSyncStart = () => dispatch(setSyncing(true));
    const onSyncEnd = async (event) => {
      dispatch(setSyncing(false));
      const shopId = getUserShopId(user);
      if (shopId) {
        const summary = await syncEngine.getLocalSyncSummary(shopId);
        dispatch(setSyncSummary({
          lastSyncAt: summary.syncState?.last_pull_at ?? null,
          lastSyncError: summary.syncState?.last_error ?? null,
          pendingCounts: summary.pendingCounts,
        }));
        maybeShowSyncIssuesToast(summary.pendingCounts, event?.detail?.push?.results);
      }
    };
    const onPendingCounts = (event) => {
      const { pendingCounts } = event.detail || {};
      if (pendingCounts) {
        dispatch(setSyncSummary({ pendingCounts }));
      }
    };
    const onPullProgress = (detail) => dispatch(setPullProgress(detail));

    window.addEventListener(OFFLINE_EVENTS.SYNC_STARTED, onSyncStart);
    window.addEventListener(OFFLINE_EVENTS.SYNC_COMPLETED, onSyncEnd);
    window.addEventListener(OFFLINE_EVENTS.SYNC_FAILED, onSyncEnd);
    window.addEventListener(OFFLINE_EVENTS.PENDING_COUNTS_UPDATED, onPendingCounts);
    window.addEventListener(OFFLINE_EVENTS.PULL_PROGRESS, (e) => onPullProgress(e.detail));

    return () => {
      window.removeEventListener(OFFLINE_EVENTS.SYNC_STARTED, onSyncStart);
      window.removeEventListener(OFFLINE_EVENTS.SYNC_COMPLETED, onSyncEnd);
      window.removeEventListener(OFFLINE_EVENTS.SYNC_FAILED, onSyncEnd);
      window.removeEventListener(OFFLINE_EVENTS.PENDING_COUNTS_UPDATED, onPendingCounts);
      window.removeEventListener(OFFLINE_EVENTS.PULL_PROGRESS, (e) => onPullProgress(e.detail));
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const persistSession = async () => {
      const { accessToken } = store.getState().auth;
      await metaRepository.saveOfflineSession({ user, accessToken });
    };

    persistSession().catch((err) => console.error('[offline] session persist failed', err));
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !isShopOfflineEligible(user)) return;
    if (!networkMonitor.isOnline()) return;

    const shopId = getUserShopId(user);
    const shopChanged = lastShopIdRef.current && lastShopIdRef.current !== shopId;
    if (shopChanged) {
      resetOfflineDb()
        .then(() => getOfflineDb())
        .catch((err) => console.error('[offline] shop switch reset failed', err));
      initialSyncDoneRef.current = false;
    }
    lastShopIdRef.current = shopId;

    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;

    syncEngine.runFullSync(user).catch((err) => {
      console.error('[offline] initial sync failed', err);
      initialSyncDoneRef.current = false;
    });
  }, [isAuthenticated, user]);

  return children;
}
