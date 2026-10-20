"use client";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CartButton } from "./cart-button";
import { LangSwitch } from "./lang-switch";
import { Logo } from "./logo";

export function Header({ locale }: { locale: Locale }) {
  const t = getDict(locale).nav;
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  // The menu remembers the page it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Over the hero the header is transparent with light text.
  const light = isHome && !scrolled && !open;
  const links = [
    { href: "/locations", label: t.locations },
    { href: "/tours", label: t.tours },
    { href: "/transport", label: t.transport },
    { href: "/about", label: t.about },
    { href: "/contacts", label: t.contacts },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        light ? "bg-transparent" : "border-b border-ink/5 bg-paper/85 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="mr-auto" aria-label="Destin Asia">
          <Logo light={light} />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname.startsWith(`/${locale}${l.href}`);
            return (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[15px] font-medium transition",
                  light ? "text-white/85 hover:bg-white/10 hover:text-white" : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                  active && (light ? "text-white" : "bg-ink/5 text-ink"),
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1.5">
          <LangSwitch locale={locale} light={light} />
          <CartButton locale={locale} light={light} />
          <ButtonLink href={`/${locale}/build`} size="sm" className="hidden sm:inline-flex">
            {t.build}
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpenAt(open ? null : pathname)}
            aria-label={open ? t.close : t.menu}
            aria-expanded={open}
            className={cn("inline-flex size-10 items-center justify-center rounded-full lg:hidden", light ? "text-white" : "text-ink")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-paper px-4 pt-4 pb-10 lg:hidden">
          <nav className="flex flex-col">
            {[{ href: "", label: t.home }, ...links, { href: "/build", label: t.build }].map((l) => (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                className="border-b border-ink/8 py-4 font-display text-2xl font-semibold text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
