import type { Metadata } from 'next'
import { Phone, Mail, MessageCircle, Send, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import { getSettings, getPublishedTours } from '@/lib/data'
import { InquiryForm } from '@/components/site/inquiry-form'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Свяжитесь с нами: телефон, email, WhatsApp, Telegram. Оставьте заявку на подбор тура.',
  alternates: { canonical: '/contacts' },
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}
function tgLink(username: string) {
  return `https://t.me/${username.replace(/^@/, '')}`
}

export default async function ContactsPage() {
  const [settings, tours] = await Promise.all([
    getSettings(),
    getPublishedTours(),
  ])

  const socials = [
    { icon: Instagram, url: settings.instagram, label: 'Instagram' },
    { icon: Facebook, url: settings.facebook, label: 'Facebook' },
    { icon: Youtube, url: settings.youtube, label: 'YouTube' },
  ].filter((s) => s.url)

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Контакты</h1>
        <p className="mt-3 text-muted-foreground">
          Напишите или позвоните — ответим в течение рабочего дня.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Contact details + map */}
        <div>
          <div className="grid gap-3">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Телефон</p>
                  <p className="font-medium">{settings.phone}</p>
                </div>
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{settings.email}</p>
                </div>
              </a>
            )}
            {settings.whatsapp && (
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{settings.whatsapp}</p>
                </div>
              </a>
            )}
            {settings.telegram && (
              <a href={tgLink(settings.telegram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Send className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Telegram</p>
                  <p className="font-medium">@{settings.telegram.replace(/^@/, '')}</p>
                </div>
              </a>
            )}
            {settings.address && (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Адрес</p>
                  <p className="font-medium">{settings.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Socials */}
          {socials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}

          {/* Map */}
          {settings.address && (
            <div className="mt-6 overflow-hidden rounded-xl border border-border">
              <iframe
                title="Карта"
                src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        {/* Inquiry form */}
        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Оставить заявку</h2>
          <InquiryForm tours={tours} />
        </div>
      </div>
    </div>
  )
}
