export const fmtCurrency = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const fmtDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
};

export const EXPENSE_CATEGORIES = [
    { value: "RENT", label: "Rent" },
    { value: "UTILITIES", label: "Utilities" },
    { value: "FREIGHT", label: "Freight" },
    { value: "LABOUR", label: "Labour" },
    { value: "TRANSPORT", label: "Transport" },
    { value: "OFFICE", label: "Office" },
    { value: "REPAIRS", label: "Repairs" },
    { value: "OTHER", label: "Other" },
];

export const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "CARD", label: "Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export const PAYMENT_STATUS_BADGE = {
    PAID: "bg-green-50 text-green-700 border border-green-200",
    PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
};

export const getExpenseCategoryLabel = (value) =>
    EXPENSE_CATEGORIES.find((c) => c.value === value)?.label || value;

export const getPaymentMethodLabel = (value) =>
    PAYMENT_METHODS.find((m) => m.value === value)?.label || value;
