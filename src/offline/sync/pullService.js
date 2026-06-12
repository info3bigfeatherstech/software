import AxiosInstance from '../../SERVICES/AxiosInstance';
import {
  SYNC_API_VERSION,
  SYNC_PULL_PAGE_LIMIT,
  OFFLINE_EVENTS,
} from '../constants';
import {
  shopConfigRepository,
  shopStockRepository,
  customerRepository,
} from '../db/repositories/dataRepository';
import { metaRepository } from '../db/repositories/metaRepository';
import { dispatchOfflineEvent } from './networkMonitor';

const unwrap = (response) => response?.data?.data ?? response?.data ?? null;

const pullPage = async (params) => {
  const { data } = await AxiosInstance.get('/sync/pull', { params });
  return unwrap({ data });
};

/**
 * Downloads the full shop snapshot into IndexedDB using cursor pagination.
 */
export const pullFullSnapshot = async (shopId, { since = null, onProgress } = {}) => {
  if (!shopId) throw new Error('shopId is required for sync pull');

  let stocksCursor = null;
  let customersCursor = null;
  let stocksDone = false;
  let customersDone = false;
  let stocksTotal = 0;
  let customersTotal = 0;

  const configPayload = await pullPage({
    shop_id: shopId,
    sections: 'config',
  });

  if (configPayload?.config) {
    await shopConfigRepository.saveConfigBundle(configPayload.config);
  }

  while (!stocksDone || !customersDone) {
    const sections = [];
    if (!stocksDone) sections.push('stocks');
    if (!customersDone) sections.push('customers');

    const page = await pullPage({
      shop_id: shopId,
      sections: sections.join(','),
      limit: SYNC_PULL_PAGE_LIMIT,
      ...(since ? { since } : {}),
      ...(stocksCursor ? { stocks_cursor: stocksCursor } : {}),
      ...(customersCursor ? { customers_cursor: customersCursor } : {}),
    });

    if (page.sync_version && page.sync_version !== SYNC_API_VERSION) {
      console.warn(
        `[sync-pull] API version mismatch: server=${page.sync_version}, client=${SYNC_API_VERSION}`
      );
    }

    if (!stocksDone && page.stocks) {
      const count = await shopStockRepository.bulkUpsert(page.stocks.items || []);
      stocksTotal += count;
      stocksDone = !page.stocks.has_more;
      stocksCursor = page.stocks.next_cursor;
    } else if (!stocksDone) {
      stocksDone = true;
    }

    if (!customersDone && page.customers) {
      const count = await customerRepository.bulkUpsert(page.customers.items || []);
      customersTotal += count;
      customersDone = !page.customers.has_more;
      customersCursor = page.customers.next_cursor;
    } else if (!customersDone) {
      customersDone = true;
    }

    onProgress?.({
      stocksTotal,
      customersTotal,
      stocksDone,
      customersDone,
    });

    dispatchOfflineEvent(OFFLINE_EVENTS.PULL_PROGRESS, {
      stocksTotal,
      customersTotal,
      stocksDone,
      customersDone,
    });
  }

  await metaRepository.updateSyncState({
    shop_id: shopId,
    last_pull_at: new Date().toISOString(),
    last_error: null,
  });

  return {
    shop_id: shopId,
    stocksTotal,
    customersTotal,
    pulled_at: new Date().toISOString(),
  };
};

export const fetchSyncStatus = async (shopId) => {
  const { data } = await AxiosInstance.get('/sync/status', {
    params: { shop_id: shopId },
  });
  return unwrap({ data });
};
