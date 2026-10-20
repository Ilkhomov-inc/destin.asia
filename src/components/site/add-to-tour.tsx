"use client";
import { Check, Plus } from "lucide-react";
import { getDict } from "@/dictionaries";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AddToTour({ id, locale, className, size = "sm" }: { id: string; locale: Locale; className?: string; size?: "sm" | "lg" }) {
  const cart = useCart();
  const t = getDict(locale).build;
  const on = cart.has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        cart.toggle(id);
      }}
      aria-pressed={on}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold backdrop-blur transition active:scale-95",
        size === "sm" ? "h-8 px-3 text-xs" : "h-12 px-6 text-[15px]",
        on ? "bg-jungle text-white" : "bg-white/90 text-ink hover:bg-white",
        className,
      )}
    >
      {on ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
      {on ? t.added : t.add}
    </button>
  );
}
