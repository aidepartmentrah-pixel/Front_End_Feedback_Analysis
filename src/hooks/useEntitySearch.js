// src/hooks/useEntitySearch.js
// Debounced entity search hook (patient / doctor / employee).
import { useState, useRef, useCallback } from "react";

// `searchFn` may resolve to either a bare array (existing doctor/employee
// contract, unchanged) or `{ items, message }` (patients — `message` is a
// non-fatal advisory from the server, e.g. the real Hospital Directory API's
// "enter the full name" validation text, surfaced instead of just showing
// zero results with no explanation).
//
// `options.minWords`, if given, holds off firing the request at all until
// the query has at least that many whitespace-separated words — the real
// patient-search API requires a complete first+father+last name and 422s on
// anything less, so a partial name would otherwise guarantee a wasted
// request on every keystroke. Doctors/employees don't pass this and keep
// firing at 2+ characters, unchanged.
export function useEntitySearch(searchFn, options = {}) {
  const { minWords } = options;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const search = useCallback(
    (q) => {
      setQuery(q);
      setMessage(null);
      clearTimeout(timer.current);
      const trimmed = (q || "").trim();
      if (!trimmed || trimmed.length < 2) {
        setResults([]);
        return;
      }
      if (minWords && trimmed.split(/\s+/).length < minWords) {
        setResults([]);
        return;
      }
      timer.current = setTimeout(async () => {
        try {
          setLoading(true);
          const data = await searchFn(q);
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            setResults(Array.isArray(data?.items) ? data.items : []);
            setMessage(data?.message || null);
          }
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    [searchFn, minWords]
  );

  return { query, setQuery, results, setResults, loading, message, search };
}
