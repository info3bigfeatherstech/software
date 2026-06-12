import { getOfflineDb, withOfflineTransaction } from '../connection';
import { OFFLINE_STORES, OUTBOX_STATUS } from '../../constants';

const nowIso = () => new Date().toISOString();

/**
 * Transactional outbox — industry-standard pattern for reliable offline sync.
 */
export const outboxRepository = {
  async enqueue(entry) {
    const timestamp = nowIso();
    const record = {
      client_id: entry.client_id,
      shop_id: entry.shop_id,
      entity_type: entry.entity_type,
      idempotency_key: entry.idempotency_key,
      payload: entry.payload,
      stock_mutated_locally: Boolean(entry.stock_mutated_locally),
      offline_created_at: entry.offline_created_at || timestamp,
      client_sequence: entry.client_sequence ?? 0,
      status: OUTBOX_STATUS.PENDING,
      attempt_count: 0,
      last_error: null,
      server_id: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const db = await getOfflineDb();
    await db.put(OFFLINE_STORES.OUTBOX, record);
    return record;
  },

  async getByClientId(clientId) {
    const db = await getOfflineDb();
    return db.get(OFFLINE_STORES.OUTBOX, clientId);
  },

  async listPending(shopId, { limit = 100 } = {}) {
    const db = await getOfflineDb();
    const tx = db.transaction(OFFLINE_STORES.OUTBOX, 'readonly');
    const index = tx.store.index('by_shop_status');
    const rows = await index.getAll([shopId, OUTBOX_STATUS.PENDING]);
    await tx.done;
    return rows
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, limit);
  },

  async listByShop(shopId, { statuses = null, limit = 200 } = {}) {
    const db = await getOfflineDb();
    const all = await db.getAll(OFFLINE_STORES.OUTBOX);
    let rows = shopId ? all.filter((r) => r.shop_id === shopId) : all;
    if (statuses?.length) {
      rows = rows.filter((r) => statuses.includes(r.status));
    }
    return rows
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  },

  async resetForRetry(clientId) {
    const db = await getOfflineDb();
    const row = await db.get(OFFLINE_STORES.OUTBOX, clientId);
    if (!row) return null;
    if (![OUTBOX_STATUS.ERROR, OUTBOX_STATUS.CONFLICT].includes(row.status)) {
      return row;
    }
    const updated = {
      ...row,
      status: OUTBOX_STATUS.PENDING,
      last_error: null,
      error_code: null,
      error_details: null,
      http_status: null,
      updated_at: nowIso(),
    };
    await db.put(OFFLINE_STORES.OUTBOX, updated);
    return updated;
  },

  async resetAllRetryable(shopId) {
    const rows = await this.listByShop(shopId, {
      statuses: [OUTBOX_STATUS.ERROR, OUTBOX_STATUS.CONFLICT],
    });
    const updated = [];
    for (const row of rows) {
      const next = await this.resetForRetry(row.client_id);
      if (next) updated.push(next);
    }
    return updated;
  },

  async countByStatus(shopId) {
    const db = await getOfflineDb();
    const tx = db.transaction(OFFLINE_STORES.OUTBOX, 'readonly');
    const store = tx.store;
    const all = await store.getAll();
    await tx.done;

    const scoped = shopId ? all.filter((r) => r.shop_id === shopId) : all;
    return scoped.reduce((acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    }, /** @type {Record<string, number>} */ ({}));
  },

  async markSyncing(clientIds) {
    return withOfflineTransaction([OFFLINE_STORES.OUTBOX], 'readwrite', async (stores) => {
      const store = stores[OFFLINE_STORES.OUTBOX];
      const updated = [];
      for (const clientId of clientIds) {
        const row = await store.get(clientId);
        if (!row) continue;
        const next = {
          ...row,
          status: OUTBOX_STATUS.SYNCING,
          attempt_count: (row.attempt_count || 0) + 1,
          updated_at: nowIso(),
        };
        await store.put(next);
        updated.push(next);
      }
      return updated;
    });
  },

  async applyPushResults(results) {
    return withOfflineTransaction([OFFLINE_STORES.OUTBOX], 'readwrite', async (stores) => {
      const store = stores[OFFLINE_STORES.OUTBOX];
      for (const result of results) {
        const row = await store.get(result.client_id);
        if (!row) continue;

        let status = OUTBOX_STATUS.ERROR;
        if (result.status === 'applied' || result.status === 'duplicate') {
          status = OUTBOX_STATUS.SYNCED;
        } else if (result.status === 'conflict') {
          status = OUTBOX_STATUS.CONFLICT;
        } else if (result.status === 'deferred') {
          status = OUTBOX_STATUS.PENDING;
        }

        await store.put({
          ...row,
          status,
          server_id: result.server_id ?? row.server_id,
          last_error: result.message ?? null,
          error_code: result.error_code ?? null,
          error_details: result.error_details ?? null,
          http_status: result.http_status ?? null,
          updated_at: nowIso(),
        });
      }
    });
  },

  async remove(clientId) {
    const db = await getOfflineDb();
    await db.delete(OFFLINE_STORES.OUTBOX, clientId);
  },

  async updateEntry(clientId, patch) {
    const db = await getOfflineDb();
    const row = await db.get(OFFLINE_STORES.OUTBOX, clientId);
    if (!row) return null;
    const { payload: payloadPatch, ...rest } = patch;
    const updated = {
      ...row,
      ...rest,
      payload: payloadPatch ? { ...row.payload, ...payloadPatch } : row.payload,
      updated_at: nowIso(),
    };
    await db.put(OFFLINE_STORES.OUTBOX, updated);
    return updated;
  },

  async purgeSynced(shopId, { olderThanDays = 30 } = {}) {
    const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
    const db = await getOfflineDb();
    const tx = db.transaction(OFFLINE_STORES.OUTBOX, 'readwrite');
    const all = await tx.store.getAll();
    for (const row of all) {
      if (
        row.shop_id === shopId
        && row.status === OUTBOX_STATUS.SYNCED
        && row.updated_at < cutoff
      ) {
        await tx.store.delete(row.client_id);
      }
    }
    await tx.done;
  },
};
