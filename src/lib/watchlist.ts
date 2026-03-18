"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "masters-madness-watchlist";

/** Hook to manage watchlisted player names, persisted to localStorage */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...watchlist]));
    }
  }, [watchlist, loaded]);

  const toggle = useCallback((name: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const isWatchlisted = useCallback(
    (name: string) => watchlist.has(name),
    [watchlist]
  );

  return { watchlist, toggle, isWatchlisted, loaded };
}
