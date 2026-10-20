import { Banknote, CloudSun, Plane, Shirt, Smartphone, UtensilsCrossed } from "lucide-react";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";

const ICONS = [Plane, Banknote, Smartphone, CloudSun, UtensilsCrossed, Shirt];

export function InfoGrid({ locale }: { locale: Locale }) {
  const items = getDict(locale).info.items;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <div key={it.title} className="rounded-card border border-line bg-white/70 p-6">
            <Icon className="size-6 text-route" />
            <h3 className="mt-4 font-display text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.text}</p>
          </div>
        );
      })}
    </div>
  );
}
