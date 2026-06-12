/**
 * Billing cart helpers — product GST from master, cart line shape for Redux.
 */

export const toBillingNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : defaultValue;
};

/** GST % lives on Product, not ProductVariant. */
export const resolveProductGstPercent = (product) => {
  if (!product) return 0;
  const n = toBillingNumber(product.gst_percent, NaN);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const resolveProductGstType = (product) => {
  const t = String(product?.gst_type || "CGST_SGST").trim().toUpperCase();
  if (t === "IGST" || t === "EXEMPT" || t === "CGST_SGST") return t;
  return "CGST_SGST";
};

/**
 * GST amount from taxable line total and product gst_percent (e.g. 12 means 12%, not ×12).
 */
export const calculateGstOnAmount = (taxableAmount, gstPercent) => {
  const base = toBillingNumber(taxableAmount);
  const rate = toBillingNumber(gstPercent);
  if (base <= 0 || rate <= 0) return 0;
  return Math.round((base * rate) / 100 * 100 + Number.EPSILON) / 100;
};

/** Human label for UI; null when not configured or zero. */
export const formatGstPercentLabel = (gstPercent) => {
  const n = toBillingNumber(gstPercent, NaN);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n % 1 === 0 ? `${n}%` : `${n.toFixed(2)}%`;
};

/**
 * Build payload for billingSlice addToCart from shop stock / barcode API row.
 */
export const buildBillingCartItem = ({
  variant_id,
  product_name,
  system_barcode,
  special_price,
  wholesale_price,
  mrp,
  online_price,
  retail_price,
  gst_percent,
  gst_type,
  hsn_code,
  quantity_available,
  price_type = "SPECIAL",
  quantity = 1,
}) => {
  const unitPrice = toBillingNumber(special_price ?? retail_price);
  const gst = toBillingNumber(gst_percent);
  const type = String(gst_type || "CGST_SGST").trim().toUpperCase();
  const normalizedType =
    type === "IGST" || type === "EXEMPT" || type === "CGST_SGST" ? type : "CGST_SGST";
  return {
    variant_id,
    product_name: product_name || "Unknown",
    system_barcode: system_barcode || "",
    quantity,
    price_type,
    unit_price: unitPrice,
    retail_price: toBillingNumber(retail_price ?? special_price),
    wholesale_price: toBillingNumber(wholesale_price),
    special_price: toBillingNumber(special_price),
    mrp: toBillingNumber(mrp),
    online_price: toBillingNumber(online_price),
    gst_percent: gst,
    gst_type: normalizedType,
    hsn_code: hsn_code ? String(hsn_code).trim() : null,
    quantity_available: toBillingNumber(quantity_available, 0),
    line_total: unitPrice * quantity,
    gst_amount: 0,
  };
};
