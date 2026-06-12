import { shopStockMutationService } from '../db/repositories/localBillsRepository';
import { metaRepository } from '../db/repositories/metaRepository';
import { enqueueMutation } from '../sync/pushService';
import { getUserShopId } from '../constants';
import { broadcastPendingCounts } from '../sync/offlineSyncState.service';

const nowIso = () => new Date().toISOString();

export const offlineAdjustmentNumberService = {
  async nextReference(shopId, shopCode) {
    const key = `offline_adjust_seq_${shopId}`;
    const current = (await metaRepository.get(key)) || { seq: 0 };
    const nextSeq = (current.seq || 0) + 1;
    await metaRepository.set(key, { seq: nextSeq, shop_id: shopId });
    const code = String(shopCode || 'SHOP').replace(/\s+/g, '').slice(0, 8).toUpperCase();
    return `OFF-ADJ-${code}-${String(nextSeq).padStart(5, '0')}`;
  },
};

/**
 * Record a shop stock adjustment on-device and queue for server sync.
 */
export const createOfflineStockAdjustment = async ({
  user,
  shopId,
  variantId,
  operation,
  quantity,
  reason,
  remarks,
  low_stock_threshold,
  productName,
}) => {
  const resolvedShopId = shopId || getUserShopId(user);
  if (!resolvedShopId) {
    throw new Error('Shop context is required for offline stock adjustment');
  }

  const op = operation || 'set';
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error('Valid quantity is required');
  }
  if (!reason?.trim()) {
    throw new Error('Reason is required for stock adjustment');
  }

  const { before, after } = await shopStockMutationService.applyAdjustment(resolvedShopId, {
    variant_id: variantId,
    operation: op,
    quantity: op === 'set' ? qty : Math.abs(qty),
    low_stock_threshold,
  });

  const clientId = crypto.randomUUID();
  const offlineReference = await offlineAdjustmentNumberService.nextReference(
    resolvedShopId,
    user?.shop?.shop_code
  );

  const payload = {
    variant_id: variantId,
    operation: op,
    quantity: op === 'set' ? after : Math.abs(qty),
    reason: reason.trim(),
    remarks: remarks?.trim() || null,
    low_stock_threshold: low_stock_threshold != null ? Number(low_stock_threshold) : null,
    offline_before_quantity: before,
    offline_after_quantity: after,
    offline_reference: offlineReference,
    product_name: productName || null,
  };

  await enqueueMutation({
    client_id: clientId,
    shop_id: resolvedShopId,
    entity_type: 'stock_adjustment',
    idempotency_key: clientId,
    payload,
    stock_mutated_locally: true,
    offline_created_at: nowIso(),
  });

  await broadcastPendingCounts(resolvedShopId);

  return {
    client_id: clientId,
    offline_reference: offlineReference,
    before,
    after,
    payload,
  };
};

export const shouldUseOfflineStockOps = (isOnline) => !isOnline;
