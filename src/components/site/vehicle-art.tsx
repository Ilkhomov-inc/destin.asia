import type { VehicleClass } from "@/lib/types";

// Flat side-view illustrations used until real vehicle photos are uploaded.
const SPECS: Record<VehicleClass, { body: string; windows: string[]; wheels: number[]; color: string; w: number }> = {
  sedan: {
    w: 280,
    color: "#d6452b",
    body: "M18 96c0-12 6-18 22-20l34-4 30-22c6-4 12-6 20-6h56c10 0 16 2 24 8l26 20 34 4c10 1 14 6 14 14v8c0 4-3 6-6 6H24c-4 0-6-2-6-6Z",
    windows: ["M110 52h28v20H86l18-16c2-2 4-4 6-4Z", "M146 52h30c6 0 10 2 14 6l14 14h-58Z"],
    wheels: [70, 214],
  },
  mpv: {
    w: 280,
    color: "#1d6a4c",
    body: "M16 98V78c0-8 4-12 12-14l28-4 28-24c6-5 12-6 20-6h96c10 0 16 4 20 12l14 24 18 4c8 2 12 6 12 14v14c0 4-3 6-6 6H22c-4 0-6-2-6-6Z",
    windows: ["M98 40h34v24H72l20-18c2-4 4-6 6-6Z", "M140 40h40v24h-40Z", "M188 40h12c6 0 9 3 12 8l8 16h-32Z"],
    wheels: [68, 212],
  },
  premium: {
    w: 280,
    color: "#13201a",
    body: "M14 98V70c0-10 4-14 14-16l26-4 24-22c6-6 14-8 24-8h110c12 0 18 4 22 14l10 30 14 4c8 2 12 6 12 14v16c0 4-3 6-6 6H20c-4 0-6-2-6-6Z",
    windows: ["M92 30h38v26H66l20-20c2-4 4-6 6-6Z", "M138 30h44v26h-44Z", "M190 30h20c6 0 9 3 10 8l6 18h-36Z"],
    wheels: [66, 214],
  },
  van: {
    w: 280,
    color: "#e3b23c",
    body: "M10 98V44c0-12 6-20 20-22l26-2h184c12 0 18 6 20 18l8 36 4 4v20c0 4-3 6-6 6H16c-4 0-6-2-6-6Z",
    windows: ["M30 30h32v26H26V38c0-6 2-8 4-8Z", "M70 30h44v26H70Z", "M122 30h44v26h-44Z", "M174 30h44v26h-44Z", "M226 30h16c4 0 6 2 7 6l6 20h-29Z"],
    wheels: [62, 222],
  },
  bus: {
    w: 280,
    color: "#17264d",
    body: "M8 98V30c0-10 6-16 16-16h232c10 0 16 6 16 16v68c0 4-3 6-6 6H14c-4 0-6-2-6-6Z",
    windows: ["M22 26h34v30H22Z", "M62 26h34v30H62Z", "M102 26h34v30h-34Z", "M142 26h34v30h-34Z", "M182 26h34v30h-34Z", "M222 26h36v40h-36Z"],
    wheels: [56, 226],
  },
};

export function VehicleArt({ vclass, className }: { vclass: VehicleClass; className?: string }) {
  const s = SPECS[vclass];
  return (
    <svg viewBox="0 0 280 124" className={className} aria-hidden>
      <ellipse cx="140" cy="114" rx="128" ry="6" fill="#13201a" opacity=".12" />
      <path d={s.body} fill={s.color} />
      <path d={s.body} fill="url(#shine)" opacity=".35" />
      {s.windows.map((w) => (
        <path key={w} d={w} fill="#cfe3ea" />
      ))}
      <rect x="12" y="84" width="256" height="3" fill="#fff" opacity=".25" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="104" r="16" fill="#13201a" />
          <circle cx={x} cy="104" r="7" fill="#c9c3b6" />
        </g>
      ))}
      <defs>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
