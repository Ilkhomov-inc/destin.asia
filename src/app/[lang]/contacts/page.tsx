import { Mail, MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { InstagramIcon, TelegramIcon, WhatsAppIcon } from "@/components/site/icons";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";
import { getDict } from "@/dictionaries";
import { getSettings } from "@/lib/data";
import { hasLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Sheet } from "@/components/site/sheet";

export async function generateMetadata({ params }: PageProps<"/[lang]/contacts">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, "/contacts", d.contacts.title, d.contacts.text);
}

export default async function ContactsPage({ params }: PageProps<"/[lang]/contacts">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const s = await getSettings();
  const channels = [
    { href: s.telegram, label: "Telegram", sub: s.telegram.replace(/^https?:\/\/(t\.me\/)?/, "@"), Icon: TelegramIcon, color: "bg-[#229ED9]" },
    { href: s.whatsapp, label: "WhatsApp", sub: s.phone, Icon: WhatsAppIcon, color: "bg-[#25D366]" },
    { href: s.instagram, label: "Instagram", sub: "@destin.asia", Icon: InstagramIcon, color: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
  ].filter((c) => c.href);
  return (
    <>
      <PageHero eyebrow={d.nav.contacts} title={d.contacts.title} text={d.contacts.text} />
      <Sheet>
      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-4">
            {channels.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener" className="group flex items-center gap-4 rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className={`flex size-12 items-center justify-center rounded-2xl text-white ${c.color}`}>
                  <c.Icon className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-display font-semibold">{c.label}</span>
                  <span className="block text-sm text-ink-soft">{c.sub}</span>
                </span>
                <span className="text-sm font-semibold text-route opacity-0 transition group-hover:opacity-100">{d.contacts.write} →</span>
              </a>
            ))}
            <div className="space-y-3 rounded-card border border-line p-5 text-[15px]">
              <a href={`tel:${s.phone}`} className="flex items-center gap-3 hover:text-route">
                <Phone className="size-4 text-route" /> {s.phone}
              </a>
              <a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:text-route">
                <Mail className="size-4 text-route" /> {s.email}
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="size-4 text-route" /> {s.address}
              </p>
            </div>
          </div>
          <div id="form" className="rounded-card bg-white p-6 shadow-lift sm:p-8">
            <h2 className="mb-6 font-display text-2xl font-semibold">{d.contacts.formTitle}</h2>
            <InquiryForm locale={lang} source="contacts" />
          </div>
        </Container>
      </section>
      </Sheet>
    </>
  );
}
