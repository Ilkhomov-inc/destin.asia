"use client";
import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { getDict } from "@/dictionaries";
import type { Category, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export type BrowserItem = { id: string; category: Category; haystack: string; node: ReactNode };

export function LocationBrowser({ items, locale }: { items: BrowserItem[]; locale: Locale }) {
  const d = getDict(locale);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | null>(null);
  const cats = useMemo(() => [...new Set(items.map((i) => i.category))], [items]);
  const shown = items.filter((i) => (!cat || i.category === cat) && (!q || i.haystack.includes(q.trim().toLowerCase())));

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
          {[null, ...cats].map((c) => (
            <button
              key={c ?? "all"}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                cat === c ? "border-ink bg-ink text-white" : "border-ink/12 bg-white text-ink-soft hover:border-ink/30 hover:text-ink",
              )}
            >
              {c ? d.categories[c] : d.common.all}
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={d.locations.search}
            className="h-11 w-full rounded-full border border-ink/12 bg-white pr-4 pl-11 text-[15px] outline-none focus:border-jungle-2 focus:ring-4 focus:ring-jungle-2/10"
          />
        </label>
      </div>
      {shown.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{shown.map((i) => <div key={i.id}>{i.node}</div>)}</div>
      ) : (
        <p className="py-16 text-center text-ink-soft">{d.locations.empty}</p>
      )}
    </>
  );
}
