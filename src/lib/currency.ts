import type { Settings } from "./types";

export const CURRENCIES = ["USD", "MYR", "UZS", "KZT"] as const;
export type Currency = (typeof CURRENCIES)[number];

export function formatPrice(usd: number, currency: Currency, rates: Settings["rates"]) {
  const value = currency === "USD" ? usd : usd * rates[currency];
  const rounded = currency === "UZS" ? Math.round(value / 1000) * 1000 : currency === "KZT" ? Math.round(value / 100) * 100 : Math.round(value);
  const symbol = { USD: "$", MYR: "RM", UZS: "сум", KZT: "₸" }[currency];
  const n = new Intl.NumberFormat("ru-RU").format(rounded);
  return currency === "USD" || currency === "MYR" ? `${symbol}${n}` : `${n} ${symbol}`;
}
