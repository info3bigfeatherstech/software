/** GST place-of-supply state codes — keep in sync with backend/src/constants/indianStateCodes.js */
export const INDIAN_GST_STATE_CODES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
];

export const normalizeStateCode = (code) => {
  if (code == null || String(code).trim() === "") return "";
  return String(code).trim().padStart(2, "0").slice(-2);
};

export const getStateName = (code) => {
  if (!code) return "";
  const normalized = normalizeStateCode(code);
  const row = INDIAN_GST_STATE_CODES.find((s) => s.code === normalized);
  return row?.name || `State ${normalized}`;
};

export const formatStateWithCode = (code) => {
  if (!code) return "";
  const normalized = normalizeStateCode(code);
  const name = getStateName(normalized);
  return `${name} (${normalized})`;
};

/** Type-ahead filter for state picker — matches name or code (e.g. "Himachal" → HP). */
export const searchIndianStates = (query, limit = 15) => {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return INDIAN_GST_STATE_CODES.slice(0, limit);
  return INDIAN_GST_STATE_CODES.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.code.includes(q) ||
      s.name.toLowerCase().replace(/&/g, "and").includes(q.replace(/&/g, "and"))
  ).slice(0, limit);
};
