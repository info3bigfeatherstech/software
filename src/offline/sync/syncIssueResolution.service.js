import { localBillsRepository, shopStockMutationService } from '../db/repositories/localBillsRepository';
import { outboxRepository } from '../db/repositories/outboxRepository';
import {
  syncConflictsRepository,
  SYNC_CONFLICT_RESOLUTION,
} from '../db/repositories/syncConflictsRepository';
import { OUTBOX_STATUS, OFFLINE_EVENTS } from '../constants';
import { broadcastPendingCounts } from './offlineSyncState.service';
import { dispatchOfflineEvent } from './networkMonitor';

/**
 * Cancel an offline bill that cannot sync: restore local stock, remove outbox entry.
 */
export const discardOfflineBill = async ({ clientBillId, shopId }) => {
  const bill = await localBillsRepository.get(clientBillId);
  if (!bill) {
    throw new Error('Offline bill not found on this device');
  }
  if (bill.sync_status === 'synced') {
    throw new Error('This bill is already synced — it cannot be discarded locally');
  }
  if (bill.sync_status === 'discarded') {
    return bill;
  }

  const outbox = await outboxRepository.getByClientId(clientBillId);
  const lines = (bill.items || []).map((item) => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
  }));

  if (outbox?.stock_mutated_locally !== false && lines.length) {
    await shopStockMutationService.restoreForSale(shopId || bill.shop_id, lines);
  }

  await localBillsRepository.markDiscarded(clientBillId);
  await outboxRepository.remove(clientBillId);
  await syncConflictsRepository.markResolved(clientBillId, SYNC_CONFLICT_RESOLUTION.DISCARDED);
  await broadcastPendingCounts(shopId || bill.shop_id);
  dispatchOfflineEvent(OFFLINE_EVENTS.BILL_DISCARDED, { clientBillId });

  return localBillsRepository.get(clientBillId);
};

/** Reset a failed outbox row for retry (non-bill entities). */
export const retryOutboxItem = async (clientId) => {
  const row = await outboxRepository.getByClientId(clientId);
  if (!row) throw new Error('Sync item not found');
  if (![OUTBOX_STATUS.ERROR, OUTBOX_STATUS.CONFLICT].includes(row.status)) {
    throw new Error('Only failed items can be retried');
  }
  await syncConflictsRepository.markResolved(clientId, SYNC_CONFLICT_RESOLUTION.RETRIED);
  return outboxRepository.resetForRetry(clientId);
};

/** Cancel a pending offline stock adjustment — revert local stock to pre-adjustment quantity. */
export const discardStockAdjustment = async ({ clientId, shopId }) => {
  const outbox = await outboxRepository.getByClientId(clientId);
  if (!outbox || outbox.entity_type !== 'stock_adjustment') {
    throw new Error('Offline stock adjustment not found on this device');
  }
  if (outbox.status === OUTBOX_STATUS.SYNCED) {
    throw new Error('This adjustment is already synced — it cannot be discarded locally');
  }

  const payload = outbox.payload || {};
  if (payload.variant_id != null && payload.offline_before_quantity != null) {
    await shopStockMutationService.revertToQuantity(shopId || outbox.shop_id, {
      variant_id: payload.variant_id,
      quantity: payload.offline_before_quantity,
    });
  }

  await outboxRepository.remove(clientId);
  await syncConflictsRepository.markResolved(clientId, SYNC_CONFLICT_RESOLUTION.DISCARDED);
  await broadcastPendingCounts(shopId || outbox.shop_id);
  dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, { clientId, entityType: 'stock_adjustment' });
};

/** Remove a pending offline shop expense from the outbox (no local stock to revert). */
export const discardShopExpense = async ({ clientId, shopId }) => {
  const outbox = await outboxRepository.getByClientId(clientId);
  if (!outbox || outbox.entity_type !== 'shop_expense') {
    throw new Error('Offline expense not found on this device');
  }
  if (outbox.status === OUTBOX_STATUS.SYNCED) {
    throw new Error('This expense is already synced — it cannot be discarded locally');
  }

  await outboxRepository.remove(clientId);
  await syncConflictsRepository.markResolved(clientId, SYNC_CONFLICT_RESOLUTION.DISCARDED);
  await broadcastPendingCounts(shopId || outbox.shop_id);
  dispatchOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, { clientId, entityType: 'shop_expense' });
};

/** Retry all pending customer outbox rows first (dependency fix for bills). */
export const retryPendingCustomers = async (shopId) => {
  const rows = await outboxRepository.listByShop(shopId, {
    statuses: [OUTBOX_STATUS.ERROR, OUTBOX_STATUS.CONFLICT, OUTBOX_STATUS.PENDING],
  });
  const customers = rows.filter((r) => r.entity_type === 'customer');
  for (const row of customers) {
    if ([OUTBOX_STATUS.ERROR, OUTBOX_STATUS.CONFLICT].includes(row.status)) {
      await outboxRepository.resetForRetry(row.client_id);
    }
  }
  return customers.length;
};
