"use client";
import { CheckCircle2, Send } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { getDict } from "@/dictionaries";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

type Channel = "telegram" | "whatsapp" | "phone";

export function ChannelPicker({ locale, value, onChange }: { locale: Locale; value: Channel; onChange: (c: Channel) => void }) {
  const t = getDict(locale).form;
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["telegram", "whatsapp", "phone"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
            value === c ? "border-jungle bg-jungle text-white" : "border-ink/12 bg-white text-ink-soft hover:border-ink/30",
          )}
        >
          {t[c]}
        </button>
      ))}
    </div>
  );
}

export function InquiryForm({
  locale,
  tourId,
  source,
  compact,
  children,
  hidden,
  submitLabel,
  minimal,
}: {
  locale: Locale;
  tourId?: string;
  source: string;
  compact?: boolean;
  /** Extra fields rendered above the contact block. */
  children?: ReactNode;
  hidden?: Record<string, string | string[] | number | null | undefined>;
  submitLabel?: string;
  /** Hide the people/date fields (the caller collects them). */
  minimal?: boolean;
}) {
  const t = getDict(locale).form;
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, null);
  const [channel, setChannel] = useState<Channel>("telegram");

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-jungle/5 px-6 py-10 text-center">
        <CheckCircle2 className="size-12 text-jungle-2" />
        <p className="max-w-sm text-lg font-semibold text-ink">{t.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="channel" value={channel} />
      {tourId && <input type="hidden" name="tour_id" value={tourId} />}
      {Object.entries(hidden ?? {}).flatMap(([k, v]) =>
        v === null || v === undefined || v === ""
          ? []
          : (Array.isArray(v) ? v : [v]).map((x, i) => <input key={`${k}${i}`} type="hidden" name={k} value={String(x)} />),
      )}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {children}
      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <Field label={t.name}>
          <Input name="name" required maxLength={80} autoComplete="name" />
        </Field>
        <Field label={t.contact}>
          <Input name="contact" required maxLength={80} autoComplete="tel" placeholder="+998 … / @username" />
        </Field>
      </div>
      <Field label={t.channel}>
        <ChannelPicker locale={locale} value={channel} onChange={setChannel} />
      </Field>
      {!children && !minimal && (
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.people}>
            <Input name="people" type="number" min={1} max={500} inputMode="numeric" />
          </Field>
          <Field label={t.date}>
            <Input name="date_from" type="date" />
          </Field>
        </div>
      )}
      <Field label={t.message}>
        <Textarea name="message" maxLength={2000} placeholder={t.messagePh} rows={compact ? 2 : 3} />
      </Field>
      {state && !state.ok && <p className="rounded-xl bg-route/10 px-4 py-3 text-sm font-medium text-route-dark">{t.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Send className="size-4" />
        {pending ? getDict(locale).common.sending : submitLabel ?? t.submit}
      </Button>
      <p className="text-center text-xs text-ink-soft/80">{t.privacy}</p>
    </form>
  );
}
