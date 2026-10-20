import { Briefcase, Users } from "lucide-react";
import { getDict } from "@/dictionaries";
import { tr, trList } from "@/lib/i18n";
import type { Locale, Settings, Vehicle } from "@/lib/types";
import { Price } from "./price";
import { VehicleArt } from "./vehicle-art";

export function VehicleCard({ vehicle, locale, rates, compact }: { vehicle: Vehicle; locale: Locale; rates: Settings["rates"]; compact?: boolean }) {
  const d = getDict(locale);
  const prices = [
    [vehicle.price_hour, d.transport.hour],
    [vehicle.price_day, d.transport.day],
    [vehicle.price_transfer, d.transport.transfer],
  ].filter(([p]) => p) as [number, string][];
  return (
    <div className="flex flex-col overflow-hidden rounded-card bg-white shadow-card">
      <div className="relative flex aspect-[16/9] items-end justify-center bg-gradient-to-b from-paper-2 to-white px-6 pt-6">
        {vehicle.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={vehicle.image} alt={tr(vehicle.name, locale)} className="h-full w-full object-contain" />
        ) : (
          <VehicleArt vclass={vehicle.vclass} className="w-full max-w-[280px]" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase">{d.vehicleClasses[vehicle.vclass]}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold">{tr(vehicle.name, locale)}</h3>
        <p className="text-[13px] font-medium text-ink-soft">{vehicle.examples}</p>
        <div className="mt-3 flex gap-4 text-[13px] font-semibold text-ink">
          <span className="flex items-center gap-1.5">
            <Users className="size-4 text-route" /> {d.common.seats(vehicle.seats)}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="size-4 text-route" /> {d.common.luggage(vehicle.luggage)}
          </span>
        </div>
        {!compact && (
          <>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{tr(vehicle.description, locale)}</p>
            <ul className="mt-3 space-y-1 text-sm text-ink-soft">
              {trList(vehicle.features, locale).map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-moss" /> {f}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mt-auto pt-4 text-sm font-semibold">
          {prices.length ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {prices.map(([p, label]) => (
                <span key={label}>
                  <Price usd={p} rates={rates} /> <span className="font-normal text-ink-soft">/ {label}</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-ink-soft">{d.common.onRequest}</span>
          )}
        </div>
      </div>
    </div>
  );
}
