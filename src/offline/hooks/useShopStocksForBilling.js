import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { shopStockRepository } from '../db/repositories/dataRepository';
import { mapLocalStockToApiRow } from '../utils/offlineStockAdapter';
import { useGetShopStocksQuery } from '../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi';

/**
 * Shop stocks for billing — online API when available, IndexedDB fallback when offline.
 */
export const useShopStocksForBilling = (shopId) => {
  const isOnline = useSelector((state) => state.offline.isOnline);
  const [localStocks, setLocalStocks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const {
    data: onlineData,
    isLoading: onlineLoading,
    isFetching: onlineFetching,
    refetch,
  } = useGetShopStocksQuery(
    { shop_id: shopId, limit: 500 },
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
      const rows = await shopStockRepository.listAll();
      setLocalStocks(rows.map(mapLocalStockToApiRow).filter(Boolean));
    } finally {
      setLocalLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadLocal();
  }, [loadLocal, isOnline]);

  const onlineStocks = onlineData?.stocks || [];
  const stocks = isOnline && onlineStocks.length > 0 ? onlineStocks : localStocks;
  const isLoading = isOnline ? (onlineLoading || onlineFetching) && !onlineStocks.length : localLoading;
  const usingOfflineCache = !isOnline || !onlineStocks.length;

  return {
    stocks,
    isLoading,
    isFetching: isOnline ? onlineFetching : false,
    isOnline,
    usingOfflineCache,
    refetch: isOnline ? refetch : loadLocal,
  };
};
