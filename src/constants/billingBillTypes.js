/** Backend enum values — do not change without API migration */
export const BILL_TYPES = {
  WITH_GST: "GST_INVOICE",
  WITHOUT_GST: "NON_GST_INVOICE",
};

export const getBillTypeLabel = (billType) =>
  billType === BILL_TYPES.WITH_GST ? "With GST" : "Without GST";

export const isWithGstBill = (billType) => billType === BILL_TYPES.WITH_GST;
