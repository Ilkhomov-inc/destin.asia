"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import { DEFAULT_LOCALE } from "@/lib/types";
import { hasLocale } from "@/lib/i18n";

// not-found gets no params, so read the locale from the URL.
export default function NotFound() {
  const first = usePathname().split("/")[1] ?? "";
  const lang = hasLocale(first) ? first : DEFAULT_LOCALE;
  const t = getDict(lang).notFound;
  return (
    <section className="topo-bg flex min-h-[70svh] flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="font-display text-7xl font-bold text-route">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">{t.title}</h1>
      <p className="mt-2 text-ink-soft">{t.text}</p>
      <Link href={`/${lang}`} className={buttonClass("dark", "md", "mt-8")}>
        {t.home}
      </Link>
    </section>
  );
}
