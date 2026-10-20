"use client";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { login } from "../actions";
import { Logo } from "@/components/site/logo";
import { inputClass } from "@/components/ui/field";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lift">
      <Logo />
      <h1 className="mt-6 font-display text-xl font-semibold">Вход в админку</h1>
      <input type="password" name="password" required autoFocus autoComplete="current-password" placeholder="Пароль" className={`${inputClass} mt-5`} />
      {error && <p className="mt-3 text-sm font-medium text-route">{error}</p>}
      <button disabled={pending} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white hover:bg-jungle">
        {pending && <Loader2 className="size-4 animate-spin" />} Войти
      </button>
    </form>
  );
}
