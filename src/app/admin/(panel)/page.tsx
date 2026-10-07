import Link from 'next/link'
import { MapPin, Backpack, Inbox, ArrowRight, Clock } from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [locations, tours, inquiries] = await Promise.all([
    db.location.count(),
    db.tour.count(),
    db.inquiry.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { tour: { select: { title: true } } },
    }),
  ])
  const newInquiries = await db.inquiry.count({ where: { status: 'NEW' } })

  const stats = [
    { label: 'Локации', value: locations, href: '/admin/locations', icon: MapPin },
    { label: 'Туры', value: tours, href: '/admin/tours', icon: Backpack },
    { label: 'Новые заявки', value: newInquiries, href: '/admin/inquiries', icon: Inbox },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Обзор вашего сайта.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
          >
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-bold">{s.value}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5 text-primary" /> Последние заявки
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/inquiries">Все заявки <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {inquiries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Заявок пока нет.</p>
        ) : (
          <ul className="divide-y divide-border">
            {inquiries.map((inq) => (
              <li key={inq.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-medium">{inq.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{inq.contact}</p>
                  {inq.tour && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">Тур: {inq.tour.title}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={inq.status === 'NEW' ? 'default' : 'secondary'}>
                    {inq.status === 'NEW' ? 'Новая' : 'Обработана'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(inq.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
