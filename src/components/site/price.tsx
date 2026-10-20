"use client";
import { formatPrice } from "@/lib/currency";
import type { Settings } from "@/lib/types";
import { useCurrency } from "@/lib/use-currency";

export function Price({ usd, rates }: { usd: number; rates: Settings["rates"] }) {
  const [currency] = useCurrency();
  return <>{formatPrice(usd, currency, rates)}</>;
}
