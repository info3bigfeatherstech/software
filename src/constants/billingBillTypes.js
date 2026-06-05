/** Backend enum values — do not change without API migration */
export const BILL_TYPES = {
  WITH_GST: "GST_INVOICE",
  WITHOUT_GST: "NON_GST_INVOICE",
  ESTIMATE: "ESTIMATE_INVOICE",
};

export const getBillTypeLabel = (billType) => {
  if (billType === BILL_TYPES.WITH_GST) return "GST Tax Invoice";
  if (billType === BILL_TYPES.ESTIMATE) return "Estimate";
  return "Non-GST Bill";
};

export const isWithGstBill = (billType) => billType === BILL_TYPES.WITH_GST;

export const isEstimateBill = (billType) => billType === BILL_TYPES.ESTIMATE;
