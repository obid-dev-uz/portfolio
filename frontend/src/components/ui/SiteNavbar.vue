<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { PhArrowUpRight } from "@phosphor-icons/vue";

const scrolled = ref(false);
const onScroll = () => {
  scrolled.value = window.scrollY > 40;
};

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-300"
    :class="
      scrolled
        ? 'border-b border-white/10 bg-black/60 backdrop-blur-2xl backdrop-saturate-150'
        : 'border-b border-transparent bg-transparent'
    "
  >
    <div class="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-8 md:py-5">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground"
      >
        <span aria-hidden="true" class="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(212,162,47,0.9)]" />
        Stark / Industries
      </RouterLink>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          href="#systems"
          class="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-foreground"
        >
          Systems
        </a>
        <a
          href="#footer"
          class="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors hover:text-foreground"
        >
          Archive
        </a>
      </nav>

      <a
        href="#systems"
        class="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/[0.1] active:translate-y-[1px]"
      >
        Engage
        <PhArrowUpRight
          :size="14"
          weight="bold"
          class="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </div>
  </header>
</template>
