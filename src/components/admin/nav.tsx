"use client";
import { Car, ExternalLink, Inbox, LayoutDashboard, LogOut, MapPin, MessageSquareQuote, Route, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/inquiries", label: "Заявки", icon: Inbox },
  { href: "/admin/locations", label: "Локации", icon: MapPin },
  { href: "/admin/tours", label: "Туры", icon: Route },
  { href: "/admin/vehicles", label: "Машины", icon: Car },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquareQuote },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminNav({ newCount, storage }: { newCount: number; storage: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex shrink-0 flex-col border-ink/8 bg-white lg:sticky lg:top-0 lg:h-svh lg:w-60 lg:border-r">
      <div className="flex items-center justify-between p-4 lg:p-5">
        <Link href="/admin">
          <Logo />
        </Link>
        <form action={logout} className="lg:hidden">
          <button className="flex size-9 items-center justify-center rounded-full hover:bg-ink/5" aria-label="Выйти">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5 hover:text-ink")}>
              <l.icon className="size-4" />
              {l.label}
              {l.href === "/admin/inquiries" && newCount > 0 && <span className="ml-auto rounded-full bg-route px-2 py-0.5 text-[11px] text-white">{newCount}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden space-y-1 p-3 lg:block">
        <a href="/ru" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
          <ExternalLink className="size-4" /> Открыть сайт
        </a>
        <form action={logout}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5">
            <LogOut className="size-4" /> Выйти
          </button>
        </form>
        <p className="px-3 pt-2 text-[11px] text-ink-soft/70">Хранилище: {storage}</p>
      </div>
    </aside>
  );
}
