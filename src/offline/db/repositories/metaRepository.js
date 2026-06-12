import { getOfflineDb } from '../connection';
import { OFFLINE_STORES, META_KEYS } from '../../constants';

const nowIso = () => new Date().toISOString();

export const metaRepository = {
  async get(key) {
    const db = await getOfflineDb();
    const row = await db.get(OFFLINE_STORES.META, key);
    return row?.value ?? null;
  },

  async set(key, value) {
    const db = await getOfflineDb();
    await db.put(OFFLINE_STORES.META, {
      key,
      value,
      updated_at: nowIso(),
    });
  },

  async remove(key) {
    const db = await getOfflineDb();
    await db.delete(OFFLINE_STORES.META, key);
  },

  async getSyncState() {
    return (await this.get(META_KEYS.SYNC_STATE)) || {
      shop_id: null,
      last_pull_at: null,
      last_push_at: null,
      last_error: null,
    };
  },

  async updateSyncState(patch) {
    const current = await this.getSyncState();
    await this.set(META_KEYS.SYNC_STATE, {
      ...current,
      ...patch,
      updated_at: nowIso(),
    });
  },

  async saveOfflineSession({ user, accessToken }) {
    await this.set(META_KEYS.SESSION, {
      user,
      accessToken: accessToken ?? null,
      saved_at: nowIso(),
    });
  },

  async getOfflineSession() {
    return this.get(META_KEYS.SESSION);
  },

  async clearOfflineSession() {
    await this.remove(META_KEYS.SESSION);
  },

  async getOrCreateDeviceId() {
    let deviceId = await this.get(META_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      await this.set(META_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  },
};
