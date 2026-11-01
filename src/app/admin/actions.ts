"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createToken, SESSION_COOKIE } from "@/lib/session";
import { store } from "@/lib/store";
import { CATEGORIES, INQUIRY_STATUSES, VEHICLE_CLASSES, type Inquiry, type Location, type Review, type Settings, type Tour, type Vehicle } from "@/lib/types";
import { slugify } from "@/lib/utils";

/** `slug` is the normalised slug the server actually saved, so editors can show it. */
export type SaveResult = { ok: true; id: string; slug?: string } | { ok: false; error: string };

// ── Auth ────────────────────────────────────────────────────────────
export async function login(_: string | null, form: FormData): Promise<string | null> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return "ADMIN_PASSWORD не задан в переменных окружения.";
  const given = String(form.get("password") ?? "");
  // Constant-time-ish compare
  let diff = given.length ^ expected.length;
  for (let i = 0; i < Math.max(given.length, expected.length); i++) diff |= (given.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  if (diff !== 0) {
    await new Promise((r) => setTimeout(r, 600));
    return "Неверный пароль";
  }
  const token = await createToken();
  (await cookies()).set(SESSION_COOKIE, token.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: token.maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Schemas ─────────────────────────────────────────────────────────
const L = z.object({ ru: z.string().max(20000), uz: z.string().max(20000) });
const LList = z.object({ ru: z.array(z.string().max(500)).max(50), uz: z.array(z.string().max(500)).max(50) });
const url = z.string().max(2000);
const status = z.enum(["published", "draft"]);
const nullableNum = z.number().nonnegative().nullable();
const rate = z.number().positive("укажите курс больше 0");

const locationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().max(100),
  title: L,
  region: z.string().max(100),
  category: z.enum(CATEGORIES),
  short: L,
  description: L,
  highlights: LList,
  duration: L,
  price_note: L,
  travel_min: z.number().int().min(0).max(1000).nullable(),
  visit_hours: z.number().min(0).max(24),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  cover: url,
  images: z.array(url).max(40),
  status,
  sort: z.number().int(),
  created_at: z.string(),
});

const tourSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().max(100),
  kind: z.enum(["ready", "custom"]),
  title: L,
  short: L,
  description: L,
  duration_days: z.number().int().min(1, "минимум 1 день").max(60),
  price_from: nullableNum,
  price_note: L,
  cover: url,
  images: z.array(url).max(40),
  included: LList,
  not_included: LList,
  program: z.array(z.object({ day: z.number().int().min(1), title: L, text: L })).max(60),
  location_ids: z.array(z.string().uuid()).max(50),
  featured: z.boolean(),
  status,
  sort: z.number().int(),
  created_at: z.string(),
});

const vehicleSchema = z.object({
  id: z.string().uuid(),
  name: L,
  vclass: z.enum(VEHICLE_CLASSES),
  examples: z.string().max(200),
  seats: z.number().int().min(1, "минимум 1 место").max(100),
  luggage: z.number().int().min(0).max(100),
  description: L,
  features: LList,
  image: url,
  price_hour: nullableNum,
  price_day: nullableNum,
  price_transfer: nullableNum,
  status,
  sort: z.number().int(),
  created_at: z.string(),
});

const reviewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  country: z.string().max(60),
  text: z.string().min(1).max(3000),
  rating: z.number().int().min(1).max(5),
  photo: url,
  tour_id: z.string().uuid().nullable(),
  status,
  created_at: z.string(),
});

const settingsSchema = z.object({
  id: z.literal("main"),
  phone: z.string().max(60),
  email: z.string().max(120),
  telegram: url,
  whatsapp: url,
  instagram: url,
  address: z.string().max(200),
  hero_title: L,
  hero_subtitle: L,
  about: L,
  about_extra: L,
  about_image: url,
  rates: z.object({ MYR: rate, UZS: rate, KZT: rate }),
});

function cleanList(v: { ru: string[]; uz: string[] }) {
  return { ru: v.ru.map((s) => s.trim()).filter(Boolean), uz: v.uz.map((s) => s.trim()).filter(Boolean) };
}

async function uniqueSlug(table: "locations" | "tours", wanted: string, id: string) {
  const base = slugify(wanted) || "item";
  const rows = await store.all(table);
  let slug = base;
  for (let i = 2; rows.some((r) => r.slug === slug && r.id !== id); i++) slug = `${base}-${i}`;
  return slug;
}

function done(id: string, slug?: string): SaveResult {
  revalidatePath("/", "layout");
  return { ok: true, id, slug };
}

function fail(e: unknown): SaveResult {
  if (e instanceof z.ZodError) return { ok: false, error: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  return { ok: false, error: e instanceof Error ? e.message : "Ошибка сохранения" };
}

// ── Saves ───────────────────────────────────────────────────────────
export async function saveLocation(input: Location): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = locationSchema.parse(input) as Location;
    row.slug = await uniqueSlug("locations", row.slug || row.title.ru, row.id);
    row.highlights = cleanList(row.highlights);
    row.cover = row.images[0] ?? "";
    await store.upsert("locations", row);
    return done(row.id, row.slug);
  } catch (e) {
    return fail(e);
  }
}

export async function saveTour(input: Tour): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = tourSchema.parse(input) as Tour;
    row.slug = await uniqueSlug("tours", row.slug || row.title.ru, row.id);
    row.included = cleanList(row.included);
    row.not_included = cleanList(row.not_included);
    row.cover = row.images[0] ?? "";
    row.program = row.program.map((p, i) => ({ ...p, day: i + 1 }));
    await store.upsert("tours", row);
    return done(row.id, row.slug);
  } catch (e) {
    return fail(e);
  }
}

export async function saveVehicle(input: Vehicle): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = vehicleSchema.parse(input) as Vehicle;
    row.features = cleanList(row.features);
    await store.upsert("vehicles", row);
    return done(row.id);
  } catch (e) {
    return fail(e);
  }
}

export async function saveReview(input: Review): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = reviewSchema.parse(input) as Review;
    await store.upsert("reviews", row);
    return done(row.id);
  } catch (e) {
    return fail(e);
  }
}

export async function saveSettings(input: Settings): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = settingsSchema.parse(input) as Settings;
    await store.upsert("settings", row);
    return done(row.id);
  } catch (e) {
    return fail(e);
  }
}

export async function updateInquiry(id: string, patch: { status?: Inquiry["status"]; note?: string }): Promise<SaveResult> {
  await requireAdmin();
  try {
    const row = await store.get("inquiries", id);
    if (!row) return { ok: false, error: "Заявка не найдена" };
    const next = {
      ...row,
      status: patch.status ? z.enum(INQUIRY_STATUSES).parse(patch.status) : row.status,
      note: patch.note !== undefined ? z.string().max(2000).parse(patch.note) : row.note,
    };
    await store.upsert("inquiries", next);
    revalidatePath("/admin", "layout");
    return { ok: true, id };
  } catch (e) {
    return fail(e);
  }
}

const DELETABLE = ["locations", "tours", "vehicles", "reviews", "inquiries"] as const;

export async function deleteRow(table: (typeof DELETABLE)[number], id: string): Promise<SaveResult> {
  await requireAdmin();
  if (!DELETABLE.includes(table)) return { ok: false, error: "bad table" };
  try {
    await store.remove(table, z.string().uuid().parse(id));
    if (table === "locations") {
      // Drop the location from any tour routes.
      for (const t of await store.all("tours"))
        if (t.location_ids.includes(id)) await store.upsert("tours", { ...t, location_ids: t.location_ids.filter((x) => x !== id) });
    }
    return done(id);
  } catch (e) {
    return fail(e);
  }
}

const MAX_UPLOAD = 8 * 1024 * 1024;

export async function uploadImages(form: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) return { urls, error: `${f.name}: не изображение` };
    if (f.size > MAX_UPLOAD) return { urls, error: `${f.name}: больше 8 МБ` };
    try {
      urls.push(await store.upload(f));
    } catch (e) {
      return { urls, error: e instanceof Error ? e.message : "Ошибка загрузки" };
    }
  }
  return { urls };
}
