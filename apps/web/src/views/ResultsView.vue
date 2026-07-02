<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { formatPriceLakh, formatSafetyStars } from "../constants.js";
import { useCompareStore } from "../stores/useCompareStore.js";
import { useQuestionnaireStore } from "../stores/useQuestionnaireStore.js";

const router = useRouter();
const store = useQuestionnaireStore();
const compareStore = useCompareStore();

onMounted(() => {
  if (!store.result) {
    void router.replace({ name: "questionnaire" });
  }
});

function goBack() {
  void router.push({ name: "questionnaire" });
}

function goToDetail(id: number) {
  void router.push({ name: "car-detail", params: { id } });
}

const scoreLabels: Record<string, string> = {
  budgetFit: "Budget Fit",
  useCaseMatch: "Use Case",
  featureMatch: "Features",
  safety: "Safety",
  efficiency: "Efficiency",
};

const scoreMax: Record<string, number> = {
  budgetFit: 35,
  useCaseMatch: 25,
  featureMatch: 20,
  safety: 12,
  efficiency: 8,
};

function scorePercent(key: string, value: number): number {
  const max = scoreMax[key] ?? 100;
  return Math.round((value / max) * 100);
}

const scoreKeys = Object.keys(scoreLabels);
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-12">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-stone-100">
          Your Recommendations
        </h1>
        <p
          v-if="store.result"
          class="mt-2 max-w-2xl text-sm text-stone-400"
        >
          {{ store.result.summary }}
        </p>
      </div>
      <button
        class="rounded-xl border border-stone-700 bg-stone-800/60 px-5 py-2.5 text-sm text-stone-300 transition hover:bg-stone-700/60"
        @click="goBack"
      >
        ← Refine
      </button>
    </div>

    <!-- Loading -->
    <div
      v-if="store.loading"
      class="flex items-center justify-center py-24"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
    </div>

    <!-- No result redirect handled via onMounted -->
    <div
      v-else-if="!store.result"
      class="py-24 text-center text-stone-400"
    >
      Redirecting…
    </div>

    <!-- Results -->
    <div
      v-else
      class="space-y-6"
    >
      <div
        v-for="(item, index) in store.result.recommendations"
        :key="item.car.id"
        class="group relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/70 p-6 transition hover:border-stone-700"
      >
        <!-- Rank badge -->
        <div
          class="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
          :class="[
            index === 0 ? 'bg-amber-400 text-stone-950' : 'bg-stone-700 text-stone-300',
          ]"
        >
          #{{ index + 1 }}
        </div>

        <!-- Car header -->
        <div class="mb-5 flex items-start gap-4">
          <div class="flex-1">
            <p class="text-xs uppercase tracking-wider text-amber-400">
              {{ item.car.brand }}
            </p>
            <h2 class="mt-0.5 text-xl font-bold text-stone-100">
              {{ item.car.name }}
            </h2>
            <p class="mt-1 text-sm text-stone-400">
              {{ formatPriceLakh(item.car.priceLakh) }} &middot;
              {{ item.car.segment }} &middot;
              {{ item.car.fuelType }}
            </p>
          </div>

          <div class="text-right">
            <p class="text-3xl font-bold text-amber-400">
              {{ item.score.total }}
            </p>
            <p class="text-xs text-stone-500">
              / 100
            </p>
            <p class="mt-1 text-sm text-stone-400">
              {{ formatSafetyStars(item.car.safetyStars) }}
            </p>
          </div>
        </div>

        <!-- Score breakdown bars -->
        <div class="mb-5 space-y-2">
          <div
            v-for="key in scoreKeys"
            :key="key"
            class="flex items-center gap-3"
          >
            <span class="w-24 text-xs text-stone-400">{{ scoreLabels[key] }}</span>
            <div class="flex-1 overflow-hidden rounded-full bg-stone-800 h-1.5">
              <div
                class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                :style="{ width: `${scorePercent(key, (item.score as Record<string, number>)[key] ?? 0)}%` }"
              />
            </div>
            <span class="w-8 text-right text-xs font-medium text-stone-300">
              {{ (item.score as Record<string, number>)[key]?.toFixed(1) }}
            </span>
          </div>
        </div>

        <!-- Explanation -->
        <p class="mb-5 text-sm leading-relaxed text-stone-400">
          {{ item.explanation }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            class="rounded-xl border border-stone-700 bg-stone-800/50 px-4 py-2 text-sm text-stone-300 transition hover:bg-stone-700/50"
            @click="goToDetail(item.car.id)"
          >
            View Details
          </button>
          <button
            class="rounded-xl border px-4 py-2 text-sm transition"
            :class="[
              compareStore.isSelected(item.car.id)
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-stone-700 bg-stone-800/50 text-stone-300 hover:bg-stone-700/50',
            ]"
            @click="compareStore.toggleCar(item.car.id)"
          >
            {{ compareStore.isSelected(item.car.id) ? '✓ In Compare' : '+ Compare' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
