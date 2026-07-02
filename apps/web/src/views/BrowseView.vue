<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import {
  FUEL_OPTIONS,
  SEGMENT_OPTIONS,
  TRANSMISSION_OPTIONS,
  formatEfficiency,
  formatPriceLakh,
  formatSafetyStars,
  PRICE_RANGE_MIN,
  PRICE_RANGE_MAX,
} from "../constants.js";
import { useBrowseStore } from "../stores/useBrowseStore.js";
import { useCompareStore } from "../stores/useCompareStore.js";

const router = useRouter();
const store = useBrowseStore();
const compareStore = useCompareStore();

const imageErrorMap = ref<Record<number, boolean>>({});

onMounted(() => {
  void store.fetchCars();
});

watch(() => [store.page, store.filters.segment, store.filters.fuelType, store.filters.transmission], () => {
  imageErrorMap.value = {};
  void store.fetchCars();
});

// ─── Input handlers (never inline ifs in @input) ───────────────────────────

function handleSearchInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  store.setSearch(target.value);
}

function handleSegmentChange(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  store.setSegment(target.value as Parameters<typeof store.setSegment>[0]);
}

function handleFuelChange(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  store.setFuelType(target.value as Parameters<typeof store.setFuelType>[0]);
}

function handleTransmissionChange(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  store.setTransmission(target.value as Parameters<typeof store.setTransmission>[0]);
}

function handleMinPriceInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const val = parseFloat(target.value);
  if (!Number.isNaN(val)) store.setMinPrice(val);
}

function handleMaxPriceInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const val = parseFloat(target.value);
  if (!Number.isNaN(val)) store.setMaxPrice(val);
}

function applySearch() {
  imageErrorMap.value = {};
  void store.fetchCars();
}

function goToDetail(id: number) {
  void router.push({ name: "car-detail", params: { id } });
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12">
    <h1 class="mb-8 text-3xl font-bold text-stone-100">
      Browse Cars
    </h1>

    <div class="flex gap-8">
      <!-- Filter sidebar -->
      <aside class="w-64 flex-shrink-0 space-y-6">
        <div class="rounded-2xl border border-stone-800 bg-stone-900/60 p-5">
          <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
            Filters
          </h2>

          <!-- Search -->
          <div class="mb-5">
            <label
              for="search-input"
              class="mb-1.5 block text-xs text-stone-400"
            >Search</label>
            <div class="flex gap-2">
              <input
                id="search-input"
                type="text"
                :value="store.filters.search"
                placeholder="e.g. Nexon"
                class="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-400 focus:outline-none"
                @input="handleSearchInput"
                @keyup.enter="applySearch"
              >
              <button
                class="rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-300 hover:bg-stone-700"
                @click="applySearch"
              >
                Go
              </button>
            </div>
          </div>

          <!-- Segment -->
          <div class="mb-4">
            <label
              for="filter-segment"
              class="mb-1.5 block text-xs text-stone-400"
            >Segment</label>
            <select
              id="filter-segment"
              :value="store.filters.segment"
              class="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-400 focus:outline-none"
              @change="handleSegmentChange"
            >
              <option value="">
                All
              </option>
              <option
                v-for="opt in SEGMENT_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Fuel -->
          <div class="mb-4">
            <label
              for="filter-fuel"
              class="mb-1.5 block text-xs text-stone-400"
            >Fuel Type</label>
            <select
              id="filter-fuel"
              :value="store.filters.fuelType"
              class="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-400 focus:outline-none"
              @change="handleFuelChange"
            >
              <option value="">
                All
              </option>
              <option
                v-for="opt in FUEL_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Transmission -->
          <div class="mb-4">
            <label
              for="filter-transmission"
              class="mb-1.5 block text-xs text-stone-400"
            >Transmission</label>
            <select
              id="filter-transmission"
              :value="store.filters.transmission"
              class="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-100 focus:border-amber-400 focus:outline-none"
              @change="handleTransmissionChange"
            >
              <option value="">
                All
              </option>
              <option
                v-for="opt in TRANSMISSION_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Price range -->
          <div class="mb-4">
            <label class="mb-1.5 block text-xs text-stone-400">
              Price: {{ formatPriceLakh(store.filters.minPriceLakh) }} – {{ formatPriceLakh(store.filters.maxPriceLakh) }}
            </label>
            <div class="space-y-2">
              <input
                id="filter-min-price"
                type="range"
                :min="PRICE_RANGE_MIN"
                :max="PRICE_RANGE_MAX"
                :value="store.filters.minPriceLakh"
                class="w-full accent-amber-400"
                @input="handleMinPriceInput"
                @change="applySearch"
              >
              <input
                id="filter-max-price"
                type="range"
                :min="PRICE_RANGE_MIN"
                :max="PRICE_RANGE_MAX"
                :value="store.filters.maxPriceLakh"
                class="w-full accent-amber-400"
                @input="handleMaxPriceInput"
                @change="applySearch"
              >
            </div>
          </div>

          <button
            class="w-full rounded-lg border border-stone-700 py-2 text-xs text-stone-400 transition hover:text-stone-200"
            @click="store.resetFilters(); imageErrorMap = {}; void store.fetchCars()"
          >
            Reset Filters
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1">
        <!-- Summary row -->
        <div class="mb-5 flex items-center justify-between">
          <p class="text-sm text-stone-400">
            <span v-if="!store.loading">{{ store.total }} cars found</span>
            <span v-else>Loading…</span>
          </p>
          <p class="text-sm text-stone-500">
            Page {{ store.page }} of {{ store.totalPages }}
          </p>
        </div>

        <!-- Loading spinner -->
        <div
          v-if="store.loading"
          class="flex items-center justify-center py-24"
        >
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
        </div>

        <!-- Error -->
        <div
          v-else-if="store.error"
          class="py-24 text-center text-red-400"
        >
          {{ store.error }}
        </div>

        <!-- Empty -->
        <div
          v-else-if="store.cars.length === 0"
          class="py-24 text-center text-stone-500"
        >
          No cars match your filters.
        </div>

        <!-- Card grid -->
        <div
          v-else
          class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="car in store.cars"
            :key="car.id"
            class="group cursor-pointer overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/60 transition hover:border-stone-700 hover:shadow-lg hover:shadow-black/30"
            @click="goToDetail(car.id)"
          >
            <!-- Image placeholder -->
            <div class="relative flex h-44 items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900">
              <img
                v-if="car.images.length > 0 && !imageErrorMap[car.id]"
                :src="car.images[0]!.imageUrl"
                :alt="car.images[0]!.altText"
                class="h-full w-full object-cover"
                @error="imageErrorMap[car.id] = true"
              >
              <div
                v-else
                class="flex flex-col items-center justify-center h-full w-full p-4 text-center select-none"
              >
                <span class="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-1">{{ car.brand }}</span>
                <span class="text-xs font-bold text-stone-200 truncate max-w-full px-2">{{ car.name }}</span>
                <span class="mt-2 text-[9px] text-stone-500 font-medium px-2 py-0.5 rounded-full border border-stone-800 bg-stone-950/40">No Image</span>
              </div>

              <!-- Compare toggle -->
              <button
                class="absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-medium transition"
                :class="[
                  compareStore.isSelected(car.id)
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                    : 'border-stone-600 bg-stone-900/80 text-stone-400 hover:border-stone-500',
                ]"
                @click.stop="compareStore.toggleCar(car.id)"
              >
                {{ compareStore.isSelected(car.id) ? '✓' : '+' }} Compare
              </button>
            </div>

            <div class="p-4">
              <p class="text-xs uppercase tracking-wide text-amber-400">
                {{ car.brand }}
              </p>
              <h3 class="mt-0.5 font-semibold text-stone-100">
                {{ car.name }}
              </h3>
              <p class="mt-1 text-xs text-stone-500">
                {{ car.segment }} · {{ car.fuelType }} · {{ car.transmission }}
              </p>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-base font-bold text-amber-400">{{ formatPriceLakh(car.priceLakh) }}</span>
                <span class="text-xs text-stone-400">{{ formatEfficiency(car.mileageKmpl, car.evRangeKm) }}</span>
              </div>
              <p class="mt-1 text-xs text-amber-300">
                {{ formatSafetyStars(car.safetyStars) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="store.totalPages > 1"
          class="mt-8 flex items-center justify-center gap-2"
        >
          <button
            :disabled="store.page === 1"
            class="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-sm text-stone-300 transition hover:bg-stone-700 disabled:opacity-40"
            @click="store.setPage(store.page - 1); void store.fetchCars()"
          >
            ←
          </button>
          <span class="text-sm text-stone-400">{{ store.page }} / {{ store.totalPages }}</span>
          <button
            :disabled="store.page === store.totalPages"
            class="rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-sm text-stone-300 transition hover:bg-stone-700 disabled:opacity-40"
            @click="store.setPage(store.page + 1); void store.fetchCars()"
          >
            →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
