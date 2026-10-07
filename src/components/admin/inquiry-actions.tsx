'use client'

import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface Props {
  id: string
  status: string
}

export function InquiryActions({ id, status }: Props) {
  const router = useRouter()
  const processed = status === 'PROCESSED'

  async function toggle() {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: processed ? 'NEW' : 'PROCESSED' }),
    })
    if (!res.ok) {
      toast({ title: 'Ошибка', variant: 'destructive' })
      return
    }
    toast({ title: processed ? 'Возвращена в новые' : 'Отмечена обработанной' })
    router.refresh()
  }

  return (
    <Button onClick={toggle} variant={processed ? 'outline' : 'default'} size="sm">
      <Check className="mr-1 h-4 w-4" />
      {processed ? 'Снять отметку' : 'Обработать'}
    </Button>
  )
}
