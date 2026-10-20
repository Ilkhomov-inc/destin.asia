"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LangSwitch({ locale, light }: { locale: Locale; light?: boolean }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(ru|uz)(?=\/|$)/, "");
  return (
    <div className={cn("flex rounded-full p-0.5 text-xs font-bold", light ? "bg-white/10" : "bg-ink/5")}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={`/${l}${rest}`}
          scroll={false}
          aria-current={l === locale}
          className={cn(
            "rounded-full px-2.5 py-1.5 uppercase transition",
            l === locale ? (light ? "bg-white text-ink" : "bg-ink text-white") : light ? "text-white/70 hover:text-white" : "text-ink-soft hover:text-ink",
          )}
        >
          {l === "ru" ? "Рус" : "O'zb"}
        </Link>
      ))}
    </div>
  );
}
