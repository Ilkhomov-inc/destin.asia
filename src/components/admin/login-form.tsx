'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Compass, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export function LoginForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/admin'
  // Keep a ref to router to avoid race on unmount
  const routerRef = useRef(router)
  routerRef.current = router

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        toast({ title: 'Неверный пароль', variant: 'destructive' })
        return
      }
      toast({ title: 'Добро пожаловать!' })
      routerRef.current.replace(next)
      routerRef.current.refresh()
    } catch {
      toast({ title: 'Ошибка входа', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Compass className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Админ-панель</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Войдите, чтобы управлять контентом сайта.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="pl-9"
              placeholder="••••••••"
            />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Вход…</>
          ) : (
            'Войти'
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Подсказка: пароль задаётся в файле <code className="rounded bg-muted px-1 py-0.5">.env</code> (ADMIN_PASSWORD).
        </p>
      </form>
    </div>
  )
}
