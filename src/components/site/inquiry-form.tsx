'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import type { PublicTour } from '@/lib/types'

interface InquiryFormProps {
  tours?: PublicTour[]
  /** preselected tour title to show as context */
  tourLabel?: string
}

export function InquiryForm({ tours = [], tourLabel }: InquiryFormProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [tourId, setTourId] = useState<string>('none')
  // Honeypot: hidden field, must stay empty. Bots fill it.
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (company) {
      // Bot filled the honeypot — pretend success, drop the data.
      setDone(true)
      return
    }
    if (!name.trim() || !contact.trim()) {
      toast({ title: 'Заполните имя и контакт', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          message: message.trim(),
          tourId: tourId && tourId !== 'none' ? tourId : null,
        }),
      })
      if (!res.ok) throw new Error('Ошибка отправки')
      setDone(true)
      setName(''); setContact(''); setMessage(''); setTourId('none')
      toast({ title: 'Заявка отправлена!', description: 'Мы свяжемся с вами в ближайшее время.' })
    } catch {
      toast({ title: 'Не удалось отправить заявку', description: 'Попробуйте ещё раз или напишите нам в мессенджер.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="text-lg font-semibold">Спасибо за заявку!</h3>
        <p className="text-sm text-muted-foreground">
          Мы получили ваше обращение и свяжемся с вами в ближайшее время.
        </p>
        <Button variant="outline" onClick={() => setDone(false)}>
          Отправить ещё одну
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4">
        {tourLabel && (
          <p className="text-sm text-muted-foreground">
            Заявка по туру: <span className="font-medium text-foreground">{tourLabel}</span>
          </p>
        )}
        <div className="grid gap-2">
          <Label htmlFor="inq-name">Имя *</Label>
          <Input
            id="inq-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как к вам обращаться"
            autoComplete="name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inq-contact">Контакт *</Label>
          <Input
            id="inq-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Телефон, email, Telegram или WhatsApp"
            required
          />
        </div>
        {tours.length > 0 && (
          <div className="grid gap-2">
            <Label htmlFor="inq-tour">Тур (необязательно)</Label>
            <Select value={tourId} onValueChange={setTourId}>
              <SelectTrigger id="inq-tour">
                <SelectValue placeholder="Выберите тур" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без привязки к туру</SelectItem>
                {tours.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="inq-message">Сообщение</Label>
          <Textarea
            id="inq-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Даты, количество человек, пожелания…"
            rows={4}
          />
        </div>

        {/* Honeypot — visually hidden, label lures bots */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="inq-company">Компания (оставьте пустым)</label>
          <input
            id="inq-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Отправляем…</>
          ) : (
            <><Send className="mr-2 h-4 w-4" /> Отправить заявку</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь на обработку ваших данных для связи с вами.
        </p>
      </div>
    </form>
  )
}
