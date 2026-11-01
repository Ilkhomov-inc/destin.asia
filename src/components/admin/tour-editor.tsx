"use client";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { saveTour } from "@/app/admin/actions";
import type { Tour } from "@/lib/types";
import { SaveBar, useDraft } from "./editor";
import { Card, ImagesField, LField, LListField, num, SelectField, TextField, Toggle } from "./fields";

export function TourEditor({ initial, isNew, locations }: { initial: Tour; isNew: boolean; locations: { id: string; title: string }[] }) {
  const { value: v, set, dirty, setDirty } = useDraft(initial);
  const route = v.location_ids;
  const moveStop = (i: number, d: number) => {
    const next = [...route];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set("location_ids", next);
  };
  const program = v.program;
  const setDay = (i: number, patch: Partial<Tour["program"][number]>) => set("program", program.map((p, k) => (k === i ? { ...p, ...patch } : p)));

  return (
    <>
      <SaveBar
        title={isNew ? "Новый тур" : v.title.ru || "Тур"}
        backHref="/admin/tours"
        isNew={isNew}
        dirty={dirty}
        id={v.id}
        deleteTable="tours"
        viewHref={`/ru/tours/${v.slug}`}
        onSave={() => saveTour(v)}
        onSaved={(res) => {
          if (res.slug) set("slug", res.slug);
          setDirty(false);
        }}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Основное">
            <LField label="Название" value={v.title} onChange={(x) => set("title", x)} />
            <LField label="Коротко (для карточки)" value={v.short} onChange={(x) => set("short", x)} multiline rows={2} />
            <LField label="Описание" value={v.description} onChange={(x) => set("description", x)} multiline rows={5} />
          </Card>
          <Card title="Маршрут">
            <ol className="space-y-2">
              {route.map((id, i) => (
                <li key={id} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-route text-[11px] font-bold text-white">{i + 1}</span>
                  <span className="flex-1 text-sm font-semibold">{locations.find((l) => l.id === id)?.title ?? "—"}</span>
                  <button type="button" disabled={i === 0} onClick={() => moveStop(i, -1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-white disabled:opacity-30" aria-label="Выше">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" disabled={i === route.length - 1} onClick={() => moveStop(i, 1)} className="flex size-8 items-center justify-center rounded-lg hover:bg-white disabled:opacity-30" aria-label="Ниже">
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => set("location_ids", route.filter((x) => x !== id))} className="flex size-8 items-center justify-center rounded-lg text-route hover:bg-white" aria-label="Убрать">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2">
              {locations
                .filter((l) => !route.includes(l.id))
                .map((l) => (
                  <button key={l.id} type="button" onClick={() => set("location_ids", [...route, l.id])} className="inline-flex items-center gap-1 rounded-full border border-ink/12 px-3 py-1.5 text-xs font-semibold hover:border-jungle-2 hover:text-jungle-2">
                    <Plus className="size-3" /> {l.title}
                  </button>
                ))}
            </div>
          </Card>
          <Card title="Программа по дням">
            {program.map((p, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-ink/8 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-jungle px-3 py-1 text-xs font-bold text-white">День {i + 1}</span>
                  <button type="button" onClick={() => set("program", program.filter((_, k) => k !== i))} className="flex size-8 items-center justify-center rounded-lg text-route hover:bg-route/10" aria-label="Удалить день">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <LField label="Заголовок" value={p.title} onChange={(x) => setDay(i, { title: x })} />
                <LField label="Описание дня" value={p.text} onChange={(x) => setDay(i, { text: x })} multiline rows={3} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("program", [...program, { day: program.length + 1, title: { ru: "", uz: "" }, text: { ru: "", uz: "" } }])}
              className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-2 text-sm font-semibold hover:bg-ink/10"
            >
              <Plus className="size-4" /> Добавить день
            </button>
          </Card>
          <Card title="Что входит">
            <LListField label="Включено" value={v.included} onChange={(x) => set("included", x)} />
            <LListField label="Не включено" value={v.not_included} onChange={(x) => set("not_included", x)} />
          </Card>
          <Card title="Фото">
            <ImagesField value={v.images} onChange={(x) => set("images", x)} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Публикация">
            <Toggle label="Опубликовано" checked={v.status === "published"} onChange={(x) => set("status", x ? "published" : "draft")} />
            <Toggle label="Показывать на главной" checked={v.featured} onChange={(x) => set("featured", x)} />
            <TextField label="Порядок" type="number" value={v.sort} onChange={(x) => set("sort", Number(x) || 0)} hint="меньше = выше" />
            <TextField label="Адрес страницы (slug)" value={v.slug} onChange={(x) => set("slug", x)} hint="из названия, если пусто" />
          </Card>
          <Card title="Параметры">
            <SelectField label="Тип" value={v.kind} options={[{ value: "ready", label: "Готовая программа" }, { value: "custom", label: "Индивидуальный" }]} onChange={(x) => set("kind", x)} />
            <TextField label="Дней" type="number" value={v.duration_days || null} onChange={(x) => set("duration_days", Number(x) || 0)} />
            <TextField label="Цена от, USD" type="number" value={v.price_from} onChange={(x) => set("price_from", num(x))} hint="пусто = «на консультации»" />
            <LField label="Примечание к цене" value={v.price_note} onChange={(x) => set("price_note", x)} multiline rows={2} />
          </Card>
        </div>
      </div>
    </>
  );
}
