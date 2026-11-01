"use client";
import { Check, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { deleteRow, type SaveResult } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/** Local draft state + a sticky save bar shared by every admin editor. */
export function useDraft<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const set = <K extends keyof T>(key: K, v: T[K]) => {
    setValue((prev) => ({ ...prev, [key]: v }));
    setDirty(true);
  };
  return { value, set, dirty, setDirty };
}

export function SaveBar({
  title,
  backHref,
  isNew,
  dirty,
  onSave,
  onSaved,
  deleteTable,
  id,
  viewHref,
}: {
  title: ReactNode;
  backHref: string;
  isNew: boolean;
  dirty: boolean;
  onSave: () => Promise<SaveResult>;
  onSaved: (res: Extract<SaveResult, { ok: true }>) => void;
  deleteTable?: Parameters<typeof deleteRow>[0];
  id: string;
  viewHref?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // A thrown action (network drop, server crash) would otherwise reach the error boundary and lose the draft.
  const failed = () => setMsg({ ok: false, text: "Нет связи с сервером, попробуйте ещё раз" });

  const save = () =>
    start(async () => {
      let res: SaveResult;
      try {
        res = await onSave();
      } catch {
        return failed();
      }
      if (res.ok) {
        onSaved(res);
        setMsg({ ok: true, text: "Сохранено" });
        if (isNew) router.replace(`${backHref}/${res.id}`);
        else router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });

  const remove = () => {
    if (!deleteTable || !confirm("Удалить безвозвратно?")) return;
    start(async () => {
      let res: SaveResult;
      try {
        res = await deleteRow(deleteTable, id);
      } catch {
        return failed();
      }
      if (res.ok) router.replace(backHref);
      else setMsg({ ok: false, text: res.error });
    });
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-ink/8 bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <Link href={backHref} className="text-sm font-semibold text-ink-soft hover:text-ink">
        ←
      </Link>
      <h1 className="mr-auto truncate font-display text-lg font-semibold">{title}</h1>
      {msg && <span className={cn("max-w-md truncate text-sm font-medium", msg.ok ? "text-jungle-2" : "text-route")} title={msg.text}>{msg.text}</span>}
      {viewHref && !isNew && (
        <a href={viewHref} target="_blank" className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-ink/5">
          На сайте ↗
        </a>
      )}
      {deleteTable && !isNew && (
        <button type="button" onClick={remove} disabled={pending} className="flex size-10 items-center justify-center rounded-full text-route hover:bg-route/10" aria-label="Удалить">
          <Trash2 className="size-4" />
        </button>
      )}
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className={cn("inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition", dirty || isNew ? "bg-route hover:bg-route-dark" : "bg-ink")}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Сохранить
      </button>
    </div>
  );
}
