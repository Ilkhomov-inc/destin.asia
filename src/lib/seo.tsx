import type { Metadata } from "next";
import { tr } from "./i18n";
import { SITE_URL } from "./site";
import type { Locale, Location, Settings, Tour } from "./types";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Per-page metadata with hreflang alternates for both locales. */
export function pageMeta(locale: Locale, path: string, title: string, description: string, image?: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `/${locale}${path}`, languages: { ru: `/ru${path}`, uz: `/uz${path}`, "x-default": `/ru${path}` } },
    // openGraph replaces the layout's object rather than merging, so repeat the site-wide fields.
    openGraph: {
      type: "website",
      siteName: "Destin Asia",
      locale: locale === "ru" ? "ru_RU" : "uz_UZ",
      title,
      description,
      url: `/${locale}${path}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export function organizationLd(s: Settings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Destin Asia",
    url: `${SITE_URL}/${locale}`,
    description: tr(s.hero_subtitle, locale),
    telephone: s.phone,
    email: s.email,
    address: { "@type": "PostalAddress", addressLocality: "Kuala Lumpur", addressCountry: "MY" },
    areaServed: "Malaysia",
    knowsLanguage: ["ru", "uz", "en", "ms"],
    sameAs: [s.instagram, s.telegram].filter(Boolean),
  };
}

export function attractionLd(l: Location, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: tr(l.title, locale),
    description: tr(l.short, locale),
    image: l.images.length ? l.images : undefined,
    url: `${SITE_URL}/${locale}/locations/${l.slug}`,
    geo: l.lat !== null && l.lng !== null ? { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } : undefined,
    address: { "@type": "PostalAddress", addressRegion: l.region, addressCountry: "MY" },
  };
}

export function tripLd(t: Tour, route: Location[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tr(t.title, locale),
    description: tr(t.short, locale),
    image: t.cover || undefined,
    url: `${SITE_URL}/${locale}/tours/${t.slug}`,
    provider: { "@type": "TravelAgency", name: "Destin Asia" },
    itinerary: {
      "@type": "ItemList",
      itemListElement: route.map((l, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "TouristAttraction", name: tr(l.title, locale) } })),
    },
    offers: t.price_from ? { "@type": "Offer", price: t.price_from, priceCurrency: "USD" } : undefined,
  };
}
