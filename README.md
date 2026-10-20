# Destin Asia

Сайт гид-сервиса по Малайзии для туристов из Узбекистана, Казахстана и СНГ. Языки: русский (`/ru`) и узбекский (`/uz`).

**Стек:** Next.js 16 (App Router) · Tailwind CSS 4 · framer-motion · Supabase (Postgres + Storage) · Vercel.

## Запуск локально

```bash
npm install
cp .env.example .env.local   # задайте ADMIN_PASSWORD и ADMIN_SECRET
npm run dev
```

- Сайт: http://localhost:3000 (сам перенаправит на `/ru` или `/uz` по языку браузера)
- Админка: http://localhost:3000/admin — пароль из `ADMIN_PASSWORD`

Пока Supabase не подключён, данные хранятся в `.data/db.json`, а фото — в `public/uploads/`. Это только для разработки: на Vercel файлы не сохраняются.

## Подключение Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. **SQL Editor** → вставьте и выполните `supabase/migrations/0001_init.sql` (таблицы + bucket `media` для фото).
3. **Settings → API** → скопируйте `Project URL` и `service_role` key в `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
   `service_role` — секретный ключ, только на сервере. Никогда не публикуйте его.
4. Залейте контент: `npm run seed:supabase` (берёт `.data/db.json`, если вы уже что-то правили локально, иначе — `src/content/seed.ts`).
   Фото, загруженные локально в `/uploads`, перезагрузите через админку — они не переносятся.

Все запросы к базе идут с сервера Next.js. RLS включён без политик, поэтому публичный anon-ключ не даёт доступа к данным.

## Деплой на Vercel

1. Залейте репозиторий на GitHub → **Import Project** в Vercel.
2. В **Environment Variables** добавьте `ADMIN_PASSWORD`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL` (например `https://destin.asia`), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` и, по желанию, `NEXT_PUBLIC_CARTO_KEY`.
3. **Settings → Domains** → подключите свой домен.

После сохранения в админке страницы сайта обновляются сразу (плюс автоматически каждые 5 минут).

## Карты

Карта локаций (`src/components/site/region-map.tsx`), карточка на странице локации (`src/components/ui/expanded-map.tsx`, компонент с 21st.dev) и мини-карта в hero используют растровые тайлы (`src/lib/tiles.ts`):

- с ключом `NEXT_PUBLIC_CARTO_KEY` — светлые и тёмные стили CARTO. Ключ бесплатный: [carto.com/basemaps/apikey](https://carto.com/basemaps/apikey/), коммерческое использование — до 1 млн запросов в месяц;
- без ключа — тайлы OpenStreetMap. Подходят для запуска, но для продакшена лучше CARTO: без ключа CARTO показывает заглушку «API KEY REQUIRED».

Подписи «© OpenStreetMap contributors» (и «© CARTO») обязательны и уже выводятся.

## Главный экран

- `src/content/hero.ts` — конфиг кино-hero (три главы: Genting → Batu Caves → KLCC). Пока там `null`, показывается нарисованный hero.
- Кадры генерируются в Google AI Studio по промптам из [docs/ai-studio-prompts.md](docs/ai-studio-prompts.md) и кладутся в `assets-incoming/`.
- `npx tsx scripts/prepare-hero.ts` уменьшает их и складывает в `src/assets/hero/`; затем главы прописываются в `src/content/hero.ts`.

## Живой фон

Фон с Куала-Лумпуром (`src/components/site/ambient/`) виден в «окнах» между разделами. Время суток стартует с текущего времени в KL, а полный день проходит за 8 минут (`CYCLE_MS` в `sky.ts`). Анимация работает, только пока окно на экране. В dev-режиме можно проверить фазы: `?skyPhase=0.9` (ночь), `?skyPhase=0.5` (день), `?skySpeed=30` (ускорить).

## Структура

| Путь | Что там |
| --- | --- |
| `src/app/[lang]/` | Публичные страницы: главная, локации, туры, транспорт, конструктор, о нас, контакты |
| `src/app/admin/` | Админка: заявки, локации, туры, машины, отзывы, настройки |
| `src/components/site/hero/` | Главный экран: кино-hero на фото и запасной SVG-hero |
| `src/components/site/region-map.tsx` | Карта локаций с маршрутами туров |
| `src/components/site/ambient/` | Живой фон: KLCC, канатка, смена дня и ночи |
| `src/dictionaries/` | Тексты интерфейса RU/UZ |
| `src/content/seed.ts` | Стартовый контент (перенесён с base44) |
| `src/lib/store/` | Хранилище: Supabase или локальный JSON |

Тексты локаций и туров хранятся сразу на двух языках (`{ ru, uz }`); если узбекский пуст, показывается русский.
Чтобы добавить язык (например, казахский), добавьте его в `LOCALES` (`src/lib/types.ts`), словарь в `src/dictionaries/` и поле в редакторах админки.
