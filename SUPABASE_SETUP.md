# Настройка Supabase и деплой на Vercel — пошаговая инструкция для новичка

Это приложение по умолчанию работает на локальной SQLite-базе (Prisma). Ниже —
как перенести его на **Supabase** (Postgres + Storage + Auth) и выложить на
**Vercel**. Все шаги бесплатные.

> Архитектура: публичная часть рендерится на сервере (Next.js RSC). Данные
> читаются через Prisma. Запись (админка) тоже через Prisma, защищена
> логином/паролем. RLS-политики ниже включают «публичное чтение / запись только
> для админа» как защиту «вглубь» и на будущее (если захотите ходить в базу с
> anon-ключа прямо из браузера).

---

## Содержание
1. Создать проект Supabase
2. Вариант A (рекомендуемый): Prisma + Postgres от Supabase
3. Вариант B: таблицы вручную (SQL) — если хочется без Prisma
4. Включить RLS и добавить политики (SQL)
5. Хранилище фото (Supabase Storage) + правка роута загрузки
6. Авторизация админа через Supabase Auth (опционально)
7. Деплой на Vercel
8. Создать аккаунт администратора
9. Запуск локально

---

## 1. Создать проект Supabase

1. Зарегистрируйтесь на https://supabase.com (вход через GitHub).
2. Нажмите **New project**. Выберите имя (например `voyage`), пароль для БД,
   регион (ближе к аудитории — `Frankfurt` для СНГ/Европы).
3. Дождитесь окончания инициализации (~2 минуты).

---

## 2. Вариант A (рекомендуемый): Prisma + Postgres

В этом варианте **ничего переписывать не нужно** — Prisma умеет работать с
Postgres и сама создаст все таблицы.

### 2.1. Получите connection string
В Supabase: **Project Settings → Database → Connection string → URI**.
Используйте **Session pooler** (порт `5432`, без pgbouncer), если не уверены.
Получите строку вида:
```
postgresql://postgres:ВAШ_ПАРОЛЬ@db.ВАШПРОЕКТ.supabase.co:5432/postgres
```

### 2.2. Поменяйте provider в `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"   // было "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2.3. Задайте `DATABASE_URL` в `.env`
```
DATABASE_URL="postgresql://postgres:ВAШ_ПАРОЛЬ@db.ВАШПРОЕКТ.supabase.co:5432/postgres"
```

### 2.4. Создайте таблицы и залейте демо-данные
```bash
bun run db:push        # Prisma создаст все таблицы в Postgres
bun run db:seed        # зальёт 3 демо-локации и 2 тура
```

Готово — приложение работает на Supabase. RLS (раздел 4) включается отдельно.

> Совет: для продакшена сохраняйте URL в переменных окружения Vercel, а не в `.env`.

---

## 3. Вариант B: таблицы вручную (SQL)

Если не хотите использовать Prisma (или хотите видеть схему глазами),
выполните этот SQL в **SQL Editor** Supabase. Он создаёт те же таблицы.

```sql
-- Локации
create table if not exists "Location" (
  id text primary key,
  slug text unique not null,
  title text not null,
  region text not null default '—',
  category text not null default '—',
  "shortDescription" text not null default '',
  description text not null default '',
  "bestSeason" text not null default '',
  "whatToSee" text not null default '[]',          -- JSON-массив
  status text not null default 'PUBLISHED',        -- PUBLISHED | DRAFT
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "Location_region_idx" on "Location"(region);
create index if not exists "Location_category_idx" on "Location"(category);

create table if not exists "LocationImage" (
  id text primary key,
  "locationId" text not null references "Location"(id) on delete cascade,
  url text not null,
  "order" integer not null default 0
);
create index if not exists "LocationImage_locationId_idx" on "LocationImage"("locationId");

-- Туры
create table if not exists "Tour" (
  id text primary key,
  slug text unique not null,
  title text not null,
  type text not null,                 -- BASIC | INDIVIDUAL
  description text not null default '',
  "durationDays" integer not null default 1,
  price text not null default '',
  "startDate" text,
  included text not null default '[]',      -- JSON
  "notIncluded" text not null default '[]', -- JSON
  "programDays" text not null default '[]', -- JSON
  status text not null default 'PUBLISHED',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "Tour_type_idx" on "Tour"(type);
create index if not exists "Tour_status_idx" on "Tour"(status);

create table if not exists "TourImage" (
  id text primary key,
  "tourId" text not null references "Tour"(id) on delete cascade,
  url text not null,
  "order" integer not null default 0
);
create index if not exists "TourImage_tourId_idx" on "TourImage"("tourId");

-- Связь тур ↔ локация (many-to-many)
create table if not exists "TourLocation" (
  id text primary key,
  "tourId" text not null references "Tour"(id) on delete cascade,
  "locationId" text not null references "Location"(id) on delete cascade,
  "order" integer not null default 0
);
create unique index if not exists "TourLocation_tourId_locationId_key"
  on "TourLocation"("tourId", "locationId");

-- Заявки (публичная форма). Чтение только для админа!
create table if not exists "Inquiry" (
  id text primary key,
  name text not null,
  contact text not null,
  message text not null default '',
  "tourId" text references "Tour"(id) on delete set null,
  status text not null default 'NEW',          -- NEW | PROCESSED
  "createdAt" timestamptz not null default now()
);
create index if not exists "Inquiry_status_idx" on "Inquiry"(status);
create index if not exists "Inquiry_createdAt_idx" on "Inquiry"("createdAt");

-- Настройки сайта (одна строка)
create table if not exists "SiteSettings" (
  id text primary key default 'singleton',
  "siteName" text not null default 'Вояж',
  tagline text not null default '',
  phone text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  telegram text not null default '',
  address text not null default '',
  instagram text,
  facebook text,
  youtube text,
  "aboutText" text not null default '',
  "heroImage" text,
  "updatedAt" timestamptz not null default now()
);

-- Начальная строка настроек
insert into "SiteSettings" (id, "siteName", tagline, "aboutText")
values ('singleton', 'Вояж', 'Авторские путешествия', '')
on conflict (id) do nothing;
```

---

## 4. Включить RLS и добавить политики

RLS (Row Level Security) позволяет сделать **публичное чтение** и
**запись только для админа**. Выполните в SQL Editor:

```sql
-- Включаем RLS на всех таблицах
alter table "Location"       enable row level security;
alter table "LocationImage"  enable row level security;
alter table "Tour"           enable row level security;
alter table "TourImage"      enable row level security;
alter table "TourLocation"   enable row level security;
alter table "Inquiry"        enable row level security;
alter table "SiteSettings"   enable row level security;

-- === ПОЛИТИКИ ЧТЕНИЯ (публичные) ===
-- Локации и туры: видны только опубликованные
create policy "public read published locations"
  on "Location" for select to anon, authenticated
  using (status = 'PUBLISHED');

create policy "public read published tours"
  on "Tour" for select to anon, authenticated
  using (status = 'PUBLISHED');

-- Картинки, связи и настройки: публичное чтение
-- (приложение само фильтрует черновики по родительской записи)
create policy "public read location images"
  on "LocationImage" for select to anon, authenticated using (true);

create policy "public read tour images"
  on "TourImage" for select to anon, authenticated using (true);

create policy "public read tour locations"
  on "TourLocation" for select to anon, authenticated using (true);

create policy "public read site settings"
  on "SiteSettings" for select to anon, authenticated using (true);

-- Заявки: публичное ЧТЕНИЕ ЗАПРЕЩЕНО (только админ).
-- Публичная вставка заявок делается через service-role ключ на сервере
-- (роут /api/inquiries), который обходит RLS. Можно разрешить публичную
-- вставку напрямую в таблицу — раскомментируйте:
-- create policy "public insert inquiries"
--   on "Inquiry" for insert to anon with check (true);

-- === ПОЛИТИКИ ЗАПИСИ (только авторизованный админ) ===
-- Здесь 'authenticated' = любой залогиненный в Supabase Auth пользователь.
-- Чтобы пускать ТОЛЬКО конкретного админа, см. политику по email ниже.

create policy "admin write locations"
  on "Location" for all to authenticated
  using (true) with check (true);

create policy "admin write location images"
  on "LocationImage" for all to authenticated
  using (true) with check (true);

create policy "admin write tours"
  on "Tour" for all to authenticated
  using (true) with check (true);

create policy "admin write tour images"
  on "TourImage" for all to authenticated
  using (true) with check (true);

create policy "admin write tour locations"
  on "TourLocation" for all to authenticated
  using (true) with check (true);

create policy "admin write inquiries"
  on "Inquiry" for all to authenticated
  using (true) with check (true);

create policy "admin write site settings"
  on "SiteSettings" for all to authenticated
  using (true) with check (true);

-- (Опционально) Ограничить запись только конкретным email-админом:
-- Замените 'admin@yoursite.com' на email, который зарегистрируете в Supabase Auth.
-- create policy "only admin email can write locations"
--   on "Location" for all to authenticated
--   using (auth.jwt() ->> 'email' = 'admin@yoursite.com')
--   with check (auth.jwt() ->> 'email' = 'admin@yoursite.com');
-- (повторить для остальных таблиц)
```

**Что важно знать про RLS и Prisma:**
- Если приложение ходит в базу через Prisma с connection string (роль `postgres`
  / service role), **RLS не применяется** — service-role обходит RLS. Поэтому
  вся защита от публичного доступа в этом проекте держится на серверной логике
  (публичные запросы фильтруют `status='PUBLISHED'`, админские — за middleware).
- RLS из пункта выше включается «на будущее» и для случая, если вы решите
  ходить в базу с **anon-ключа** прямо из браузера (тогда политики реально
  ограничат доступ). Для текущей серверной архитектуры это защита вглубь.

---

## 5. Хранилище фото (Supabase Storage)

Локально фото сохраняются в `public/uploads/`. На Vercel файловая система
read-only, поэтому для продакшена нужен Storage.

### 5.1. Создать бакет
В Supabase: **Storage → New bucket**. Имя: `media`, **Public bucket: ON**
(чтобы фото открывались по прямой ссылке).

### 5.2. Политики бакета (SQL Editor)
```sql
-- Публичное чтение картинок
create policy "public read media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

-- Запись только для авторизованного админа
create policy "admin upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "admin update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

create policy "admin delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
```

### 5.3. Установить клиент и поправить роут загрузки
```bash
bun add @supabase/supabase-js
```
Добавьте в `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://ВАШПРОЕКТ.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # Project Settings → API → service_role
```
Замените тело `POST` в `src/app/api/admin/upload/route.ts` на версию со Storage:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'expected_multipart' }, { status: 400 })
  }
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'no_file' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
```
Интерфейс админки менять не нужно — ответ тот же `{ url }`.

---

## 6. Авторизация админа через Supabase Auth (опционально)

Сейчас вход в админку — по паролю из `ADMIN_PASSWORD` (cookie + HMAC).
Чтобы использовать **Supabase Auth** (email + пароль):

### 6.1. Создать пользователя-админа
Supabase → **Authentication → Users → Add user**: введите email, пароль,
поставьте **Auto Confirm User = ON**. Это и есть ваш админ.

### 6.2. Установить пакеты
```bash
bun add @supabase/ssr @supabase/supabase-js
```
В `.env` добавьте:
```
NEXT_PUBLIC_SUPABASE_URL=https://ВАШПРОЕКТ.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # Project Settings → API → anon public
```

### 6.3. Заменить `src/lib/auth.ts`
Создайте серверный клиент `src/lib/supabase-server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServer() {
  const store = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => store.set(name, value, options)),
      },
    }
  )
}
```
И обновите `auth.ts`:
```ts
import { supabaseServer } from '@/lib/supabase-server'
export async function isAuthenticated() {
  const supa = await supabaseServer()
  const { data: { user } } = await supa.auth.getUser()
  return !!user
}
// createSession/destroySession/verifyToken больше не нужны —
// сессией управляет Supabase через cookies.
```
Логин-API (`/api/auth/login`) замените на вызов `supabase.auth.signInWithPassword({ email, password })`.

> Если хотите пускать в админку только ОДНОГО email — добавьте проверку:
> `if (user.email !== 'admin@yoursite.com') return false` в `isAuthenticated()`.

---

## 7. Деплой на Vercel

1. Запушьте проект в GitHub (или GitLab/Bitbucket).
2. На https://vercel.com → **Add New → Project** → выберите репозиторий.
3. Framework Presel: **Next.js** (определится автоматически).
4. **Environment Variables** — добавьте все:
   | Имя | Значение |
   |---|---|
   | `DATABASE_URL` | connection string Supabase (из шага 2.1) |
   | `ADMIN_PASSWORD` | ваш пароль админа (длинный, сложный) |
   | `SESSION_SECRET` | случайная строка ≥32 символов (`openssl rand -hex 32`) |
   | `NEXT_PUBLIC_SITE_URL` | `https://ваш-домен.vercel.app` (после первого деплоя поменяйте на финальный) |
   | (опц.) `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | если используете Supabase Storage/Auth |
5. **Deploy**. После первого успешного деплоя Vercel даст домен `xxx.vercel.app`.
6. В Supabase: **Authentication → URL Configuration** — добавьте ваш домен
   Vercel в **Site URL** и **Redirect URLs** (если используете Supabase Auth).
7. Прогоните `bun run db:push` локально с тем же `DATABASE_URL`, чтобы таблицы
   существовали (если ещё не создавали), и `bun run db:seed` для демо-данных.

> На Vercel `bun run build` отработает автоматически. Prisma-клиент
> сгенерируется в `postinstall` (Prisma это делает сама).

---

## 8. Создать аккаунт администратора

Текущая схема (без Supabase Auth): «админ» — это просто знание пароля из
`ADMIN_PASSWORD`. Войти: откройте `https://ваш-домен.vercel.app/admin/login` и
введите пароль. Больше nobody с этим паролем ничего не сделает, если не знает
`SESSION_SECRET`.

Если используете **Supabase Auth**: пользователь создаётся в дашборде Supabase
(раздел 6.1). Логин — по email + паролю на `/admin/login`.

**Безопасность:**
- Никогда не коммитьте `.env` (он уже в `.gitignore` по умолчанию у Next).
- На Vercel переменные видны только вам.
- Поставьте `SESSION_SECRET` случайной строкой ≥32 символов.
- Поставьте сложный `ADMIN_PASSWORD`.

---

## 9. Запуск локально

```bash
# 1. Установить зависимости
bun install

# 2. Настроить .env (скопируйте из .env.example и заполните)
cp .env.example .env
# отредактируйте ADMIN_PASSWORD и SESSION_SECRET

# 3. Создать локальную SQLite-базу и залить демо-данные
bun run db:push
bun run db:seed

# 4. Запустить dev-сервер
bun run dev
# откройте http://localhost:3000
# админка: http://localhost:3000/admin/login (пароль из ADMIN_PASSWORD)
```

Для продакшена на Supabase просто поменяйте `DATABASE_URL` на строку Supabase
и `provider` в `prisma/schema.prisma` на `postgresql` (см. раздел 2).

---

## Шпаргалка по URL-адресам

| Что | URL |
|---|---|
| Главная | `/` |
| Все туры (вкладки) | `/tours` |
| Локация | `/locations/{slug}` (напр. `/locations/bali`) |
| Тур | `/tours/{slug}` (напр. `/tours/bali-7-days`) |
| О нас | `/about` |
| Контакты + форма заявки | `/contacts` |
| Вход в админку | `/admin/login` |
| Дашборд админки | `/admin` |
| Sitemap | `/sitemap.xml` |
| Robots | `/robots.txt` |
