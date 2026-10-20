<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent backdrop-blur-md"
    style="box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 24px -8px rgba(212, 162, 47, 0.25)"
  >
    <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,162,47,0.85)]" />
    <slot />
  </span>
</template>
