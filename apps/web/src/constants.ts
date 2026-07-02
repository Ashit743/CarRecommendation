import type { FuelType, Segment, Transmission } from "@car-app/shared";

// ─── Segment ─────────────────────────────────────────────────────────────────

export const SEGMENT_LABELS: Record<Segment, string> = {
  hatchback: "Hatchback",
  sedan: "Sedan",
  "compact-suv": "Compact SUV",
  "mid-suv": "Mid SUV",
  mpv: "MPV",
  ev: "EV",
};

export const SEGMENT_OPTIONS: { value: Segment; label: string }[] = (
  Object.keys(SEGMENT_LABELS) as Segment[]
).map((value) => ({ value, label: SEGMENT_LABELS[value] }));

// ─── Fuel Type ────────────────────────────────────────────────────────────────

export const FUEL_LABELS: Record<FuelType, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  cng: "CNG",
  hybrid: "Hybrid",
  electric: "Electric",
};

export const FUEL_OPTIONS: { value: FuelType; label: string }[] = (
  Object.keys(FUEL_LABELS) as FuelType[]
).map((value) => ({ value, label: FUEL_LABELS[value] }));

// ─── Transmission ─────────────────────────────────────────────────────────────

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automatic",
  amt: "AMT",
  cvt: "CVT",
  dct: "DCT",
};

export const TRANSMISSION_OPTIONS: { value: Transmission; label: string }[] = (
  Object.keys(TRANSMISSION_LABELS) as Transmission[]
).map((value) => ({ value, label: TRANSMISSION_LABELS[value] }));

// ─── Price ────────────────────────────────────────────────────────────────────

export const PRICE_RANGE_MIN = 3;
export const PRICE_RANGE_MAX = 80;

export function formatPriceLakh(lakh: number): string {
  return `₹${lakh.toFixed(2)} L`;
}

export function formatPriceRange(min: number, max: number): string {
  return `₹${min.toFixed(0)}L – ₹${max.toFixed(0)}L`;
}

// ─── Efficiency ───────────────────────────────────────────────────────────────

export function formatEfficiency(mileageKmpl: number | null, evRangeKm: number | null): string {
  if (evRangeKm !== null) return `${evRangeKm} km range`;
  if (mileageKmpl !== null) return `${mileageKmpl.toFixed(1)} kmpl`;
  return "—";
}

// ─── Safety Stars ─────────────────────────────────────────────────────────────

export function formatSafetyStars(stars: number): string {
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}

// ─── Feature priority presets ────────────────────────────────────────────────

export const FEATURE_PRIORITY_PRESETS = [
  "safety",
  "infotainment",
  "sunroof",
  "adas",
  "ventilated seats",
  "wireless charger",
  "heads-up display",
  "cruise control",
  "rear AC vents",
  "boot space",
] as const;
