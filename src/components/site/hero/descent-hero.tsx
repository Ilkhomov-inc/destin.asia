"use client";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DescentScene, PINS, ROUTE, SCENE_H, SCENE_W } from "./scene";

const Scene = memo(DescentScene);

// Which slice of scroll progress each stage caption owns.
const STAGES = [
  { from: 0.06, to: 0.3, slug: "genting-highlands" },
  { from: 0.4, to: 0.62, slug: "batu-caves" },
  { from: 0.74, to: 0.9, slug: "klcc" },
];

type Sample = { len: number; x: number; y: number };

export function DescentHero({ locale, title, subtitle }: { locale: Locale; title: string; subtitle: string }) {
  const d = getDict(locale);
  const sectionRef = useRef<HTMLElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const samples = useRef<Sample[]>([]);
  const [size, setSize] = useState({ vw: 1440, vh: 900, w: 1440, h: 3200 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const camY = useMotionValue(0);
  const camXRaw = useMotionValue(0);
  const camX = useSpring(camXRaw, { stiffness: 90, damping: 24, mass: 0.6 });
  const drawn = useMotionValue(0);
  const tipX = useMotionValue<number>(PINS[0].x);
  const tipY = useMotionValue<number>(PINS[0].y);

  // Size the scene so it always covers the viewport; on phones it is wider than the screen and pans.
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = Math.max(vw, vh * 1.15);
      setSize({ vw, vh, w, h: (w * SCENE_H) / SCENE_W });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    samples.current = Array.from({ length: 401 }, (_, i) => {
      const len = (i / 400) * total;
      const p = path.getPointAtLength(len);
      return { len: len / total, x: p.x, y: p.y };
    });
  }, []);

  const update = useCallback(
    (p: number) => {
      const scale = size.w / SCENE_W;
      const y = -(size.h - size.vh) * p;
      camY.set(y);
      // The trail tip sits a little below the middle of the screen.
      const focusY = (-y + size.vh * 0.58) / scale;
      const s = samples.current;
      if (!s.length) return;
      let tip = s[s.length - 1];
      if (focusY < s[0].y) tip = s[0];
      else for (const sample of s) if (sample.y >= focusY) { tip = sample; break; }
      drawn.set(p >= 0.995 ? 1 : tip.len);
      tipX.set(tip.x);
      tipY.set(tip.y);
      const x = size.vw / 2 - tip.x * scale;
      camXRaw.set(Math.min(0, Math.max(size.vw - size.w, x)));
    },
    [size, camY, camXRaw, drawn, tipX, tipY],
  );

  useMotionValueEvent(scrollYProgress, "change", update);
  useEffect(() => {
    update(scrollYProgress.get());
    camX.jump(camXRaw.get());
  }, [update, scrollYProgress, camX, camXRaw]);

  const altitude = useTransform(scrollYProgress, [0, 0.3, 0.55, 0.75, 1], [1800, 1100, 120, 70, 60]);
  const altitudeText = useTransform(altitude, (v) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v / 10) * 10)} ${locale === "ru" ? "м" : "m"}`);
  const gauge = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.07], [0, -60]);
  const outroOpacity = useTransform(scrollYProgress, [0.9, 0.97], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.9, 0.97], [40, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);

  return (
    <section ref={sectionRef} data-hero className="relative h-[420vh] bg-night" aria-label={title}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div className="absolute top-0 left-0 will-change-transform" style={{ x: camX, y: camY, width: size.w, height: size.h }}>
          <Scene />
          <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="absolute inset-0 h-full w-full" aria-hidden={false}>
            <path d={ROUTE} fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeDasharray="2 16" strokeLinecap="round" />
            <motion.path ref={routeRef} d={ROUTE} fill="none" stroke="#d6452b" strokeWidth="7" strokeLinecap="round" style={{ pathLength: drawn }} />
            <motion.path d={ROUTE} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="10 12" strokeLinecap="round" style={{ pathLength: drawn }} />
            {PINS.map((p) => (
              <Link key={p.key} href={`/${locale}/locations/${p.slug}`} aria-label={p.slug}>
                <g transform={`translate(${p.x} ${p.y})`} className="cursor-pointer">
                  <circle r="26" fill="#d6452b" opacity=".25" className="origin-center animate-pulse-ring [transform-box:fill-box]" />
                  <circle r="14" fill="#fff" stroke="#d6452b" strokeWidth="5" />
                  <circle r="5" fill="#d6452b" />
                </g>
              </Link>
            ))}
            <motion.g style={{ x: tipX, y: tipY }}>
              <circle r="20" fill="#d6452b" />
              <circle r="20" fill="none" stroke="#fff" strokeWidth="4" />
              <path d="M-8 -2 L0 -10 L8 -2 M0 -10 V9" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180)" />
            </motion.g>
          </svg>
        </motion.div>

        {/* Readability scrims */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-night/60 to-transparent" />

        {/* Intro */}
        <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-x-0 top-0 flex h-full flex-col justify-center px-4 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl rounded-[2rem] bg-night/35 p-6 backdrop-blur-md sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-white uppercase backdrop-blur">
                <MapPin className="size-3.5 text-sunset" /> {d.hero.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-bold tracking-tight text-white drop-shadow-[0_2px_24px_rgb(11_21_48/0.45)] sm:text-6xl lg:text-7xl">{title}</h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_12px_rgb(11_21_48/0.5)]">{subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/${locale}/tours`} className={buttonClass("primary", "lg")}>
                  {d.hero.ctaTours} <ArrowRight className="size-4" />
                </Link>
                <Link href={`/${locale}/build`} className={buttonClass("light", "lg")}>
                  {d.hero.ctaBuild}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white">
          <span className="text-xs font-semibold tracking-wider text-white/85 uppercase">{d.hero.scroll}</span>
          <ArrowDown className="size-5 animate-float" />
        </motion.div>

        {/* Altitude gauge */}
        <div className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex lg:right-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase [writing-mode:vertical-rl]">{d.hero.altitude}</span>
          <div className="relative h-48 w-1 rounded-full bg-white/20">
            <motion.div className="absolute inset-x-0 top-0 rounded-full bg-route" style={{ height: gauge }} />
          </div>
          <motion.span className="rounded-full bg-night/60 px-2.5 py-1 font-display text-xs font-semibold text-white tabular-nums backdrop-blur">{altitudeText}</motion.span>
        </div>

        {/* Stage captions */}
        {STAGES.map((s, i) => (
          <StageCaption key={s.slug} progress={scrollYProgress} {...s} locale={locale} index={i} name={d.hero.stages[i].name} note={d.hero.stages[i].note} more={d.common.more} />
        ))}

        {/* Arrival */}
        <motion.div style={{ opacity: outroOpacity, y: outroY }} className="absolute inset-x-0 top-[14%] px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white drop-shadow-[0_2px_24px_rgb(11_21_48/0.7)] sm:text-5xl">{d.hero.arrived}</h2>
          <p className="mx-auto mt-4 max-w-md text-white/85">{d.hero.arrivedText}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={`/${locale}/tours`} className={buttonClass("primary", "lg")}>
              {d.hero.ctaTours}
            </Link>
            <Link href={`/${locale}/build`} className={buttonClass("light", "lg")}>
              {d.hero.ctaBuild}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StageCaption({
  progress,
  from,
  to,
  slug,
  locale,
  index,
  name,
  note,
  more,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  slug: string;
  locale: Locale;
  index: number;
  name: string;
  note: string;
  more: string;
}) {
  const opacity = useTransform(progress, [from, from + 0.04, to - 0.04, to], [0, 1, 1, 0]);
  const x = useTransform(progress, [from, from + 0.04], [-24, 0]);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(opacity, "change", (v) => setVisible(v > 0.05));
  return (
    <motion.div style={{ opacity, x }} className={cn("absolute bottom-24 left-4 max-w-[calc(100%-2rem)] sm:bottom-10 sm:left-8", !visible && "pointer-events-none")}>
      <div className="rounded-2xl bg-night/55 p-5 text-white shadow-lift backdrop-blur-md sm:w-96">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-route font-display text-sm font-bold">{index + 1}</span>
          <h3 className="font-display text-xl font-semibold">{name}</h3>
        </div>
        <p className="mt-2 text-sm text-white/80">{note}</p>
        <Link href={`/${locale}/locations/${slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sunset hover:text-white">
          {more} <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
}
