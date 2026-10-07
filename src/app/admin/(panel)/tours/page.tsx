import Link from 'next/link'
import { Backpack, Plus, Pencil } from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

export default async function AdminToursPage() {
  const tours = await db.tour.findMany({
    include: { images: { orderBy: { order: 'asc' }, take: 1 }, _count: { select: { inquiries: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Backpack className="h-6 w-6 text-primary" /> Туры
          </h1>
          <p className="text-sm text-muted-foreground">Базовые и индивидуальные программы.</p>
        </div>
        <Button asChild>
          <Link href="/admin/tours/new"><Plus className="mr-1 h-4 w-4" /> Новый тур</Link>
        </Button>
      </div>

      {tours.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Туров пока нет. Создайте первый.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {tours.map((t) => {
              const cover = t.images[0]?.url
              return (
                <li key={t.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {cover && (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{t.title}</p>
                      <Badge variant="secondary">
                        {t.type === 'BASIC' ? 'Базовый' : 'Индивидуальный'}
                      </Badge>
                      <Badge variant={t.status === 'PUBLISHED' ? 'default' : 'outline'}>
                        {t.status === 'PUBLISHED' ? 'Опубликован' : 'Черновик'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{t.slug} · {t.durationDays} дн. · {t.price}
                    </p>
                    <p className="text-xs text-muted-foreground">Заявок: {t._count.inquiries}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/tours/${t.id}/edit`}>
                        <Pencil className="mr-1 h-4 w-4" /> Изменить
                      </Link>
                    </Button>
                    <DeleteButton
                      deleteUrl={`/api/admin/tours/${t.id}`}
                      label="Удалить"
                      title={`Удалить тур «${t.title}»?`}
                      description="Тур и его фото будут удалены. Заявки по этому туру останутся (без привязки)."
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
