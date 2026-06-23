// src/hooks/useEntitySearch.js
// Debounced entity search hook (patient / doctor / employee).
import { useState, useRef, useCallback } from "react";

export function useEntitySearch(searchFn) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = useCallback(
    (q) => {
      setQuery(q);
      clearTimeout(timer.current);
      if (!q || q.trim().length < 2) {
        setResults([]);
        return;
      }
      timer.current = setTimeout(async () => {
        try {
          setLoading(true);
          const data = await searchFn(q);
          setResults(Array.isArray(data) ? data : []);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    [searchFn]
  );

  return { query, setQuery, results, setResults, loading, search };
}
