"use client";
import { useSyncExternalStore } from "react";
import { CURRENCIES, type Currency } from "./currency";

const KEY = "destin-currency";
const listeners = new Set<() => void>();

function read(): Currency {
  try {
    const v = localStorage.getItem(KEY) as Currency | null;
    if (v && CURRENCIES.includes(v)) return v;
  } catch {}
  return "USD";
}

export function useCurrency() {
  const currency = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "USD" as Currency,
  );
  const setCurrency = (c: Currency) => {
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    listeners.forEach((l) => l());
  };
  return [currency, setCurrency] as const;
}
