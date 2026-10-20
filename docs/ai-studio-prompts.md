# Промпты для Google AI Studio — кадры для главного экрана

Главный экран — это «кинопролёт» из трёх глав: **Genting Highlands (рассвет) → Batu Caves (золотой час) → KLCC (синий час)**. Движок уже готов (`src/components/site/hero/cinematic-hero.tsx`). Пока кадров нет, на сайте показывается нарисованный hero.

## Как генерировать

1. Откройте [Google AI Studio](https://aistudio.google.com) → генерация изображений → модель **Nano Banana Pro (Gemini 3 Pro Image)**.
2. Горизонтальные кадры: формат **16:9**, разрешение **4K**. Если 4K доступно только с оплатой — 2K, но не меньше **2560 px** по ширине.
3. Сделайте по 3–4 варианта на промпт и выберите самый точный (чек-лист ниже).
4. Вертикальную версию (**9:16**) делайте **редактированием**, а не новым промптом: загрузите выбранный горизонтальный кадр в чат и дайте промпт «tall». Тогда свет и стиль совпадут.
5. Видео необязательны. Если хотите: **Veo 3.1** (или новее), 16:9, 1080p, 8 секунд, начинать с готового кадра (загрузить его как исходное изображение). Звук не нужен — на сайте видео без звука.

### Чек-лист перед тем, как сохранить
- Петронас: **две одинаковые** башни и **мост** между ними, без лишних башен.
- Batu Caves: **золотая статуя** и **радужная лестница**, вход в пещеру сверху.
- Genting: кабинки висят **на одном тросе**, пагода в **9 ярусов**.
- Нет надписей, логотипов, водяных знаков, искажённых лиц и рук.
- Слева (на горизонтальных) и внизу (на вертикальных) спокойная зона: там будет текст.

### Куда положить файлы
Папка `assets-incoming/` в корне проекта (она не попадает в git). Имена:

| Файл | Что это |
| --- | --- |
| `genting-wide`, `genting-tall` | Глава 1 |
| `batu-wide`, `batu-tall` | Глава 2 |
| `klcc-wide`, `klcc-tall` | Глава 3 |
| `clouds` *(необязательно)* | Облака для переходов |
| `genting-loop.mp4`, `batu-loop.mp4`, `klcc-loop.mp4` *(необязательно)* | Видео-петли |
| `og` *(необязательно)* | Картинка для превью ссылок в Telegram |

Форматы: PNG или JPG. После этого скрипт `scripts/prepare-hero.ts` уменьшит кадры и положит в `src/assets/hero/`, а в `src/content/hero.ts` подключатся главы.

---

## STYLE — добавляйте в конец каждого промпта картинки

> Photorealistic cinematic travel film still, shot on ARRI Alexa 65 with an anamorphic lens, natural film grain, gentle teal-and-orange grade, volumetric light, soft atmospheric haze, high dynamic range, crisp detail. No text, no logos, no watermarks, no visible people in the foreground.

## 1. Genting Highlands — рассвет над облаками

**genting-wide (16:9)**

> Aerial drone view at sunrise above Genting Highlands, Malaysia. A sea of soft white clouds fills the valleys; dark green rainforest ridges of the Titiwangsa mountains rise above it. The Awana Skyway cable car line runs diagonally from the upper right to the lower left, with five small gondola cabins (red and white) gliding over the jungle canopy. On a ridge on the right stands the white nine-tier Chin Swee Temple pagoda with red roofs, lit by the first warm sun. Low golden sunrise light from the right, pastel peach and pale blue sky, wisps of mist between the trees. Calm, majestic, strong sense of altitude. Keep the left third of the frame calm and uncluttered (sky and clouds) for title text. + STYLE

**genting-tall (9:16, редактированием genting-wide)**

> Recompose this exact scene as a vertical 9:16 frame for a phone screen. Keep the same light, colors and style. The cable car line runs from the top right toward the bottom left, the pagoda sits in the middle on its ridge, the sea of clouds fills the bottom quarter. Keep the bottom 25% calm (clouds only) for captions.

## 2. Batu Caves — золотой час

**batu-wide (16:9)**

> Cinematic wide shot of Batu Caves in Selangor, Malaysia, at golden hour. The giant golden statue of Lord Murugan (about 43 m tall) stands in front of a massive limestone cliff draped in tropical greenery. Next to the statue, the steep staircase of 272 steps, painted in vivid rainbow colors, climbs to the dark mouth of the cave high in the cliff. Warm low sun from the left makes the gold glow, light haze, a few birds in the sky, the plaza almost empty. Accurate architecture and realistic scale. Place the statue and stairs center-right; keep the left third calmer for title text. + STYLE

**batu-tall (9:16, редактированием batu-wide)**

> Recompose this exact scene as a vertical 9:16 frame: a low angle looking up the rainbow staircase toward the cave entrance, the golden statue rising along the left edge, the limestone cliff behind. Same golden-hour light and style. Keep the bottom 25% (the base of the stairs) calm for captions.

## 3. KLCC — синий час

**klcc-wide (16:9)**

> Cinematic wide shot of the Petronas Twin Towers in Kuala Lumpur at blue hour, seen from KLCC Park across the lake. The towers are depicted accurately: two identical 88-storey stainless-steel towers with tapering stepped tops and spires, joined by the double-deck skybridge at the 41st–42nd floors supported by angled struts, lit in warm white light. Deep blue twilight sky with a last band of orange on the horizon, surrounding skyscrapers with lit windows, the towers reflected in the calm water, palm trees silhouetted in the foreground. Calm, luxurious, metropolitan mood. Place the towers center-right; keep the left third calmer for title text. + STYLE

**klcc-tall (9:16, редактированием klcc-wide)**

> Recompose this exact scene as a vertical 9:16 frame: the twin towers run up the center from the reflecting lake at the bottom to the spires near the top edge. Same blue-hour light and style. Keep the bottom 25% (water and reflections) calm for captions.

## 4. Облака для переходов — необязательно (16:9)

> Dense billowing white clouds and mist isolated on a pure black background, soft volumetric edges, photorealistic, spread across the whole frame with a few gaps, no ground, no sky color, no text.

## 5. Видео-петли Veo — необязательно (начинать с кадра wide)

**genting-loop**

> Very slow, steady drone push-in over the sea of clouds at sunrise. The cable car gondolas glide slowly along the cable, mist drifts gently between the ridges. Smooth motion, no camera shake, no cuts, no text. Subtle movement so the clip can loop.

**batu-loop**

> Very slow upward camera tilt along the rainbow staircase at golden hour toward the cave entrance. Birds cross the sky, warm haze shimmers, the golden statue glows. No cuts, no text, no people close to the camera.

**klcc-loop**

> Locked-off tripod shot of the Petronas Twin Towers at blue hour turning into night. The tower lights brighten, city windows twinkle, clouds drift slowly across the sky like a gentle timelapse, soft ripples on the lake. No cuts, no text.

## 6. Превью для соцсетей — необязательно (16:9)

> Wide cinematic panorama for a travel brand banner: on the left, misty Genting Highlands mountains with a red cable car gondola; on the right, the illuminated Petronas Twin Towers skyline at dusk; warm golden light blending into blue hour; generous empty space in the center for a title. + STYLE
