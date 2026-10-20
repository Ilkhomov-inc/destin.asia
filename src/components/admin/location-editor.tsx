"use client";
import { saveLocation } from "@/app/admin/actions";
import ru from "@/dictionaries/ru";
import { CATEGORIES, type Location } from "@/lib/types";
import { SaveBar, useDraft } from "./editor";
import { Card, ImagesField, LField, LListField, num, SelectField, TextField, Toggle } from "./fields";

export function LocationEditor({ initial, isNew }: { initial: Location; isNew: boolean }) {
  const { value: v, set, dirty, setDirty } = useDraft(initial);
  return (
    <>
      <SaveBar
        title={isNew ? "Новая локация" : v.title.ru || "Локация"}
        backHref="/admin/locations"
        isNew={isNew}
        dirty={dirty}
        id={v.id}
        deleteTable="locations"
        viewHref={`/ru/locations/${v.slug}`}
        onSave={() => saveLocation(v)}
        onSaved={() => setDirty(false)}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Основное">
            <LField label="Название" value={v.title} onChange={(x) => set("title", x)} />
            <LField label="Коротко (для карточки)" value={v.short} onChange={(x) => set("short", x)} multiline rows={2} />
            <LField label="Описание" value={v.description} onChange={(x) => set("description", x)} multiline rows={8} />
            <LListField label="Что посмотреть" value={v.highlights} onChange={(x) => set("highlights", x)} />
          </Card>
          <Card title="Фото">
            <ImagesField value={v.images} onChange={(x) => set("images", x)} />
          </Card>
          <Card title="Практическая информация">
            <LField label="Сколько времени нужно" value={v.duration} onChange={(x) => set("duration", x)} />
            <LField label="Билеты / цены" value={v.price_note} onChange={(x) => set("price_note", x)} multiline rows={2} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Публикация">
            <Toggle label="Опубликовано" checked={v.status === "published"} onChange={(x) => set("status", x ? "published" : "draft")} />
            <TextField label="Порядок" type="number" value={v.sort} onChange={(x) => set("sort", Number(x) || 0)} hint="меньше = выше" />
            <TextField label="Адрес страницы (slug)" value={v.slug} onChange={(x) => set("slug", x)} hint="из названия, если пусто" />
          </Card>
          <Card title="Категория и место">
            <SelectField label="Категория" value={v.category} options={CATEGORIES.map((c) => ({ value: c, label: ru.categories[c] }))} onChange={(x) => set("category", x)} />
            <TextField label="Регион" value={v.region} onChange={(x) => set("region", x)} placeholder="Kuala Lumpur" />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Широта" type="number" value={v.lat} onChange={(x) => set("lat", num(x))} />
              <TextField label="Долгота" type="number" value={v.lng} onChange={(x) => set("lng", num(x))} />
            </div>
            <p className="text-xs text-ink-soft">Координаты: правый клик по месту в Google Maps → первые два числа.</p>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Дорога от KLCC, мин" type="number" value={v.travel_min} onChange={(x) => set("travel_min", num(x))} />
              <TextField label="На месте, часов" type="number" value={v.visit_hours} onChange={(x) => set("visit_hours", Number(x) || 0)} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
