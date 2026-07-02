import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";

import type { FuelType, Segment, Transmission } from "@car-app/shared";
import { listCars } from "../api.js";
import type { CarWithReviews, PaginatedCarsResponse } from "../api.js";

// ─── Filter State ─────────────────────────────────────────────────────────────

export type BrowseFilters = {
  search: string;
  segment: Segment | "";
  fuelType: FuelType | "";
  transmission: Transmission | "";
  minPriceLakh: number;
  maxPriceLakh: number;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBrowseStore = defineStore("browse", () => {
  const filters = reactive<BrowseFilters>({
    search: "",
    segment: "",
    fuelType: "",
    transmission: "",
    minPriceLakh: 3,
    maxPriceLakh: 80,
  });

  const page = ref(1);
  const limit = ref(12);
  const response = ref<PaginatedCarsResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ─── Derived ────────────────────────────────────────────────────────────

  const cars = computed<CarWithReviews[]>(() => response.value?.items ?? []);
  const total = computed(() => response.value?.total ?? 0);
  const totalPages = computed(() => response.value?.totalPages ?? 1);

  // ─── Filter setters (safe for @input without inline ifs) ────────────────

  function setSearch(value: string) {
    filters.search = value;
    page.value = 1;
  }

  function setSegment(value: Segment | "") {
    filters.segment = value;
    page.value = 1;
  }

  function setFuelType(value: FuelType | "") {
    filters.fuelType = value;
    page.value = 1;
  }

  function setTransmission(value: Transmission | "") {
    filters.transmission = value;
    page.value = 1;
  }

  function setMinPrice(value: number) {
    filters.minPriceLakh = value;
    page.value = 1;
  }

  function setMaxPrice(value: number) {
    filters.maxPriceLakh = value;
    page.value = 1;
  }

  function setPage(value: number) {
    page.value = value;
  }

  function resetFilters() {
    filters.search = "";
    filters.segment = "";
    filters.fuelType = "";
    filters.transmission = "";
    filters.minPriceLakh = 3;
    filters.maxPriceLakh = 80;
    page.value = 1;
  }

  // ─── Fetch ───────────────────────────────────────────────────────────────

  async function fetchCars() {
    loading.value = true;
    error.value = null;
    try {
      response.value = await listCars({
        page: page.value,
        limit: limit.value,
        search: filters.search || undefined,
        segment: filters.segment || undefined,
        fuelType: filters.fuelType || undefined,
        transmission: filters.transmission || undefined,
        minPriceLakh: filters.minPriceLakh,
        maxPriceLakh: filters.maxPriceLakh,
      });
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : "Failed to load cars.";
    } finally {
      loading.value = false;
    }
  }

  return {
    filters,
    page,
    limit,
    cars,
    total,
    totalPages,
    loading,
    error,
    setSearch,
    setSegment,
    setFuelType,
    setTransmission,
    setMinPrice,
    setMaxPrice,
    setPage,
    resetFilters,
    fetchCars,
  };
});
