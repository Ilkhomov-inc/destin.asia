'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Backpack, Inbox, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/locations', label: 'Локации', icon: MapPin },
  { href: '/admin/tours', label: 'Туры', icon: Backpack },
  { href: '/admin/inquiries', label: 'Заявки', icon: Inbox },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export function AdminNavClient() {
  const pathname = usePathname()
  return (
    <nav className="mt-4 flex flex-row flex-wrap gap-1 lg:flex-col">
      {NAV.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
