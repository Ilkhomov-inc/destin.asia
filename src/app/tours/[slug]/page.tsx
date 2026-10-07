import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Clock, Tag, CalendarDays, Check, X, MapPin, ArrowLeft, MessageCircle } from 'lucide-react'
import { ImageSlider } from '@/components/site/image-slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SmartImage } from '@/components/site/smart-image'
import { getSettings, getTourBySlug, getPublishedTours } from '@/lib/data'
import { InquiryForm } from '@/components/site/inquiry-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) return { title: 'Тур не найден' }
  const settings = await getSettings()
  return {
    title: tour.title,
    description: tour.description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: tour.title,
      description: tour.description,
      url: `/tours/${tour.slug}`,
      images: tour.coverImage ? [{ url: tour.coverImage }] : undefined,
    },
  }
}

export default async function TourPage({ params }: PageProps) {
  const { slug } = await params
  const tour = await getTourBySlug(slug)
  if (!tour) notFound()
  const allTours = await getPublishedTours()

  return (
    <article className="container mx-auto px-4 py-10 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/tours"><ArrowLeft className="mr-1 h-4 w-4" /> Все туры</Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <ImageSlider images={tour.images} alt={tour.title} />

        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {tour.type === 'BASIC' ? 'Базовый тур' : 'Индивидуальный тур'}
            </Badge>
            <Badge variant="outline">{tour.durationDays} дн.</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tour.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{tour.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Длительность</dt>
              <dd className="mt-1 text-lg font-semibold">{tour.durationDays} дней</dd>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground"><Tag className="h-3.5 w-3.5" /> Цена</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">{tour.price}</dd>
            </div>
            {tour.startDate && (
              <div className="col-span-2 rounded-xl border border-border bg-card p-4">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> Даты</dt>
                <dd className="mt-1 font-medium">{tour.startDate}</dd>
              </div>
            )}
          </dl>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/contacts"><MessageCircle className="mr-2 h-4 w-4" /> Связаться</Link>
          </Button>
        </div>
      </div>

      {/* Program */}
      {tour.programDays.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">Программа по дням</h2>
          <ol className="mt-6 space-y-4">
            {tour.programDays.map((d, i) => (
              <li
                key={i}
                className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {d.day}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">День {d.day}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Included / not included */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Check className="h-5 w-5 text-primary" /> Что включено
          </h2>
          {tour.included.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Не указано.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {tour.included.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <X className="h-5 w-5 text-muted-foreground" /> Не включено
          </h2>
          {tour.notIncluded.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Не указано.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {tour.notIncluded.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Locations in tour */}
      {tour.locations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">Локации в туре</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tour.locations.map((l) => (
              <Link
                key={l.id}
                href={`/locations/${l.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
              >
                <SmartImage src={`https://picsum.photos/seed/${l.slug}/600/450`} alt={l.title} ratioClassName="aspect-[4/3] w-full" />
                <div className="p-3">
                  <p className="font-medium leading-tight">{l.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {l.region}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Inquiry */}
      <section className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Готовы поехать?</h2>
          <p className="mt-2 text-muted-foreground">
            Оставьте заявку по этому туру — и мы свяжемся с вами, чтобы обсудить детали и забронировать даты.
          </p>
        </div>
        <InquiryForm tours={allTours} tourLabel={tour.title} />
      </section>
    </article>
  )
}
