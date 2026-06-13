import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shopStockRepository } from '../db/repositories/dataRepository';
import { mapLocalStockToApiRow } from '../utils/offlineStockAdapter';
import { useGetShopStocksQuery } from '../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi';
import { OFFLINE_EVENTS } from '../constants';
import { useOfflineEvent } from './useOfflineStatus';

const matchesSearch = (stock, query) => {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const product = stock.variant?.product || {};
  const variant = stock.variant || {};
  const haystack = [
    product.name,
    product.product_code,
    variant.sku,
    variant.product_code,
    variant.system_barcode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
};

/**
 * Shop stocks for Inventory tab — online API when available, IndexedDB with client-side filter/pagination when offline.
 */
export const useShopStocksForInventory = (
  shopId,
  { search = '', lowStockOnly = false, page = 1, limit = 20 } = {}
) => {
  const isOnline = useSelector((state) => state.offline.isOnline);
  const [localStocks, setLocalStocks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const {
    data: onlineData,
    isLoading: onlineLoading,
    isFetching: onlineFetching,
    refetch,
  } = useGetShopStocksQuery(
    {
      shop_id: shopId,
      page,
      limit,
      search,
      low_stock_only: lowStockOnly,
    },
    { skip: !shopId || !isOnline }
  );

  const loadLocal = useCallback(async () => {
    if (!shopId) {
      setLocalStocks([]);
      setLocalLoading(false);
      return;
    }
    setLocalLoading(true);
    try {
      const rows = await shopStockRepository.listByShop(shopId);
      setLocalStocks(rows.map(mapLocalStockToApiRow).filter(Boolean));
    } finally {
      setLocalLoading(false);
    }
  }, [shopId]);

  const refreshAll = useCallback(() => {
    loadLocal();
    if (isOnline && shopId) {
      refetch();
    }
  }, [loadLocal, isOnline, shopId, refetch]);

  useEffect(() => {
    loadLocal();
  }, [loadLocal]);

  useOfflineEvent(OFFLINE_EVENTS.STOCKS_UPDATED, (event) => {
    const updatedShopId = event?.detail?.shopId;
    if (updatedShopId && updatedShopId !== shopId) return;
    refreshAll();
  });

  useOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, refreshAll);

  const offlineResult = useMemo(() => {
    let filtered = localStocks.filter((s) => matchesSearch(s, search));
    if (lowStockOnly) {
      filtered = filtered.filter(
        (s) =>
          s.quantity_available > 0
          && s.quantity_available <= (s.low_stock_threshold || 10)
      );
    }
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * limit;
    const stocks = filtered.slice(start, start + limit);
    return {
      stocks,
      meta: { total, page: safePage, limit, totalPages },
    };
  }, [localStocks, search, lowStockOnly, page, limit]);

  const onlineStocks = onlineData?.stocks || [];
  const onlineMeta = onlineData?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  const usingOfflineCache = !isOnline
    ? localStocks.length > 0
    : !(onlineLoading || onlineFetching) && !onlineStocks.length && localStocks.length > 0;

  return {
    stocks: isOnline && onlineStocks.length ? onlineStocks : offlineResult.stocks,
    meta: isOnline && onlineStocks.length ? onlineMeta : offlineResult.meta,
    isLoading: isOnline ? onlineLoading && !onlineStocks.length : localLoading,
    isFetching: isOnline ? onlineFetching : false,
    isOnline,
    usingOfflineCache,
    refetch: refreshAll,
  };
};
