<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

import { useCompareStore } from "./stores/useCompareStore.js";

const route = useRoute();
const compareStore = useCompareStore();

const navLinks = [
  { to: "/", label: "Home", name: "home" },
  { to: "/questionnaire", label: "Find My Car", name: "questionnaire" },
  { to: "/browse", label: "Browse", name: "browse" },
  { to: "/compare", label: "Compare", name: "compare" },
] as const;

const compareCount = computed(() => compareStore.count);
</script>

<template>
  <div class="min-h-screen bg-stone-950 text-stone-100">
    <!-- Nav -->
    <nav class="fixed inset-x-0 top-0 z-50 border-b border-stone-800/60 bg-stone-950/90 backdrop-blur-md">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-lg font-bold tracking-tight text-amber-400 transition hover:text-amber-300"
        >
          <span class="text-2xl">🚗</span>
          CarIQ
        </RouterLink>

        <div class="flex items-center gap-1">
          <RouterLink
            v-for="link in navLinks"
            :key="link.name"
            :to="link.to"
            class="relative rounded-xl px-4 py-2 text-sm font-medium transition"
            :class="[
              route.name === link.name
                ? 'bg-amber-400/10 text-amber-300'
                : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-100',
            ]"
          >
            {{ link.label }}
            <span
              v-if="link.name === 'compare' && compareCount > 0"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-stone-950"
            >
              {{ compareCount }}
            </span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Page content offset below fixed nav -->
    <main class="pt-[73px]">
      <RouterView />
    </main>
  </div>
</template>
