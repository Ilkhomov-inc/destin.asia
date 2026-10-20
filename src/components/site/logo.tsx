import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <circle cx="20" cy="20" r="19" className={light ? "fill-white/10" : "fill-jungle"} />
        <path d="M5 29 15 15l5 6 4-5 11 13Z" className="fill-moss" />
        <path d="M5 29 15 15l4 5" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" opacity=".7" />
        <rect x="26.5" y="12" width="2.4" height="17" rx=".6" fill="#fff" />
        <rect x="30.5" y="12" width="2.4" height="17" rx=".6" fill="#fff" />
        <rect x="26.5" y="18" width="6.4" height="1.2" fill="#fff" />
        <path d="M27.7 12V8.5M31.7 12V8.5" stroke="#fff" strokeWidth=".9" />
        <path d="M9 31c5-3 9 1 14-2s7-1 9-3" fill="none" stroke="#d6452b" strokeWidth="1.8" strokeDasharray="2.2 2" strokeLinecap="round" />
      </svg>
      <span className={cn("font-display text-[17px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>
        Destin<span className="text-route">.</span>Asia
      </span>
    </span>
  );
}
