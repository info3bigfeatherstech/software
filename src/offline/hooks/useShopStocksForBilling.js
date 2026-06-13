import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { shopStockRepository } from '../db/repositories/dataRepository';
import { mapLocalStockToApiRow } from '../utils/offlineStockAdapter';
import { useGetShopStocksCatalogQuery } from '../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi';
import { OFFLINE_EVENTS } from '../constants';
import { useOfflineEvent } from './useOfflineStatus';

/**
 * Shop stocks for billing — server-first when online, IndexedDB fallback when offline
 * or when the live stock API is unavailable after fetch settles.
 */
export const useShopStocksForBilling = (shopId) => {
  const isOnline = useSelector((state) => state.offline.isOnline);
  const [localStocks, setLocalStocks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localVersion, setLocalVersion] = useState(0);

  const {
    data: onlineData,
    isLoading: onlineLoading,
    isFetching: onlineFetching,
    refetch,
  } = useGetShopStocksCatalogQuery(
    { shop_id: shopId },
    {
      skip: !shopId || !isOnline,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    }
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
      setLocalVersion((v) => v + 1);
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

  useEffect(() => {
    if (isOnline && shopId) {
      refetch();
    }
  }, [isOnline, shopId, refetch]);

  useOfflineEvent(OFFLINE_EVENTS.STOCKS_UPDATED, (event) => {
    const updatedShopId = event?.detail?.shopId;
    if (updatedShopId && updatedShopId !== shopId) return;
    refreshAll();
  });

  useOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, refreshAll);

  const onlineStocks = onlineData?.stocks ?? [];
  const onlineHasStocks = onlineStocks.length > 0;
  const onlineBusy = onlineLoading || onlineFetching;
  const onlineSettled = isOnline && !onlineBusy;

  const stocks = isOnline && onlineHasStocks ? onlineStocks : localStocks;

  const isLoading = isOnline
    ? onlineBusy && !onlineHasStocks && !localStocks.length
    : localLoading;

  const usingOfflineCache = !isOnline
    ? localStocks.length > 0
    : onlineSettled && !onlineHasStocks && localStocks.length > 0;

  return {
    stocks,
    isLoading,
    isFetching: isOnline ? onlineFetching : false,
    isOnline,
    usingOfflineCache,
    localVersion,
    refetch: refreshAll,
  };
};
