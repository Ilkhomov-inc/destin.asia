import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from '@/components/admin/delete-button'
import { InquiryActions } from '@/components/admin/inquiry-actions'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

const STATUS: Record<string, string> = { NEW: 'Новая', PROCESSED: 'Обработана' }

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    include: { tour: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const newCount = inquiries.filter((i) => i.status === 'NEW').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Заявки</h1>
        <p className="text-sm text-muted-foreground">
          Всего: {inquiries.length} · Новых: {newCount}
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Заявок пока нет.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{inq.name}</p>
                    <Badge variant={inq.status === 'NEW' ? 'default' : 'secondary'}>
                      {STATUS[inq.status] ?? inq.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Контакт: {inq.contact}</p>
                  {inq.tour && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Тур: {inq.tour.title}
                    </p>
                  )}
                  {inq.message && (
                    <p className="mt-2 whitespace-pre-line rounded-md bg-muted/60 p-3 text-sm">
                      {inq.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(inq.createdAt)}</span>
                  <InquiryActions id={inq.id} status={inq.status} />
                  <DeleteButton
                    deleteUrl={`/api/admin/inquiries/${inq.id}`}
                    label="Удалить"
                    title="Удалить заявку?"
                    description="Заявка будет удалена безвозвратно."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
