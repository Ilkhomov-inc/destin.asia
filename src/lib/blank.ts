import type { Location, Tour, Vehicle } from "./types";

const L = () => ({ ru: "", uz: "" });
const LL = () => ({ ru: [], uz: [] });
const now = () => new Date().toISOString();

export const blankLocation = (sort: number): Location => ({
  id: crypto.randomUUID(), slug: "", title: L(), region: "Kuala Lumpur", category: "city", short: L(), description: L(), highlights: LL(),
  duration: L(), price_note: L(), travel_min: null, visit_hours: 1.5, lat: null, lng: null, cover: "", images: [], status: "draft", sort, created_at: now(),
});

export const blankTour = (sort: number): Tour => ({
  id: crypto.randomUUID(), slug: "", kind: "ready", title: L(), short: L(), description: L(), duration_days: 1, price_from: null, price_note: L(), cover: "", images: [],
  included: LL(), not_included: LL(), program: [], location_ids: [], featured: false, status: "draft", sort, created_at: now(),
});

export const blankVehicle = (sort: number): Vehicle => ({
  id: crypto.randomUUID(), name: L(), vclass: "mpv", examples: "", seats: 6, luggage: 4, description: L(), features: LL(), image: "",
  price_hour: null, price_day: null, price_transfer: null, status: "draft", sort, created_at: now(),
});
