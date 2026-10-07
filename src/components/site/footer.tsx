import Link from 'next/link'
import { Phone, Mail, MessageCircle, Send, MapPin, Compass } from 'lucide-react'
import type { PublicSettings } from '@/lib/types'

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

function tgLink(username: string) {
  const clean = username.replace(/^@/, '')
  return `https://t.me/${clean}`
}

export function SiteFooter({ settings }: { settings: PublicSettings }) {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t border-border/70 bg-secondary/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </span>
              <span>{settings.siteName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{settings.tagline}</p>
          </div>

          {/* Nav */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Навигация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Главная</Link></li>
              <li><Link href="/tours" className="hover:text-foreground">Туры</Link></li>
              <li><Link href="/about" className="hover:text-foreground">О нас</Link></li>
              <li><Link href="/contacts" className="hover:text-foreground">Контакты</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Контакты</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-foreground">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Messengers */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Написать нам</h3>
            <div className="flex flex-wrap gap-2">
              <a
                href={waLink(settings.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
              </a>
              <a
                href={tgLink(settings.telegram)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                <Send className="h-4 w-4 text-primary" /> Telegram
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {year} {settings.siteName}. Все права защищены.</p>
          <p>Сделано с любовью к путешествиям</p>
        </div>
      </div>
    </footer>
  )
}
