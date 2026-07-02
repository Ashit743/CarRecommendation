<script setup lang="ts">
import { ref } from "vue";

import { useRecommendationStore } from "./stores/useRecommendationStore.js";

const store = useRecommendationStore();
const rawBudget = ref("");

function handleBudgetInput(event: Event) {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  rawBudget.value = target.value;
  const parsedBudget = Number(target.value);

  if (!Number.isNaN(parsedBudget)) {
    store.setBudget(parsedBudget);
  }
}
</script>

<template>
  <main class="min-h-screen bg-stone-950 px-6 py-12 text-stone-100">
    <div class="mx-auto max-w-4xl rounded-3xl border border-stone-800 bg-stone-900/80 p-8 shadow-2xl">
      <p class="text-sm uppercase tracking-[0.35em] text-amber-400">
        Indian car discovery
      </p>
      <h1 class="mt-4 text-4xl font-semibold tracking-tight">
        Find the right car for your budget and priorities.
      </h1>
      <p class="mt-4 max-w-2xl text-base text-stone-300">
        This starter app uses a typed workspace setup for recommendations, scoring, and API responses.
      </p>

      <label class="mt-8 block">
        <span class="mb-2 block text-sm font-medium text-stone-200">Budget in lakh</span>
        <input
          :value="rawBudget"
          class="w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-400"
          inputmode="decimal"
          placeholder="12.5"
          @input="handleBudgetInput"
        >
      </label>

      <div class="mt-8 rounded-2xl border border-stone-800 bg-stone-950/70 p-5">
        <p class="text-sm text-stone-400">
          Current store snapshot
        </p>
        <pre class="mt-3 overflow-x-auto text-sm text-amber-200">{{ JSON.stringify(store.questionnaire, null, 2) }}</pre>
      </div>
    </div>
  </main>
</template>
