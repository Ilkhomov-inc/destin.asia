// "Fisheye" projection centred on KLCC: distance is square-root scaled so that
// city-centre spots and day trips (Genting, Melaka) fit on one readable map.
export const VIEWBOX = { x: 110, y: 80, w: 580, h: 520 };
export const MAP_W = 800;
export const MAP_H = 680;
const CENTER = { lat: 3.1579, lng: 101.7116 };
const ORIGIN = { x: 360, y: 290 };
const K = 27;

export function project(lat: number, lng: number) {
  const dy = (lat - CENTER.lat) * 111;
  const dx = (lng - CENTER.lng) * 111 * Math.cos((CENTER.lat * Math.PI) / 180);
  const d = Math.hypot(dx, dy);
  if (d === 0) return { ...ORIGIN };
  const r = K * Math.sqrt(d);
  return { x: ORIGIN.x + (dx / d) * r, y: ORIGIN.y - (dy / d) * r };
}

/** Push overlapping pins apart so every one stays clickable. */
export function spread<T extends { x: number; y: number }>(pts: T[], min = 30, iterations = 60) {
  const p = pts.map((x) => ({ ...x }));
  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < p.length; i++)
      for (let j = i + 1; j < p.length; j++) {
        let dx = p[j].x - p[i].x;
        let dy = p[j].y - p[i].y;
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d === 0) {
          dx = Math.cos(i + j);
          dy = Math.sin(i + j);
          d = 1;
        }
        const push = (min - d) / 2;
        p[i].x -= (dx / d) * push;
        p[i].y -= (dy / d) * push;
        p[j].x += (dx / d) * push;
        p[j].y += (dy / d) * push;
      }
  }
  return p;
}

/** Closed, slightly wobbly ring for contour lines. */
export function contour(cx: number, cy: number, r: number, squash = 1, rot = 0, seed = 1) {
  const n = 48;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble = 1 + 0.08 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2.3) + 0.03 * Math.sin(a * 7 + seed * 0.7);
    const x0 = Math.cos(a) * r * wobble;
    const y0 = Math.sin(a) * r * wobble * squash;
    const x = cx + x0 * Math.cos(rot) - y0 * Math.sin(rot);
    const y = cy + x0 * Math.sin(rot) + y0 * Math.cos(rot);
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join("") + "Z";
}

const COAST: [number, number][] = [
  [3.75, 100.95],
  [3.34, 101.25],
  [3.0, 101.39],
  [2.75, 101.44],
  [2.52, 101.8],
  [2.3, 102.05],
  [2.19, 102.24],
  [2.05, 102.6],
];

export function coastPath() {
  const pts = COAST.map(([la, ln]) => project(la, ln));
  let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    d += ` Q${p.x.toFixed(1)} ${p.y.toFixed(1)} ${((p.x + c.x) / 2).toFixed(1)} ${((p.y + c.y) / 2).toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return { line: d + ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`, sea: d + ` L${last.x.toFixed(1)} ${last.y.toFixed(1)} L${MAP_W + 200} ${MAP_H + 200} L-200 ${MAP_H + 200} L-200 -200 Z` };
}
