import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { getDict } from "@/dictionaries";
import { tr } from "@/lib/i18n";
import type { Locale, Location } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddToTour } from "./add-to-tour";
import { SmartImage } from "./smart-image";

export function travelLabel(locale: Locale, min: number | null) {
  const c = getDict(locale).common;
  if (min === null) return null;
  if (min === 0) return c.inCenter;
  return `${min >= 60 ? c.hours(Math.round((min / 60) * 2) / 2) : c.minutes(min)} ${c.fromKlcc}`;
}

export function LocationCard({ location, locale, index, className }: { location: Location; locale: Locale; index?: number; className?: string }) {
  const d = getDict(locale);
  const travel = travelLabel(locale, location.travel_min);
  return (
    <Link
      href={`/${locale}/locations/${location.slug}`}
      className={cn("group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift", className)}
    >
      <div className="relative">
        <SmartImage src={location.cover} alt={tr(location.title, locale)} className="aspect-[4/3] transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-ink/70 px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur">
            {d.categories[location.category]}
          </span>
          <AddToTour id={location.id} locale={locale} />
        </div>
        {index !== undefined && (
          <span className="absolute bottom-3 left-3 flex size-8 items-center justify-center rounded-full border-2 border-white bg-route font-display text-xs font-bold text-white shadow">
            {index + 1}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-tight font-semibold text-ink">{tr(location.title, locale)}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
          <MapPin className="size-3.5 text-route" /> {location.region}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{tr(location.short, locale)}</p>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-[13px] font-medium text-ink-soft">
          {travel && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {travel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
