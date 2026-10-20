"use client";
import { Check, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getDict } from "@/dictionaries";
import { useCart } from "@/lib/cart";
import type { Category, Locale, VehicleClass } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TelegramIcon } from "./icons";
import { InquiryForm } from "./inquiry-form";
import { VehicleArt } from "./vehicle-art";
import { Field, Input } from "@/components/ui/field";

export type BuilderLocation = { id: string; title: string; region: string; cover: string; category: Category; visit_hours: number; travel_min: number | null };
export type BuilderVehicle = { id: string; name: string; seats: number; vclass: VehicleClass; examples: string };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-white p-5 shadow-card sm:p-7">
      <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
        <span className="flex size-8 items-center justify-center rounded-full bg-route text-sm font-bold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function TourBuilder({ locations, vehicles, locale, telegram }: { locations: BuilderLocation[]; vehicles: BuilderVehicle[]; locale: Locale; telegram: string }) {
  const d = getDict(locale);
  const t = d.build;
  const cart = useCart();
  const [people, setPeople] = useState(2);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [daysManual, setDaysManual] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const selected = cart.ids.map((id) => locations.find((l) => l.id === id)).filter((l): l is BuilderLocation => !!l);
  // Rough planning: time on site + a return drive from the city per stop, ~8 useful hours a day.
  const totalHours = selected.reduce((s, l) => s + l.visit_hours + ((l.travel_min ?? 0) * 1.2) / 60, 0);
  const suggested = Math.max(1, Math.ceil(totalHours / 8));
  const datesDays = from && to ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1 : null;
  const days = daysManual ?? (datesDays && datesDays > 0 ? datesDays : suggested);
  const fitting = vehicles.filter((v) => v.seats >= people);
  const recommended = fitting.sort((a, b) => a.seats - b.seats)[0]?.id;
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const summaryText = useMemo(() => {
    const lines = [
      `${t.summary}:`,
      ...selected.map((l, i) => `${i + 1}. ${l.title}`),
      `${t.days}: ${days}`,
      `${t.people}: ${people}`,
      from ? `${t.dateFrom}: ${from}${to ? ` — ${to}` : ""}` : "",
      `${d.nav.transport}: ${vehicle ? vehicle.name : t.anyVehicle}`,
    ];
    return lines.filter(Boolean).join("\n");
  }, [selected, days, people, from, to, vehicle, t, d.nav.transport]);

  const telegramHref = telegram ? `${telegram}${telegram.includes("?") ? "&" : "?"}text=${encodeURIComponent(summaryText)}` : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Step n={1} title={t.step1}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {locations.map((l) => {
              const on = cart.has(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => cart.toggle(l.id)}
                  aria-pressed={on}
                  className={cn("group relative overflow-hidden rounded-2xl text-left ring-2 transition active:scale-[0.98]", on ? "ring-route" : "ring-transparent hover:ring-ink/15")}
                >
                  <div className="relative aspect-[4/3] bg-paper-2">
                    {l.cover && <Image src={l.cover} alt={l.title} fill sizes="(min-width: 640px) 220px, 50vw" className="object-cover" />}
                    <div className={cn("absolute inset-0 transition", on ? "bg-route/35" : "bg-gradient-to-t from-night/70 to-transparent")} />
                    <span className={cn("absolute top-2 right-2 flex size-7 items-center justify-center rounded-full border-2 transition", on ? "border-white bg-route text-white" : "border-white/80 bg-night/30 text-transparent")}>
                      <Check className="size-4" />
                    </span>
                    <span className="absolute inset-x-3 bottom-2.5 text-sm leading-tight font-bold text-white drop-shadow">{l.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={2} title={t.step2}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.dateFrom}>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label={t.dateTo}>
              <Input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Field label={t.days}>
              <Stepper value={days} min={1} max={30} onChange={setDaysManual} />
            </Field>
            <Field label={t.people}>
              <Stepper value={people} min={1} max={60} onChange={setPeople} />
            </Field>
          </div>
        </Step>

        <Step n={3} title={t.step3}>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setVehicleId(null)}
              className={cn("rounded-2xl border-2 p-4 text-left transition", vehicleId === null ? "border-route bg-route/5" : "border-ink/10 hover:border-ink/25")}
            >
              <span className="font-display font-semibold">{t.anyVehicle}</span>
              <span className="mt-1 block text-sm text-ink-soft">{d.common.people(people)}</span>
            </button>
            {vehicles.map((v) => {
              const tooSmall = v.seats < people;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={tooSmall}
                  onClick={() => setVehicleId(v.id)}
                  className={cn(
                    "relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                    vehicleId === v.id ? "border-route bg-route/5" : "border-ink/10 hover:border-ink/25",
                  )}
                >
                  <VehicleArt vclass={v.vclass} className="w-24 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-display font-semibold">{v.name}</span>
                    <span className="block truncate text-xs text-ink-soft">{v.examples}</span>
                    <span className="mt-1 block text-xs font-semibold">{d.common.seats(v.seats)}</span>
                  </span>
                  {v.id === recommended && !tooSmall && <span className="absolute top-2 right-2 size-2 rounded-full bg-moss" />}
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={4} title={t.step4}>
          <InquiryForm
            locale={locale}
            source="builder"
            minimal
            hidden={{ location_ids: selected.map((l) => l.id), days, people, date_from: from || null, date_to: to || null, vehicle_id: vehicleId }}
          />
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card bg-night p-6 text-white shadow-lift">
          <h2 className="font-display text-xl font-semibold">{t.summary}</h2>
          {selected.length ? (
            <ol className="mt-5 space-y-2">
              {selected.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 rounded-xl bg-white/6 py-2 pr-2 pl-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-route text-[11px] font-bold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{l.title}</span>
                  <button type="button" onClick={() => cart.toggle(l.id)} aria-label="Remove" className="flex size-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-white/60">{t.emptyCart}</p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
            <div>
              <dt className="text-white/50">{t.totalHours}</dt>
              <dd className="mt-0.5 font-display text-lg font-semibold">≈ {d.common.hours(Math.round(totalHours * 2) / 2)}</dd>
            </div>
            <div>
              <dt className="text-white/50">{t.suggestedDays}</dt>
              <dd className="mt-0.5 font-display text-lg font-semibold">{d.common.days(suggested)}</dd>
            </div>
            <div>
              <dt className="text-white/50">{t.people}</dt>
              <dd className="mt-0.5 font-semibold">{d.common.people(people)}</dd>
            </div>
            <div>
              <dt className="text-white/50">{d.nav.transport}</dt>
              <dd className="mt-0.5 font-semibold">{vehicle?.name ?? t.anyVehicle}</dd>
            </div>
          </dl>
          {telegramHref && (
            <a href={telegramHref} target="_blank" rel="noopener" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-[#229ED9] text-sm font-semibold text-white transition hover:brightness-110">
              <TelegramIcon className="size-5" /> {t.sendTelegram}
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex h-[50px] items-center justify-between rounded-xl border border-ink/12 bg-white px-1.5">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="flex size-9 items-center justify-center rounded-lg hover:bg-ink/5" aria-label="−">
        <Minus className="size-4" />
      </button>
      <span className="font-display text-lg font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="flex size-9 items-center justify-center rounded-lg hover:bg-ink/5" aria-label="+">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
