import "server-only";
import { localStore } from "./local";
import { supabaseStore } from "./supabase";

export const usingSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const store = usingSupabase ? supabaseStore : localStore;
