<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { formatEfficiency, formatPriceLakh, formatSafetyStars } from "../constants.js";
import { getCarById } from "../api.js";
import type { CarWithReviews } from "../api.js";
import { useCompareStore } from "../stores/useCompareStore.js";

const props = defineProps<{ id: number }>();

const router = useRouter();
const compareStore = useCompareStore();

const car = ref<CarWithReviews | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const activeImageIndex = ref(0);

onMounted(async () => {
  try {
    car.value = await getCarById(props.id);
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : "Failed to load car.";
  } finally {
    loading.value = false;
  }
});

const activeImageError = ref(false);

function setActiveImage(index: number) {
  activeImageIndex.value = index;
  activeImageError.value = false;
}

function goBack() {
  void router.back();
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-12">
    <!-- Back -->
    <button
      class="mb-6 flex items-center gap-2 text-sm text-stone-400 transition hover:text-stone-200"
      @click="goBack"
    >
      ← Back
    </button>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-24"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="py-24 text-center text-red-400"
    >
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="car">
      <!-- Image gallery -->
      <div class="mb-10 overflow-hidden rounded-3xl border border-stone-800 bg-stone-900">
        <!-- Main image -->
        <div class="flex h-80 items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 md:h-96">
          <img
            v-if="car.images.length > 0 && !activeImageError"
            :src="car.images[activeImageIndex]!.imageUrl"
            :alt="car.images[activeImageIndex]!.altText"
            class="h-full w-full object-cover"
            @error="activeImageError = true"
          >
          <div
            v-else
            class="flex flex-col items-center justify-center h-full w-full p-6 text-center select-none"
          >
            <span class="text-sm uppercase tracking-widest text-amber-400 font-semibold mb-2">{{ car.brand }}</span>
            <span class="text-2xl font-bold text-stone-100 mb-2">{{ car.name }}</span>
            <span class="text-xs text-stone-400 font-medium uppercase tracking-wider">
              {{ car.images[activeImageIndex]?.altText || 'Car View' }}
            </span>
            <span class="mt-4 text-xs text-stone-500 font-medium px-3 py-1 rounded-full border border-stone-800 bg-stone-950/40">No Image Available</span>
          </div>
        </div>
        <!-- Thumbnails -->
        <div
          v-if="car.images.length > 1"
          class="flex gap-2 overflow-x-auto p-4"
        >
          <button
            v-for="(img, idx) in car.images"
            :key="img.id"
            class="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition flex items-center justify-center bg-stone-900"
            :class="[
              idx === activeImageIndex
                ? 'border-amber-400'
                : 'border-stone-700 opacity-60 hover:opacity-100',
            ]"
            @click="setActiveImage(idx)"
          >
            <img
              :src="img.imageUrl"
              :alt="img.altText"
              class="h-full w-full object-cover"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            >
            <span class="text-[10px] text-stone-500 font-bold uppercase tracking-wider select-none px-1 text-center">View {{ idx + 1 }}</span>
          </button>
        </div>
      </div>

      <!-- Header -->
      <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-sm uppercase tracking-wider text-amber-400">
            {{ car.brand }}
          </p>
          <h1 class="mt-1 text-4xl font-bold text-stone-100">
            {{ car.name }}
          </h1>
          <p class="mt-2 text-stone-400">
            {{ car.segment }} · {{ car.fuelType }} · {{ car.transmission }}
          </p>
          <p class="mt-3 text-2xl font-bold text-amber-400">
            {{ formatPriceLakh(car.priceLakh) }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-3">
          <div class="text-right">
            <p class="text-xl text-amber-300">
              {{ formatSafetyStars(car.safetyStars) }}
            </p>
            <p class="text-xs text-stone-500">
              NCAP Safety
            </p>
          </div>
          <button
            class="rounded-xl border px-5 py-2.5 text-sm font-medium transition"
            :class="[
              compareStore.isSelected(car.id)
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-stone-700 bg-stone-800/60 text-stone-300 hover:bg-stone-700/60',
            ]"
            @click="compareStore.toggleCar(car.id)"
          >
            {{ compareStore.isSelected(car.id) ? '✓ In Compare' : '+ Add to Compare' }}
          </button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 text-center">
          <p class="text-xs text-stone-500">
            Price
          </p>
          <p class="mt-1 text-lg font-bold text-amber-400">
            {{ formatPriceLakh(car.priceLakh) }}
          </p>
        </div>
        <div class="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 text-center">
          <p class="text-xs text-stone-500">
            Efficiency
          </p>
          <p class="mt-1 text-lg font-bold text-stone-100">
            {{ formatEfficiency(car.mileageKmpl, car.evRangeKm) }}
          </p>
        </div>
        <div class="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 text-center">
          <p class="text-xs text-stone-500">
            Safety
          </p>
          <p class="mt-1 text-lg font-bold text-amber-300">
            {{ car.safetyStars }}/5 ★
          </p>
        </div>
        <div class="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 text-center">
          <p class="text-xs text-stone-500">
            Gearbox
          </p>
          <p class="mt-1 text-lg font-bold text-stone-100">
            {{ car.transmission.toUpperCase() }}
          </p>
        </div>
      </div>

      <!-- Tags -->
      <div
        v-if="car.tags.length > 0"
        class="mb-8 flex flex-wrap gap-2"
      >
        <span
          v-for="tag in car.tags"
          :key="tag"
          class="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-300"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Specs grid -->
      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold text-stone-200">
          Specifications
        </h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div
            v-for="[key, val] in Object.entries(car.specs)"
            :key="key"
            class="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3"
          >
            <p class="text-xs capitalize text-stone-500">
              {{ key }}
            </p>
            <p class="mt-0.5 text-sm font-medium text-stone-200">
              {{ String(val) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div v-if="car.reviews.length > 0">
        <h2 class="mb-4 text-lg font-semibold text-stone-200">
          Reviews
        </h2>
        <div class="space-y-4">
          <div
            v-for="review in car.reviews"
            :key="review.id"
            class="rounded-2xl border border-stone-800 bg-stone-900/60 p-5"
          >
            <div class="mb-2 flex items-center justify-between">
              <p class="font-medium text-stone-200">
                {{ review.reviewerName }}
              </p>
              <p class="text-sm text-amber-400">
                {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
              </p>
            </div>
            <p class="mb-2 font-medium text-stone-300">
              {{ review.title }}
            </p>
            <p class="text-sm text-stone-400">
              {{ review.comment }}
            </p>
            <div
              v-if="review.pros.length > 0 || review.cons.length > 0"
              class="mt-3 flex gap-6"
            >
              <ul
                v-if="review.pros.length > 0"
                class="space-y-1"
              >
                <li
                  v-for="pro in review.pros"
                  :key="pro"
                  class="flex items-start gap-1 text-xs text-green-400"
                >
                  <span>✓</span> {{ pro }}
                </li>
              </ul>
              <ul
                v-if="review.cons.length > 0"
                class="space-y-1"
              >
                <li
                  v-for="con in review.cons"
                  :key="con"
                  class="flex items-start gap-1 text-xs text-red-400"
                >
                  <span>✗</span> {{ con }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
