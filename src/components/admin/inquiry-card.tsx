"use client";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRow, updateInquiry } from "@/app/admin/actions";
import { inputClass } from "@/components/ui/field";
import type { Inquiry, InquiryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS: Record<InquiryStatus, { label: string; cls: string }> = {
  new: { label: "Новая", cls: "bg-route text-white" },
  in_progress: { label: "В работе", cls: "bg-gold text-ink" },
  done: { label: "Готово", cls: "bg-jungle-2 text-white" },
  spam: { label: "Спам", cls: "bg-ink/10 text-ink-soft" },
};

function contactHref(i: Inquiry) {
  const c = i.contact.trim();
  const digits = c.replace(/[^\d]/g, "");
  if (i.channel === "telegram") return c.startsWith("@") || !/^\+?\d/.test(c) ? `https://t.me/${c.replace(/^@/, "")}` : `https://t.me/+${digits}`;
  if (i.channel === "whatsapp") return `https://wa.me/${digits}`;
  return `tel:+${digits}`;
}

export function InquiryCard({ inquiry, details }: { inquiry: Inquiry; details: { tour?: string; vehicle?: string; locations: string[] } }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState(inquiry.note);
  const set = (patch: { status?: InquiryStatus; note?: string }) =>
    start(async () => {
      await updateInquiry(inquiry.id, patch);
      router.refresh();
    });
  const date = new Date(inquiry.created_at);
  const rows = [
    ["Тур", details.tour],
    ["Локации", details.locations.join(", ")],
    ["Даты", [inquiry.date_from, inquiry.date_to].filter(Boolean).join(" — ")],
    ["Дней", inquiry.days],
    ["Людей", inquiry.people],
    ["Машина", details.vehicle],
    ["Язык", inquiry.lang.toUpperCase()],
    ["Откуда", inquiry.source],
  ].filter(([, v]) => v);

  return (
    <article className={cn("rounded-2xl border bg-white p-5", inquiry.status === "new" ? "border-route/40" : "border-ink/8")}>
      <header className="flex flex-wrap items-center gap-3">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS[inquiry.status].cls)}>{STATUS[inquiry.status].label}</span>
        <h3 className="font-display font-semibold">{inquiry.name}</h3>
        <a href={contactHref(inquiry)} target="_blank" rel="noopener" className="text-sm font-semibold text-jungle-2 hover:underline">
          {inquiry.contact} · {inquiry.channel}
        </a>
        <time className="ml-auto text-xs text-ink-soft">{date.toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}</time>
      </header>
      {rows.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k as string} className="flex gap-2">
              <dt className="w-20 shrink-0 text-ink-soft">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {inquiry.message && <p className="mt-4 rounded-xl bg-paper p-3 text-sm whitespace-pre-line">{inquiry.message}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(Object.keys(STATUS) as InquiryStatus[]).map((s) => (
          <button key={s} type="button" disabled={pending || s === inquiry.status} onClick={() => set({ status: s })} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", s === inquiry.status ? "border-ink bg-ink text-white" : "border-ink/12 hover:border-ink/40")}>
            {STATUS[s].label}
          </button>
        ))}
        {pending && <Loader2 className="size-4 animate-spin text-ink-soft" />}
        <button
          type="button"
          onClick={() => confirm("Удалить заявку?") && start(async () => (await deleteRow("inquiries", inquiry.id), router.refresh()))}
          className="ml-auto flex size-8 items-center justify-center rounded-lg text-route hover:bg-route/10"
          aria-label="Удалить"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <textarea
        className={cn(inputClass, "mt-3 py-2 text-sm")}
        rows={1}
        placeholder="Заметка менеджера…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note !== inquiry.note && set({ note })}
      />
    </article>
  );
}
