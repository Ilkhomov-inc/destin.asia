"use client";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { cn } from "@/lib/utils";

export function CurrencySwitch({ className }: { className?: string }) {
  const [currency, setCurrency] = useCurrency();
  return (
    <div className={cn("inline-flex rounded-full bg-ink/5 p-0.5 text-xs font-bold", className)}>
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={cn("rounded-full px-3 py-1.5 transition", c === currency ? "bg-ink text-white" : "text-ink-soft hover:text-ink")}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
