import { Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function ListHeader({ title, newHref }: { title: string; newHref?: string }) {
  return (
    <div className="flex items-center justify-between py-8">
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      {newHref && (
        <Link href={newHref} className="inline-flex h-10 items-center gap-2 rounded-full bg-route px-5 text-sm font-semibold text-white hover:bg-route-dark">
          <Plus className="size-4" /> Добавить
        </Link>
      )}
    </div>
  );
}

export function ListRow({ href, image, title, sub, draft, right }: { href: string; image?: string; title: string; sub?: ReactNode; draft?: boolean; right?: ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white p-3 transition hover:border-ink/20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image ? <img src={image} alt="" className="size-14 shrink-0 rounded-xl object-cover" /> : <span className="size-14 shrink-0 rounded-xl bg-paper-2" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{title || "Без названия"}</span>
        {sub && <span className="block truncate text-sm text-ink-soft">{sub}</span>}
      </span>
      {draft && <span className="rounded-full bg-ink/8 px-2.5 py-1 text-[11px] font-bold text-ink-soft">ЧЕРНОВИК</span>}
      {right}
    </Link>
  );
}
