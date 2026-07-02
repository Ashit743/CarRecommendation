<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { formatEfficiency, formatPriceLakh, formatSafetyStars } from "../constants.js";
import type { CarWithReviews } from "../api.js";
import { useCompareStore } from "../stores/useCompareStore.js";

const router = useRouter();
const store = useCompareStore();
const imageErrorMap = ref<Record<number, boolean>>({});

onMounted(() => {
  if (store.canCompare && !store.result) {
    void store.fetchComparison();
  }
});

function goToBrowse() {
  void router.push({ name: "browse" });
}

function goToDetail(id: number) {
  void router.push({ name: "car-detail", params: { id } });
}

function fetchComparison() {
  void store.fetchComparison();
}

// Row definitions for the comparison table
type RowKey =
  | "priceLakh"
  | "segment"
  | "fuelType"
  | "transmission"
  | "safetyStars"
  | "mileage"
  | "tags";

type CompareRow = {
  label: string;
  key: RowKey;
};

const compareRows: CompareRow[] = [
  { label: "Price", key: "priceLakh" },
  { label: "Segment", key: "segment" },
  { label: "Fuel", key: "fuelType" },
  { label: "Transmission", key: "transmission" },
  { label: "Safety", key: "safetyStars" },
  { label: "Efficiency", key: "mileage" },
  { label: "Tags", key: "tags" },
];

function getCellValue(car: CarWithReviews, key: RowKey): string {
  switch (key) {
    case "priceLakh": return formatPriceLakh(car.priceLakh);
    case "segment": return car.segment;
    case "fuelType": return car.fuelType;
    case "transmission": return car.transmission;
    case "safetyStars": return formatSafetyStars(car.safetyStars);
    case "mileage": return formatEfficiency(car.mileageKmpl, car.evRangeKm);
    case "tags": return car.tags.join(", ");
  }
}

function isBest(carId: number, key: RowKey): boolean {
  if (!store.result) return false;
  const h = store.result.highlights;
  if (key === "priceLakh") return h.bestValueCarId === carId;
  if (key === "safetyStars") return h.bestSafetyCarId === carId;
  if (key === "mileage") return h.bestEfficiencyCarId === carId;
  return false;
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-12">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-stone-100">
        Compare Cars
      </h1>
      <button
        class="text-sm text-stone-400 transition hover:text-stone-200"
        @click="goToBrowse"
      >
        ← Browse more
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="store.count === 0"
      class="py-24 text-center"
    >
      <p class="mb-2 text-2xl">
        ⚖️
      </p>
      <p class="text-stone-400">
        No cars selected for comparison.
      </p>
      <button
        class="mt-6 rounded-xl border border-stone-700 bg-stone-800/60 px-6 py-3 text-sm text-stone-300 transition hover:bg-stone-700"
        @click="goToBrowse"
      >
        Browse & select cars
      </button>
    </div>

    <!-- Has selections but not yet fetched -->
    <div
      v-else-if="store.count > 0 && !store.result && !store.loading"
      class="py-12 text-center"
    >
      <p class="mb-4 text-stone-400">
        {{ store.count }} car{{ store.count === 1 ? '' : 's' }} selected.
      </p>
      <button
        :disabled="!store.canCompare"
        class="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-3 text-sm font-semibold text-stone-950 transition hover:scale-105 disabled:opacity-50"
        @click="fetchComparison"
      >
        Compare {{ store.count }} Cars →
      </button>
      <p
        v-if="!store.canCompare"
        class="mt-2 text-xs text-stone-500"
      >
        Select at least 2 cars to compare.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-else-if="store.loading"
      class="flex items-center justify-center py-24"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
    </div>

    <!-- Error -->
    <div
      v-else-if="store.error"
      class="py-24 text-center text-red-400"
    >
      {{ store.error }}
    </div>

    <!-- Comparison table -->
    <div
      v-else-if="store.result"
      class="overflow-x-auto"
    >
      <!-- Car headers -->
      <div
        class="mb-4 grid gap-4"
        :style="{ gridTemplateColumns: `180px repeat(${store.result.cars.length}, minmax(160px, 1fr))` }"
      >
        <div />
        <div
          v-for="car in store.result.cars"
          :key="car.id"
          class="relative rounded-2xl border border-stone-800 bg-stone-900/70 p-4 text-center"
          :class="{ 'border-amber-400/50': store.result.highlights.bestSafetyCarId === car.id }"
        >
          <!-- Best badge -->
          <div
            v-if="store.result.highlights.bestValueCarId === car.id"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-bold text-stone-950"
          >
            Best Value
          </div>

          <!-- Image -->
          <div class="mx-auto mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-stone-800">
            <img
              v-if="car.images.length > 0 && !imageErrorMap[car.id]"
              :src="car.images[0]!.imageUrl"
              :alt="car.images[0]!.altText"
              class="h-full w-full object-cover"
              @error="imageErrorMap[car.id] = true"
            >
            <div
              v-else
              class="flex flex-col items-center justify-center h-full w-full p-2 text-center bg-stone-900 select-none"
            >
              <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wider truncate max-w-full px-1">{{ car.name }}</span>
              <span class="text-[8px] text-stone-600 font-medium mt-0.5">No Image</span>
            </div>
          </div>

          <p class="text-xs text-amber-400">
            {{ car.brand }}
          </p>
          <p class="font-semibold text-stone-100 text-sm">
            {{ car.name }}
          </p>
          <button
            class="mt-2 text-xs text-stone-500 hover:text-stone-300"
            @click="goToDetail(car.id)"
          >
            View →
          </button>
          <button
            class="ml-3 mt-2 text-xs text-red-400 hover:text-red-300"
            @click="store.removeCar(car.id)"
          >
            Remove
          </button>
        </div>
      </div>

      <!-- Table rows -->
      <div class="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden">
        <div
          v-for="(row, rowIdx) in compareRows"
          :key="row.key"
          class="grid gap-4"
          :style="{ gridTemplateColumns: `180px repeat(${store.result.cars.length}, minmax(160px, 1fr))` }"
          :class="rowIdx % 2 === 0 ? 'bg-stone-900/40' : 'bg-stone-900/0'"
        >
          <!-- Label -->
          <div class="flex items-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
            {{ row.label }}
          </div>

          <!-- Car cells -->
          <div
            v-for="car in store.result.cars"
            :key="car.id"
            class="flex items-center justify-center px-3 py-3 text-sm text-center"
            :class="[
              isBest(car.id, row.key) ? 'font-bold text-amber-300' : 'text-stone-300',
            ]"
          >
            {{ getCellValue(car, row.key) }}
            <span
              v-if="isBest(car.id, row.key)"
              class="ml-1.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300"
            >
              BEST
            </span>
          </div>
        </div>
      </div>

      <!-- Common tags -->
      <div
        v-if="store.result.commonTags.length > 0"
        class="mt-6"
      >
        <p class="mb-2 text-sm text-stone-400">
          Common tags across all compared cars:
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in store.result.commonTags"
            :key="tag"
            class="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Clear -->
      <div class="mt-8 text-center">
        <button
          class="rounded-xl border border-stone-700 bg-stone-800/60 px-6 py-3 text-sm text-stone-400 transition hover:text-stone-200"
          @click="store.clearAll()"
        >
          Clear comparison
        </button>
      </div>
    </div>
  </div>
</template>
