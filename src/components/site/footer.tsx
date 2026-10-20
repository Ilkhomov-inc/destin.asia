import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { getDict } from "@/dictionaries";
import type { Locale, Settings } from "@/lib/types";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "./icons";
import Image from "next/image";
import fullLogo from "../../../public/brand/logo-full.png";
import { Container } from "./section";

export function Footer({ locale, settings }: { locale: Locale; settings: Settings }) {
  const d = getDict(locale);
  const links = [
    ["/locations", d.nav.locations],
    ["/tours", d.nav.tours],
    ["/transport", d.nav.transport],
    ["/build", d.nav.build],
    ["/about", d.nav.about],
    ["/contacts", d.nav.contacts],
  ] as const;
  return (
    <footer className="bg-[#15273f] text-white">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src={fullLogo} alt="Destin Asia" width={188} className="h-auto w-[188px]" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">{d.footer.tagline}</p>
          <div className="mt-6 flex gap-2">
            {[
              [settings.telegram, TelegramIcon, "Telegram"],
              [settings.whatsapp, WhatsAppIcon, "WhatsApp"],
              [settings.instagram, InstagramIcon, "Instagram"],
            ].map(([url, Icon, label]) =>
              url ? (
                <a key={label as string} href={url as string} target="_blank" rel="noopener" aria-label={label as string} className="flex size-10 items-center justify-center rounded-full bg-white/8 transition hover:bg-white/15">
                  {(() => {
                    const I = Icon as typeof TelegramIcon;
                    return <I className="size-[18px]" />;
                  })()}
                </a>
              ) : null,
            )}
          </div>
        </div>
        <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
          {links.map(([href, label]) => (
            <Link key={href} href={`/${locale}${href}`} className="text-white/70 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 text-sm text-white/70">
          <a href={`tel:${settings.phone}`} className="flex items-center gap-3 hover:text-white">
            <Phone className="size-4 text-sunset" /> {settings.phone}
          </a>
          <a href={`mailto:${settings.email}`} className="flex items-center gap-3 hover:text-white">
            <Mail className="size-4 text-sunset" /> {settings.email}
          </a>
          <p className="flex items-center gap-3">
            <MapPin className="size-4 text-sunset" /> {settings.address}
          </p>
        </div>
      </Container>
      <div className="border-t border-white/8">
        <Container className="py-6 text-xs text-white/40">
          © {new Date().getFullYear()} Destin Asia. {d.footer.rights}
        </Container>
      </div>
    </footer>
  );
}
