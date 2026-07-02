import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { compareCars } from "../api.js";
import type { CompareResponse } from "../api.js";

const MAX_COMPARE = 4;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCompareStore = defineStore("compare", () => {
  const selectedIds = ref<number[]>([]);
  const result = ref<CompareResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ─── Derived ────────────────────────────────────────────────────────────

  const count = computed(() => selectedIds.value.length);
  const canCompare = computed(() => selectedIds.value.length >= 2);
  const isFull = computed(() => selectedIds.value.length >= MAX_COMPARE);

  function isSelected(id: number): boolean {
    return selectedIds.value.includes(id);
  }

  // ─── Mutation ────────────────────────────────────────────────────────────

  function toggleCar(id: number) {
    const idx = selectedIds.value.indexOf(id);
    if (idx !== -1) {
      selectedIds.value.splice(idx, 1);
      result.value = null;
    } else if (selectedIds.value.length < MAX_COMPARE) {
      selectedIds.value.push(id);
      result.value = null;
    }
  }

  function removeCar(id: number) {
    const idx = selectedIds.value.indexOf(id);
    if (idx !== -1) {
      selectedIds.value.splice(idx, 1);
      result.value = null;
    }
  }

  function clearAll() {
    selectedIds.value = [];
    result.value = null;
    error.value = null;
  }

  // ─── Fetch ───────────────────────────────────────────────────────────────

  async function fetchComparison() {
    if (selectedIds.value.length < 2) return;
    loading.value = true;
    error.value = null;
    try {
      result.value = await compareCars([...selectedIds.value]);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : "Compare failed.";
    } finally {
      loading.value = false;
    }
  }

  return {
    selectedIds,
    result,
    loading,
    error,
    count,
    canCompare,
    isFull,
    isSelected,
    toggleCar,
    removeCar,
    clearAll,
    fetchComparison,
  };
});
