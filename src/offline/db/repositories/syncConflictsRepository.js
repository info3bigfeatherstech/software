import { getOfflineDb } from '../connection';
import { OFFLINE_STORES } from '../../constants';

const nowIso = () => new Date().toISOString();

export const SYNC_CONFLICT_RESOLUTION = Object.freeze({
  OPEN: 'open',
  DISCARDED: 'discarded',
  RETRIED: 'retried',
  ADJUSTED: 'adjusted',
});

export const syncConflictsRepository = {
  async upsertFromFailure({ outboxRow, pushResult }) {
    if (!outboxRow?.client_id) return null;
    if (pushResult?.status !== 'error' && pushResult?.status !== 'conflict') return null;

    const db = await getOfflineDb();
    const timestamp = nowIso();
    const existing = await db.get(OFFLINE_STORES.SYNC_CONFLICTS, outboxRow.client_id);

    const record = {
      client_id: outboxRow.client_id,
      shop_id: outboxRow.shop_id,
      entity_type: outboxRow.entity_type,
      error_code: pushResult.error_code || null,
      error_message: pushResult.message || outboxRow.last_error || null,
      error_details: pushResult.error_details ?? outboxRow.error_details ?? null,
      http_status: pushResult.http_status ?? outboxRow.http_status ?? null,
      outbox_status: pushResult.status,
      payload_snapshot: outboxRow.payload ?? null,
      resolution: existing?.resolution === SYNC_CONFLICT_RESOLUTION.DISCARDED
        ? SYNC_CONFLICT_RESOLUTION.DISCARDED
        : SYNC_CONFLICT_RESOLUTION.OPEN,
      attempt_count: outboxRow.attempt_count ?? 0,
      created_at: existing?.created_at || timestamp,
      updated_at: timestamp,
    };

    await db.put(OFFLINE_STORES.SYNC_CONFLICTS, record);
    return record;
  },

  async get(clientId) {
    const db = await getOfflineDb();
    return db.get(OFFLINE_STORES.SYNC_CONFLICTS, clientId);
  },

  async listOpen(shopId) {
    const db = await getOfflineDb();
    const all = await db.getAll(OFFLINE_STORES.SYNC_CONFLICTS);
    return all
      .filter(
        (row) =>
          (!shopId || row.shop_id === shopId)
          && row.resolution === SYNC_CONFLICT_RESOLUTION.OPEN
      )
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  async markResolved(clientId, resolution = SYNC_CONFLICT_RESOLUTION.RETRIED) {
    const db = await getOfflineDb();
    const existing = await db.get(OFFLINE_STORES.SYNC_CONFLICTS, clientId);
    if (!existing) return null;
    const updated = {
      ...existing,
      resolution,
      updated_at: nowIso(),
    };
    await db.put(OFFLINE_STORES.SYNC_CONFLICTS, updated);
    return updated;
  },

  async remove(clientId) {
    const db = await getOfflineDb();
    await db.delete(OFFLINE_STORES.SYNC_CONFLICTS, clientId);
  },
};
