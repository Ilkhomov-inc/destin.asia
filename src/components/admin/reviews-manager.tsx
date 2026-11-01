"use client";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRow, saveReview } from "@/app/admin/actions";
import { inputClass } from "@/components/ui/field";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Toggle } from "./fields";

const blank = (): Review => ({ id: crypto.randomUUID(), name: "", country: "Узбекистан", text: "", rating: 5, photo: "", tour_id: null, status: "published", created_at: new Date().toISOString() });

export function ReviewsManager({ reviews, tours }: { reviews: Review[]; tours: { id: string; title: string }[] }) {
  const [drafts, setDrafts] = useState<Review[]>([]);
  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setDrafts((d) => [blank(), ...d])} className="inline-flex h-10 items-center gap-2 rounded-full bg-route px-5 text-sm font-semibold text-white">
        <Plus className="size-4" /> Добавить отзыв
      </button>
      <p className="text-sm text-ink-soft">Добавляйте только настоящие отзывы гостей — с их согласия.</p>
      {[...drafts, ...reviews].map((r) => (
        <ReviewRow key={r.id} initial={r} tours={tours} isNew={drafts.some((d) => d.id === r.id)} onDone={() => setDrafts((d) => d.filter((x) => x.id !== r.id))} />
      ))}
    </div>
  );
}

function ReviewRow({ initial, tours, isNew, onDone }: { initial: Review; tours: { id: string; title: string }[]; isNew: boolean; onDone: () => void }) {
  const router = useRouter();
  const [r, setR] = useState(initial);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof Review>(k: K, v: Review[K]) => setR((p) => ({ ...p, [k]: v }));
  return (
    <div className="grid gap-3 rounded-2xl border border-ink/8 bg-white p-5 md:grid-cols-[220px_1fr]">
      <div className="space-y-2">
        <input className={inputClass} placeholder="Имя" value={r.name} onChange={(e) => set("name", e.target.value)} />
        <input className={inputClass} placeholder="Страна / город" value={r.country} onChange={(e) => set("country", e.target.value)} />
        <select className={inputClass} value={r.rating} onChange={(e) => set("rating", Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)}
            </option>
          ))}
        </select>
        <select className={inputClass} value={r.tour_id ?? ""} onChange={(e) => set("tour_id", e.target.value || null)}>
          <option value="">— без тура —</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-3">
        <textarea className={cn(inputClass, "flex-1")} rows={4} placeholder="Текст отзыва" value={r.text} onChange={(e) => set("text", e.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <Toggle label="Опубликован" checked={r.status === "published"} onChange={(x) => set("status", x ? "published" : "draft")} />
          {err && <span className="text-sm text-route">{err}</span>}
          <span className="ml-auto" />
          {pending && <Loader2 className="size-4 animate-spin" />}
          <button
            type="button"
            onClick={() =>
              isNew
                ? onDone()
                : confirm("Удалить отзыв?") &&
                  start(async () => {
                    try {
                      const res = await deleteRow("reviews", r.id);
                      if (!res.ok) return setErr(res.error);
                    } catch {
                      return setErr("Нет связи с сервером");
                    }
                    router.refresh();
                  })
            }
            className="flex size-9 items-center justify-center rounded-lg text-route hover:bg-route/10"
            aria-label="Удалить"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                let res;
                try {
                  res = await saveReview(r);
                } catch {
                  return setErr("Нет связи с сервером");
                }
                if (!res.ok) return setErr(res.error);
                setErr(null);
                if (isNew) onDone();
                router.refresh();
              })
            }
            className="h-9 rounded-full bg-ink px-4 text-sm font-semibold text-white"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
