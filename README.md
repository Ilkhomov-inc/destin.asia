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
2. В **Environment Variables** добавьте `ADMIN_PASSWORD`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL` (например `https://destin.asia`), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **Settings → Domains** → подключите свой домен.

После сохранения в админке страницы сайта обновляются сразу (плюс автоматически каждые 5 минут).

## Структура

| Путь | Что там |
| --- | --- |
| `src/app/[lang]/` | Публичные страницы: главная, локации, туры, транспорт, конструктор, о нас, контакты |
| `src/app/admin/` | Админка: заявки, локации, туры, машины, отзывы, настройки |
| `src/components/site/hero/` | Главный экран «Genting Highlands → KLCC» (SVG-сцена + камера по скроллу) |
| `src/components/site/topo-map.tsx` | Топографическая карта локаций с маршрутами туров |
| `src/dictionaries/` | Тексты интерфейса RU/UZ |
| `src/content/seed.ts` | Стартовый контент (перенесён с base44) |
| `src/lib/store/` | Хранилище: Supabase или локальный JSON |

Тексты локаций и туров хранятся сразу на двух языках (`{ ru, uz }`); если узбекский пуст, показывается русский.
Чтобы добавить язык (например, казахский), добавьте его в `LOCALES` (`src/lib/types.ts`), словарь в `src/dictionaries/` и поле в редакторах админки.
