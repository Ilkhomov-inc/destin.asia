import type { Metadata } from 'next'
import { getSettings } from '@/lib/data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Sparkles, Heart, Map, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'О нас',
  description: 'О туристической компании: миссия, команда и подход к путешествиям.',
  alternates: { canonical: '/about' },
}

const VALUES = [
  { icon: Heart, title: 'Любим то, что делаем', text: 'Каждый маршрут — авторская работа, а не шаблон из каталога.' },
  { icon: Map, title: 'Проверенные направления', text: 'Лично ездим и отбираем лучшее: от отелей до скрытых локаций.' },
  { icon: Users, title: 'С вами на связи 24/7', text: 'Поддержка в поездке на каждом этапе — от аэропорта до дома.' },
  { icon: Sparkles, title: 'Гибкость', text: 'Меняем планы по ходу, если хочется свернуть с маршрута.' },
]

export default async function AboutPage() {
  const settings = await getSettings()
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight">О нас</h1>
        <p className="mt-3 text-lg text-muted-foreground">{settings.tagline}</p>
      </header>

      <div className="mt-8 max-w-3xl">
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
          {settings.aboutText}
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-xl border border-border bg-card p-6">
            <v.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-semibold">{v.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-secondary/40 p-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Готовы отправиться в путь?</h2>
        <p className="mt-2 text-muted-foreground">Расскажите, куда хотите — соберём маршрут под вас.</p>
        <Button asChild className="mt-6">
          <Link href="/contacts">Оставить заявку</Link>
        </Button>
      </div>
    </div>
  )
}
