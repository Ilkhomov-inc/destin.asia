import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "./types";

const BUCKET = "media";
let client: SupabaseClient | null = null;

// All database access goes through the server with the service-role key.
// RLS is enabled with no policies, so the public anon key can't read or write anything.
function db() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  return client;
}

function check<T>(res: { data: T; error: { message: string } | null }) {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export const supabaseStore: Store = {
  async all(table) {
    return check(await db().from(table).select("*")) as never;
  },
  async get(table, id) {
    return check(await db().from(table).select("*").eq("id", id).maybeSingle()) as never;
  },
  async upsert(table, row) {
    check(await db().from(table).upsert(row));
  },
  async remove(table, id) {
    check(await db().from(table).delete().eq("id", id));
  },
  async upload(file) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    check(await db().storage.from(BUCKET).upload(key, file, { contentType: file.type, upsert: false }));
    return db().storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  },
};
