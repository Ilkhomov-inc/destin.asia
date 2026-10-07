'use client'

import { useState } from 'react'
import { TourCard } from './tour-card'
import { InquiryForm } from './inquiry-form'
import { cn } from '@/lib/utils'
import type { PublicTour } from '@/lib/types'

interface ToursTabsProps {
  basicTours: PublicTour[]
  individualTours: PublicTour[]
}

export function ToursTabs({ basicTours, individualTours }: ToursTabsProps) {
  const [tab, setTab] = useState<'basic' | 'individual'>('basic')

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
        <button
          onClick={() => setTab('basic')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            tab === 'basic' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Базовые туры
        </button>
        <button
          onClick={() => setTab('individual')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            tab === 'individual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Индивидуальные туры
        </button>
      </div>

      {tab === 'basic' ? (
        <section>
          <p className="mb-6 max-w-2xl text-muted-foreground">
            Готовые программы с фиксированной ценой и расписанием. Бронируйте в пару кликов —
            всё уже продумано за вас.
          </p>
          {basicTours.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Пока нет базовых туров — загляните позже.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {basicTours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Как это работает</h2>
              <ol className="mt-4 space-y-4">
                {[
                  { t: 'Вы оставляете заявку', d: 'Расскажите, куда хотите, даты, бюджет и пожелания.' },
                  { t: 'Мы готовим маршрут', d: 'Подбираем локации, отели, логистику под ваш ритм.' },
                  { t: 'Согласуем и бронируем', d: 'Вы вносите правки, мы фиксируем всё на месте.' },
                  { t: 'Вы путешествуете', d: 'Поддержка 24/7, гибкость по ходу поездки.' },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.t}</p>
                      <p className="text-sm text-muted-foreground">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {individualTours.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">Примеры индивидуальных туров</h3>
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {individualTours.map((t) => (
                      <TourCard key={t.id} tour={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">Заявка на подбор</h2>
              <p className="mb-4 mt-1 text-muted-foreground">
                Заполните форму — соберём индивидуальный маршрут под ваш запрос.
              </p>
              <InquiryForm tours={[...basicTours, ...individualTours]} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
