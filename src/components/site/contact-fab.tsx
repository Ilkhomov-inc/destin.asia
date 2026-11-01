"use client";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TelegramIcon, WhatsAppIcon } from "./icons";

export function ContactFab({ locale, telegram, whatsapp }: { locale: Locale; telegram: string; whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const t = getDict(locale).contactWidget;
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <div
        // inert: the hidden panel's links must not be reachable with Tab or a screen reader.
        inert={!open}
        className={cn(
          "origin-bottom-right rounded-2xl bg-white p-4 shadow-lift transition-all duration-200",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
        )}
      >
        <p className="font-display text-sm font-semibold">{t.title}</p>
        <p className="mb-3 text-xs text-ink-soft">{t.text}</p>
        <div className="flex flex-col gap-2">
          {telegram && (
            <a href={telegram} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white">
              <TelegramIcon className="size-5" /> Telegram
            </a>
          )}
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white">
              <WhatsAppIcon className="size-5" /> WhatsApp
            </a>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.title}
        aria-expanded={open}
        className="relative flex size-14 items-center justify-center rounded-full bg-route text-white shadow-lift transition active:scale-95"
      >
        {!open && <span className="absolute inset-0 animate-pulse-ring rounded-full bg-route" />}
        {open ? <X className="relative size-6" /> : <MessageCircle className="relative size-6" />}
      </button>
    </div>
  );
}
