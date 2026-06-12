import { pullFullSnapshot } from './pullService';
import { pushPendingOutbox } from './pushService';
import { networkMonitor, dispatchOfflineEvent } from './networkMonitor';
import { metaRepository } from '../db/repositories/metaRepository';
import { outboxRepository } from '../db/repositories/outboxRepository';
import { OFFLINE_EVENTS, isShopOfflineEligible, getUserShopId } from '../constants';

let syncInProgress = false;
let syncQueue = Promise.resolve();

const runExclusive = (task) => {
  syncQueue = syncQueue.then(task, task);
  return syncQueue;
};

const refreshPendingCounts = async (shopId) => {
  const counts = await outboxRepository.countByStatus(shopId);
  return {
    pending: counts.pending || 0,
    syncing: counts.syncing || 0,
    conflict: counts.conflict || 0,
    error: counts.error || 0,
    synced: counts.synced || 0,
  };
};

export const syncEngine = {
  isSyncing() {
    return syncInProgress;
  },

  /**
   * Full sync cycle: push local mutations first, then pull fresh server snapshot.
   */
  async runFullSync(user, { since = null, onProgress } = {}) {
    if (!isShopOfflineEligible(user)) {
      return { skipped: true, reason: 'not_shop_user' };
    }

    const shopId = getUserShopId(user);
    if (!shopId) {
      return { skipped: true, reason: 'not_shop_user' };
    }
    if (!networkMonitor.isOnline()) {
      return { skipped: true, reason: 'offline' };
    }

    return runExclusive(async () => {
      if (syncInProgress) return { skipped: true, reason: 'already_syncing' };
      syncInProgress = true;
      dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_STARTED, { shopId });

      try {
        const pushResult = await pushPendingOutbox(shopId);
        const pullResult = await pullFullSnapshot(shopId, { since, onProgress });
        const pendingCounts = await refreshPendingCounts(shopId);

        const result = {
          shop_id: shopId,
          push: pushResult,
          pull: pullResult,
          pendingCounts,
          completed_at: new Date().toISOString(),
        };

        dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, result);
        return result;
      } catch (error) {
        await metaRepository.updateSyncState({
          shop_id: shopId,
          last_error: error?.message || 'Sync failed',
        });
        dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_FAILED, {
          shopId,
          message: error?.message,
        });
        throw error;
      } finally {
        syncInProgress = false;
      }
    });
  },

  async runPushOnly(user) {
    if (!isShopOfflineEligible(user) || !networkMonitor.isOnline()) {
      return { skipped: true };
    }

    return runExclusive(async () => {
      const shopId = getUserShopId(user);
      const result = await pushPendingOutbox(shopId);
      const pendingCounts = await refreshPendingCounts(shopId);
      const payload = {
        shop_id: shopId,
        push: result,
        pendingCounts,
        push_only: true,
      };
      dispatchOfflineEvent(OFFLINE_EVENTS.PENDING_COUNTS_UPDATED, { pendingCounts });
      dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, payload);
      return { push: result, pendingCounts };
    });
  },

  async getLocalSyncSummary(shopId) {
    const syncState = await metaRepository.getSyncState();
    const pendingCounts = shopId ? await refreshPendingCounts(shopId) : {};
    return { syncState, pendingCounts };
  },
};

export const setupAutoSync = (getUser) => {
  networkMonitor.start();

  const handleOnline = () => {
    const user = getUser();
    if (user && isShopOfflineEligible(user)) {
      syncEngine.runFullSync(user).catch((err) => {
        console.error('[sync-engine] auto-sync failed', err);
      });
    }
  };

  const unsubscribe = networkMonitor.subscribe((online) => {
    if (online) handleOnline();
  });

  return unsubscribe;
};
