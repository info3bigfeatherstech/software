/** Staff-facing sync issue copy — maps server error_code to title, explanation, actions. */

export const SYNC_ISSUE_ACTIONS = Object.freeze({
  RETRY: 'retry',
  DISCARD_BILL: 'discard_bill',
  DISCARD_OFFLINE: 'discard_offline',
  SYNC_CUSTOMER_FIRST: 'sync_customer_first',
  ADJUST_AND_RETRY: 'adjust_and_retry',
  COPY_ERROR: 'copy_error',
});

const DEFAULT_ENTRY = {
  title: 'Sync failed',
  message: 'This offline record could not be uploaded to the server.',
  hint: 'Try again when online. If the problem persists, contact support with the error code.',
  severity: 'error',
  actions: [SYNC_ISSUE_ACTIONS.RETRY, SYNC_ISSUE_ACTIONS.COPY_ERROR],
};

export const SYNC_ERROR_CATALOG = Object.freeze({
  INSUFFICIENT_STOCK: {
    title: 'Stock mismatch',
    message:
      'Server par itni quantity available nahi hai jitni is offline bill mein thi. Ho sakta hai doosri sale ne stock use kar liya ho.',
    hint: 'Quantity kam karke dubara sync karein, bill discard karein, ya manager se confirm karein.',
    severity: 'conflict',
    actions: [
      SYNC_ISSUE_ACTIONS.ADJUST_AND_RETRY,
      SYNC_ISSUE_ACTIONS.DISCARD_BILL,
      SYNC_ISSUE_ACTIONS.RETRY,
      SYNC_ISSUE_ACTIONS.COPY_ERROR,
    ],
  },
  STOCK_SNAPSHOT_MISMATCH: {
    title: 'Stock changed on server',
    message:
      'Jab aapne offline adjustment kiya tab se server par stock badal chuka hai. Yeh adjustment ab directly apply nahi ho sakta.',
    hint: 'Discard karke local stock restore karein, phir server stock dekh kar naya adjustment karein.',
    severity: 'conflict',
    actions: [
      SYNC_ISSUE_ACTIONS.DISCARD_OFFLINE,
      SYNC_ISSUE_ACTIONS.RETRY,
      SYNC_ISSUE_ACTIONS.COPY_ERROR,
    ],
  },
  OFFLINE_CUSTOMER_NOT_SYNCED: {
    title: 'Customer not synced yet',
    message:
      'Yeh bill ek offline customer par depend karti hai jo abhi server par upload nahi hui.',
    hint: 'Pehle customer sync hone do (Retry all), phir bill dubara sync karein.',
    severity: 'conflict',
    actions: [SYNC_ISSUE_ACTIONS.SYNC_CUSTOMER_FIRST, SYNC_ISSUE_ACTIONS.RETRY, SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  IDEMPOTENCY_PAYLOAD_MISMATCH: {
    title: 'Duplicate sync entry',
    message:
      'Yeh record pehle sync ho chuka tha lekin ab alag data ke saath dubara aa raha hai.',
    hint: 'Agar yeh galat offline bill hai to discard karein. Warna support se contact karein.',
    severity: 'conflict',
    actions: [SYNC_ISSUE_ACTIONS.DISCARD_BILL, SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  OFFLINE_CREDIT_NOTE_NOT_SUPPORTED: {
    title: 'Credit note not supported offline',
    message: 'Offline bill mein credit note lagaya gaya tha — yeh sync ke dauran support nahi hota.',
    hint: 'Bill ko discard karein aur online mode mein dubara banayein.',
    severity: 'conflict',
    actions: [SYNC_ISSUE_ACTIONS.DISCARD_BILL, SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  DUPLICATE_MOBILE: {
    title: 'Customer mobile already exists',
    message: 'Yeh mobile number server par pehle se registered hai.',
    hint: 'Retry karein — system usually existing customer se link kar deta hai.',
    severity: 'conflict',
    actions: [SYNC_ISSUE_ACTIONS.RETRY, SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  SHOP_MISMATCH: {
    title: 'Wrong shop context',
    message: 'Yeh record is shop ke liye nahi hai.',
    hint: 'Logout karke sahi shop account se login karein.',
    severity: 'conflict',
    actions: [SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  HANDLER_NOT_READY: {
    title: 'Not supported yet',
    message: 'Is type ka record abhi server par sync nahi ho sakta.',
    hint: 'App update ka wait karein ya online mode use karein.',
    severity: 'error',
    actions: [SYNC_ISSUE_ACTIONS.COPY_ERROR],
  },
  SYNC_APPLY_FAILED: DEFAULT_ENTRY,
});

export const getSyncIssuePresentation = ({ errorCode, lastError, entityType } = {}) => {
  const code = errorCode || 'SYNC_APPLY_FAILED';
  const entry = SYNC_ERROR_CATALOG[code] || DEFAULT_ENTRY;

  let actions = [...entry.actions];
  if (entityType !== 'bill') {
    actions = actions.filter((a) => a !== SYNC_ISSUE_ACTIONS.DISCARD_BILL);
  }
  if (!['stock_adjustment', 'shop_expense'].includes(entityType)) {
    actions = actions.filter((a) => a !== SYNC_ISSUE_ACTIONS.DISCARD_OFFLINE);
  }

  return {
    ...entry,
    errorCode: code,
    rawMessage: lastError || null,
    actions,
  };
};

export const formatStockConflictDetails = (errorDetails, billItems = []) => {
  if (!errorDetails) return [];

  const rows = [];
  const variantId = errorDetails.variant_id;
  if (variantId) {
    const line = billItems.find((i) => i.variant_id === variantId);
    rows.push({
      variant_id: variantId,
      product_name:
        errorDetails.product_name
        || line?.variant?.product?.name
        || line?.product_name
        || variantId,
      requested: errorDetails.requested ?? errorDetails.offline_before ?? line?.quantity,
      available: errorDetails.available ?? errorDetails.server_before,
    });
    return rows;
  }

  if (Array.isArray(errorDetails.items)) {
    return errorDetails.items;
  }

  return rows;
};
