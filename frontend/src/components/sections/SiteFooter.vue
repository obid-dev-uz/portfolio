<script setup lang="ts">
import { PhArrowUpRight } from "@phosphor-icons/vue";

const marks = [
  ["Mark I", "Cave, Afghanistan"],
  ["Mark III", "Monaco Circuit"],
  ["Mark VII", "Stark Tower"],
  ["Mark XLIV", "Hulkbuster"],
  ["Mark L", "Titan"],
  ["Mark LXXXV", "Endgame"],
] as const;
</script>

<template>
  <footer id="footer" class="border-t border-white/5 bg-background px-6 py-14 md:px-10 md:py-16">
    <div class="mx-auto flex max-w-[1400px] flex-col gap-10">
      <div class="flex flex-col justify-between gap-8 md:flex-row md:items-start">
        <div class="flex flex-col gap-3">
          <div
            class="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-foreground"
          >
            <span
              aria-hidden="true"
              class="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(212,162,47,0.9)]"
            />
            Stark / Industries
          </div>
          <p class="max-w-[38ch] font-sans text-sm leading-relaxed text-zinc-400">
            &copy; Stark Industries &mdash; 10880 Malibu Point, 90265. Registered trademark of the Office of Howard
            &amp; Anthony E. Stark.
          </p>
        </div>

        <nav class="grid grid-cols-2 gap-x-10 gap-y-3 md:grid-cols-3">
          <a v-for="[name, note] in marks" :key="name" href="#" class="group flex flex-col gap-1">
            <span class="font-sans text-[13px] font-medium text-foreground transition-colors group-hover:text-accent">
              {{ name }}
              <PhArrowUpRight
                :size="11"
                weight="bold"
                class="ml-1 inline-block align-baseline opacity-0 transition-opacity group-hover:opacity-100"
              />
            </span>
            <span class="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{{ note }}</span>
          </a>
        </nav>
      </div>

      <div
        class="flex flex-col gap-2 border-t border-white/5 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:flex-row md:items-center md:justify-between"
      >
        <span>Build 2026.04.21 &nbsp;&middot;&nbsp; Mark LXXXV &nbsp;&middot;&nbsp; J.A.R.V.I.S. Online</span>
        <span>Proof of concept &mdash; fan art, no commercial use</span>
      </div>
    </div>
  </footer>
</template>
