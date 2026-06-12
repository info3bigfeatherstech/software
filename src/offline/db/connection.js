import { openDB, deleteDB } from 'idb';
import {
  OFFLINE_DB_NAME,
  OFFLINE_DB_VERSION,
  OFFLINE_STORES,
} from '../constants';
import { offlineDbSchema } from './schema';

/** @type {Promise<import('idb').IDBPDatabase>|null} */
let dbPromise = null;

const upgradeDatabase = (db, oldVersion, _newVersion, transaction) => {
  if (oldVersion < 1) {
    for (const storeName of Object.values(OFFLINE_STORES)) {
      if (!db.objectStoreNames.contains(storeName)) {
        const schema = offlineDbSchema[storeName];
        const store = db.createObjectStore(storeName, {
          keyPath: schema.keyPath,
          autoIncrement: schema.autoIncrement ?? false,
        });

        if (schema.indexes) {
          for (const [indexName, keyPath] of Object.entries(schema.indexes)) {
            store.createIndex(indexName, keyPath, { unique: false });
          }
        }
      }
    }
  }

  if (oldVersion < 2 && !db.objectStoreNames.contains(OFFLINE_STORES.LOCAL_BILLS)) {
    const schema = offlineDbSchema[OFFLINE_STORES.LOCAL_BILLS];
    const store = db.createObjectStore(OFFLINE_STORES.LOCAL_BILLS, {
      keyPath: schema.keyPath,
    });
    if (schema.indexes) {
      for (const [indexName, keyPath] of Object.entries(schema.indexes)) {
        store.createIndex(indexName, keyPath, { unique: false });
      }
    }
  }

  void transaction;
};

export const getOfflineDb = () => {
  if (!dbPromise) {
    dbPromise = openDB(OFFLINE_DB_NAME, OFFLINE_DB_VERSION, {
      upgrade: upgradeDatabase,
      blocked() {
        console.warn('[offline-db] Database upgrade blocked — close other tabs.');
      },
      blocking() {
        console.warn('[offline-db] This tab is blocking a database upgrade in another tab.');
      },
      terminated() {
        console.error('[offline-db] Database connection terminated unexpectedly.');
        dbPromise = null;
      },
    });
  }
  return dbPromise;
};

export const closeOfflineDb = async () => {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
};

/** Destructive — used on logout or shop switch. */
export const resetOfflineDb = async () => {
  await closeOfflineDb();
  await deleteDB(OFFLINE_DB_NAME);
};

export const withOfflineTransaction = async (storeNames, mode, callback) => {
  const db = await getOfflineDb();
  const tx = db.transaction(storeNames, mode);
  const stores = storeNames.reduce((acc, name) => {
    acc[name] = tx.objectStore(name);
    return acc;
  }, /** @type {Record<string, import('idb').IDBPObjectStore>} */ ({}));

  const result = await callback(stores, tx);
  await tx.done;
  return result;
};
