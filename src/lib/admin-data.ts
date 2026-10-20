import type { Inquiry, Location, Tour, Vehicle } from "./types";

export function inquiryDetails(locations: Location[], tours: Tour[], vehicles: Vehicle[]) {
  return (i: Inquiry) => ({
    tour: tours.find((t) => t.id === i.tour_id)?.title.ru,
    vehicle: vehicles.find((v) => v.id === i.vehicle_id)?.name.ru,
    locations: i.location_ids.map((id) => locations.find((l) => l.id === id)?.title.ru).filter((x): x is string => !!x),
  });
}
