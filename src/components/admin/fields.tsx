"use client";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { uploadImages } from "@/app/admin/actions";
import { inputClass } from "@/components/ui/field";
import type { L, LList } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-semibold text-ink-soft">
      {children}
      {hint && <span className="font-normal text-ink-soft/70">{hint}</span>}
    </span>
  );
}

export function Card({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-ink/8 bg-white p-5 sm:p-6", className)}>
      {title && <h2 className="mb-5 font-display text-base font-semibold">{title}</h2>}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function TextField({ label, value, onChange, type = "text", placeholder, hint }: { label: ReactNode; value: string | number | null; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: ReactNode }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <input className={inputClass} type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} step={type === "number" ? "any" : undefined} />
    </label>
  );
}

export const num = (v: string) => (v.trim() === "" ? null : Number(v));

/** Same field in Russian and Uzbek side by side. */
export function LField({ label, value, onChange, multiline, rows = 3 }: { label: ReactNode; value: L; onChange: (v: L) => void; multiline?: boolean; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid gap-2 md:grid-cols-2">
        {(["ru", "uz"] as const).map((lng) => (
          <div key={lng} className="relative">
            <span className="pointer-events-none absolute top-2.5 right-3 rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft uppercase">{lng}</span>
            {multiline ? (
              <textarea className={cn(inputClass, "resize-y pr-12")} rows={rows} value={value[lng]} onChange={(e) => onChange({ ...value, [lng]: e.target.value })} />
            ) : (
              <input className={cn(inputClass, "pr-12")} value={value[lng]} onChange={(e) => onChange({ ...value, [lng]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Bilingual list, one item per line. */
export function LListField({ label, value, onChange }: { label: ReactNode; value: LList; onChange: (v: LList) => void }) {
  return (
    <div>
      <Label hint="по одному на строку">{label}</Label>
      <div className="grid gap-2 md:grid-cols-2">
        {(["ru", "uz"] as const).map((lng) => (
          <div key={lng} className="relative">
            <span className="pointer-events-none absolute top-2.5 right-3 rounded bg-ink/5 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft uppercase">{lng}</span>
            <textarea className={cn(inputClass, "resize-y pr-12")} rows={4} value={value[lng].join("\n")} onChange={(e) => onChange({ ...value, [lng]: e.target.value.split("\n") })} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SelectField<T extends string>({ label, value, options, onChange }: { label: ReactNode; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-jungle-2" : "bg-ink/15")}>
        <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition", checked && "translate-x-5")} />
      </button>
      {label}
    </label>
  );
}

/** Ordered image list. The first image is used as the cover. */
export function ImagesField({ value, onChange, single }: { value: string[]; onChange: (v: string[]) => void; single?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState("");

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, single ? 1 : undefined);
    setError(null);
    start(async () => {
      // One file per request: several photos together would exceed the 12 MB server-action body limit.
      const urls: string[] = [];
      for (const f of list) {
        const fd = new FormData();
        fd.append("files", f);
        try {
          const res = await uploadImages(fd);
          urls.push(...res.urls);
          if (res.error) {
            setError(res.error);
            break;
          }
        } catch {
          setError(`${f.name}: не удалось загрузить (нет связи или файл слишком большой)`);
          break;
        }
      }
      if (urls.length) onChange(single ? urls.slice(0, 1) : [...value, ...urls]);
    });
  };
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        {value.map((src, i) => (
          <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-paper-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {i === 0 && !single && <span className="absolute top-2 left-2 rounded bg-route px-1.5 py-0.5 text-[10px] font-bold text-white">ОБЛОЖКА</span>}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              {!single && i > 0 && (
                <button type="button" onClick={() => move(i, -1)} className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-ink" aria-label="Влево">
                  <ArrowUp className="size-3.5 -rotate-90" />
                </button>
              )}
              {!single && i < value.length - 1 && (
                <button type="button" onClick={() => move(i, 1)} className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-ink" aria-label="Вправо">
                  <ArrowDown className="size-3.5 -rotate-90" />
                </button>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-route" aria-label="Удалить">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(!single || value.length === 0) && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={pending}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-sm font-semibold text-ink-soft transition hover:border-jungle-2 hover:text-jungle-2"
          >
            {pending ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {pending ? "Загрузка…" : "Загрузить"}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple={!single} hidden onChange={(e) => (upload(e.target.files), (e.target.value = ""))} />
      <div className="mt-3 flex gap-2">
        <input className={cn(inputClass, "py-2 text-sm")} placeholder="…или вставьте ссылку на фото" value={link} onChange={(e) => setLink(e.target.value)} />
        <button
          type="button"
          className="shrink-0 rounded-xl bg-ink/5 px-4 text-sm font-semibold hover:bg-ink/10"
          onClick={() => {
            if (!/^https?:\/\/|^\//.test(link.trim())) return;
            onChange(single ? [link.trim()] : [...value, link.trim()]);
            setLink("");
          }}
        >
          Добавить
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-medium text-route">{error}</p>}
    </div>
  );
}
