import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/auth'
import { AdminLogout } from '@/components/admin/logout'
import { AdminNavClient } from '@/components/admin/nav-client'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()
  if (!authed) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        {/* Sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-6 rounded-xl border border-border bg-card p-4 shadow-sm">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </span>
              Админ-панель
            </Link>
            <AdminNavClient />
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/">Открыть сайт</Link>
              </Button>
              <AdminLogout />
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
