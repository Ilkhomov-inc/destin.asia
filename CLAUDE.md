# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

This is Next.js 16.4 with React 19.3: before using any Next API, check `node_modules/next/dist/docs/`. For example, middleware is now `src/proxy.ts` and exports `proxy()`, not `middleware()`.

## Project

Destin Asia is a guide service site for Malaysia aimed at tourists from Uzbekistan, Kazakhstan and the CIS. It has a public site in Russian (`/ru`) and Uzbek (`/uz`) and a password-protected admin panel at `/admin`. The README and all UI copy are in Russian, so write admin-facing strings in Russian.

## Commands

```bash
npm run dev             # dev server on :3000
npm run build           # production build (also runs the type check)
npm run lint            # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit        # type check only
npm run seed:supabase   # push .data/db.json (or src/content/seed.ts) into Supabase; reads .env.local
npx tsx scripts/prepare-hero.ts   # resize hero frames from assets-incoming/ into src/assets/hero/
```

There is no test suite. Local setup: `cp .env.example .env.local` and set `ADMIN_PASSWORD` and `ADMIN_SECRET`.

## Architecture

**Storage abstraction (`src/lib/store/`).** `store` is either `supabaseStore` or `localStore`. It is Supabase when both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Otherwise it is a JSON file at `.data/db.json`, with uploads saved to `public/uploads/` (for dev only, since neither persists on Vercel). Both stores implement the same generic `Store` interface (`all/get/upsert/remove/upload`) over the tables listed in `Tables` in `src/lib/types.ts`. All DB access happens on the server through the service-role key. RLS is enabled with no policies, so the anon key gets nothing.

**Reads and writes.**
- Public pages read through `src/lib/data.ts`. It wraps reads in React `cache()`, keeps only `status === "published"` rows, sorts by `sort`, and merges the `settings` row (`id: "main"`) over `seedSettings`.
- Admin pages read through `src/lib/admin-data.ts`.
- All mutations are server actions: the public inquiry form is in `src/app/actions.ts` and every admin CRUD action is in `src/app/admin/actions.ts`. Each one validates with zod.
- Admin actions must call `requireAdmin()` first and finish with `revalidatePath("/", "layout")`.
- Public pages also use ISR (`revalidate = 300` in `[lang]/layout.tsx`) with `generateStaticParams` for locales and slugs.

**Adding or changing a table/field.** Update these together:
- the type in `src/lib/types.ts` (and `Tables`)
- the zod schema in `src/app/admin/actions.ts`
- `supabase/migrations/` SQL
- `src/content/seed.ts`
- the matching admin editor in `src/components/admin/`

**i18n.**
- `src/proxy.ts` redirects locale-less paths to `/ru` or `/uz`, using the `da_locale` cookie first and then Accept-Language.
- Content fields are bilingual objects: `L = { ru, uz }` and `LList`. Render them with `tr()` / `trList()` from `src/lib/i18n.ts`, which fall back to Russian when the Uzbek value is empty.
- Build internal links with `href(locale, path)`.
- UI strings live in `src/dictionaries/{ru,uz}.ts`. `ru.ts` defines the `Dict` type, so add each key to both files.
- To add a locale, add it to `LOCALES` in `src/lib/types.ts`, add a dictionary, and add fields in the admin editors.

**Admin auth.**
- `src/lib/session.ts` signs an HMAC token (`<expiry>.<hmac>`, keyed by `ADMIN_SECRET`) in the `da_admin` cookie. It uses Web Crypto so it works in both the proxy and node.
- The proxy guards `/admin/*` (except `/admin/login`), and server actions check again with `requireAdmin()`.

**Client-side state.** The visitor's "my tour" cart (`src/lib/cart.ts`) and the currency choice (`src/lib/use-currency.ts`) live in localStorage via `useSyncExternalStore`. Prices are stored in USD and converted with `formatPrice` using `settings.rates`.

**Visual pieces.**
- Maps use raster tiles from `src/lib/tiles.ts`: CARTO when `NEXT_PUBLIC_CARTO_KEY` is set, OSM otherwise. The attribution must stay visible.
- The cinematic hero is configured in `src/content/hero.ts`. When that config is `null`, a drawn SVG fallback hero is shown.

**Styling.** Tailwind CSS 4 is loaded through the `@tailwindcss/turbopack` loader (see `next.config.ts`; there is no postcss config). Design tokens are in `src/app/globals.css`. Use `cn()` from `src/lib/utils.ts` to merge class names. Animations use the `motion` package.

**Remote images** must be allowed in `images.remotePatterns` in `next.config.ts`. The server action body limit is raised to 12 MB to allow image uploads.
