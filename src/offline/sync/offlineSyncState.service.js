import { outboxRepository } from '../db/repositories/outboxRepository';
import { dispatchOfflineEvent } from './networkMonitor';
import { OFFLINE_EVENTS } from '../constants';

/** Push latest outbox status counts to Redux via OfflineProvider. */
export const broadcastPendingCounts = async (shopId) => {
  if (!shopId) return;
  const counts = await outboxRepository.countByStatus(shopId);
  dispatchOfflineEvent(OFFLINE_EVENTS.PENDING_COUNTS_UPDATED, {
    pendingCounts: {
      pending: counts.pending || 0,
      syncing: counts.syncing || 0,
      conflict: counts.conflict || 0,
      error: counts.error || 0,
      synced: counts.synced || 0,
    },
  });
};
