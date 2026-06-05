/**
 * Build a UPI deep-link URI for QR codes and payment apps.
 * @see NPCI UPI URI spec (pa, pn, am, cu, tn)
 */
export const buildUpiPaymentUri = ({
    upiId,
    payeeName = "",
    amount = 0,
    transactionNote = "Bill Payment",
}) => {
    const params = new URLSearchParams();
    params.set("pa", String(upiId || "").trim());
    if (payeeName) params.set("pn", String(payeeName).trim().slice(0, 100));
    const numericAmount = Number(amount);
    if (numericAmount > 0) params.set("am", numericAmount.toFixed(2));
    params.set("cu", "INR");
    if (transactionNote) params.set("tn", String(transactionNote).trim().slice(0, 100));
    return `upi://pay?${params.toString()}`;
};

export const formatBankAccountLabel = (account) => {
    if (!account) return "—";
    const masked = account.account_number_masked || "—";
    const defaultTag = account.is_default ? " (Default)" : "";
    return `${account.bank_name} — ${masked}${defaultTag}`;
};
