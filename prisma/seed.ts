/**
 * Demo data seed script.
 * Run with: `bun run db:seed`
 *
 * Adds 3 demo locations (Bali, Kyoto, Santorini) and 2 demo tours, plus
 * default site settings. Re-runnable: upserts by slug / singleton id.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Helper: placeholder images (picsum.photos) so the demo looks real but is
// easy to replace from the admin panel later.
const img = (seed: string, w = 1200, h = 800) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

async function main() {
  // --- Site settings (singleton) ---
  await db.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'Вояж',
      tagline: 'Авторские путешествия по миру',
      phone: '+7 (000) 000-00-00',
      email: 'hello@voyage.example',
      whatsapp: '+70000000000',
      telegram: 'voyage_travel',
      address: 'г. Москва, ул. Примерная, д. 1',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      youtube: 'https://youtube.com/',
      aboutText:
        'Мы — команда увлечённых путешественников, которые превращают поездки в авторские истории. Уже 10 лет мы собираем лучшие маршруты по Азии и Европе и берём на себя всю организацию, чтобы вы просто наслаждались дорогой.',
      heroImage: img('hero-voyage', 1920, 1080),
    },
  })

  // --- Locations ---
  const bali = await db.location.upsert({
    where: { slug: 'bali' },
    update: {},
    create: {
      slug: 'bali',
      title: 'Бали',
      region: 'Азия',
      category: 'Острова',
      shortDescription: 'Изумрудные рисовые террасы, вулканы и теплое море — остров богов.',
      description:
        'Бали — это удивительное сочетание тропической природы, древней культуры и серфинг-пляжей. Здесь рисовые террасы Тегаллаланг соседствуют с индуистскими храмами, а на закате океан окрашивается в золотые тона. Идеальное место для тех, кто ищет баланс между приключениями и перезагрузкой.',
      bestSeason: 'Апрель — октябрь (сухой сезон)',
      whatToSee: JSON.stringify([
        'Рисовые террасы Тегаллаланг',
        'Храм Улувату на скале над океаном',
        'Вулкан Батур и рассвет на вершине',
        'Лес обезьян в Убуде',
        'Водопад Секумпул',
      ]),
      status: 'PUBLISHED',
      images: {
        create: [
          { url: img('bali-1'), order: 0 },
          { url: img('bali-2'), order: 1 },
          { url: img('bali-3'), order: 2 },
          { url: img('bali-4'), order: 3 },
        ],
      },
    },
  })

  const kyoto = await db.location.upsert({
    where: { slug: 'kyoto' },
    update: {},
    create: {
      slug: 'kyoto',
      title: 'Киото',
      region: 'Азия',
      category: 'Города',
      shortDescription: 'Древняя столица Японии: храмы, гейши и сады камней.',
      description:
        'Киото — душа традиционной Японии. Более тысячи буддийских храмов, синтоистские святилища, улочки Гион, где можно встретить гейш, и знаменитый сад камней Рёандзи. Город особенно прекрасен в сезон сакуры и осенней листвы.',
      bestSeason: 'Март–апрель (сакура) и ноябрь (клён)',
      whatToSee: JSON.stringify([
        'Золотой павильон Кинкаку-дзи',
        'Бамбуковая роща Арасияма',
        'Храм Фусими Инари и тысячи тории',
        'Район Гион и гейши',
        'Сад камней Рёандзи',
      ]),
      status: 'PUBLISHED',
      images: {
        create: [
          { url: img('kyoto-1'), order: 0 },
          { url: img('kyoto-2'), order: 1 },
          { url: img('kyoto-3'), order: 2 },
          { url: img('kyoto-4'), order: 3 },
        ],
      },
    },
  })

  const santorini = await db.location.upsert({
    where: { slug: 'santorini' },
    update: {},
    create: {
      slug: 'santorini',
      title: 'Санторини',
      region: 'Европа',
      category: 'Острова',
      shortDescription: 'Белые дома, синие купола и лучшие закаты в Эгейском море.',
      description:
        'Санторини — пост card из Греции: белоснежные дома на скалах кальдеры, синекупольные церкви и виды на вулкан. Города Ия и Фира предлагают самые романтичные закаты в Европе, а чёрные и красные пляжи острова дополняют картину.',
      bestSeason: 'Май — октябрь',
      whatToSee: JSON.stringify([
        'Закат в городе Ия',
        'Кальдера и виды на вулкан',
        'Красный и чёрный пляжи',
        'Древний город Акротири',
        'Виноградники ассиртико',
      ]),
      status: 'PUBLISHED',
      images: {
        create: [
          { url: img('santorini-1'), order: 0 },
          { url: img('santorini-2'), order: 1 },
          { url: img('santorini-3'), order: 2 },
          { url: img('santorini-4'), order: 3 },
        ],
      },
    },
  })

  // --- Tours ---
  const basicTour = await db.tour.upsert({
    where: { slug: 'bali-7-days' },
    update: {},
    create: {
      slug: 'bali-7-days',
      title: 'Бали: 7 дней в раю',
      type: 'BASIC',
      description:
        'Готовая программа на неделю: серфинг, храмы, вулкан и спа. Идеальный баланс активностей и отдыха на острове богов.',
      durationDays: 7,
      price: '1890 €',
      startDate: 'Ежемесячно, по запросу',
      included: JSON.stringify([
        'Проживание 7 ночей в отелях 4★',
        'Завтраки',
        'Все трансферы на острове',
        'Русскоговорящий гид',
        'Восхождение на вулкан Батур',
        'Экскурсия на рисовые террасы',
      ]),
      notIncluded: JSON.stringify([
        'Авиаперелёт до Денпасара',
        'Обеды и ужины',
        'Страховка',
        'Личные расходы',
      ]),
      programDays: JSON.stringify([
        {
          day: 1,
          title: 'Прилёт и знакомство с островом',
          description: 'Встреча в аэропорту, трансфер в отель, лёгкий ужин и отдых.',
        },
        {
          day: 2,
          title: 'Убуд и рисовые террасы',
          description: 'Лес обезьян, Тегаллаланг, обед в кафе с видом на джунгли.',
        },
        {
          day: 3,
          title: 'Восхождение на Батур',
          description: 'Ночной подъём к вулкану, встреча рассвета на вершине, горячие источники.',
        },
        {
          day: 4,
          title: 'Серфинг на Куте',
          description: 'Утренний урок серфинга, свободное время на пляже.',
        },
        {
          day: 5,
          title: 'Храмы юга',
          description: 'Улувату, танец кечак на закате, ужин с морепродуктами.',
        },
        {
          day: 6,
          title: 'Острова Нуса-Пенида',
          description: 'Однодневная поездка: Келингкинг, разбитое стекло, кристальная вода.',
        },
        {
          day: 7,
          title: 'Спа и отъезд',
          description: 'Утренний спа-ритуал, трансфер в аэропорт.',
        },
      ]),
      status: 'PUBLISHED',
      images: {
        create: [
          { url: img('tour-bali-1'), order: 0 },
          { url: img('tour-bali-2'), order: 1 },
          { url: img('tour-bali-3'), order: 2 },
        ],
      },
      locations: {
        create: [{ locationId: bali.id, order: 0 }],
      },
    },
  })

  await db.tour.upsert({
    where: { slug: 'japan-individual' },
    update: {},
    create: {
      slug: 'japan-individual',
      title: 'Индивидуальный тур по Японии',
      type: 'INDIVIDUAL',
      description:
        'Соберём ваш персональный маршрут по Японии под интересы и бюджет: от сакуры в Киото до неоновой Токио. Вы выбираете даты, длительность и приоритеты — мы берём организацию на себя.',
      durationDays: 10,
      price: 'от 2500 €',
      startDate: null,
      included: JSON.stringify([
        'Подбор и бронирование отелей',
        'Ж/д билеты (Japan Rail Pass)',
        'Подробный маршрут-гид по дням',
        'Поддержка 24/7 в поездке',
        'Встреча и трансфер на месте',
      ]),
      notIncluded: JSON.stringify([
        'Авиаперелёт',
        'Питание',
        'Входные билеты в достопримечательности',
      ]),
      programDays: JSON.stringify([
        {
          day: 1,
          title: 'Знакомство в Токио',
          description: 'Пример: прилёт, заселение, вечерняя прогулка по Сибуя.',
        },
        {
          day: 2,
          title: 'Токио по интересам',
          description: 'Музеи, районы, кухня — составим под вас.',
        },
      ]),
      status: 'PUBLISHED',
      images: {
        create: [
          { url: img('tour-japan-1'), order: 0 },
          { url: img('tour-japan-2'), order: 1 },
        ],
      },
      locations: {
        create: [{ locationId: kyoto.id, order: 0 }],
      },
    },
  })

  console.log('Seed completed. Locations:', { bali: bali.id, kyoto: kyoto.id, santorini: santorini.id }, 'Tour:', basicTour.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
