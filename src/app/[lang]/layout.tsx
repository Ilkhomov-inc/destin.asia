import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { notFound } from "next/navigation";
import { ContactFab } from "@/components/site/contact-fab";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getDict } from "@/dictionaries";
import { getSettings } from "@/lib/data";
import { hasLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { LOCALES } from "@/lib/types";
import "../globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", weight: ["500", "600", "700"] });
const sans = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const revalidate = 300;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang).meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.title, template: "%s · Destin Asia" },
    description: t.description,
    alternates: { canonical: `/${lang}`, languages: { ru: "/ru", uz: "/uz", "x-default": "/ru" } },
    openGraph: { type: "website", siteName: "Destin Asia", locale: lang === "ru" ? "ru_RU" : "uz_UZ", title: t.title, description: t.description },
  };
}

export const viewport: Viewport = { themeColor: "#0b1530" };

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const settings = await getSettings();
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-svh">
        <Header locale={lang} />
        <main>{children}</main>
        <Footer locale={lang} settings={settings} />
        <ContactFab locale={lang} telegram={settings.telegram} whatsapp={settings.whatsapp} />
      </body>
    </html>
  );
}
