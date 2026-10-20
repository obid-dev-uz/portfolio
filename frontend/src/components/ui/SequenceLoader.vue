<script setup lang="ts">
import { computed } from "vue";
import EyebrowBadge from "./EyebrowBadge.vue";

const props = defineProps<{ badge: string; label: string; progress: number }>();
const percent = computed(() => Math.round(props.progress * 100));
</script>

<template>
  <div class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-background px-6">
    <EyebrowBadge>{{ badge }}</EyebrowBadge>
    <div class="h-px w-60 bg-white/10 md:w-80">
      <div class="h-full bg-accent transition-[width] duration-150 ease-out" :style="{ width: `${percent}%` }" />
    </div>
    <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
      {{ label }} &nbsp;&middot;&nbsp; {{ percent }}%
    </p>
  </div>
</template>
