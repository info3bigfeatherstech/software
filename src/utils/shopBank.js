export const maskAccountNumber = (accountNumber) => {
  const raw = String(accountNumber || "").trim();
  if (!raw) return "";
  if (raw.length <= 4) return raw;
  return `${"X".repeat(Math.max(0, raw.length - 4))}${raw.slice(-4)}`;
};
