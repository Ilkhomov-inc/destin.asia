"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getDict } from "@/dictionaries";
import { coastPath, contour, project, spread, VIEWBOX } from "@/lib/geo";
import type { Category, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddToTour } from "./add-to-tour";

export type MapLocation = {
  id: string;
  slug: string;
  title: string;
  short: string;
  category: Category;
  cover: string;
  travel: string | null;
  lat: number;
  lng: number;
};
export type MapTour = { id: string; title: string; location_ids: string[] };

const RINGS = [
  // Genting / Titiwangsa range
  ...Array.from({ length: 7 }, (_, i) => contour(404, 150, 22 + i * 17, 0.62, -1.2, 1 + i * 0.4)),
  ...Array.from({ length: 4 }, (_, i) => contour(470, 250, 18 + i * 16, 0.5, -1.0, 3 + i)),
  // Low hills south-east
  ...Array.from({ length: 4 }, (_, i) => contour(470, 420, 16 + i * 15, 0.7, 0.4, 5 + i)),
  ...Array.from({ length: 3 }, (_, i) => contour(250, 200, 14 + i * 14, 0.8, 0.8, 8 + i)),
];

const coast = coastPath();

export function TopoMap({ locations, tours, locale, className }: { locations: MapLocation[]; tours: MapTour[]; locale: Locale; className?: string }) {
  const d = getDict(locale);
  const [active, setActive] = useState<string | null>(null);
  const [tourId, setTourId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const pins = useMemo(
    () => spread(locations.map((l) => ({ ...project(l.lat, l.lng), id: l.id })), 26),
    [locations],
  );
  const pinOf = (id: string) => pins.find((p) => p.id === id);
  const tour = tours.find((t) => t.id === tourId);
  const routeIds = tour?.location_ids.filter((id) => pinOf(id)) ?? [];
  const routePath = routeIds.map((id, i) => `${i ? "L" : "M"}${pinOf(id)!.x.toFixed(1)} ${pinOf(id)!.y.toFixed(1)}`).join(" ");
  const current = locations.find((l) => l.id === active);
  const klcc = project(3.1579, 101.7116);
  // City-centre pins sit too close for labels; they get one "Kuala Lumpur" tag and show names on hover.
  const inCity = (p: { x: number; y: number }) => Math.hypot(p.x - klcc.x, p.y - klcc.y) < 62;

  return (
    <div className={cn("grid gap-5 lg:grid-cols-[1fr_340px]", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-[#f3ecdc] shadow-card">
        {tours.length > 0 && (
          <div className="no-scrollbar absolute inset-x-0 top-0 z-10 flex gap-2 overflow-x-auto p-3">
            {[{ id: null, title: d.common.all }, ...tours].map((t) => (
              <button
                key={t.id ?? "all"}
                type="button"
                onClick={() => setTourId(t.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition",
                  tourId === t.id ? "bg-route text-white" : "bg-white/85 text-ink-soft backdrop-blur hover:text-ink",
                )}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
        <svg viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`} className="block h-auto w-full" role="img" aria-label={d.home.mapTitle}>
          <defs>
            <pattern id="sea-lines" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
              <path d="M0 6h12" stroke="#7fb2c4" strokeWidth=".8" opacity=".5" />
            </pattern>
          </defs>
          <path d={coast.sea} fill="#cfe2e4" />
          <path d={coast.sea} fill="url(#sea-lines)" />
          <path d={coast.line} fill="none" stroke="#6b9aa8" strokeWidth="1.4" />
          <text x="190" y="520" className="fill-[#5f8f9c] text-[11px] font-semibold italic" letterSpacing="3">
            STRAIT OF MALACCA
          </text>
          {RINGS.map((r, i) => (
            <path key={i} d={r} fill="none" stroke="#a89668" strokeWidth={i % 4 === 0 ? 1.1 : 0.6} opacity={0.45} />
          ))}
          <text x="430" y="105" className="fill-[#8d7b4f] text-[10px] font-semibold" letterSpacing="2">
            TITIWANGSA RANGE
          </text>
          {/* City glow at KLCC */}
          <circle cx={klcc.x} cy={klcc.y} r="46" fill="#f29f4b" opacity=".12" />
          <circle cx={klcc.x} cy={klcc.y} r="26" fill="#f29f4b" opacity=".14" />
          {!tour && (
            <text x={klcc.x + 58} y={klcc.y - 40} className="fill-route text-[13px] font-bold" letterSpacing="1.5" paintOrder="stroke" stroke="#f3ecdc" strokeWidth="3">
              KUALA LUMPUR
            </text>
          )}

          {routePath && (
            <motion.path
              key={tourId}
              d={routePath}
              fill="none"
              stroke="#d6452b"
              strokeWidth="2.6"
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          )}

          {locations.map((l) => {
            const p = pinOf(l.id)!;
            const order = routeIds.indexOf(l.id);
            const dim = tour && order < 0;
            const on = active === l.id;
            return (
              <g
                key={l.id}
                transform={`translate(${p.x} ${p.y})`}
                className="cursor-pointer"
                opacity={dim ? 0.35 : 1}
                onClick={() => setActive(on ? null : l.id)}
                onMouseEnter={() => setHover(l.id)}
                onMouseLeave={() => setHover(null)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(on ? null : l.id)}
                tabIndex={0}
                role="button"
                aria-label={l.title}
              >
                <circle r="16" fill="transparent" />
                {(on || hover === l.id) && <circle r="15" fill="#d6452b" opacity=".18" />}
                <circle r={on ? 9 : 7} fill={on ? "#d6452b" : "#fff"} stroke="#d6452b" strokeWidth="2.5" className="transition-all" />
                {order >= 0 && (
                  <text y="3.5" textAnchor="middle" className={cn("text-[9px] font-bold", on ? "fill-white" : "fill-route")}>
                    {order + 1}
                  </text>
                )}
                {(!inCity(p) || on || hover === l.id || order >= 0) && (
                  <text x="12" y="4" className="pointer-events-none fill-ink text-[11px] font-bold" paintOrder="stroke" stroke="#f3ecdc" strokeWidth="3">
                    {l.title}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-1.5 text-[10px] font-semibold text-ink-soft backdrop-blur">
          N ↑ · KLCC
        </div>
      </div>

      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-card bg-white shadow-card"
            >
              <div className="relative aspect-[16/10] bg-paper-2">
                {current.cover && <Image src={current.cover} alt={current.title} fill sizes="340px" className="object-cover" />}
                <button type="button" onClick={() => setActive(null)} aria-label={d.nav.close} className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink">
                  <X className="size-4" />
                </button>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-bold tracking-wider text-route uppercase">{d.categories[current.category]}</span>
                <h3 className="mt-1 font-display text-xl font-semibold">{current.title}</h3>
                {current.travel && (
                  <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-ink-soft">
                    <Clock className="size-3.5" /> {current.travel}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{current.short}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/${locale}/locations/${current.slug}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-xs font-semibold text-white hover:bg-jungle">
                    {d.common.more} <ArrowUpRight className="size-3.5" />
                  </Link>
                  <AddToTour id={current.id} locale={locale} className="border border-ink/10" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.ul key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {(tour ? routeIds.map((id) => locations.find((l) => l.id === id)!) : locations).map((l, i) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setActive(l.id)}
                    onMouseEnter={() => setHover(l.id)}
                    onMouseLeave={() => setHover(null)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-route text-[10px] font-bold text-route">
                      {tour ? i + 1 : "•"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{l.title}</span>
                      {l.travel && <span className="block text-xs text-ink-soft">{l.travel}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
