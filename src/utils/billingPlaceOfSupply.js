/**
 * Place of supply resolution — mirrors backend billing.utils resolvePlaceOfSupply priority.
 */

import { normalizeStateCode } from "../constants/indianStateCodes";

/** First 2 digits of GSTIN = state code (India). */
export const stateCodeFromGstin = (gstin) => {
  const g = gstin?.trim().toUpperCase();
  if (!g || g.length < 2) return null;
  return normalizeStateCode(g.slice(0, 2));
};

/** Customer master: state_code, else derive from GSTIN. */
export const resolveCustomerStateCodeForBilling = ({ stateCode, gstNumber }) => {
  const fromState = normalizeStateCode(stateCode);
  if (fromState) return fromState;
  return stateCodeFromGstin(gstNumber);
};

/**
 * @returns {{ code: string|null, source: 'customer'|'override'|'shop'|null }}
 */
export const resolvePlaceOfSupplyForBilling = ({
  customerStateCode,
  overrideStateCode,
  shopStateCode,
}) => {
  const fromCustomer = normalizeStateCode(customerStateCode);
  if (fromCustomer) return { code: fromCustomer, source: "customer" };

  const fromShop = normalizeStateCode(shopStateCode);
  const fromOverride = normalizeStateCode(overrideStateCode);

  if (fromOverride) {
    if (fromShop && fromOverride === fromShop) {
      return { code: fromShop, source: "shop" };
    }
    return { code: fromOverride, source: "override" };
  }

  if (fromShop) return { code: fromShop, source: "shop" };

  return { code: null, source: null };
};

export const resolveCustomerGstinForBilling = ({ customerGstNumber, checkoutGstin }) => {
  const fromCheckout = checkoutGstin?.trim();
  if (fromCheckout) return fromCheckout.toUpperCase();
  const fromCustomer = customerGstNumber?.trim();
  if (fromCustomer) return fromCustomer.toUpperCase();
  return "";
};
