// Day/night cycle for the ambient background. The cycle starts at the current time of day in
// Kuala Lumpur and then runs fast: a whole day in CYCLE_MS.
export const CYCLE_MS = 8 * 60 * 1000;

export type SkyState = { t0: number; p0: number; speed: number };

declare global {
  interface Window {
    __sky?: SkyState;
  }
}

/** Time of day in Kuala Lumpur (UTC+8) as 0…1, where 0.5 is noon. */
export function klPhase(now: number) {
  const d = new Date(now + 8 * 3600_000);
  return (d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()) / 86400;
}

export function phaseAt(sky: SkyState, now: number) {
  return (((sky.p0 + ((now - sky.t0) / CYCLE_MS) * sky.speed) % 1) + 1) % 1;
}

/**
 * CSS variables for one moment of the day. Self-contained on purpose: its source is also
 * inlined into a tiny <head> script so the first paint already shows the right sky.
 */
export function skyFrame(p: number): Record<string, string> {
  function at(k: number[][]) {
    for (let i = 1; i < k.length; i++)
      if (p <= k[i][0]) {
        const t = (p - k[i - 1][0]) / (k[i][0] - k[i - 1][0] || 1);
        return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t;
      }
    return k[k.length - 1][1];
  }
  const night = at([[0, 1], [0.2, 1], [0.265, 0], [0.8, 0], [0.865, 1], [1, 1]]);
  const dawn = at([[0, 0], [0.2, 0], [0.255, 1], [0.29, 1], [0.345, 0], [1, 0]]);
  const day = at([[0, 0], [0.29, 0], [0.35, 1], [0.69, 1], [0.75, 0], [1, 0]]);
  const dusk = at([[0, 0], [0.69, 0], [0.745, 1], [0.79, 1], [0.865, 0], [1, 0]]);
  const lights = at([[0, 1], [0.24, 1], [0.3, 0], [0.73, 0], [0.8, 1], [1, 1]]);

  // Blend a palette of [day, dawn, dusk, night] hex colours by the current weights.
  const sum = night + dawn + day + dusk || 1;
  function mix(pal: string[]) {
    const w = [day, dawn, dusk, night];
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < 4; i++) {
      const n = parseInt(pal[i].slice(1), 16);
      r += ((n >> 16) & 255) * w[i];
      g += ((n >> 8) & 255) * w[i];
      b += (n & 255) * w[i];
    }
    return `rgb(${Math.round(r / sum)} ${Math.round(g / sum)} ${Math.round(b / sum)})`;
  }

  // Sun from sunrise (0.25) to sunset (0.78); moon through the night.
  const ts = (p - 0.25) / 0.53;
  const sunUp = ts > 0 && ts < 1;
  const tm = (((p - 0.78) % 1) + 1) % 1 / 0.47;
  const moonUp = tm > 0 && tm < 1;

  const v: Record<string, number | string> = {
    night,
    dawn,
    day,
    dusk,
    lights,
    "sun-x": sunUp ? 1450 - ts * 1300 : -200,
    "sun-y": sunUp ? 600 - Math.sin(ts * Math.PI) * 470 : 1200,
    "sun-o": sunUp ? Math.min(1, Math.sin(ts * Math.PI) * 4) : 0,
    "moon-x": moonUp ? 1380 - tm * 1160 : -200,
    "moon-y": moonUp ? 560 - Math.sin(tm * Math.PI) * 400 : 1200,
    "moon-o": moonUp ? Math.min(1, Math.sin(tm * Math.PI) * 4) * Math.max(night, 0.2) : 0,
    "ridge-far": mix(["#a4bcb6", "#c3a5a4", "#7c6187", "#1b2551"]),
    "ridge-near": mix(["#729a8b", "#9c8389", "#5b4672", "#141c41"]),
    "bld-far": mix(["#a9b6c5", "#c8acab", "#6f5c84", "#1d244b"]),
    "bld-near": mix(["#80909f", "#a48f95", "#4d4068", "#11173b"]),
    tower: mix(["#c6cedb", "#e4c9bf", "#b59cab", "#b4c0dd"]),
    trees: mix(["#567563", "#6d6065", "#3b304d", "#0b1129"]),
    cloud: mix(["#ffffff", "#ffe3d0", "#f6b8a3", "#2e3a6b"]),
    cable: mix(["#3b4a44", "#5b4e52", "#4b4057", "#8d97ba"]),
    gwin: mix(["#bcd8e3", "#dccbc2", "#d6a99a", "#ffd38a"]),
  };
  const out: Record<string, string> = {};
  for (const k in v) out[k] = typeof v[k] === "number" ? (v[k] as number).toFixed(4) : (v[k] as string);
  return out;
}

/**
 * Inline script for <head>: computes the first frame before paint and records the clock in
 * window.__sky for the client component. In development `?skyPhase=0..1` and `?skySpeed=N` help testing.
 */
export function skyScript(dev: boolean) {
  return `(function(){try{
var now=Date.now(),d=new Date(now+288e5),p0=(d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds())/86400,speed=1;
${dev ? `var q=new URLSearchParams(location.search);if(q.has("skyPhase"))p0=+q.get("skyPhase")%1;if(q.has("skySpeed"))speed=+q.get("skySpeed");` : ""}
if(matchMedia("(prefers-reduced-motion: reduce)").matches)speed=0;
window.__sky={t0:now,p0:p0,speed:speed};
var f=(${skyFrame.toString()})(p0),s="";for(var k in f)s+="--"+k+":"+f[k]+";";
var st=document.createElement("style");st.id="sky-initial";st.textContent="#ambient{"+s+"}";document.head.appendChild(st);
}catch(e){}})();`;
}
