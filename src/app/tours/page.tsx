import type { Metadata } from 'next'
import { getSettings, getPublishedTours } from '@/lib/data'
import { ToursTabs } from '@/components/site/tours-tabs'

export const metadata: Metadata = {
  title: 'Туры',
  description: 'Базовые и индивидуальные туры по миру. Выберите готовую программу или закажите авторский маршрут.',
  alternates: { canonical: '/tours' },
}

export default async function ToursPage() {
  const [basic, individual] = await Promise.all([
    getPublishedTours('BASIC'),
    getPublishedTours('INDIVIDUAL'),
  ])
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Туры</h1>
        <p className="mt-2 text-muted-foreground">
          Готовые программы с фиксированной ценой или индивидуальный маршрут под ваш запрос.
        </p>
      </header>
      <ToursTabs basicTours={basic} individualTours={individual} />
    </div>
  )
}
