// Shared Kuala Lumpur illustration pieces, used by the SVG hero and the ambient background.

/** Small deterministic PRNG (mulberry32) so server and client draw the same skyline. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Building = { x: number; w: number; h: number; windows: { x: number; y: number; t: number }[] };

/** A row of random buildings standing on `base`, optionally with lit windows. */
export function skyline({
  seed,
  base,
  width,
  minH,
  maxH,
  minW,
  maxW,
  litRatio = 0,
  skip,
}: {
  seed: number;
  base: number;
  width: number;
  minH: number;
  maxH: number;
  minW: number;
  maxW: number;
  litRatio?: number;
  skip?: [number, number][];
}) {
  const r = rng(seed);
  const out: Building[] = [];
  let x = -20;
  while (x < width + 20) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    if (!skip?.some(([a, b]) => x + w > a && x < b)) {
      const windows: Building["windows"] = [];
      if (litRatio > 0)
        for (let wy = base - h + 14; wy < base - 10; wy += 16)
          for (let wx = x + 7; wx < x + w - 8; wx += 12) if (r() < litRatio) windows.push({ x: wx, y: wy, t: Math.floor(r() * 4) });
      out.push({ x, w, h, windows });
    }
    x += w + 2 + r() * 10;
  }
  return out;
}

// Petronas tier widths and their tops measured up from the base (scale 1).
const TIERS = [
  { w: 92, off: 360 },
  { w: 82, off: 460 },
  { w: 72, off: 530 },
  { w: 60, off: 585 },
  { w: 46, off: 625 },
  { w: 30, off: 655 },
];

/** One Petronas-like stepped tower; 770 units tall at scale 1. */
export function Petronas({ cx, base, scale = 1, fill = "url(#steel)", lines = "#fff6dc", linesOpacity = 0.55, tip = "#e7ecf3" }: { cx: number; base: number; scale?: number; fill?: string; lines?: string; linesOpacity?: number | string; tip?: string }) {
  const tops = TIERS.map((t) => base - t.off * scale);
  return (
    <g>
      {TIERS.map((t, i) => {
        const w = t.w * scale;
        const bottom = i === 0 ? base : tops[i - 1];
        return (
          <g key={i}>
            <rect x={cx - w / 2} y={tops[i]} width={w} height={bottom - tops[i] + 1} fill={fill} />
            {Array.from({ length: Math.floor(t.w / 9) }, (_, k) => (
              <rect key={k} x={cx - w / 2 + (5 + k * 9) * scale} y={tops[i] + 3 * scale} width={1.4 * scale} height={bottom - tops[i] - 6 * scale} fill={lines} opacity={linesOpacity} />
            ))}
          </g>
        );
      })}
      <rect x={cx - 9 * scale} y={base - 680 * scale} width={18 * scale} height={26 * scale} fill={tip} opacity=".9" />
      <circle cx={cx} cy={base - 682 * scale} r={9 * scale} fill={tip} />
      <rect x={cx - 1.6 * scale} y={base - 770 * scale} width={3.2 * scale} height={90 * scale} fill={tip} />
      <circle cx={cx} cy={base - 770 * scale} r={3 * Math.max(scale, 0.8)} fill="#ff5a3c" className="animate-twinkle" />
    </g>
  );
}

/** Skybridge between the two towers (scale 1 matches towers 160 units apart). */
export function Skybridge({ x1, x2, base, scale = 1, fill = "#c9d1df" }: { x1: number; x2: number; base: number; scale?: number; fill?: string }) {
  const y = base - 308 * scale;
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <rect x={x1 + 44 * scale} y={y} width={x2 - x1 - 88 * scale} height={12 * scale} fill={fill} />
      <path d={`M${x1 + 48 * scale} ${y + 12 * scale} L${mid} ${y + 78 * scale} L${x2 - 48 * scale} ${y + 12 * scale}`} fill="none" stroke={fill} strokeWidth={5 * scale} />
    </g>
  );
}

/** Menara KL: shaft, pod and antenna. `base` is the ground, 530 units tall at scale 1. */
export function KlTower({ cx, base, scale = 1, fill = "#3a4682", ring = "#4a579a", pod = "#5664aa", antenna = "#8a96c8", glow = "#ffd38a", glowOpacity = 0.8 }: { cx: number; base: number; scale?: number; fill?: string; ring?: string; pod?: string; antenna?: string; glow?: string; glowOpacity?: number | string }) {
  const s = scale;
  const podY = base - 410 * s;
  return (
    <g>
      <path d={`M${cx - 12 * s} ${base} L${cx - 4 * s} ${podY} L${cx + 4 * s} ${podY} L${cx + 12 * s} ${base}Z`} fill={fill} />
      <ellipse cx={cx} cy={podY} rx={34 * s} ry={12 * s} fill={ring} />
      <rect x={cx - 30 * s} y={podY - 30 * s} width={60 * s} height={30 * s} rx={12 * s} fill={pod} />
      <rect x={cx - 26 * s} y={podY - 20 * s} width={52 * s} height={5 * s} fill={glow} opacity={glowOpacity} />
      <ellipse cx={cx} cy={podY - 30 * s} rx={28 * s} ry={8 * s} fill={ring} />
      <rect x={cx - 1.5 * s} y={podY - 120 * s} width={3 * s} height={90 * s} fill={antenna} />
      <circle cx={cx} cy={podY - 120 * s} r={3 * Math.max(s, 0.8)} fill="#ff5a3c" className="animate-twinkle" />
    </g>
  );
}

/** Merdeka 118 with its faceted spire, 760 units tall at scale 1. */
export function Merdeka118({ cx, base, scale = 1, fill = "#33407a", shade = "#26305f" }: { cx: number; base: number; scale?: number; fill?: string; shade?: string }) {
  const s = scale;
  return (
    <g>
      <path d={`M${cx - 50 * s} ${base} L${cx - 36 * s} ${base - 530 * s} L${cx - 12 * s} ${base - 600 * s} L${cx} ${base - 760 * s} L${cx + 12 * s} ${base - 600 * s} L${cx + 36 * s} ${base - 530 * s} L${cx + 50 * s} ${base}Z`} fill={fill} />
      <path d={`M${cx} ${base - 760 * s} L${cx + 12 * s} ${base - 600 * s} L${cx + 36 * s} ${base - 530 * s} L${cx + 50 * s} ${base} L${cx} ${base}Z`} fill={shade} />
    </g>
  );
}

/** A cable car cabin hanging below its grip point (0,0). */
export function Gondola({ body = "#d6452b", window = "#bcd8e3", outline = "#3b4a44", scale = 1, windowOpacity }: { body?: string; window?: string; outline?: string; scale?: number; windowOpacity?: number | string }) {
  const s = scale;
  return (
    <g>
      <line x1="0" y1="0" x2="0" y2={14 * s} stroke={outline} strokeWidth={2 * s} />
      <rect x={-13 * s} y={14 * s} width={26 * s} height={22 * s} rx={6 * s} fill={body} stroke={outline} strokeWidth={1.5 * s} />
      <rect x={-9 * s} y={19 * s} width={18 * s} height={8 * s} rx={2 * s} fill={window} opacity={windowOpacity} />
    </g>
  );
}
