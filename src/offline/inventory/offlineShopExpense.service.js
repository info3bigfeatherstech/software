import { metaRepository } from '../db/repositories/metaRepository';
import { enqueueMutation } from '../sync/pushService';
import { getUserShopId } from '../constants';
import { broadcastPendingCounts } from '../sync/offlineSyncState.service';

const nowIso = () => new Date().toISOString();

export const offlineExpenseNumberService = {
  async nextExpenseNumber(shopId, shopCode) {
    const key = `offline_expense_seq_${shopId}`;
    const current = (await metaRepository.get(key)) || { seq: 0 };
    const nextSeq = (current.seq || 0) + 1;
    await metaRepository.set(key, { seq: nextSeq, shop_id: shopId });
    const code = String(shopCode || 'SHOP').replace(/\s+/g, '').slice(0, 8).toUpperCase();
    return `OFF-EXP-${code}-${String(nextSeq).padStart(5, '0')}`;
  },
};

/**
 * Create a shop expense locally and queue for server sync.
 */
export const createOfflineShopExpense = async ({ user, shopId, data }) => {
  const resolvedShopId = shopId || getUserShopId(user);
  if (!resolvedShopId) {
    throw new Error('Shop context is required for offline expense');
  }

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Valid amount is required');
  }
  if (!data.description?.trim()) {
    throw new Error('Description is required');
  }
  if (!data.category) {
    throw new Error('Category is required');
  }

  const clientId = crypto.randomUUID();
  const offlineExpenseNumber = await offlineExpenseNumberService.nextExpenseNumber(
    resolvedShopId,
    user?.shop?.shop_code
  );

  const payload = {
    category: data.category,
    description: data.description.trim(),
    amount,
    expense_date: data.expense_date || nowIso().slice(0, 10),
    payment_method: data.payment_method || null,
    reference_no: data.reference_no?.trim() || null,
    remarks: data.remarks?.trim() || null,
    offline_expense_number: offlineExpenseNumber,
  };

  await enqueueMutation({
    client_id: clientId,
    shop_id: resolvedShopId,
    entity_type: 'shop_expense',
    idempotency_key: clientId,
    payload,
    stock_mutated_locally: false,
    offline_created_at: nowIso(),
  });

  await broadcastPendingCounts(resolvedShopId);

  return {
    client_id: clientId,
    expense_id: clientId,
    expense_number: offlineExpenseNumber,
    ...payload,
    shop_id: resolvedShopId,
    is_offline_pending: true,
    created_at: nowIso(),
  };
};

export const shouldUseOfflineExpenses = (isOnline) => !isOnline;
