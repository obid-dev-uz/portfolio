<script setup lang="ts">
import { motion } from "motion-v";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
</script>

<template>
  <motion.div
    :variants="containerVariants"
    initial="hidden"
    while-in-view="visible"
    :in-view-options="{ once: true, margin: '-100px' }"
  >
    <slot />
  </motion.div>
</template>
