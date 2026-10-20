// Raster map tiles in Web Mercator. CARTO basemaps need a (free) key — without one
// CARTO serves an "API KEY REQUIRED" placeholder, so we fall back to OpenStreetMap tiles.
export const TILE_SIZE = 256;
export type TileStyle = "light" | "voyager" | "dark";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY;
const CARTO_PATH: Record<TileStyle, string> = { light: "light_all", voyager: "rastertiles/voyager", dark: "dark_all" };

export const usingCarto = Boolean(CARTO_KEY);

/** `osm` forces OpenStreetMap tiles even when a CARTO key is configured. */
export function tileUrl(style: TileStyle, x: number, y: number, z: number, osm = false) {
  const n = 2 ** z;
  const wx = ((x % n) + n) % n;
  if (CARTO_KEY && !osm) {
    const sub = "abcd"[(wx + y) % 4];
    return `https://${sub}.basemaps.cartocdn.com/${CARTO_PATH[style]}/${z}/${wx}/${y}@2x.png?key=${CARTO_KEY}`;
  }
  return `https://tile.openstreetmap.org/${z}/${wx}/${y}.png`;
}

/** OSM's default style is loud; tone it towards the site palette (CARTO tiles are used as-is). */
export function tileFilter(style: TileStyle, osm = false) {
  if (CARTO_KEY && !osm) return undefined;
  return style === "dark"
    ? "invert(1) hue-rotate(180deg) brightness(0.82) contrast(0.92) saturate(0.45)"
    : "saturate(0.72) sepia(0.14) contrast(0.96) brightness(1.03)";
}

export const attribution = {
  text: CARTO_KEY ? "© OpenStreetMap contributors, © CARTO" : "© OpenStreetMap contributors",
  href: "https://www.openstreetmap.org/copyright",
};

/** World pixel coordinates at zoom 0 (0…256). Multiply by 2^z for any zoom. */
export function worldPoint(lat: number, lng: number) {
  const s = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * TILE_SIZE,
    y: (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE_SIZE,
  };
}

export function latLngToTile(lat: number, lng: number, zoom: number) {
  const p = worldPoint(lat, lng);
  const k = 2 ** zoom;
  return { x: Math.floor((p.x * k) / TILE_SIZE), y: Math.floor((p.y * k) / TILE_SIZE) };
}

export type View = { center: { x: number; y: number }; zoom: number };

/** Fractional zoom + centre that fit all points into a width×height box. */
export function fitView(points: { lat: number; lng: number }[], width: number, height: number, padding = 48, maxZoom = 15): View {
  const w = points.map((p) => worldPoint(p.lat, p.lng));
  const minX = Math.min(...w.map((p) => p.x));
  const maxX = Math.max(...w.map((p) => p.x));
  const minY = Math.min(...w.map((p) => p.y));
  const maxY = Math.max(...w.map((p) => p.y));
  const dx = Math.max(maxX - minX, 1e-6);
  const dy = Math.max(maxY - minY, 1e-6);
  const zoom = Math.min(maxZoom, Math.log2(Math.min((width - padding * 2) / dx, (height - padding * 2) / dy)));
  return { center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, zoom };
}

/** Screen position of a lat/lng inside a width×height viewport showing `view`. */
export function toScreen(lat: number, lng: number, view: View, width: number, height: number) {
  const p = worldPoint(lat, lng);
  const k = 2 ** view.zoom;
  return { x: (p.x - view.center.x) * k + width / 2, y: (p.y - view.center.y) * k + height / 2 };
}

/** Tiles (at an integer zoom, drawn scaled) needed to cover the viewport. */
export function visibleTiles(view: View, width: number, height: number) {
  const z = Math.max(0, Math.floor(view.zoom));
  const scale = 2 ** (view.zoom - z);
  const size = TILE_SIZE * scale;
  const cx = view.center.x * 2 ** z;
  const cy = view.center.y * 2 ** z;
  const x0 = Math.floor((cx - width / 2 / scale) / TILE_SIZE);
  const x1 = Math.floor((cx + width / 2 / scale) / TILE_SIZE);
  const y0 = Math.max(0, Math.floor((cy - height / 2 / scale) / TILE_SIZE));
  const y1 = Math.min(2 ** z - 1, Math.floor((cy + height / 2 / scale) / TILE_SIZE));
  const tiles: { x: number; y: number; z: number; left: number; top: number; size: number }[] = [];
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      tiles.push({ x: tx, y: ty, z, left: (tx * TILE_SIZE - cx) * scale + width / 2, top: (ty * TILE_SIZE - cy) * scale + height / 2, size });
  return tiles;
}

/** Push overlapping screen points apart so every marker stays clickable. */
export function spread<T extends { x: number; y: number }>(pts: T[], min: number, iterations = 80) {
  const p = pts.map((x) => ({ ...x }));
  for (let it = 0; it < iterations; it++)
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
  return p;
}

/** Distance in km between two coordinates (haversine). */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
