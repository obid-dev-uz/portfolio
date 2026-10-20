<script setup lang="ts">
import { computed } from "vue";

type Corner = "tl" | "tr" | "bl" | "br";

const props = withDefaults(defineProps<{ corner: Corner; size?: number }>(), { size: 22 });

const d = computed(() => {
  const s = props.size;
  const paths: Record<Corner, string> = {
    tl: `M 2 ${s} L 2 2 L ${s} 2`,
    tr: `M ${s - 20} 2 L ${s} 2 L ${s} ${s}`,
    bl: `M 2 ${s - 20} L 2 ${s} L ${s} ${s}`,
    br: `M ${s - 20} ${s} L ${s} ${s} L ${s} ${s - 20}`,
  };
  return paths[props.corner];
});
</script>

<template>
  <svg aria-hidden="true" :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" fill="none">
    <path :d="d" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" />
  </svg>
</template>
