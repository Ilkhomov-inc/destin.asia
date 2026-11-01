"use client";
import { saveVehicle } from "@/app/admin/actions";
import ru from "@/dictionaries/ru";
import { VEHICLE_CLASSES, type Vehicle } from "@/lib/types";
import { SaveBar, useDraft } from "./editor";
import { Card, ImagesField, LField, LListField, num, SelectField, TextField, Toggle } from "./fields";

export function VehicleEditor({ initial, isNew }: { initial: Vehicle; isNew: boolean }) {
  const { value: v, set, dirty, setDirty } = useDraft(initial);
  return (
    <>
      <SaveBar title={isNew ? "Новая машина" : v.name.ru || "Машина"} backHref="/admin/vehicles" isNew={isNew} dirty={dirty} id={v.id} deleteTable="vehicles" onSave={() => saveVehicle(v)} onSaved={() => setDirty(false)} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Основное">
            <LField label="Название" value={v.name} onChange={(x) => set("name", x)} />
            <TextField label="Модели" value={v.examples} onChange={(x) => set("examples", x)} placeholder="Toyota Alphard · Vellfire" />
            <LField label="Описание" value={v.description} onChange={(x) => set("description", x)} multiline rows={3} />
            <LListField label="Особенности" value={v.features} onChange={(x) => set("features", x)} />
          </Card>
          <Card title="Фото (на прозрачном или белом фоне)">
            <ImagesField single value={v.image ? [v.image] : []} onChange={(x) => set("image", x[0] ?? "")} />
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Публикация">
            <Toggle label="Опубликовано" checked={v.status === "published"} onChange={(x) => set("status", x ? "published" : "draft")} />
            <TextField label="Порядок" type="number" value={v.sort} onChange={(x) => set("sort", Number(x) || 0)} />
          </Card>
          <Card title="Параметры">
            <SelectField label="Класс" value={v.vclass} options={VEHICLE_CLASSES.map((c) => ({ value: c, label: ru.vehicleClasses[c] }))} onChange={(x) => set("vclass", x)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Мест" type="number" value={v.seats || null} onChange={(x) => set("seats", Number(x) || 0)} />
              <TextField label="Чемоданов" type="number" value={v.luggage} onChange={(x) => set("luggage", Number(x) || 0)} />
            </div>
          </Card>
          <Card title="Цены, USD (пусто = по запросу)">
            <TextField label="За час" type="number" value={v.price_hour} onChange={(x) => set("price_hour", num(x))} />
            <TextField label="За день" type="number" value={v.price_day} onChange={(x) => set("price_day", num(x))} />
            <TextField label="Трансфер KLIA" type="number" value={v.price_transfer} onChange={(x) => set("price_transfer", num(x))} />
          </Card>
        </div>
      </div>
    </>
  );
}
