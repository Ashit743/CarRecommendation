import type {
  Car,
  QuestionnaireInput,
  RecommendationResult,
  Review,
} from "@car-app/shared";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

export type CarWithReviews = Car & { reviews: Review[] };

export type PaginatedCarsResponse = {
  items: CarWithReviews[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ListCarsParams = {
  page?: number;
  limit?: number;
  search?: string;
  segment?: string;
  fuelType?: string;
  transmission?: string;
  minPriceLakh?: number;
  maxPriceLakh?: number;
  tags?: string;
};

export type CompareResponse = {
  cars: CarWithReviews[];
  highlights: {
    bestSafetyCarId: number;
    bestValueCarId: number;
    bestEfficiencyCarId: number;
  };
  commonTags: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as { error?: string };
    throw new Error(body.error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

// ─── Health / Warm-up ───────────────────────────────────────────────────────

export async function wakeApi(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore warm-up failures; the app will retry on actual requests.
  }
}

// ─── Cars ─────────────────────────────────────────────────────────────────────

export function listCars(params: ListCarsParams = {}): Promise<PaginatedCarsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.segment) query.set("segment", params.segment);
  if (params.fuelType) query.set("fuelType", params.fuelType);
  if (params.transmission) query.set("transmission", params.transmission);
  if (params.minPriceLakh !== undefined) query.set("minPriceLakh", String(params.minPriceLakh));
  if (params.maxPriceLakh !== undefined) query.set("maxPriceLakh", String(params.maxPriceLakh));
  if (params.tags) query.set("tags", params.tags);

  const qs = query.toString();
  return request<PaginatedCarsResponse>(`/cars${qs ? `?${qs}` : ""}`);
}

export function getCarById(id: number): Promise<CarWithReviews> {
  return request<CarWithReviews>(`/cars/${id}`);
}

export function compareCars(ids: number[]): Promise<CompareResponse> {
  return request<CompareResponse>(`/compare?ids=${ids.join(",")}`);
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function getRecommendations(input: QuestionnaireInput): Promise<RecommendationResult> {
  return request<RecommendationResult>("/recommend", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
