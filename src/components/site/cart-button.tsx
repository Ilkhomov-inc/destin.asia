"use client";
import { Route } from "lucide-react";
import Link from "next/link";
import { getDict } from "@/dictionaries";
import { useCart } from "@/lib/cart";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CartButton({ locale, light }: { locale: Locale; light?: boolean }) {
  const { ids } = useCart();
  return (
    <Link
      href={`/${locale}/build`}
      aria-label={getDict(locale).build.cart}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full transition",
        light ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
      )}
    >
      <Route className="size-5" />
      {ids.length > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-route text-[11px] font-bold text-white">
          {ids.length}
        </span>
      )}
    </Link>
  );
}
