export const LOCALES = ["ru", "uz"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

/** A string stored in both site languages. */
export type L = { ru: string; uz: string };
/** A list of strings stored in both site languages. */
export type LList = { ru: string[]; uz: string[] };

export type Status = "published" | "draft";

export const CATEGORIES = [
  "city",
  "temple",
  "mosque",
  "nature",
  "caves",
  "museum",
  "food",
  "shopping",
  "waterpark",
  "history",
  "park",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Location = {
  id: string;
  slug: string;
  title: L;
  region: string;
  category: Category;
  short: L;
  description: L;
  highlights: LList;
  /** Free text such as "2–3 часа". */
  duration: L;
  /** Prices / tickets note. */
  price_note: L;
  /** Drive time from KLCC in minutes. */
  travel_min: number | null;
  /** Approx. visit length in hours, used by the tour builder. */
  visit_hours: number;
  lat: number | null;
  lng: number | null;
  cover: string;
  images: string[];
  status: Status;
  sort: number;
  created_at: string;
};

export type ProgramDay = { day: number; title: L; text: L };

export type Tour = {
  id: string;
  slug: string;
  kind: "ready" | "custom";
  title: L;
  short: L;
  description: L;
  duration_days: number;
  /** Price per group in USD, null = on consultation. */
  price_from: number | null;
  price_note: L;
  cover: string;
  images: string[];
  included: LList;
  not_included: LList;
  program: ProgramDay[];
  /** Ordered route. */
  location_ids: string[];
  featured: boolean;
  status: Status;
  sort: number;
  created_at: string;
};

export const VEHICLE_CLASSES = ["sedan", "mpv", "premium", "van", "bus"] as const;
export type VehicleClass = (typeof VEHICLE_CLASSES)[number];

export type Vehicle = {
  id: string;
  name: L;
  vclass: VehicleClass;
  examples: string;
  seats: number;
  luggage: number;
  description: L;
  features: LList;
  image: string;
  /** USD, null = on request. */
  price_hour: number | null;
  price_day: number | null;
  price_transfer: number | null;
  status: Status;
  sort: number;
  created_at: string;
};

export type Review = {
  id: string;
  name: string;
  country: string;
  text: string;
  rating: number;
  photo: string;
  tour_id: string | null;
  status: Status;
  created_at: string;
};

export const INQUIRY_STATUSES = ["new", "in_progress", "done", "spam"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export type Inquiry = {
  id: string;
  name: string;
  contact: string;
  channel: "telegram" | "whatsapp" | "phone";
  lang: Locale;
  people: number | null;
  date_from: string | null;
  date_to: string | null;
  days: number | null;
  tour_id: string | null;
  location_ids: string[];
  vehicle_id: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  note: string;
  created_at: string;
};

export type Settings = {
  id: string;
  phone: string;
  email: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  address: string;
  hero_title: L;
  hero_subtitle: L;
  about: L;
  about_extra: L;
  about_image: string;
  /** How many units of a currency equal 1 USD. */
  rates: { MYR: number; UZS: number; KZT: number };
};

export type Tables = {
  locations: Location;
  tours: Tour;
  vehicles: Vehicle;
  reviews: Review;
  inquiries: Inquiry;
  settings: Settings;
};
export type TableName = keyof Tables;
