import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { seedLocations, seedSettings, seedTours, seedVehicles } from "@/content/seed";
import type { TableName, Tables } from "@/lib/types";
import type { Store } from "./types";

// Development fallback: a JSON file on disk, seeded from src/content/seed.ts.
type DB = { [K in TableName]: Tables[K][] };

const FILE = path.join(process.cwd(), ".data", "db.json");
const UPLOADS = path.join(process.cwd(), "public", "uploads");

const seed = (): DB => ({
  locations: seedLocations,
  tours: seedTours,
  vehicles: seedVehicles,
  reviews: [],
  inquiries: [],
  settings: [seedSettings],
});

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<DB> {
  try {
    return { ...seed(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    return seed();
  }
}

async function write(db: DB) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

/** Serialize read-modify-write cycles so concurrent requests don't clobber each other. */
function mutate(fn: (db: DB) => void) {
  const next = queue.then(async () => {
    const db = await read();
    fn(db);
    await write(db);
  });
  queue = next.catch(() => {});
  return next;
}

export const localStore: Store = {
  async all(table) {
    return (await read())[table];
  },
  async get(table, id) {
    return ((await read())[table] as { id: string }[]).find((r) => r.id === id) as never;
  },
  async upsert(table, row) {
    await mutate((db) => {
      const rows = db[table] as { id: string }[];
      const i = rows.findIndex((r) => r.id === row.id);
      if (i >= 0) rows[i] = row;
      else rows.push(row);
    });
  },
  async remove(table, id) {
    await mutate((db) => {
      (db[table] as { id: string }[]) = (db[table] as { id: string }[]).filter((r) => r.id !== id);
    });
  },
  async upload(file) {
    await fs.mkdir(UPLOADS, { recursive: true });
    const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".jpg";
    const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    await fs.writeFile(path.join(UPLOADS, name), Buffer.from(await file.arrayBuffer()));
    return `/uploads/${name}`;
  },
};
