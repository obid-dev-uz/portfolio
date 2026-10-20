<script setup lang="ts">
import { RouterView } from "vue-router";
import { useSmoothScroll } from "./composables/useSmoothScroll";

useSmoothScroll();
</script>

<template>
  <RouterView />
</template>
