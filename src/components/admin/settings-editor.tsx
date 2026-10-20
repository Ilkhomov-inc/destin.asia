"use client";
import { saveSettings } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";
import { SaveBar, useDraft } from "./editor";
import { Card, ImagesField, LField, TextField } from "./fields";

export function SettingsEditor({ initial }: { initial: Settings }) {
  const { value: v, set, dirty, setDirty } = useDraft(initial);
  const rate = (k: keyof Settings["rates"], x: string) => set("rates", { ...v.rates, [k]: Number(x) || v.rates[k] });
  return (
    <>
      <SaveBar title="Настройки сайта" backHref="/admin" isNew={false} dirty={dirty} id="main" onSave={() => saveSettings(v)} onSaved={() => setDirty(false)} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Контакты">
          <TextField label="Телефон" value={v.phone} onChange={(x) => set("phone", x)} />
          <TextField label="Email" value={v.email} onChange={(x) => set("email", x)} />
          <TextField label="Telegram (ссылка)" value={v.telegram} onChange={(x) => set("telegram", x)} placeholder="https://t.me/username" />
          <TextField label="WhatsApp (ссылка)" value={v.whatsapp} onChange={(x) => set("whatsapp", x)} placeholder="https://wa.me/60123456789" />
          <TextField label="Instagram (ссылка)" value={v.instagram} onChange={(x) => set("instagram", x)} />
          <TextField label="Адрес" value={v.address} onChange={(x) => set("address", x)} />
        </Card>
        <Card title="Курсы валют (сколько за 1 USD)">
          <TextField label="MYR — ринггит" type="number" value={v.rates.MYR} onChange={(x) => rate("MYR", x)} />
          <TextField label="UZS — сум" type="number" value={v.rates.UZS} onChange={(x) => rate("UZS", x)} />
          <TextField label="KZT — тенге" type="number" value={v.rates.KZT} onChange={(x) => rate("KZT", x)} />
        </Card>
        <Card title="Главная" className="xl:col-span-2">
          <LField label="Заголовок" value={v.hero_title} onChange={(x) => set("hero_title", x)} />
          <LField label="Подзаголовок" value={v.hero_subtitle} onChange={(x) => set("hero_subtitle", x)} multiline rows={2} />
        </Card>
        <Card title="О нас" className="xl:col-span-2">
          <LField label="Текст" value={v.about} onChange={(x) => set("about", x)} multiline rows={6} />
          <LField label="Цитата" value={v.about_extra} onChange={(x) => set("about_extra", x)} multiline rows={2} />
          <ImagesField single value={v.about_image ? [v.about_image] : []} onChange={(x) => set("about_image", x[0] ?? "")} />
        </Card>
      </div>
    </>
  );
}
