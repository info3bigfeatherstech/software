import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineStatus, useManualSync } from '../hooks/useOfflineStatus';
import { getUserShopId } from '../constants';

const formatRelativeTime = (iso) => {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
};

export default function OfflineStatusBar() {
  const navigate = useNavigate();
  const {
    isOnline,
    isSyncing,
    lastSyncAt,
    lastSyncError,
    pendingCounts,
    user,
  } = useOfflineStatus();
  const { triggerSync, isRunning } = useManualSync();

  if (!getUserShopId(user)) return null;

  const pending = pendingCounts?.pending ?? 0;
  const conflicts = pendingCounts?.conflict ?? 0;
  const errors = pendingCounts?.error ?? 0;
  const busy = isSyncing || isRunning;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
        isOnline
          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-100'
          : 'bg-amber-950/50 border-amber-700/60 text-amber-100'
      }`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <Cloud size={14} className="shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <CloudOff size={14} className="shrink-0 text-amber-400" aria-hidden />
      )}

      <span className="font-medium">
        {isOnline ? 'Online' : 'Offline mode'}
      </span>

      <span className="text-white/50 hidden sm:inline">·</span>

      <span className="text-white/70 hidden sm:inline">
        Last sync: {formatRelativeTime(lastSyncAt)}
      </span>

      {pending > 0 && (
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=sales&ctab=offline-sync')}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-white/90 hover:bg-white/15 transition-colors"
          title="View pending offline bills"
        >
          {pending} pending
        </button>
      )}

      {(conflicts > 0 || errors > 0) && (
        <button
          type="button"
          onClick={() => navigate('/dashboard?tab=sales&ctab=offline-sync&syncFilter=failed')}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-900/40 text-red-200 hover:bg-red-900/55 transition-colors"
          title="View sync issues"
        >
          <AlertTriangle size={12} />
          {conflicts + errors} issues
        </button>
      )}

      {lastSyncError && isOnline && (
        <span className="text-red-300 truncate max-w-[160px]" title={lastSyncError}>
          Sync error
        </span>
      )}

      {isOnline && (
        <button
          type="button"
          onClick={() => triggerSync()}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50 transition-colors"
          title="Sync now"
        >
          <RefreshCw size={12} className={busy ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{busy ? 'Syncing…' : 'Sync'}</span>
        </button>
      )}
    </div>
  );
}
