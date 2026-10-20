import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { getDict } from "@/dictionaries";
import { tr } from "@/lib/i18n";
import type { Locale, Location, Settings, Tour } from "@/lib/types";
import { Price } from "./price";
import { SmartImage } from "./smart-image";

export function TourCard({ tour, route, locale, rates }: { tour: Tour; route: Location[]; locale: Locale; rates: Settings["rates"] }) {
  const d = getDict(locale);
  return (
    <Link href={`/${locale}/tours/${tour.slug}`} className="group flex flex-col overflow-hidden rounded-card bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <SmartImage src={tour.cover} alt={tr(tour.title, locale)} className="aspect-[16/10] transition duration-700 group-hover:scale-[1.04]" sizes="(min-width: 1024px) 40vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink backdrop-blur">
            <CalendarDays className="size-3.5 text-route" /> {d.common.days(tour.duration_days)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink backdrop-blur">
            <MapPin className="size-3.5 text-route" /> {d.common.locationsCount(route.length)}
          </span>
        </div>
        <h3 className="absolute inset-x-5 bottom-4 font-display text-xl leading-tight font-semibold text-white sm:text-2xl">{tr(tour.title, locale)}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">{tr(tour.short, locale)}</p>
        {/* Route as a dotted trail of stops */}
        <ol className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-medium text-ink">
          {route.map((l, i) => (
            <li key={l.id} className="flex items-center gap-1.5">
              {i > 0 && <span className="h-px w-3 border-t-2 border-dotted border-route" />}
              {tr(l.title, locale)}
            </li>
          ))}
        </ol>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm font-semibold text-ink">
            {tour.price_from ? (
              <>
                {d.common.from} <Price usd={tour.price_from} rates={rates} />
              </>
            ) : (
              <span className="text-ink-soft">{d.common.onRequest}</span>
            )}
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-ink text-white transition group-hover:bg-route">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
