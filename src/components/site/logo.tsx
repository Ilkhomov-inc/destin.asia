import Image from "next/image";
import mark from "../../../public/brand/logo-mark.png";
import { cn } from "@/lib/utils";

/** Brand emblem (Petronas, palms, crescent) plus the wordmark as live text. */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image src={mark} alt="" width={40} height={40} loading="eager" className="size-10 shrink-0 rounded-xl shadow-sm ring-1 ring-white/10" />
      <span className={cn("font-display text-[17px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>Destin Asia</span>
    </span>
  );
}
