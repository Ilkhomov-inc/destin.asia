import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InfoGrid } from "@/components/site/info-grid";
import { Container, Eyebrow, SectionHead } from "@/components/site/section";
import { SmartImage } from "@/components/site/smart-image";
import { buttonClass } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import { getSettings } from "@/lib/data";
import { hasLocale, tr } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  const s = await getSettings();
  return pageMeta(lang, "/about", d.about.title, tr(s.about_extra, lang));
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const s = await getSettings();
  return (
    <>
      <section className="topo-bg pt-28 pb-16 sm:pt-36 sm:pb-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{d.nav.about}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-6xl">{d.about.title}</h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed whitespace-pre-line text-ink-soft">{tr(s.about, lang)}</div>
            <p className="mt-6 border-l-4 border-route pl-5 font-display text-xl leading-snug font-medium">{tr(s.about_extra, lang)}</p>
            <Link href={`/${lang}/contacts`} className={buttonClass("primary", "lg", "mt-8")}>
              {d.nav.contacts} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="relative">
            <SmartImage src={s.about_image} alt="Destin Asia" className="aspect-[4/5] rounded-[2rem] shadow-lift" sizes="(min-width: 1024px) 50vw, 100vw" priority />
            <div className="absolute -bottom-6 left-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-3 shadow-lift sm:-left-6">
              {d.about.values.map((v) => (
                <div key={v.t} className="px-2 text-center">
                  <div className="font-display text-2xl font-bold text-route">{v.n}</div>
                  <div className="mt-1 text-[11px] leading-tight font-semibold text-ink-soft">{v.t}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <SectionHead eyebrow={d.info.eyebrow} title={d.info.title} />
          <InfoGrid locale={lang} />
        </Container>
      </section>
    </>
  );
}
