"use client";
import { ArrowLeft, ArrowUpRight, Clock, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getDict } from "@/dictionaries";
import type { MapLocation, MapTour } from "@/lib/map-data";
import { attribution, fitView, km, spread, tileFilter, tileUrl, toScreen, visibleTiles, type View } from "@/lib/tiles";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddToTour } from "./add-to-tour";

// Spots this close to KLCC are grouped into one "Kuala Lumpur" marker on the trip-wide view.
const KLCC = { lat: 3.1579, lng: 101.7116 };
const CITY_KM = 8;
const CLUSTER = "__city";
const STYLE = "voyager" as const;

type Mode = "region" | "city";
type Marker = { id: string; x: number; y: number; ax: number; ay: number; loc?: MapLocation; count?: number };

export function RegionMap({ locations, tours, locale, className }: { locations: MapLocation[]; tours: MapTour[]; locale: Locale; className?: string }) {
  const d = getDict(locale);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState<Mode>("region");
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [tourId, setTourId] = useState<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const city = useMemo(() => locations.filter((l) => km(l, KLCC) <= CITY_KM), [locations]);
  const cityIds = useMemo(() => new Set(city.map((l) => l.id)), [city]);
  const clustered = city.length >= 2 && city.length < locations.length;

  const views = useMemo(() => {
    if (!size.w || !locations.length) return null;
    return {
      region: fitView(locations, size.w, size.h, 64, 12),
      city: fitView(city.length ? city : locations, size.w, size.h, 80, 15),
    } satisfies Record<Mode, View>;
  }, [size, locations, city]);

  const tour = tours.find((t) => t.id === tourId);
  const loc = (id: string) => locations.find((l) => l.id === id);
  const current = active ? loc(active) : undefined;

  function markersFor(m: Mode): Marker[] {
    if (!views) return [];
    const v = views[m];
    const shown = m === "city" ? city : clustered ? locations.filter((l) => !cityIds.has(l.id)) : locations;
    const pts: Marker[] = shown.map((l) => {
      const p = toScreen(l.lat, l.lng, v, size.w, size.h);
      return { id: l.id, x: p.x, y: p.y, ax: p.x, ay: p.y, loc: l };
    });
    if (m === "region" && clustered) {
      const lat = city.reduce((s, l) => s + l.lat, 0) / city.length;
      const lng = city.reduce((s, l) => s + l.lng, 0) / city.length;
      const p = toScreen(lat, lng, v, size.w, size.h);
      pts.push({ id: CLUSTER, x: p.x, y: p.y, ax: p.x, ay: p.y, count: city.length });
    }
    // Labels sit under the pins on the trip view, so it needs more room between them.
    return spread(pts, m === "region" ? 80 : 56);
  }

  /** Route through the markers of the current view (city stops collapse into the cluster). */
  function routeFor(markers: Marker[], m: Mode) {
    if (!tour) return { path: "", order: new Map<string, number>() };
    const ids = tour.location_ids
      .filter((id) => loc(id) && (m === "region" || cityIds.has(id)))
      .map((id) => (m === "region" && clustered && cityIds.has(id) ? CLUSTER : id))
      .filter((id, i, arr) => i === 0 || arr[i - 1] !== id);
    const pts = ids.map((id) => markers.find((p) => p.id === id)).filter((p): p is Marker => !!p);
    const order = new Map<string, number>();
    tour.location_ids.forEach((id, i) => order.set(id, i));
    let path = pts.length ? `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}` : "";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      // Bend each leg into a gentle arc.
      const cx = mx - ((b.y - a.y) / (len || 1)) * len * 0.18;
      const cy = my + ((b.x - a.x) / (len || 1)) * len * 0.18;
      path += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    return { path, order };
  }

  const pickTour = (id: string | null) => {
    setTourId(id);
    setActive(null);
    const t = tours.find((x) => x.id === id);
    if (t && clustered) setMode(t.location_ids.every((x) => cityIds.has(x)) ? "city" : "region");
  };

  const select = (id: string) => {
    if (id === CLUSTER) return setMode("city");
    if (mode === "region" && clustered && cityIds.has(id)) setMode("city");
    setActive((cur) => (cur === id ? null : id));
  };

  const markers = markersFor(mode);
  const route = routeFor(markers, mode);
  const cluster = views && clustered ? markersFor("region").find((m) => m.id === CLUSTER) : undefined;
  const origin = cluster ? `${cluster.x}px ${cluster.y}px` : "50% 50%";
  const listed = tour ? tour.location_ids.map(loc).filter((l): l is MapLocation => !!l) : locations;

  return (
    <div className={cn("grid gap-5 lg:grid-cols-[1fr_340px]", className)}>
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-[#ebe6da] shadow-card">
        <div ref={box} className="relative aspect-[4/5] w-full sm:aspect-[16/11]">
          <AnimatePresence initial={false} custom={mode}>
            {views && (
              <motion.div
                key={mode}
                className="absolute inset-0"
                style={{ transformOrigin: origin }}
                custom={mode}
                variants={{
                  enter: (m: Mode) => ({ opacity: 0, scale: m === "city" ? 0.35 : 2.6 }),
                  show: { opacity: 1, scale: 1 },
                  leave: (m: Mode) => ({ opacity: 0, scale: m === "city" ? 2.6 : 0.35 }),
                }}
                initial="enter"
                animate="show"
                exit="leave"
                transition={{ duration: 0.7, ease: [0.3, 0.7, 0.2, 1] }}
              >
                <Tiles view={views[mode]} w={size.w} h={size.h} />
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  {/* Leader lines for markers nudged away from their true spot */}
                  {markers.map((m) =>
                    Math.hypot(m.x - m.ax, m.y - m.ay) > 6 ? (
                      <g key={m.id}>
                        <line x1={m.ax} y1={m.ay} x2={m.x} y2={m.y} stroke="#13201a" strokeOpacity=".35" strokeWidth="1.2" />
                        <circle cx={m.ax} cy={m.ay} r="3" fill="#d6452b" stroke="#fff" strokeWidth="1.5" />
                      </g>
                    ) : null,
                  )}
                  {route.path && (
                    <>
                      <path d={route.path} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".85" />
                      <motion.path
                        key={`${tourId}-${mode}`}
                        d={route.path}
                        fill="none"
                        stroke="#d6452b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
                      />
                      <path d={route.path} fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="6 10" strokeLinecap="round" className="anim-dash" />
                    </>
                  )}
                </svg>
                {markers.map((m) => (
                  <Pin
                    key={m.id}
                    marker={m}
                    locale={locale}
                    active={active === m.id}
                    hovered={hover === m.id}
                    dim={!!tour && m.id !== CLUSTER && !route.order.has(m.id)}
                    order={m.loc ? route.order.get(m.id) : undefined}
                    showLabel={mode === "region" || active === m.id || hover === m.id}
                    onSelect={() => select(m.id)}
                    onHover={(on) => setHover(on ? m.id : null)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          {!views && <div className="absolute inset-0 animate-pulse bg-paper-2" />}
        </div>

        {/* Tour chips */}
        {tours.length > 0 && (
          <div className="no-scrollbar absolute inset-x-0 top-0 z-10 flex gap-2 overflow-x-auto p-3">
            {[{ id: null, title: d.common.all }, ...tours].map((t) => (
              <button
                key={t.id ?? "all"}
                type="button"
                onClick={() => pickTour(t.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition",
                  tourId === t.id ? "bg-route text-white" : "bg-white/90 text-ink-soft backdrop-blur hover:text-ink",
                )}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        {/* View switch */}
        {clustered && (
          <div className="absolute bottom-3 left-3 z-10">
            {mode === "city" ? (
              <button type="button" onClick={() => setMode("region")} className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-white shadow-lift">
                <ArrowLeft className="size-3.5" /> {d.home.mapAll}
              </button>
            ) : (
              <button type="button" onClick={() => setMode("city")} className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-bold text-ink shadow-lift backdrop-blur">
                <ZoomIn className="size-3.5 text-route" /> {d.home.mapOpenCity}
              </button>
            )}
          </div>
        )}
        <a href={attribution.href} target="_blank" rel="noopener" className="absolute right-2 bottom-2 z-10 rounded bg-white/75 px-1.5 py-0.5 text-[10px] text-ink-soft backdrop-blur hover:text-ink">
          {attribution.text}
        </a>
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
            <motion.ul key={`list-${tourId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {listed.map((l, i) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => select(l.id)}
                    onMouseEnter={() => setHover(l.id)}
                    onMouseLeave={() => setHover(null)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-route text-[10px] font-bold text-route">{tour ? i + 1 : "•"}</span>
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

function Tiles({ view, w, h }: { view: View; w: number; h: number }) {
  const tiles = visibleTiles(view, w, h);
  return (
    <div className="absolute inset-0" style={{ filter: tileFilter(STYLE) }}>
      {tiles.map((t) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${t.z}/${t.x}/${t.y}`}
          src={tileUrl(STYLE, t.x, t.y, t.z)}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute max-w-none opacity-0 transition-opacity duration-500 select-none"
          style={{ left: t.left, top: t.top, width: t.size + 0.5, height: t.size + 0.5 }}
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
      ))}
    </div>
  );
}

function Pin({
  marker,
  locale,
  active,
  hovered,
  dim,
  order,
  showLabel,
  onSelect,
  onHover,
}: {
  marker: Marker;
  locale: Locale;
  active: boolean;
  hovered: boolean;
  dim: boolean;
  order?: number;
  showLabel: boolean;
  onSelect: () => void;
  onHover: (on: boolean) => void;
}) {
  const d = getDict(locale);
  const isCluster = marker.count !== undefined;
  const label = isCluster ? `Kuala Lumpur · ${d.common.locationsCount(marker.count!)}` : marker.loc!.title;
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      aria-label={label}
      className={cn("absolute z-[1] -translate-x-1/2 -translate-y-1/2 transition-opacity", dim && "opacity-40", (active || hovered) && "z-[2]")}
      style={{ left: marker.x, top: marker.y }}
    >
      {isCluster ? (
        <span className="relative flex size-12 items-center justify-center rounded-full border-[3px] border-white bg-night font-display text-sm font-bold text-white shadow-lift">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-route/40" />
          <span className="relative">{marker.count}</span>
        </span>
      ) : (
        <span
          className={cn(
            "relative block overflow-hidden rounded-full border-[3px] border-white bg-paper-2 shadow-lift transition-all duration-200",
            active ? "size-14 ring-4 ring-route" : hovered ? "size-12 ring-2 ring-route" : "size-11",
          )}
        >
          {marker.loc!.cover && <Image src={marker.loc!.cover} alt="" fill sizes="56px" className="object-cover" />}
        </span>
      )}
      {order !== undefined && (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-white bg-route text-[10px] font-bold text-white">{order + 1}</span>
      )}
      {(showLabel || isCluster) && (
        <span className="pointer-events-none absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold whitespace-nowrap text-ink shadow">{label}</span>
      )}
    </button>
  );
}
