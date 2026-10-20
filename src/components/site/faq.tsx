import { Plus } from "lucide-react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it) => (
        <details key={it.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {it.q}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink/5 transition group-open:rotate-45 group-open:bg-route group-open:text-white">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
