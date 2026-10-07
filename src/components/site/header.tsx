'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import type { PublicSettings } from '@/lib/types'

const NAV = [
  { href: '/', label: 'Главная' },
  { href: '/tours', label: 'Туры' },
  { href: '/about', label: 'О нас' },
  { href: '/contacts', label: 'Контакты' },
]

export function SiteHeader({ settings }: { settings: PublicSettings }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="text-lg">{settings.siteName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2">
            <Link href="/contacts">Оставить заявку</Link>
          </Button>
        </nav>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-accent"
              aria-label="Открыть меню"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <SheetTitle className="sr-only">Меню навигации</SheetTitle>
            <nav className="flex flex-col gap-1 p-6 pt-10">
              {NAV.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-accent'
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Button asChild className="mt-4">
                  <Link href="/contacts">Оставить заявку</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
