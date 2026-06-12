import { OFFLINE_EVENTS } from '../constants';

const listeners = new Set();

const dispatchConnectivity = (online) => {
  const eventName = online ? OFFLINE_EVENTS.ONLINE : OFFLINE_EVENTS.OFFLINE;
  window.dispatchEvent(new CustomEvent(eventName, { detail: { online } }));
  listeners.forEach((fn) => {
    try {
      fn(online);
    } catch (err) {
      console.error('[network-monitor] listener error', err);
    }
  });
};

let started = false;

export const networkMonitor = {
  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  start() {
    if (started || typeof window === 'undefined') return;
    started = true;

    window.addEventListener('online', () => dispatchConnectivity(true));
    window.addEventListener('offline', () => dispatchConnectivity(false));
  },
};

export const dispatchOfflineEvent = (eventName, detail = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};
