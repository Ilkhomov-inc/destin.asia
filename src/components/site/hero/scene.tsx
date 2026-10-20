// The tall illustrated scene the hero camera travels down:
// Genting Highlands (0–1100) → jungle & Batu Caves (1100–2050) → Kuala Lumpur at night (2050–3200).
import { Gondola, KlTower, Merdeka118, Petronas, rng, skyline, Skybridge } from "../art/kl";

export const SCENE_W = 1440;
export const SCENE_H = 3200;

/** The trail drawn as you scroll. Keep y monotonic so the camera can follow it. */
export const ROUTE =
  "M1085 540 C 960 600, 560 560, 395 640 C 260 710, 170 860, 230 1010 C 290 1160, 520 1250, 600 1400 C 680 1550, 900 1640, 985 1830 C 1040 1960, 700 2030, 560 2140 C 420 2250, 760 2330, 900 2430 C 1020 2520, 760 2640, 722 2760 C 700 2840, 720 2930, 722 2985";

export const PINS = [
  { key: "genting", x: 1085, y: 540, slug: "genting-highlands" },
  { key: "chinswee", x: 395, y: 640, slug: "genting-highlands" },
  { key: "batu", x: 985, y: 1830, slug: "batu-caves" },
  { key: "klcc", x: 722, y: 2985, slug: "klcc" },
] as const;

const FAR = skyline({ seed: 7, base: 2990, width: SCENE_W, minH: 160, maxH: 420, minW: 40, maxW: 90 });
const MID = skyline({ seed: 19, base: 3060, width: SCENE_W, minH: 120, maxH: 360, minW: 46, maxW: 96, litRatio: 0.22, skip: [[600, 850]] });
const STARS = (() => {
  const r = rng(3);
  return Array.from({ length: 90 }, () => ({ x: r() * SCENE_W, y: 2080 + r() * 640, s: 0.6 + r() * 1.6, t: Math.floor(r() * 4) }));
})();
const CANOPY = (() => {
  const r = rng(11);
  return Array.from({ length: 70 }, (_, i) => ({ x: (i / 70) * SCENE_W + r() * 30, y: 1170 + r() * 60, r: 28 + r() * 34 }));
})();
const JUNGLE = (() => {
  const r = rng(23);
  return Array.from({ length: 60 }, (_, i) => ({ x: (i / 60) * 760 + r() * 30, y: 1700 + r() * 140 + (i / 60) * 120, r: 30 + r() * 40 }));
})();

function Pagoda({ x, y }: { x: number; y: number }) {
  // Nine tiers, base at y.
  const tiers = Array.from({ length: 9 }, (_, i) => {
    const w = 64 - i * 5.2;
    const h = 15;
    return { w, ty: y - (i + 1) * h };
  });
  return (
    <g>
      <rect x={x - 40} y={y - 6} width="80" height="10" fill="#efe6d6" />
      {tiers.map((t, i) => (
        <g key={i}>
          <rect x={x - t.w / 2 + 6} y={t.ty + 4} width={t.w - 12} height="11" fill="#f5efe4" />
          <path d={`M${x - t.w / 2 - 6} ${t.ty + 6} Q${x} ${t.ty - 2} ${x + t.w / 2 + 6} ${t.ty + 6} L${x + t.w / 2 - 2} ${t.ty + 3} L${x - t.w / 2 + 2} ${t.ty + 3} Z`} fill="#c8432b" />
          <rect x={x - 2} y={t.ty + 7} width="4" height="6" fill="#e3b23c" opacity=".8" />
        </g>
      ))}
      <path d={`M${x} ${y - 9 * 15 - 30} L${x - 4} ${y - 9 * 15} L${x + 4} ${y - 9 * 15} Z`} fill="#e3b23c" />
    </g>
  );
}

export function DescentScene() {
  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} width="100%" height="100%" preserveAspectRatio="xMidYMin slice" aria-hidden className="block">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6b98c" />
          <stop offset=".08" stopColor="#fbdcb8" />
          <stop offset=".2" stopColor="#e6ecdf" />
          <stop offset=".36" stopColor="#cfe3df" />
          <stop offset=".55" stopColor="#bfd9d2" />
          <stop offset=".63" stopColor="#f3b07a" />
          <stop offset=".68" stopColor="#c76a6a" />
          <stop offset=".74" stopColor="#4a3a6e" />
          <stop offset=".84" stopColor="#1c2350" />
          <stop offset="1" stopColor="#0a1229" />
        </linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7b88a6" />
          <stop offset=".45" stopColor="#d9dfea" />
          <stop offset="1" stopColor="#6a7593" />
        </linearGradient>
        <linearGradient id="lime" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7d0bf" />
          <stop offset="1" stopColor="#9d968a" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b8861f" />
          <stop offset=".5" stopColor="#ffd56a" />
          <stop offset="1" stopColor="#c08c22" />
        </linearGradient>
        <radialGradient id="sun">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset=".35" stopColor="#ffd8a0" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffb07a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cityglow" cx=".5" cy="1" r=".8">
          <stop offset="0" stopColor="#f29f4b" stopOpacity=".55" />
          <stop offset="1" stopColor="#f29f4b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width={SCENE_W} height={SCENE_H} fill="url(#sky)" />

      {/* ── Genting Highlands ── */}
      <circle cx="1120" cy="300" r="260" fill="url(#sun)" />
      <circle cx="1120" cy="300" r="62" fill="#fff1d2" />
      <g className="anim-drift" opacity=".9">
        <ellipse cx="300" cy="250" rx="180" ry="26" fill="#fff" opacity=".7" />
        <ellipse cx="380" cy="232" rx="110" ry="22" fill="#fff" opacity=".8" />
        <ellipse cx="900" cy="410" rx="220" ry="22" fill="#fff" opacity=".55" />
      </g>
      <g className="anim-drift-slow" opacity=".8">
        <ellipse cx="1250" cy="200" rx="150" ry="20" fill="#fff" opacity=".7" />
        <ellipse cx="620" cy="340" rx="160" ry="18" fill="#fff" opacity=".6" />
      </g>

      <path d="M0 620 L120 560 L240 590 L380 500 L520 560 L640 520 L780 590 L920 470 L1060 520 L1200 455 L1320 520 L1440 480 V900 H0Z" fill="#a9bcb6" />
      {/* Resort on the summit */}
      <g>
        {[
          [1010, 470, 34, 70, "#f1e7d7"],
          [1048, 440, 46, 100, "#e7d4bb"],
          [1098, 455, 30, 85, "#f4b860"],
          [1130, 470, 40, 70, "#8fb7d8"],
          [1172, 485, 26, 55, "#e98f74"],
        ].map(([x, y, w, h, c], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} />
            {Array.from({ length: Math.floor((h as number) / 10) }, (_, k) => (
              <rect key={k} x={(x as number) + 4} y={(y as number) + 5 + k * 10} width={(w as number) - 8} height="2" fill="#fff" opacity=".55" />
            ))}
          </g>
        ))}
      </g>
      <path d="M0 720 C120 650 220 690 300 640 C340 615 380 600 395 600 C410 600 450 625 500 650 C600 700 700 640 800 690 C900 740 1000 600 1100 560 C1200 610 1300 640 1440 600 V1000 H0Z" fill="#7da190" />
      <Pagoda x={395} y={606} />
      {/* Awana Skyway cable car */}
      <path id="cable" d="M1085 560 Q 640 820 150 1230" fill="none" stroke="#3b4a44" strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <g>
            <Gondola body={i % 2 ? "#d6452b" : "#f5efe4"} />
            <animateMotion dur="26s" repeatCount="indefinite" begin={`${-i * 5.2}s`} keyPoints="0;1" keyTimes="0;1" calcMode="linear">
              <mpath href="#cable" />
            </animateMotion>
          </g>
        </g>
      ))}
      <rect y="760" width={SCENE_W} height="120" fill="url(#mist)" />
      <path d="M0 860 C150 800 300 840 420 800 C560 760 700 830 860 790 C1000 760 1150 820 1300 780 C1360 770 1400 775 1440 770 V1260 H0Z" fill="#4e8068" />
      <rect y="940" width={SCENE_W} height="140" fill="url(#mist)" opacity=".8" />

      {/* ── Jungle ── */}
      <path d="M0 1080 C200 1020 360 1080 520 1050 C700 1010 860 1090 1040 1050 C1200 1020 1320 1060 1440 1040 V1500 H0Z" fill="#2f6a50" />
      {CANOPY.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={i % 3 ? "#2a5f47" : "#357556"} />
      ))}
      <rect y="1200" width={SCENE_W} height="700" fill="#24543f" />

      {/* Batu Caves limestone hill */}
      <path d="M640 1900 C660 1700 700 1580 760 1500 C800 1440 820 1380 880 1360 C930 1340 960 1300 1010 1310 C1080 1320 1110 1290 1170 1330 C1240 1370 1280 1440 1320 1520 C1370 1620 1410 1760 1440 1900 Z" fill="url(#lime)" />
      <path d="M820 1420 C840 1500 830 1600 860 1700 M1180 1380 C1170 1480 1200 1560 1190 1680 M1260 1470 C1280 1560 1300 1640 1290 1760 M940 1360 C950 1420 930 1470 950 1520" stroke="#7d776c" strokeWidth="5" fill="none" opacity=".35" strokeLinecap="round" />
      <ellipse cx="1080" cy="1555" rx="70" ry="48" fill="#3b3631" />
      <ellipse cx="1080" cy="1565" rx="48" ry="34" fill="#1f1c19" />
      {/* Rainbow stairs */}
      {Array.from({ length: 24 }, (_, i) => {
        const colors = ["#e84c3d", "#f39c12", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db", "#9b59b6", "#e84393"];
        const t0 = i / 24;
        const t1 = (i + 1) / 24;
        const y0 = 1860 - t0 * 270;
        const y1 = 1860 - t1 * 270;
        const w0 = 78 - t0 * 46;
        const w1 = 78 - t1 * 46;
        const x0 = 1010 + t0 * 70;
        const x1 = 1010 + t1 * 70;
        return <path key={i} d={`M${x0 - w0 / 2} ${y0} L${x0 + w0 / 2} ${y0} L${x1 + w1 / 2} ${y1} L${x1 - w1 / 2} ${y1}Z`} fill={colors[i % 8]} />;
      })}
      {/* Golden Murugan statue */}
      <g transform="translate(870 1660)">
        <rect x="-46" y="190" width="92" height="20" fill="#c9c1ae" />
        <path d="M-34 190 L-26 90 C-24 70 -14 62 0 62 C14 62 24 70 26 90 L34 190 Z" fill="url(#gold)" />
        <path d="M-26 92 C-44 110 -48 140 -40 160 L-30 158 C-34 140 -30 120 -20 108Z" fill="url(#gold)" />
        <path d="M26 92 C40 104 46 120 46 136 L38 138 C36 124 30 112 20 106Z" fill="url(#gold)" />
        <circle cx="0" cy="46" r="17" fill="url(#gold)" />
        <path d="M-14 34 L0 6 L14 34Z" fill="url(#gold)" />
        <line x1="52" y1="10" x2="40" y2="190" stroke="#e3b23c" strokeWidth="4" />
        <path d="M52 10 l-8 -22 l18 10Z" fill="#ffd56a" />
      </g>
      {JUNGLE.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={i % 2 ? "#1d4836" : "#245a42"} />
      ))}
      <path d="M0 1900 H1440 V2060 C1200 2000 900 2040 700 2020 C450 1995 200 2040 0 2010Z" fill="#1d4836" />

      {/* ── Kuala Lumpur ── */}
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" className={s.t === 0 ? "animate-twinkle" : undefined} opacity={0.4 + (s.t / 4) * 0.6} />
      ))}
      <ellipse cx="720" cy="3000" rx="900" ry="420" fill="url(#cityglow)" />
      {/* Merdeka 118 */}
      <Merdeka118 cx={1130} base={3000} />
      {/* KL Tower */}
      <KlTower cx={330} base={3000} />
      {FAR.map((b, i) => (
        <rect key={i} x={b.x} y={2990 - b.h} width={b.w} height={b.h + 10} fill="#2b3266" opacity=".85" />
      ))}
      {/* Light trails on the highway */}
      <path d="M-40 2300 C300 2240 600 2330 900 2290 C1150 2260 1300 2300 1480 2280" fill="none" stroke="#11182f" strokeWidth="26" />
      <path d="M-40 2296 C300 2236 600 2326 900 2286 C1150 2256 1300 2296 1480 2276" fill="none" stroke="#ff6b4a" strokeWidth="3" strokeDasharray="30 50" className="anim-dash" />
      <path d="M-40 2305 C300 2245 600 2335 900 2295 C1150 2265 1300 2305 1480 2285" fill="none" stroke="#fff3c4" strokeWidth="3" strokeDasharray="22 60" className="anim-dash-rev" />
      <Petronas cx={642} base={3060} />
      <Petronas cx={802} base={3060} />
      <Skybridge x1={642} x2={802} base={3060} />
      {MID.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={3060 - b.h} width={b.w} height={b.h + 10} fill="#171d42" />
          {b.windows.map((w, k) => (
            <rect key={k} x={w.x} y={w.y} width="5" height="8" fill="#ffd38a" opacity={0.55 + w.t * 0.12} className={w.t === 0 ? "animate-twinkle" : undefined} />
          ))}
        </g>
      ))}
      {/* KLCC park and lake */}
      <rect y="3055" width={SCENE_W} height="145" fill="#0b1228" />
      <ellipse cx="722" cy="3120" rx="260" ry="34" fill="#16244c" />
      <path d="M560 3118 h320 M600 3132 h240 M640 3104 h170" stroke="#f29f4b" strokeWidth="2" opacity=".5" strokeDasharray="14 10" />
      {Array.from({ length: 22 }, (_, i) => (
        <circle key={i} cx={i * 68 + (i % 2) * 20} cy={3070 + (i % 3) * 6} r={22 + (i % 4) * 6} fill="#0f1a36" />
      ))}
    </svg>
  );
}
