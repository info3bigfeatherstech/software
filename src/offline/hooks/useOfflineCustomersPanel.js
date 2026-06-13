import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { customerRepository } from '../db/repositories/dataRepository';
import { mapLocalCustomerToApiRow } from '../utils/offlineCustomerAdapter';
import { useGetCustomersQuery } from '../../REDUX_FEATURES/REDUX_SLICES/Customer_api/customerApi';
import { OFFLINE_EVENTS } from '../constants';
import { useOfflineEvent } from './useOfflineStatus';

const matchesSearch = (customer, query) => {
  if (!query) return true;
  const term = query.toLowerCase().trim();
  return (
    customer.name?.toLowerCase().includes(term)
    || String(customer.mobile || '').includes(term)
    || customer.email?.toLowerCase().includes(term)
  );
};

const mergePendingCustomers = (apiRows, localRows) => {
  const apiMobiles = new Set(apiRows.map((c) => c.mobile).filter(Boolean));
  const pendingExtras = localRows.filter(
    (c) => c.is_offline_pending && c.mobile && !apiMobiles.has(c.mobile)
  );
  return [...pendingExtras, ...apiRows];
};

/**
 * Customers for Sales tab — online API when available, IndexedDB when offline.
 * Pending offline-created customers are merged into online lists until synced.
 */
export const useOfflineCustomersPanel = (
  shopId,
  { currentPage = 1, pageSize = 20, search = '', loyaltyFilter = '' } = {}
) => {
  const isOnline = useSelector((state) => state.offline.isOnline);
  const [localCustomers, setLocalCustomers] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);

  const {
    data: onlineData,
    isLoading: onlineLoading,
    isFetching: onlineFetching,
    refetch: refetchOnline,
  } = useGetCustomersQuery(
    {
      page: currentPage,
      limit: pageSize,
      loyalty_tier: loyaltyFilter || undefined,
    },
    { skip: !isOnline }
  );

  const loadLocal = useCallback(async () => {
    if (!shopId) {
      setLocalCustomers([]);
      setLocalLoading(false);
      return;
    }
    setLocalLoading(true);
    try {
      const rows = await customerRepository.listByShop(shopId);
      setLocalCustomers(rows.map(mapLocalCustomerToApiRow).filter(Boolean));
    } finally {
      setLocalLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadLocal();
  }, [loadLocal, isOnline]);

  useOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, loadLocal);

  const offlineFiltered = useMemo(() => {
    let rows = [...localCustomers];
    if (loyaltyFilter) {
      rows = rows.filter((c) => c.loyalty_tier === loyaltyFilter);
    }
    if (search) {
      rows = rows.filter((c) => matchesSearch(c, search));
    }
    rows.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    return rows;
  }, [localCustomers, loyaltyFilter, search]);

  const offlinePage = useMemo(() => {
    const total = offlineFiltered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      customers: offlineFiltered.slice(start, start + pageSize),
      meta: { total, page: safePage, limit: pageSize, totalPages },
    };
  }, [offlineFiltered, currentPage, pageSize]);

  const onlineCustomers = useMemo(() => {
    const apiRows = (onlineData?.customers || []).map((c) => ({
      ...c,
      is_offline_pending: false,
    }));
    return mergePendingCustomers(apiRows, localCustomers);
  }, [onlineData, localCustomers]);

  const usingOfflineCache =
    localCustomers.length > 0
    && (!isOnline || (!(onlineLoading || onlineFetching) && !(onlineData?.customers?.length)));

  const refetch = isOnline
    ? async () => {
        await Promise.all([refetchOnline(), loadLocal()]);
      }
    : loadLocal;

  return {
    customers: isOnline ? onlineCustomers : offlinePage.customers,
    meta: isOnline
      ? (onlineData?.meta || { total: 0, page: 1, limit: pageSize, totalPages: 1 })
      : offlinePage.meta,
    isLoading: isOnline ? onlineLoading && !onlineData?.customers?.length : localLoading,
    isFetching: isOnline ? onlineFetching : false,
    isOnline,
    usingOfflineCache: !isOnline ? localCustomers.length > 0 : usingOfflineCache,
    localCustomers,
    refetch,
  };
};
