const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
// ─── Helpers ──────────────────────────────────────────────────────────────────
async function request(path, init) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });
    if (!res.ok) {
        const body = (await res.json().catch(() => ({ error: res.statusText })));
        throw new Error(body.error ?? res.statusText);
    }
    return res.json();
}
// ─── Health / Warm-up ───────────────────────────────────────────────────────
export async function wakeApi() {
    try {
        await fetch(`${BASE_URL}/health`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
    }
    catch {
        // Ignore warm-up failures; the app will retry on actual requests.
    }
}
// ─── Cars ─────────────────────────────────────────────────────────────────────
export function listCars(params = {}) {
    const query = new URLSearchParams();
    if (params.page !== undefined)
        query.set("page", String(params.page));
    if (params.limit !== undefined)
        query.set("limit", String(params.limit));
    if (params.search)
        query.set("search", params.search);
    if (params.segment)
        query.set("segment", params.segment);
    if (params.fuelType)
        query.set("fuelType", params.fuelType);
    if (params.transmission)
        query.set("transmission", params.transmission);
    if (params.minPriceLakh !== undefined)
        query.set("minPriceLakh", String(params.minPriceLakh));
    if (params.maxPriceLakh !== undefined)
        query.set("maxPriceLakh", String(params.maxPriceLakh));
    if (params.tags)
        query.set("tags", params.tags);
    const qs = query.toString();
    return request(`/cars${qs ? `?${qs}` : ""}`);
}
export function getCarById(id) {
    return request(`/cars/${id}`);
}
export function compareCars(ids) {
    return request(`/compare?ids=${ids.join(",")}`);
}
// ─── Recommendations ──────────────────────────────────────────────────────────
export function getRecommendations(input) {
    return request("/recommend", {
        method: "POST",
        body: JSON.stringify(input),
    });
}
