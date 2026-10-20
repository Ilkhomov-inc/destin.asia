// Copies src/content/seed.ts (and .data/db.json if present) into Supabase.
// Usage: npm run seed:supabase   (reads .env.local)
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import {
  seedLocations,
  seedSettings,
  seedTours,
  seedVehicles,
} from "../src/content/seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.",
  );
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// Prefer local edits made in the dev admin over the bundled seed.
const local = existsSync(".data/db.json")
  ? JSON.parse(readFileSync(".data/db.json", "utf8"))
  : {};
const data: Record<string, object[]> = {
  settings: local.settings ?? [seedSettings],
  locations: local.locations ?? seedLocations,
  tours: local.tours ?? seedTours,
  vehicles: local.vehicles ?? seedVehicles,
  reviews: local.reviews ?? [],
  inquiries: local.inquiries ?? [],
};

async function main() {
  for (const [table, rows] of Object.entries(data)) {
    if (!rows.length) continue;
    const { error } = await db.from(table).upsert(rows);
    if (error) {
      console.error(`${table}: ${error.message}`);
      process.exit(1);
    }
    console.log(`${table}: ${rows.length} rows`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
