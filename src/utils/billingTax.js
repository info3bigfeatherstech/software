/**
 * Client-side GST preview — uses product gst_type + gst_percent from listing.
 */

import { BILL_TYPES } from "../constants/billingBillTypes";

export const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const normalizeProductGstType = (gstType) => {
  const t = String(gstType || "CGST_SGST").trim().toUpperCase();
  if (t === "IGST" || t === "EXEMPT" || t === "CGST_SGST") return t;
  return "CGST_SGST";
};

export const splitTaxByProductGstType = (taxAmount, gstType) => {
  const tax = roundMoney(taxAmount);
  const type = normalizeProductGstType(gstType);
  if (tax <= 0 || type === "EXEMPT") return { cgst: 0, sgst: 0, igst: 0 };
  if (type === "IGST") return { cgst: 0, sgst: 0, igst: tax };
  const half = roundMoney(tax / 2);
  return { cgst: half, sgst: roundMoney(tax - half), igst: 0 };
};

export const aggregateCartTax = (cart, billType) => {
  let subtotal = 0;
  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const withGst = billType === BILL_TYPES.WITH_GST;

  for (const item of cart) {
    subtotal += roundMoney(item.line_total || 0);
    if (!withGst) continue;
    const lineGst = roundMoney(item.gst_amount || 0);
    gstAmount += lineGst;
    const split = splitTaxByProductGstType(lineGst, item.gst_type);
    cgst += split.cgst;
    sgst += split.sgst;
    igst += split.igst;
  }

  subtotal = roundMoney(subtotal);
  gstAmount = roundMoney(gstAmount);
  cgst = roundMoney(cgst);
  sgst = roundMoney(sgst);
  igst = roundMoney(igst);

  let tax_mode = "EXEMPT";
  if (withGst && gstAmount > 0) {
    if (igst > 0 && cgst === 0 && sgst === 0) tax_mode = "IGST";
    else tax_mode = "CGST_SGST";
  }

  return {
    subtotal,
    gst_amount: gstAmount,
    total_amount: roundMoney(subtotal + gstAmount),
    cgst,
    sgst,
    igst,
    tax_mode,
  };
};
