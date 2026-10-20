<script setup lang="ts">
import HudFrame from "./HudFrame.vue";
</script>

<template>
  <div class="pointer-events-none absolute left-6 top-24 text-accent md:left-10 md:top-28">
    <HudFrame corner="tl" :size="26" />
  </div>
  <div class="pointer-events-none absolute right-6 top-24 text-accent md:right-10 md:top-28">
    <HudFrame corner="tr" :size="26" />
  </div>
  <div class="pointer-events-none absolute bottom-14 left-6 text-accent md:bottom-16 md:left-10">
    <HudFrame corner="bl" :size="26" />
  </div>
  <div class="pointer-events-none absolute bottom-14 right-6 text-accent md:bottom-16 md:right-10">
    <HudFrame corner="br" :size="26" />
  </div>
</template>
