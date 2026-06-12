import {
  OFFLINE_STORES,
} from '../constants';

/** @typedef {import('idb').DBSchema} DBSchema */

/**
 * @typedef {Object} OfflineMetaRecord
 * @property {string} key
 * @property {unknown} value
 * @property {string} updated_at
 */

/**
 * @typedef {Object} OutboxRecord
 * @property {string} client_id
 * @property {string} shop_id
 * @property {string} entity_type
 * @property {string} idempotency_key
 * @property {object} payload
 * @property {boolean} [stock_mutated_locally]
 * @property {string} offline_created_at
 * @property {number} [client_sequence]
 * @property {string} status
 * @property {number} attempt_count
 * @property {string|null} last_error
 * @property {string|null} server_id
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} VyaparOfflineDB
 * @property {OfflineMetaRecord} meta
 * @property {OutboxRecord} outbox
 * @property {{ key: string, value: unknown, updated_at: string }} shop_config
 * @property {object} shop_stocks
 * @property {object} customers
 * @property {object} sync_conflicts
 */

/** @type {import('idb').DBSchema} */
export const offlineDbSchema = {
  [OFFLINE_STORES.META]: {
    keyPath: 'key',
  },
  [OFFLINE_STORES.OUTBOX]: {
    keyPath: 'client_id',
    indexes: {
      by_status: 'status',
      by_shop_status: ['shop_id', 'status'],
      by_entity_type: 'entity_type',
      by_created_at: 'created_at',
    },
  },
  [OFFLINE_STORES.SHOP_CONFIG]: {
    keyPath: 'key',
  },
  [OFFLINE_STORES.SHOP_STOCKS]: {
    keyPath: 'variant_id',
    indexes: {
      by_barcode: 'system_barcode',
      by_sku: 'sku',
      by_product_id: 'product_id',
    },
  },
  [OFFLINE_STORES.CUSTOMERS]: {
    keyPath: 'customer_id',
    indexes: {
      by_mobile: 'mobile',
      by_client_id: 'client_id',
    },
  },
  [OFFLINE_STORES.SYNC_CONFLICTS]: {
    keyPath: 'client_id',
  },
  [OFFLINE_STORES.LOCAL_BILLS]: {
    keyPath: 'client_bill_id',
    indexes: {
      by_shop_created: ['shop_id', 'created_at'],
      by_sync_status: 'sync_status',
    },
  },
};
