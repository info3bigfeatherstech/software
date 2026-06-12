import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { syncEngine } from '../sync/syncEngine';
import { getUserShopId } from '../constants';

export const useOfflineStatus = () => {
  const offline = useSelector((state) => state.offline);
  const user = useSelector((state) => state.auth.user);
  return { ...offline, user, isShopEligible: Boolean(user?.shop_id) };
};

export const useManualSync = () => {
  const user = useSelector((state) => state.auth.user);
  const [isRunning, setIsRunning] = useState(false);

  const triggerSync = useCallback(async () => {
    const shopId = getUserShopId(user);
    if (!shopId || isRunning) return null;
    setIsRunning(true);
    try {
      return await syncEngine.runFullSync(user);
    } finally {
      setIsRunning(false);
    }
  }, [user, isRunning]);

  return { triggerSync, isRunning };
};

export const useOfflineEvent = (eventName, handler) => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const listener = (event) => handler(event.detail);
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, [eventName, handler]);
};
