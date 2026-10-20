"use client";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowDown, ArrowRight, MapPin } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buttonClass } from "@/components/ui/button";
import type { HeroChapter, HeroConfig, HeroImage } from "@/content/hero";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RouteTracker } from "./route-tracker";

// Scroll timeline (0…1 over the sticky section). Chapters overlap where the fog passes.
const RANGES: [number, number][] = [
  [0, 0.36],
  [0.3, 0.7],
  [0.64, 1],
];
const FADE = 0.06;
const FOG_AT = [0.33, 0.67];
const CAPTIONS: [number, number][] = [
  [0.08, 0.3],
  [0.4, 0.62],
  [0.74, 0.9],
];
// Colour grade per time of day: dawn on the mountain, golden hour at the caves, blue hour in the city.
const GRADES = [
  "radial-gradient(120% 80% at 85% 8%, rgb(255 196 140 / 0.3), transparent 60%), linear-gradient(180deg, rgb(255 220 190 / 0.12), transparent 45%)",
  "radial-gradient(110% 80% at 15% 20%, rgb(255 170 80 / 0.22), transparent 60%), linear-gradient(180deg, transparent 50%, rgb(70 25 0 / 0.25))",
  // The left fade keeps the title readable over the city lights.
  "linear-gradient(90deg, rgb(4 8 24 / 0.7), rgb(4 8 24 / 0.3) 32%, transparent 55%), linear-gradient(180deg, rgb(10 20 60 / 0.3), transparent 45%, rgb(5 10 30 / 0.5))",
];

const noSubscribe = () => () => {};
const skipVideo = () =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) || matchMedia("(prefers-reduced-motion: reduce)").matches;

function imgProps(img: HeroImage, alt: string, high: boolean) {
  return getImageProps({ src: img.src, width: img.width, height: img.height, alt, sizes: "100vw", fetchPriority: high ? "high" : undefined }).props;
}

export function CinematicHero({ locale, title, subtitle, config }: { locale: Locale; title: string; subtitle: string; config: HeroConfig }) {
  const d = getDict(locale);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  // Videos are an extra; skip them on data saver and reduced motion (and during SSR).
  const saveData = useSyncExternalStore(noSubscribe, skipVideo, () => true);
  useMotionValueEvent(p, "change", (v) => setActive(v < FOG_AT[0] ? 0 : v < FOG_AT[1] ? 1 : 2));

  const altitude = useTransform(p, [0, 0.33, 0.38, 0.66, 0.72, 1], [1800, 1250, 400, 110, 90, 60]);
  const altitudeText = useTransform(altitude, (v) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v / 10) * 10)} ${locale === "ru" ? "м" : "m"}`);
  const gauge = useTransform(p, [0, 1], ["0%", "100%"]);
  const bars = useTransform(p, [0, 0.06, 0.9, 1], ["0vh", "5vh", "5vh", "0vh"]);
  const introOpacity = useTransform(p, [0, 0.07], [1, 0]);
  const introY = useTransform(p, [0, 0.07], [0, -60]);
  const hintOpacity = useTransform(p, [0, 0.03], [1, 0]);
  const outroOpacity = useTransform(p, [0.9, 0.97], [0, 1]);
  const outroY = useTransform(p, [0.9, 0.97], [40, 0]);

  return (
    <section ref={ref} data-hero className="relative h-[450vh] bg-night" aria-label={title}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {config.chapters.map((c, i) => (
          <Chapter key={c.key} chapter={c} index={i} progress={p} active={active === i} playVideo={!saveData && active === i} alt={d.hero.stages[i].name} />
        ))}

        {FOG_AT.map((at) => (
          <Fog key={at} at={at} progress={p} clouds={config.clouds} />
        ))}

        {/* Lens: vignette, film grain, letterbox */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(5_8_20/0.55))]" />
        <div className="film-grain pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-night/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-night/75 to-transparent" />
        <motion.div className="pointer-events-none absolute inset-x-0 top-0 hidden bg-black landscape:block" style={{ height: bars }} />
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-black landscape:block" style={{ height: bars }} />

        {/* Intro */}
        <motion.div style={{ opacity: introOpacity, y: introY }} className="absolute inset-0 flex flex-col justify-center px-4 sm:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-[0.16em] text-white uppercase backdrop-blur">
                <MapPin className="size-3.5 text-sunset" /> {d.hero.eyebrow}
              </span>
              <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-bold tracking-tight text-white drop-shadow-[0_2px_30px_rgb(5_8_20/0.6)] sm:text-6xl lg:text-7xl">{title}</h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_14px_rgb(5_8_20/0.7)]">{subtitle}</p>
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

        {/* Chapter titles */}
        {CAPTIONS.map(([from, to], i) => (
          <Caption key={i} progress={p} from={from} to={to} index={i} name={d.hero.stages[i].name} note={d.hero.stages[i].note} more={d.common.more} href={`/${locale}/locations/${config.chapters[i].slug}`} />
        ))}

        {/* Altitude gauge */}
        <div className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex lg:right-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase [writing-mode:vertical-rl]">{d.hero.altitude}</span>
          <div className="relative h-48 w-1 rounded-full bg-white/20">
            <motion.div className="absolute inset-x-0 top-0 rounded-full bg-route" style={{ height: gauge }} />
          </div>
          <motion.span className="rounded-full bg-night/60 px-2.5 py-1 font-display text-xs font-semibold text-white tabular-nums backdrop-blur">{altitudeText}</motion.span>
        </div>

        {/* Route: mini map on desktop, three-dot progress on phones */}
        <RouteTracker progress={p} title={d.hero.route} className="absolute right-20 bottom-10 hidden lg:block" />
        <MobileProgress progress={p} labels={d.hero.stages.map((s) => s.name.split(" ·")[0])} />

        {/* Arrival */}
        <motion.div style={{ opacity: outroOpacity, y: outroY }} className="absolute inset-x-0 top-[16%] px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white drop-shadow-[0_2px_24px_rgb(5_8_20/0.8)] sm:text-5xl">{d.hero.arrived}</h2>
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

function Chapter({ chapter, index, progress, active, playVideo, alt }: { chapter: HeroChapter; index: number; progress: MotionValue<number>; active: boolean; playVideo: boolean; alt: string }) {
  const [start, end] = RANGES[index];
  const first = index === 0;
  const last = index === RANGES.length - 1;
  const opacity = useTransform(progress, [start, start + FADE, end - FADE, end], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const { from, to } = chapter.camera;
  const scale = useTransform(progress, [start, end], [from.scale, to.scale]);
  const x = useTransform(progress, [start, end], [`${from.x}%`, `${to.x}%`]);
  const y = useTransform(progress, [start, end], [`${from.y}%`, `${to.y}%`]);
  const wide = imgProps(chapter.wide, alt, first);
  const tall = imgProps(chapter.tall, alt, first);

  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden={!active}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ scale, x, y }}>
        <picture>
          <source media="(orientation: portrait)" srcSet={tall.srcSet} sizes="100vw" />
          <img
            {...wide}
            alt={alt}
            className="h-full w-full object-cover [object-position:var(--focus-wide)] portrait:[object-position:var(--focus-tall)]"
            style={{ "--focus-wide": chapter.focus?.wide ?? "50% 50%", "--focus-tall": chapter.focus?.tall ?? chapter.focus?.wide ?? "50% 50%" } as React.CSSProperties}
          />
        </picture>
        {chapter.video && playVideo && <LoopVideo src={chapter.video.wide} tallSrc={chapter.video.tall} />}
      </motion.div>
      <div className="absolute inset-0" style={{ background: GRADES[index] }} />
    </motion.div>
  );
}

/** Loops a clip with a 1.2 s cross-fade between two copies, so the cut doesn't show. */
function LoopVideo({ src, tallSrc }: { src: string; tallSrc?: string }) {
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);
  const [front, setFront] = useState<"a" | "b">("a");
  const [ready, setReady] = useState(false);
  const url = tallSrc && typeof window !== "undefined" && matchMedia("(orientation: portrait)").matches ? tallSrc : src;

  useEffect(() => {
    const cur = (front === "a" ? a : b).current;
    const next = (front === "a" ? b : a).current;
    if (!cur || !next) return;
    cur.play().catch(() => {});
    const onTime = () => {
      if (cur.duration && cur.currentTime > cur.duration - 1.2 && next.paused) {
        next.currentTime = 0;
        next.play().catch(() => {});
        setFront(front === "a" ? "b" : "a");
      }
    };
    cur.addEventListener("timeupdate", onTime);
    return () => cur.removeEventListener("timeupdate", onTime);
  }, [front]);

  const cls = "absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms]";
  return (
    <>
      <video ref={a} src={url} muted playsInline preload="auto" onCanPlay={() => setReady(true)} className={cn(cls, ready && front === "a" ? "opacity-100" : "opacity-0")} />
      <video ref={b} src={url} muted playsInline preload="auto" className={cn(cls, ready && front === "b" ? "opacity-100" : "opacity-0")} />
    </>
  );
}

function Fog({ at, progress, clouds }: { at: number; progress: MotionValue<number>; clouds?: HeroImage }) {
  const opacity = useTransform(progress, [at - 0.055, at, at + 0.055], [0, 1, 0]);
  const x = useTransform(progress, [at - 0.055, at + 0.055], ["25%", "-25%"]);
  return (
    <motion.div className="pointer-events-none absolute inset-0" style={{ opacity }}>
      <motion.div className="absolute -inset-x-1/4 inset-y-0" style={{ x }}>
        {clouds ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clouds.src} alt="" className="h-full w-full object-cover mix-blend-screen" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(38% 55% at 18% 55%, rgb(255 255 255 / 0.95), transparent 70%), radial-gradient(34% 48% at 48% 42%, rgb(255 255 255 / 0.9), transparent 70%), radial-gradient(40% 60% at 78% 60%, rgb(255 255 255 / 0.95), transparent 72%), radial-gradient(60% 40% at 50% 90%, rgb(240 244 250 / 0.9), transparent 70%)",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function Caption({ progress, from, to, index, name, note, more, href }: { progress: MotionValue<number>; from: number; to: number; index: number; name: string; note: string; more: string; href: string }) {
  const opacity = useTransform(progress, [from, from + 0.04, to - 0.04, to], [0, 1, 1, 0]);
  const y = useTransform(progress, [from, from + 0.05], [30, 0]);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(opacity, "change", (v) => setVisible(v > 0.05));
  return (
    <motion.div style={{ opacity, y }} className={cn("absolute bottom-24 left-4 max-w-[calc(100%-2rem)] sm:bottom-14 sm:left-8 lg:left-12", !visible && "pointer-events-none")}>
      <p className="font-display text-sm font-semibold tracking-[0.3em] text-sunset">0{index + 1}</p>
      <h3 className="mt-2 font-display text-4xl leading-none font-bold text-white drop-shadow-[0_2px_24px_rgb(5_8_20/0.7)] sm:text-6xl">{name}</h3>
      <p className="mt-3 max-w-md text-white/85 drop-shadow-[0_1px_12px_rgb(5_8_20/0.8)]">{note}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-sunset">
        {more} <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}

function MobileProgress({ progress, labels }: { progress: MotionValue<number>; labels: string[] }) {
  const width = useTransform(progress, [0.05, 0.9], ["0%", "100%"]);
  // Shown only between the intro and the arrival screen, so it never overlaps their text.
  const opacity = useTransform(progress, [0.05, 0.08, 0.86, 0.9], [0, 1, 1, 0]);
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-x-4 top-20 lg:hidden">
      <div className="relative h-1 rounded-full bg-white/25">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-route" style={{ width }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold tracking-wider text-white/80 uppercase">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </motion.div>
  );
}
