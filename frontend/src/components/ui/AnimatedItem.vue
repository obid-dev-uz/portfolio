<script setup lang="ts">
import { motion } from "motion-v";

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};
</script>

<template>
  <motion.div :variants="itemVariants">
    <slot />
  </motion.div>
</template>
