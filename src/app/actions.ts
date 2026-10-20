"use server";
import { z } from "zod";
import { store } from "@/lib/store";
import { LOCALES, type Inquiry } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  contact: z.string().trim().min(3).max(80),
  channel: z.enum(["telegram", "whatsapp", "phone"]).default("telegram"),
  lang: z.enum(LOCALES).default("ru"),
  people: z.coerce.number().int().min(1).max(500).nullable().catch(null),
  date_from: z.string().max(20).nullable().catch(null),
  date_to: z.string().max(20).nullable().catch(null),
  days: z.coerce.number().int().min(1).max(60).nullable().catch(null),
  tour_id: z.string().uuid().nullable().catch(null),
  location_ids: z.array(z.string().uuid()).max(50).catch([]),
  vehicle_id: z.string().uuid().nullable().catch(null),
  message: z.string().trim().max(2000).catch(""),
  source: z.string().max(200).catch(""),
});

export type InquiryState = { ok: boolean; error?: "invalid" | "server" } | null;

const empty = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : String(v));

export async function submitInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never fill the hidden "website" field.
  if (form.get("website")) return { ok: true };

  const parsed = schema.safeParse({
    name: form.get("name"),
    contact: form.get("contact"),
    channel: form.get("channel") || undefined,
    lang: form.get("lang") || undefined,
    people: empty(form.get("people")),
    date_from: empty(form.get("date_from")),
    date_to: empty(form.get("date_to")),
    days: empty(form.get("days")),
    tour_id: empty(form.get("tour_id")),
    location_ids: form.getAll("location_ids").map(String),
    vehicle_id: empty(form.get("vehicle_id")),
    message: form.get("message") ?? "",
    source: form.get("source") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  const inquiry: Inquiry = {
    ...parsed.data,
    id: crypto.randomUUID(),
    status: "new",
    note: "",
    created_at: new Date().toISOString(),
  };
  try {
    await store.upsert("inquiries", inquiry);
  } catch (e) {
    console.error("inquiry save failed", e);
    return { ok: false, error: "server" };
  }
  return { ok: true };
}
