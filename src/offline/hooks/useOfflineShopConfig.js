import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { shopConfigRepository } from '../db/repositories/dataRepository';
import { useGetShopBankAccountsQuery, useGetShopStaffCodesQuery } from '../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi';

/**
 * Shop billing config (staff codes, bank accounts) with offline cache fallback.
 */
export const useOfflineShopConfig = (shopId) => {
  const isOnline = useSelector((state) => state.offline.isOnline);
  const [cached, setCached] = useState(null);

  const loadCached = useCallback(async () => {
    const bundle = await shopConfigRepository.getConfigBundle();
    setCached(bundle);
  }, []);

  useEffect(() => {
    loadCached();
  }, [loadCached, isOnline]);

  const { data: onlineStaff = [] } = useGetShopStaffCodesQuery(
    { shopId, active_only: true },
    { skip: !shopId || !isOnline }
  );

  const { data: onlineBanks = [] } = useGetShopBankAccountsQuery(
    { shopId, upi_only: true, active_only: true },
    { skip: !shopId || !isOnline }
  );

  const staffCodes = isOnline && onlineStaff.length
    ? onlineStaff
    : (cached?.staff_codes || []);

  const bankAccounts = isOnline && onlineBanks.length
    ? onlineBanks
    : (cached?.bank_accounts || []).filter((a) => a.upi_id);

  return {
    staffCodes,
    bankAccounts,
    shop: cached?.shop || null,
    isOnline,
    refreshCache: loadCached,
  };
};
