import React, { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Copy, RotateCcw, Trash2, User, X, SlidersHorizontal } from "lucide-react";
import { toast } from "../../Components/shared/ToastConfig";
import { OUTBOX_STATUS } from "../constants";
import {
  getSyncIssuePresentation,
  formatStockConflictDetails,
  SYNC_ISSUE_ACTIONS,
} from "../sync/syncErrorCatalog";
import {
  discardOfflineBill,
  discardStockAdjustment,
  discardShopExpense,
  retryOutboxItem,
  retryPendingCustomers,
} from "../sync/syncIssueResolution.service";
import { adjustOfflineBillQuantities } from "../billing/offlineBillAdjust.service";
import { syncEngine } from "../sync/syncEngine";

const fmtMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * @param {{ bill?: object, outbox: object, entityType?: string }} issue
 */
export default function SyncIssueModal({
  issue,
  shopId,
  user,
  isOnline,
  onClose,
  onResolved,
}) {
  const [busy, setBusy] = useState(null);

  const outbox = issue?.outbox;
  const bill = issue?.bill;
  const entityType = issue?.entityType || outbox?.entity_type || "bill";
  const clientId = outbox?.client_id || bill?.client_bill_id || bill?.bill_id;
  const isStockConflict =
    outbox?.error_code === "INSUFFICIENT_STOCK"
    || outbox?.error_code === "STOCK_SNAPSHOT_MISMATCH";

  const presentation = useMemo(
    () =>
      getSyncIssuePresentation({
        errorCode: outbox?.error_code,
        lastError: outbox?.last_error,
        entityType,
      }),
    [outbox, entityType]
  );

  const stockRows = useMemo(
    () => formatStockConflictDetails(outbox?.error_details, bill?.items),
    [outbox, bill]
  );

  const initialEditedQtys = useMemo(() => {
    if (!bill?.items?.length) return {};
    const initial = {};
    for (const item of bill.items) {
      initial[item.variant_id] = item.quantity;
    }
    if (isStockConflict && outbox?.error_details?.variant_id) {
      const variantId = outbox.error_details.variant_id;
      const available = Number(outbox.error_details.available);
      const line = bill.items.find((i) => i.variant_id === variantId);
      if (line && Number.isFinite(available) && available >= 1 && line.quantity > available) {
        initial[variantId] = available;
      }
    }
    return initial;
  }, [bill, isStockConflict, outbox?.error_details]);

  const [editedQtys, setEditedQtys] = useState(initialEditedQtys);

  useEffect(() => {
    setEditedQtys(initialEditedQtys);
  }, [initialEditedQtys]);

  const qtyAdjustments = useMemo(() => {
    if (!bill?.items?.length) return {};
    const changes = {};
    for (const item of bill.items) {
      const next = editedQtys[item.variant_id];
      if (next != null && next !== item.quantity) {
        changes[item.variant_id] = next;
      }
    }
    return changes;
  }, [bill, editedQtys]);

  const hasQtyChanges = Object.keys(qtyAdjustments).length > 0;

  const maxQtyForVariant = (variantId) => {
    if (outbox?.error_details?.variant_id === variantId) {
      const available = Number(outbox.error_details.available);
      if (Number.isFinite(available) && available >= 1) return available;
    }
    const line = bill?.items?.find((i) => i.variant_id === variantId);
    return line?.quantity ?? 999;
  };

  if (!outbox) return null;

  const runAction = async (actionId, fn) => {
    setBusy(actionId);
    try {
      await fn();
      onResolved?.();
    } catch (err) {
      console.error("Sync issue action failed:", err);
      toast.error(err?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const handleRetry = () =>
    runAction(SYNC_ISSUE_ACTIONS.RETRY, async () => {
      if (!isOnline) {
        throw new Error("Connect to the internet to retry sync");
      }
      await retryOutboxItem(clientId);
      await syncEngine.runPushOnly(user);
      toast.success("Retry submitted");
      onClose();
    });

  const handleSyncCustomersFirst = () =>
    runAction(SYNC_ISSUE_ACTIONS.SYNC_CUSTOMER_FIRST, async () => {
      if (!isOnline) {
        throw new Error("Connect to the internet to sync");
      }
      const count = await retryPendingCustomers(shopId);
      await syncEngine.runPushOnly(user);
      toast.success(count ? "Customer sync retried — now retry the bill" : "Sync attempted");
      onClose();
    });

  const handleDiscard = () =>
    runAction(SYNC_ISSUE_ACTIONS.DISCARD_BILL, async () => {
      const confirmed = window.confirm(
        "Discard this offline bill?\n\nLocal stock will be restored. This bill will NOT be uploaded to the server."
      );
      if (!confirmed) return;
      await discardOfflineBill({ clientBillId: clientId, shopId });
      toast.success("Offline bill discarded — stock restored");
      onClose();
    });

  const handleDiscardOffline = () =>
    runAction(SYNC_ISSUE_ACTIONS.DISCARD_OFFLINE, async () => {
      const label =
        entityType === "stock_adjustment" ? "stock adjustment" : "shop expense";
      const confirmed = window.confirm(
        `Discard this offline ${label}?\n\n${
          entityType === "stock_adjustment"
            ? "Local stock will be restored to the quantity before this adjustment."
            : "This expense will NOT be uploaded to the server."
        }`
      );
      if (!confirmed) return;
      if (entityType === "stock_adjustment") {
        await discardStockAdjustment({ clientId, shopId });
        toast.success("Adjustment discarded — local stock restored");
      } else {
        await discardShopExpense({ clientId, shopId });
        toast.success("Offline expense discarded");
      }
      onClose();
    });

  const handleAdjustAndRetry = () =>
    runAction(SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY, async () => {
      if (!isOnline) {
        throw new Error("Connect to the internet to retry sync");
      }
      if (!hasQtyChanges) {
        throw new Error("Change quantity before adjusting");
      }
      for (const [variantId, qty] of Object.entries(qtyAdjustments)) {
        const max = maxQtyForVariant(variantId);
        if (qty > max) {
          throw new Error(`Maximum quantity for this item is ${max} (server stock)`);
        }
      }
      await adjustOfflineBillQuantities({
        clientBillId: clientId,
        shopId,
        itemAdjustments: qtyAdjustments,
      });
      await syncEngine.runPushOnly(user);
      toast.success("Bill adjusted — sync retried");
      onClose();
    });

  const handleCopy = async () => {
    const text = [
      `Error: ${presentation.errorCode}`,
      presentation.rawMessage || presentation.message,
      outbox?.error_details ? JSON.stringify(outbox.error_details) : null,
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Error copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const actionHandlers = {
    [SYNC_ISSUE_ACTIONS.RETRY]: handleRetry,
    [SYNC_ISSUE_ACTIONS.DISCARD_BILL]: handleDiscard,
    [SYNC_ISSUE_ACTIONS.DISCARD_OFFLINE]: handleDiscardOffline,
    [SYNC_ISSUE_ACTIONS.SYNC_CUSTOMER_FIRST]: handleSyncCustomersFirst,
    [SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY]: handleAdjustAndRetry,
    [SYNC_ISSUE_ACTIONS.COPY_ERROR]: handleCopy,
  };

  const actionLabels = {
    [SYNC_ISSUE_ACTIONS.RETRY]: { label: "Retry sync", icon: RotateCcw, cls: "bg-orange-600 text-white hover:bg-orange-700" },
    [SYNC_ISSUE_ACTIONS.DISCARD_BILL]: { label: "Discard bill & restore stock", icon: Trash2, cls: "border border-red-300 text-red-700 hover:bg-red-50" },
    [SYNC_ISSUE_ACTIONS.DISCARD_OFFLINE]: {
      label: entityType === "stock_adjustment" ? "Discard & restore stock" : "Discard expense",
      icon: Trash2,
      cls: "border border-red-300 text-red-700 hover:bg-red-50",
    },
    [SYNC_ISSUE_ACTIONS.SYNC_CUSTOMER_FIRST]: { label: "Sync customer first", icon: User, cls: "bg-blue-600 text-white hover:bg-blue-700" },
    [SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY]: { label: "Adjust qty & retry", icon: SlidersHorizontal, cls: "bg-emerald-600 text-white hover:bg-emerald-700" },
    [SYNC_ISSUE_ACTIONS.COPY_ERROR]: { label: "Copy error", icon: Copy, cls: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  };

  const isFailed =
    outbox.status === OUTBOX_STATUS.ERROR || outbox.status === OUTBOX_STATUS.CONFLICT;

  const visibleActions = presentation.actions.filter((actionId) => {
    if (actionId !== SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY) return true;
    const available = Number(outbox?.error_details?.available);
    return Number.isFinite(available) && available >= 1;
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto text-gray-700">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
            <div className="flex gap-3">
              <div className={`p-2 rounded-lg ${presentation.severity === "conflict" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{presentation.title}</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{presentation.errorCode}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-700">{presentation.message}</p>
            {presentation.rawMessage && presentation.rawMessage !== presentation.message && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 font-mono break-words">
                {presentation.rawMessage}
              </div>
            )}
            <p className="text-sm text-gray-500">{presentation.hint}</p>

            {entityType === "bill" && bill && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Bill</p>
                  <p className="font-mono font-medium">{bill.offline_bill_number || bill.bill_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-medium">{fmtMoney(bill.total_amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Customer</p>
                  <p>{bill.customer_name || "Walk-in Customer"}</p>
                </div>
              </div>
            )}

            {entityType === "stock_adjustment" && outbox?.payload && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="font-mono font-medium">{outbox.payload.offline_reference || clientId.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Operation</p>
                    <p className="font-medium capitalize">{outbox.payload.operation} {outbox.payload.quantity}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Product</p>
                    <p>{outbox.payload.product_name || outbox.payload.variant_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Local change</p>
                    <p>{outbox.payload.offline_before_quantity} → {outbox.payload.offline_after_quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p>{outbox.payload.reason || "—"}</p>
                  </div>
                </div>
              </div>
            )}

            {entityType === "shop_expense" && outbox?.payload && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Expense</p>
                  <p className="font-mono font-medium">{outbox.payload.offline_expense_number || clientId.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-medium">{fmtMoney(outbox.payload.amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Description</p>
                  <p>{outbox.payload.description}</p>
                </div>
              </div>
            )}

            {stockRows.length > 0 && (
              <div className="rounded-lg border border-orange-200 overflow-hidden">
                <div className="bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">Stock details</div>
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-xs text-gray-500">
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-right">Bill qty</th>
                      {isStockConflict && entityType === "bill" && (
                        <th className="px-3 py-2 text-right">New qty</th>
                      )}
                      {entityType === "stock_adjustment" && (
                        <th className="px-3 py-2 text-right">Offline qty</th>
                      )}
                      <th className="px-3 py-2 text-right">Server stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockRows.map((row) => {
                      const editable =
                        isStockConflict
                        && entityType === "bill"
                        && (!outbox?.error_details?.variant_id
                          || outbox.error_details.variant_id === row.variant_id);
                      const maxQty = maxQtyForVariant(row.variant_id);
                      return (
                        <tr key={row.variant_id} className="border-t border-orange-100">
                          <td className="px-3 py-2">{row.product_name}</td>
                          <td className="px-3 py-2 text-right">{row.requested ?? "—"}</td>
                          {isStockConflict && entityType === "bill" && (
                            <td className="px-3 py-2 text-right">
                              {editable ? (
                                <input
                                  type="number"
                                  min={1}
                                  max={maxQty}
                                  value={editedQtys[row.variant_id] ?? row.requested ?? 1}
                                  onChange={(e) => {
                                    const val = Math.max(1, Math.min(maxQty, Number(e.target.value) || 1));
                                    setEditedQtys((prev) => ({ ...prev, [row.variant_id]: val }));
                                  }}
                                  className="w-16 text-right border border-gray-300 rounded px-1.5 py-0.5 text-sm"
                                />
                              ) : (
                                "—"
                              )}
                            </td>
                          )}
                          {entityType === "stock_adjustment" && (
                            <td className="px-3 py-2 text-right">{row.requested ?? "—"}</td>
                          )}
                          <td className="px-3 py-2 text-right font-medium text-orange-700">{row.available ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {isStockConflict && entityType === "bill" && (
                  <p className="px-3 py-2 text-xs text-orange-700 bg-orange-50/50 border-t border-orange-100">
                    Server stock ke hisaab se quantity kam karein, phir &quot;Adjust qty &amp; retry&quot; dabayein.
                  </p>
                )}
              </div>
            )}

            {!isOnline && isFailed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                You are offline. Reconnect to retry sync.
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-2">
            {visibleActions.map((actionId) => {
              const meta = actionLabels[actionId];
              if (!meta) return null;
              const Icon = meta.icon;
              const handler = actionHandlers[actionId];
              const needsOnline =
                actionId === SYNC_ISSUE_ACTIONS.RETRY
                || actionId === SYNC_ISSUE_ACTIONS.SYNC_CUSTOMER_FIRST
                || actionId === SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY;
              const needsQtyChange = actionId === SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY && !hasQtyChanges;
              return (
                <button
                  key={actionId}
                  type="button"
                  onClick={handler}
                  disabled={Boolean(busy) || (needsOnline && !isOnline) || needsQtyChange}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${meta.cls}`}
                >
                  <Icon size={14} className={busy === actionId ? "animate-spin" : ""} />
                  {busy === actionId ? "Working…" : meta.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
