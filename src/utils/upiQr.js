import QRCode from "qrcode";
import { buildUpiPaymentUri } from "./upiPayment";
import { BILL_TYPES } from "../constants/billingBillTypes";

/** Amount the customer should pay via UPI for this bill. */
export const resolveUpiPayableAmount = (bill) => {
  if (String(bill?.payment_method || "").toUpperCase() !== "UPI") return 0;
  const paid = Number(bill.paid_amount);
  const total = Number(bill.total_amount ?? bill.total ?? 0);
  const balance = Number(bill.balance_amount);
  if (Number.isFinite(paid) && paid > 0) return paid;
  if (Number.isFinite(balance) && balance > 0) return balance;
  return total > 0 ? total : 0;
};

export const isGstUpiBill = (bill) =>
  bill?.bill_type === BILL_TYPES.WITH_GST
  && String(bill?.payment_method || "").toUpperCase() === "UPI";

export const buildUpiQrPayload = ({ account, amount, billNumber }) => {
  if (!account?.upi_id) return null;
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) return null;

  const uri = buildUpiPaymentUri({
    upiId: account.upi_id,
    payeeName: account.account_holder_name,
    amount: numericAmount,
    transactionNote: billNumber ? `Invoice ${billNumber}` : "Shop Bill Payment",
  });

  return {
    uri,
    amount: numericAmount,
    upi_id: account.upi_id,
    account_holder_name: account.account_holder_name,
    bank_name: account.bank_name,
    bank_account_id: account.bank_account_id,
  };
};

export const generateUpiQrDataUrl = async (payload, { width = 200 } = {}) => {
  if (!payload?.uri) return null;
  return QRCode.toDataURL(payload.uri, { width, margin: 2, errorCorrectionLevel: "M" });
};

export const canShowBillUpiQr = (bill) =>
  isGstUpiBill(bill) && Boolean(bill?.bank_account_id || bill?.bank_account?.upi_id);

export const buildUpiQrForBill = async (bill, bankAccount, { width = 200 } = {}) => {
  if (!isGstUpiBill(bill) || !bankAccount?.upi_id) return null;

  const amount = resolveUpiPayableAmount(bill);
  const payload = buildUpiQrPayload({
    account: bankAccount,
    amount,
    billNumber: bill.bill_number || bill.offline_bill_number,
  });
  if (!payload) return null;

  const qr_data_url = await generateUpiQrDataUrl(payload, { width });
  return { ...payload, qr_data_url };
};
