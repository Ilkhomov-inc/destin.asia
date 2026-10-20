"use client";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { attribution, fitView, tileFilter, tileUrl, toScreen, visibleTiles } from "@/lib/tiles";
import { cn } from "@/lib/utils";

// The real drive: down from Genting, along the Karak Highway, past Batu Caves into KLCC.
const ROUTE = [
  { lat: 3.4237, lng: 101.793 },
  { lat: 3.404, lng: 101.776 },
  { lat: 3.37, lng: 101.786 },
  { lat: 3.32, lng: 101.755 },
  { lat: 3.275, lng: 101.73 },
  { lat: 3.252, lng: 101.705 },
  { lat: 3.2379, lng: 101.684 },
  { lat: 3.195, lng: 101.69 },
  { lat: 3.172, lng: 101.702 },
  { lat: 3.1579, lng: 101.7116 },
];
const STOPS = [
  { i: 0, label: "Genting" },
  { i: 6, label: "Batu Caves" },
  { i: 9, label: "KLCC" },
];
const W = 236;
const H = 156;

/** Small dark map card; `progress` is the hero scroll progress (0…1). */
export function RouteTracker({ progress, title, className }: { progress: MotionValue<number>; title: string; className?: string }) {
  const view = useMemo(() => fitView(ROUTE, W, H, 22, 12), []);
  const pts = useMemo(() => ROUTE.map((p) => toScreen(p.lat, p.lng, view, W, H)), [view]);
  const tiles = useMemo(() => visibleTiles(view, W, H), [view]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Share of the path length at each stop, so the dot reaches Batu Caves mid-hero.
  const lengths = useMemo(() => {
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    return acc.map((l) => l / acc[acc.length - 1]);
  }, [pts]);
  const drawn = useTransform(progress, [0, 0.12, 0.5, 0.86, 1], [0, 0, lengths[6], 1, 1]);

  const path = useRef<SVGPathElement>(null);
  const [dot, setDot] = useState(pts[0]);
  useMotionValueEvent(drawn, "change", (f) => {
    const el = path.current;
    if (!el) return;
    const p = el.getPointAtLength(el.getTotalLength() * f);
    setDot({ x: p.x, y: p.y });
  });

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/15 bg-night/70 shadow-lift backdrop-blur-md", className)}>
      <p className="px-3 pt-2.5 pb-2 text-[10px] font-bold tracking-[0.16em] text-white/70 uppercase">{title}</p>
      <div className="relative" style={{ width: W, height: H }}>
        <div className="absolute inset-0 opacity-80" style={{ filter: tileFilter("dark") }}>
          {tiles.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${t.z}/${t.x}/${t.y}`} src={tileUrl("dark", t.x, t.y, t.z)} alt="" className="absolute max-w-none" style={{ left: t.left, top: t.top, width: t.size + 0.5, height: t.size + 0.5 }} />
          ))}
        </div>
        <svg className="absolute inset-0" width={W} height={H}>
          <path d={d} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
          {/* Measured separately: pathLength on the animated copy can skew getPointAtLength */}
          <path ref={path} d={d} fill="none" stroke="none" />
          <motion.path d={d} fill="none" stroke="#d6452b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: drawn }} />
          {STOPS.map((s) => (
            <g key={s.label} transform={`translate(${pts[s.i].x} ${pts[s.i].y})`}>
              <circle r="4" fill="#0b1530" stroke="#fff" strokeWidth="1.5" />
              <text x={s.i === 9 ? -8 : 8} y="3.5" textAnchor={s.i === 9 ? "end" : "start"} className="fill-white text-[10px] font-bold" paintOrder="stroke" stroke="#0b1530" strokeWidth="3">
                {s.label}
              </text>
            </g>
          ))}
          <circle cx={dot.x} cy={dot.y} r="5.5" fill="#d6452b" stroke="#fff" strokeWidth="2" />
        </svg>
        <span className="absolute right-1 bottom-0.5 text-[8px] text-white/50">{attribution.text}</span>
      </div>
    </div>
  );
}
