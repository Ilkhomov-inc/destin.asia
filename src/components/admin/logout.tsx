'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

export function AdminLogout() {
  const router = useRouter()
  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast({ title: 'Вы вышли из админки' })
    router.push('/admin/login')
    router.refresh()
  }
  return (
    <Button onClick={onLogout} variant="ghost" size="sm" className="justify-start text-muted-foreground">
      <LogOut className="mr-2 h-4 w-4" /> Выйти
    </Button>
  )
}
