import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/admin/login-form'

export const metadata: Metadata = {
  title: 'Вход в админ-панель',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  // Already authed? Send to dashboard.
  if (await isAuthenticated()) redirect('/admin')
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
