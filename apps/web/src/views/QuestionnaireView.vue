<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import {
  FEATURE_PRIORITY_PRESETS,
  FUEL_OPTIONS,
  SEGMENT_OPTIONS,
  TRANSMISSION_OPTIONS,
  formatPriceLakh,
} from "../constants.js";
import { useQuestionnaireStore } from "../stores/useQuestionnaireStore.js";

const router = useRouter();
const store = useQuestionnaireStore();

const stepTitles = [
  "Budget & family",
  "Driving style",
  "Fuel & gearbox",
  "Segments",
  "Features",
];

const progressPercent = computed(() =>
  Math.round(((store.step + 1) / store.totalSteps) * 100),
);

const isLastStep = computed(() => store.step === store.totalSteps - 1);

// ─── Budget input handler (never inline if in @input) ─────────────────────────

function handleBudgetInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const parsed = parseFloat(target.value);
  if (!Number.isNaN(parsed)) store.setBudget(parsed);
}

function handleFamilySizeInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const parsed = parseInt(target.value, 10);
  if (!Number.isNaN(parsed)) store.setFamilySize(parsed);
}

function handleCityDrivingInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const parsed = parseInt(target.value, 10);
  if (!Number.isNaN(parsed)) store.setCityDriving(parsed);
}

function handleSafetyPriorityInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const parsed = parseInt(target.value, 10);
  if (!Number.isNaN(parsed)) store.setSafetyPriority(parsed);
}

function handleFuelSelect(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  store.setFuelPreference(target.value as Parameters<typeof store.setFuelPreference>[0]);
}

function handleTransmissionSelect(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  store.setTransmissionPreference(
    target.value as Parameters<typeof store.setTransmissionPreference>[0],
  );
}

async function handleSubmit() {
  await store.submit();
  if (store.result) {
    void router.push({ name: "results" });
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-12">
    <!-- Header -->
    <div class="mb-8 text-center">
      <p class="text-sm uppercase tracking-widest text-amber-400">
        Step {{ store.step + 1 }} of {{ store.totalSteps }}
      </p>
      <h1 class="mt-2 text-3xl font-bold text-stone-100">
        {{ stepTitles[store.step] }}
      </h1>
    </div>

    <!-- Progress bar -->
    <div class="mb-10 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
      <div
        class="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <!-- Step panels -->
    <div class="rounded-3xl border border-stone-800 bg-stone-900/70 p-8">
      <!-- Step 0: Budget & Family -->
      <div
        v-if="store.step === 0"
        class="space-y-8"
      >
        <div>
          <label class="block text-sm font-medium text-stone-300">
            Budget
            <span class="ml-2 text-amber-400 font-semibold">{{ formatPriceLakh(store.questionnaire.budgetLakh) }}</span>
          </label>
          <input
            id="budget-slider"
            type="range"
            min="3"
            max="80"
            step="0.5"
            :value="store.questionnaire.budgetLakh"
            class="mt-3 w-full accent-amber-400"
            @input="handleBudgetInput"
          >
          <div class="mt-1 flex justify-between text-xs text-stone-500">
            <span>₹3L</span><span>₹80L</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-300">
            Family size: <span class="text-amber-400 font-semibold">{{ store.questionnaire.familySize }}</span>
          </label>
          <input
            id="family-size-slider"
            type="range"
            min="1"
            max="10"
            step="1"
            :value="store.questionnaire.familySize"
            class="mt-3 w-full accent-amber-400"
            @input="handleFamilySizeInput"
          >
          <div class="mt-1 flex justify-between text-xs text-stone-500">
            <span>1</span><span>10</span>
          </div>
        </div>
      </div>

      <!-- Step 1: Driving style -->
      <div
        v-else-if="store.step === 1"
        class="space-y-8"
      >
        <div>
          <label class="block text-sm font-medium text-stone-300">
            City driving: <span class="text-amber-400 font-semibold">{{ store.questionnaire.cityDrivingPercent }}%</span>
            <span class="ml-2 text-stone-500">Highway: {{ store.questionnaire.highwayDrivingPercent }}%</span>
          </label>
          <input
            id="city-driving-slider"
            type="range"
            min="0"
            max="100"
            step="5"
            :value="store.questionnaire.cityDrivingPercent"
            class="mt-3 w-full accent-amber-400"
            @input="handleCityDrivingInput"
          >
          <div class="mt-1 flex justify-between text-xs text-stone-500">
            <span>All highway</span><span>All city</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-300">
            Safety priority: <span class="text-amber-400 font-semibold">{{ store.questionnaire.safetyPriority }}/5</span>
          </label>
          <input
            id="safety-priority-slider"
            type="range"
            min="1"
            max="5"
            step="1"
            :value="store.questionnaire.safetyPriority"
            class="mt-3 w-full accent-amber-400"
            @input="handleSafetyPriorityInput"
          >
          <div class="mt-1 flex justify-between text-xs text-stone-500">
            <span>Low</span><span>Critical</span>
          </div>
        </div>
      </div>

      <!-- Step 2: Fuel & Gearbox -->
      <div
        v-else-if="store.step === 2"
        class="space-y-6"
      >
        <div>
          <label
            for="fuel-select"
            class="block text-sm font-medium text-stone-300"
          >Fuel preference</label>
          <select
            id="fuel-select"
            :value="store.questionnaire.fuelPreference"
            class="mt-2 w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:border-amber-400 focus:outline-none"
            @change="handleFuelSelect"
          >
            <option
              v-for="opt in FUEL_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="transmission-select"
            class="block text-sm font-medium text-stone-300"
          >Transmission preference</label>
          <select
            id="transmission-select"
            :value="store.questionnaire.transmissionPreference"
            class="mt-2 w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:border-amber-400 focus:outline-none"
            @change="handleTransmissionSelect"
          >
            <option
              v-for="opt in TRANSMISSION_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Step 3: Segments -->
      <div v-else-if="store.step === 3">
        <p class="mb-4 text-sm text-stone-400">
          Select one or more body types that interest you.
        </p>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            v-for="opt in SEGMENT_OPTIONS"
            :key="opt.value"
            class="rounded-2xl border px-4 py-3 text-sm font-medium transition"
            :class="[
              store.questionnaire.preferredSegments.includes(opt.value)
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-stone-700 bg-stone-800/40 text-stone-300 hover:border-stone-600',
            ]"
            @click="store.toggleSegment(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Step 4: Features -->
      <div v-else-if="store.step === 4">
        <p class="mb-4 text-sm text-stone-400">
          Pick features that matter most to you.
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="feature in FEATURE_PRIORITY_PRESETS"
            :key="feature"
            class="rounded-full border px-4 py-2 text-sm transition"
            :class="[
              store.questionnaire.featurePriorities.includes(feature)
                ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                : 'border-stone-700 bg-stone-800/40 text-stone-300 hover:border-stone-600',
            ]"
            @click="store.toggleFeature(feature)"
          >
            {{ feature }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <p
      v-if="store.error"
      class="mt-4 text-center text-sm text-red-400"
    >
      {{ store.error }}
    </p>

    <!-- Navigation -->
    <div class="mt-8 flex items-center justify-between">
      <button
        v-if="store.step > 0"
        class="rounded-xl border border-stone-700 bg-stone-800/60 px-6 py-3 text-sm font-medium text-stone-300 transition hover:bg-stone-700/60"
        @click="store.prevStep"
      >
        ← Back
      </button>
      <div v-else />

      <button
        v-if="!isLastStep"
        class="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-3 text-sm font-semibold text-stone-950 transition hover:scale-105 active:scale-95"
        @click="store.nextStep"
      >
        Next →
      </button>

      <button
        v-else
        :disabled="store.loading"
        class="rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-3 text-sm font-semibold text-stone-950 transition hover:scale-105 active:scale-95 disabled:opacity-60"
        @click="handleSubmit"
      >
        <span v-if="store.loading">Calculating…</span>
        <span v-else>Get My Recommendations →</span>
      </button>
    </div>
  </div>
</template>
