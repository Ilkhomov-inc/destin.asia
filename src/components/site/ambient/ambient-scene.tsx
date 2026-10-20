"use client";
import { usePathname } from "next/navigation";
import { memo, useEffect, useRef } from "react";
import { Gondola, KlTower, Merdeka118, Petronas, rng, Skybridge, skyline } from "../art/kl";
import { klPhase, phaseAt, skyFrame, type SkyState } from "./sky";

// A fixed, slowly living Kuala Lumpur behind the page: it shows through <SceneWindow> gaps.
// viewBox is anchored to the bottom so the skyline stays on screen at any aspect ratio.
const W = 1600;
const H = 900;
const BASE = 900;

const FAR = skyline({ seed: 41, base: BASE - 40, width: W, minH: 110, maxH: 300, minW: 36, maxW: 84, skip: [[650, 910]] });
const NEAR = skyline({ seed: 87, base: BASE, width: W, minH: 70, maxH: 230, minW: 44, maxW: 96, litRatio: 0.2, skip: [[660, 900]] });
const STARS = (() => {
  const r = rng(5);
  return Array.from({ length: 110 }, () => ({ x: r() * W, y: r() * 470, s: 0.5 + r() * 1.5, t: Math.floor(r() * 5) }));
})();
const TREES = (() => {
  const r = rng(13);
  return Array.from({ length: 34 }, (_, i) => ({ x: (i / 34) * W + r() * 30, y: BASE - 6 + r() * 10, r: 16 + r() * 22 }));
})();
const RESORT: [number, number, number][] = [
  [1188, 468, 18],
  [1208, 452, 26],
  [1236, 460, 16],
  [1254, 470, 20],
];

// Two parallel lines of the cable car, from the Genting summit down behind the city.
const CABLE_DOWN = "M1218 486 L292 708";
const CABLE_UP = "M300 716 L1226 494";
const ALL_LIGHTS = "#ffd38a";

const v = (name: string) => `var(--${name})`;

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="120" ry="20" />
      <ellipse cx="-40" cy="-14" rx="56" ry="22" />
      <ellipse cx="30" cy="-20" rx="64" ry="28" />
      <ellipse cx="80" cy="-6" rx="46" ry="16" />
    </g>
  );
}

const Scene = memo(function Scene({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
      <defs>
        <linearGradient id="amb-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060b1f" />
          <stop offset=".55" stopColor="#121b43" />
          <stop offset="1" stopColor="#2a3467" />
        </linearGradient>
        <linearGradient id="amb-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7e86b8" />
          <stop offset=".45" stopColor="#f0a88e" />
          <stop offset="1" stopColor="#fde4c6" />
        </linearGradient>
        <linearGradient id="amb-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6ea6cf" />
          <stop offset=".55" stopColor="#a9d0e4" />
          <stop offset="1" stopColor="#e6f0ec" />
        </linearGradient>
        <linearGradient id="amb-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#222b62" />
          <stop offset=".5" stopColor="#9b4f7b" />
          <stop offset="1" stopColor="#f39658" />
        </linearGradient>
        <radialGradient id="amb-sun">
          <stop offset="0" stopColor="#fff6dd" />
          <stop offset=".3" stopColor="#ffd9a0" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffb07a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="amb-glow" cx=".5" cy="1" r=".7">
          <stop offset="0" stopColor="#f29f4b" stopOpacity=".5" />
          <stop offset="1" stopColor="#f29f4b" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky: night underneath, the other times of day fade over it */}
      <rect width={W} height={H} fill="url(#amb-night)" />
      <rect width={W} height={H} fill="url(#amb-dusk)" style={{ opacity: v("dusk") }} />
      <rect width={W} height={H} fill="url(#amb-dawn)" style={{ opacity: v("dawn") }} />
      <rect width={W} height={H} fill="url(#amb-day)" style={{ opacity: v("day") }} />

      <g style={{ opacity: v("night") }}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={0.35 + s.t * 0.15} className={s.t === 0 ? "animate-twinkle" : undefined} />
        ))}
      </g>
      <g style={{ transform: `translate(calc(${v("moon-x")} * 1px), calc(${v("moon-y")} * 1px))`, opacity: v("moon-o") }}>
        <circle r="70" fill="#dfe6ff" opacity=".12" />
        <circle r="24" fill="#f3f0e4" />
        <circle cx="9" cy="-6" r="20" fill="#121b43" opacity=".18" />
      </g>
      <g style={{ transform: `translate(calc(${v("sun-x")} * 1px), calc(${v("sun-y")} * 1px))`, opacity: v("sun-o") }}>
        <circle r="190" fill="url(#amb-sun)" />
        <circle r="38" fill="#fff2d2" />
      </g>

      <g style={{ fill: v("cloud") }} opacity=".8">
        <g className="amb-drift" style={{ animationDuration: "210s", animationDelay: "-40s" }}>
          <Cloud x={0} y={190} s={1.2} />
        </g>
        <g className="amb-drift" style={{ animationDuration: "260s", animationDelay: "-150s" }}>
          <Cloud x={0} y={300} s={0.8} />
        </g>
        <g className="amb-drift" style={{ animationDuration: "180s", animationDelay: "-95s" }}>
          <Cloud x={0} y={120} s={0.6} />
        </g>
      </g>

      {/* Titiwangsa range with Genting on the right */}
      <path d="M0 640 C120 600 240 620 360 586 C470 556 560 590 660 566 C760 544 860 572 960 540 C1060 508 1130 520 1188 478 C1210 462 1240 458 1262 474 C1330 520 1420 520 1600 540 V900 H0Z" style={{ fill: v("ridge-far") }} />
      {RESORT.map(([x, y, w]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={490 - y} style={{ fill: v("bld-far") }} />
          <rect x={x + 3} y={y + 5} width={w - 6} height="2.5" fill={ALL_LIGHTS} style={{ opacity: v("lights") }} />
          <rect x={x + 3} y={y + 13} width={w - 6} height="2.5" fill={ALL_LIGHTS} style={{ opacity: v("lights") }} />
        </g>
      ))}

      {/* Awana Skyway: pylons, two cables, cabins going down and up */}
      {[0.32, 0.62].map((t) => {
        const x = 1218 - t * 926;
        const y = 486 + t * 222;
        return <path key={t} d={`M${x - 7} ${y + 70} L${x} ${y - 4} L${x + 7} ${y + 70}`} fill="none" strokeWidth="2.2" style={{ stroke: v("cable") }} />;
      })}
      <path id="amb-cable-down" d={CABLE_DOWN} fill="none" strokeWidth="1.6" style={{ stroke: v("cable") }} />
      <path id="amb-cable-up" d={CABLE_UP} fill="none" strokeWidth="1.6" style={{ stroke: v("cable") }} />
      {[0, 1, 2].map((i) => (
        <g key={`d${i}`}>
          <Gondola scale={0.72} body={i % 2 ? "#d6452b" : "#f1ebe0"} window={v("gwin")} />
          <animateMotion dur="96s" repeatCount="indefinite" begin={`${-i * 32}s`} keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#amb-cable-down" />
          </animateMotion>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={`u${i}`}>
          <Gondola scale={0.72} body={i % 2 ? "#f1ebe0" : "#d6452b"} window={v("gwin")} />
          <animateMotion dur="96s" repeatCount="indefinite" begin={`${-i * 32 - 16}s`} keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#amb-cable-up" />
          </animateMotion>
        </g>
      ))}

      <path d="M0 720 C160 690 300 706 450 684 C600 662 760 690 920 668 C1080 646 1240 676 1400 660 C1480 652 1540 656 1600 650 V900 H0Z" style={{ fill: v("ridge-near") }} />

      {/* Kuala Lumpur */}
      <ellipse cx="780" cy="900" rx="900" ry="380" fill="url(#amb-glow)" style={{ opacity: v("lights") }} />
      {FAR.map((b, i) => (
        <rect key={i} x={b.x} y={BASE - 40 - b.h} width={b.w} height={b.h + 40} style={{ fill: v("bld-far") }} />
      ))}
      <KlTower cx={470} base={BASE} scale={0.78} fill={v("bld-far")} ring={v("bld-near")} pod={v("bld-near")} antenna={v("bld-far")} glow={ALL_LIGHTS} glowOpacity={v("lights")} />
      <Merdeka118 cx={1070} base={BASE} scale={0.66} fill={v("bld-far")} shade={v("bld-near")} />
      <Petronas cx={712} base={BASE} scale={0.6} fill={v("tower")} lines={ALL_LIGHTS} linesOpacity={v("lights")} tip={v("tower")} />
      <Petronas cx={808} base={BASE} scale={0.6} fill={v("tower")} lines={ALL_LIGHTS} linesOpacity={v("lights")} tip={v("tower")} />
      <Skybridge x1={712} x2={808} base={BASE} scale={0.6} fill={v("tower")} />
      {NEAR.map((b, i) => (
        <rect key={i} x={b.x} y={BASE - b.h} width={b.w} height={b.h} style={{ fill: v("bld-near") }} />
      ))}
      <g fill={ALL_LIGHTS} style={{ opacity: v("lights") }}>
        {NEAR.flatMap((b, i) => b.windows.map((w, k) => <rect key={`${i}-${k}`} x={w.x} y={w.y} width="4" height="7" opacity={0.5 + w.t * 0.14} className={w.t === 0 ? "animate-twinkle" : undefined} />))}
      </g>
      {TREES.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={t.r} style={{ fill: v("trees") }} />
      ))}
    </svg>
  );
});

export function AmbientScene() {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = Date.now();
    const sky: SkyState = window.__sky ?? { t0: now, p0: klPhase(now), speed: reduce ? 0 : 1 };
    window.__sky = sky;
    const paint = () => {
      const f = skyFrame(phaseAt(sky, Date.now()));
      for (const k in f) el.style.setProperty(`--${k}`, f[k]);
    };
    paint();

    // Only animate while some window onto the scene is on screen.
    const shown = new Set<Element>();
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 66) return;
      last = t;
      paint();
    };
    const update = () => {
      const run = shown.size > 0 && !reduce;
      el.toggleAttribute("data-paused", !run);
      cancelAnimationFrame(raf);
      if (run) {
        svg.current?.unpauseAnimations();
        if (sky.speed > 0) raf = requestAnimationFrame(tick);
      } else svg.current?.pauseAnimations();
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) shown.add(e.target);
        else shown.delete(e.target);
      }
      update();
    });
    document.querySelectorAll("[data-scene-window]").forEach((n) => io.observe(n));
    update();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <div id="ambient" ref={root} aria-hidden className="ambient pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Scene svgRef={svg} />
    </div>
  );
}
