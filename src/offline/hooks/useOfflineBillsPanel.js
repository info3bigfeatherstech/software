import { useCallback, useEffect, useMemo, useState } from 'react';
import { localBillsRepository } from '../db/repositories/localBillsRepository';
import { outboxRepository } from '../db/repositories/outboxRepository';
import { OUTBOX_STATUS, OFFLINE_EVENTS } from '../constants';
import { useOfflineEvent } from './useOfflineStatus';

const joinBillWithOutbox = (bills, outboxRows) => {
  const outboxByClient = new Map(outboxRows.map((row) => [row.client_id, row]));

  return bills.map((bill) => {
    const clientId = bill.client_bill_id || bill.bill_id;
    const outbox = outboxByClient.get(clientId) || null;
    return { bill, outbox };
  });
};

export const useOfflineBillsPanel = (shopId) => {
  const [bills, setBills] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!shopId) {
      setBills([]);
      setOutbox([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [billRows, outboxRows] = await Promise.all([
        localBillsRepository.listByShop(shopId),
        outboxRepository.listByShop(shopId),
      ]);
      setBills(billRows);
      setOutbox(outboxRows);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useOfflineEvent(OFFLINE_EVENTS.SYNC_COMPLETED, refresh);
  useOfflineEvent(OFFLINE_EVENTS.SYNC_FAILED, refresh);

  const billRows = useMemo(() => {
    const activeBills = bills.filter((b) => b.sync_status !== 'discarded');
    return joinBillWithOutbox(activeBills, outbox);
  }, [bills, outbox]);

  const summary = useMemo(() => {
    const pendingBills = billRows.filter(
      (row) => row.bill.sync_status === 'pending_sync'
        || row.outbox?.status === OUTBOX_STATUS.PENDING
        || row.outbox?.status === OUTBOX_STATUS.SYNCING
    ).length;

    const syncedBills = billRows.filter((row) => row.bill.sync_status === 'synced').length;

    const failedItems = outbox.filter(
      (row) => row.status === OUTBOX_STATUS.ERROR || row.status === OUTBOX_STATUS.CONFLICT
    ).length;

    const pendingOutbox = outbox.filter((row) => row.status === OUTBOX_STATUS.PENDING).length;

    return {
      totalBills: billRows.length,
      pendingBills,
      syncedBills,
      failedItems,
      pendingOutbox,
    };
  }, [billRows, outbox]);

  const nonBillOutbox = useMemo(
    () => outbox.filter((row) => row.entity_type !== 'bill'),
    [outbox]
  );

  return {
    billRows,
    outbox,
    nonBillOutbox,
    summary,
    loading,
    refresh,
  };
};
