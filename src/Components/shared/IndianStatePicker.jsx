import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  INDIAN_GST_STATE_CODES,
  formatStateWithCode,
  searchIndianStates,
} from "../../constants/indianStateCodes";

/**
 * Searchable Indian GST state picker — type "Himachal" to see Himachal Pradesh (02).
 */
export default function IndianStatePicker({
  value = "",
  onChange,
  error,
  label = "State (for GST supply)",
  placeholder = "Type state name e.g. Himachal",
  className = "",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const selectedLabel = useMemo(() => {
    if (!value) return "";
    return formatStateWithCode(value);
  }, [value]);

  useEffect(() => {
    if (!open) {
      setQuery(selectedLabel);
    }
  }, [selectedLabel, open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(selectedLabel);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [selectedLabel]);

  const options = useMemo(() => searchIndianStates(query), [query]);

  const pick = (code) => {
    onChange?.(code);
    setOpen(false);
    setQuery(formatStateWithCode(code));
  };

  const clear = () => {
    onChange?.("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label ? (
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      ) : null}
      <div className="relative">
        <input
          type="text"
          value={open ? query : selectedLabel || query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange?.("");
          }}
          onFocus={() => {
            setOpen(true);
            setQuery(selectedLabel || query);
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
            error ? "border-red-400" : "border-gray-300"
          }`}
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            tabIndex={-1}
          >
            ✕
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-500 mt-1">{error}</p> : null}
      {open && options.length > 0 ? (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
          {options.map((s) => (
            <li key={s.code}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s.code)}
                className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${
                  value === s.code ? "bg-blue-50 font-medium text-blue-700" : "text-gray-700"
                }`}
              >
                {s.name} ({s.code})
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && options.length === 0 ? (
        <p className="absolute z-20 mt-1 w-full px-3 py-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg shadow">
          No matching state
        </p>
      ) : null}
      {!value && !open ? (
        <p className="text-xs text-gray-400 mt-1">
          {INDIAN_GST_STATE_CODES.length} states — search by name or code
        </p>
      ) : null}
    </div>
  );
}
