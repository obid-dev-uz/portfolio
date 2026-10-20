<script setup lang="ts">
import { ref, shallowRef } from "vue";
import EyebrowBadge from "../ui/EyebrowBadge.vue";
import HudCorners from "../ui/HudCorners.vue";
import QuoteCard from "../ui/QuoteCard.vue";
import SequenceLoader from "../ui/SequenceLoader.vue";
import { useFrameSequence } from "../../composables/useFrameSequence";
import { DIALOGUES, FRAME_COUNT, HERO_TEXT_FADE_END, framePath } from "../../data/hero";

const sectionRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const heroTextRef = ref<HTMLDivElement | null>(null);
const bigLeftTextRef = ref<HTMLDivElement | null>(null);
const progressFillRef = ref<HTMLDivElement | null>(null);
const powerReadoutRef = ref<HTMLSpanElement | null>(null);
const seqReadoutRef = ref<HTMLSpanElement | null>(null);

const visibleCards = shallowRef(new Set<string>());
let prevVisibleIds = "";

const DESKTOP_POSITION: Record<string, string> = {
  d1: "top-[22%] right-6 md:right-12",
  d2: "top-1/2 -translate-y-1/2 right-6 md:right-12",
  d3: "bottom-24 right-6 md:bottom-28 md:right-12",
};

// Scroll-linked styles are written straight to the DOM: they change every
// animation frame and don't need to go through Vue's reactivity.
const { loadProgress, loaded } = useFrameSequence({
  count: FRAME_COUNT,
  path: framePath,
  section: sectionRef,
  canvas: canvasRef,
  onProgress(progress, frameIndex) {
    if (heroTextRef.value) {
      const opacity = Math.max(0, 1 - progress / HERO_TEXT_FADE_END);
      heroTextRef.value.style.opacity = String(opacity);
      heroTextRef.value.style.transform = `translateY(${(1 - opacity) * 12}px)`;
    }

    if (bigLeftTextRef.value) {
      const op = Math.min(1, Math.max(0, (progress - 0.1) / 0.08));
      bigLeftTextRef.value.style.opacity = String(op);
      bigLeftTextRef.value.style.transform = `translateY(${(1 - op) * 14}px)`;
    }

    if (progressFillRef.value) {
      progressFillRef.value.style.transform = `scaleX(${progress})`;
    }

    if (powerReadoutRef.value) {
      const pwr = 87.3 + Math.sin(progress * Math.PI * 2) * 6.7;
      powerReadoutRef.value.textContent = pwr.toFixed(1) + "%";
    }

    if (seqReadoutRef.value) {
      seqReadoutRef.value.textContent = `SEQ ${String(frameIndex + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
    }

    const next = new Set<string>();
    for (const d of DIALOGUES) {
      if (progress >= d.show && progress <= d.hide) next.add(d.id);
    }
    const ids = [...next].sort().join(",");
    if (ids !== prevVisibleIds) {
      prevVisibleIds = ids;
      visibleCards.value = next;
    }
  },
});
</script>

<template>
  <section ref="sectionRef" class="scroll-animation relative">
    <div
      class="sticky top-0 min-h-[100dvh] w-full overflow-hidden bg-background"
      style="height: 100dvh; will-change: transform; transform: translateZ(0)"
    >
      <canvas
        ref="canvasRef"
        class="absolute inset-0 h-full w-full"
        style="will-change: contents; transform: translateZ(0)"
      />

      <div
        class="pointer-events-none absolute inset-0"
        style="background: radial-gradient(120% 80% at 50% 10%, transparent 30%, rgba(10, 10, 11, 0.45) 70%, rgba(10, 10, 11, 0.85) 100%)"
      />

      <HudCorners />

      <div
        ref="heroTextRef"
        class="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-5 px-6 pb-24 md:px-12 md:pb-28"
        style="transition: opacity 80ms linear"
      >
        <EyebrowBadge>MARK LXXXV // STARK INDUSTRIES // ONLINE</EyebrowBadge>
        <h1
          class="max-w-[14ch] font-sans text-5xl font-semibold leading-[0.95] tracking-tighter text-foreground md:text-7xl lg:text-8xl"
        >
          I am
          <br />
          <span class="text-accent">Iron Man.</span>
        </h1>
        <p class="max-w-[42ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
          Mark LXXXV nanotech suit. Arc reactor calibrated. Scroll to run a full system diagnostic —
          J.A.R.V.I.S. is holding on the line.
        </p>
      </div>

      <div
        ref="bigLeftTextRef"
        class="pointer-events-none absolute bottom-24 left-6 z-10 hidden max-w-[58%] flex-col gap-5 md:flex md:bottom-28 md:left-12"
        style="opacity: 0; transition: opacity 80ms linear"
      >
        <span class="inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          <span
            aria-hidden="true"
            class="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,162,47,0.85)]"
          />
          Protocol &mdash; Mk LXXXV
        </span>
        <h2
          class="font-sans font-semibold leading-[0.88] tracking-tighter text-foreground text-[clamp(4rem,9.5vw,9rem)]"
        >
          Build
          <br />
          with <span class="text-accent">Devini</span>
        </h2>
        <p class="max-w-[36ch] font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
          Interfaces &amp; products, engineered like the Mark LXXXV.
        </p>
      </div>

      <div class="pointer-events-none absolute left-6 top-20 z-10 flex items-center gap-2 md:left-10 md:top-24">
        <div class="h-px w-8 bg-accent/60" />
        <span class="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
          Telemetry Link &mdash; Live
        </span>
      </div>

      <div class="pointer-events-none absolute right-6 top-20 z-10 flex items-center gap-3 md:right-10 md:top-24">
        <span class="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">Arc Reactor</span>
        <span ref="powerReadoutRef" class="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">87.3%</span>
        <span
          aria-hidden="true"
          class="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(212,162,47,0.85)]"
        />
      </div>

      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div class="mx-6 mb-3 h-px bg-white/10 md:mx-10">
          <div
            ref="progressFillRef"
            class="h-full origin-left bg-accent"
            style="transform: scaleX(0); transition: transform 80ms linear"
          />
        </div>
        <div
          class="mx-6 flex items-center justify-between pb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 md:mx-10"
        >
          <span ref="seqReadoutRef">SEQ 001 / {{ FRAME_COUNT }}</span>
          <span>J.A.R.V.I.S. // DIAGNOSTIC</span>
          <span>Scroll &darr;</span>
        </div>
      </div>

      <div
        v-for="d in DIALOGUES"
        :key="d.id"
        class="pointer-events-none absolute z-20 hidden w-[420px] max-w-[90vw] md:block"
        :class="DESKTOP_POSITION[d.id]"
      >
        <QuoteCard :quote="d.quote" :speaker="d.speaker" :film="d.film" :visible="visibleCards.has(d.id)" film-accent />
      </div>

      <div class="pointer-events-none absolute inset-x-0 top-[38%] z-20 flex flex-col gap-3 px-6 md:hidden">
        <QuoteCard
          v-for="d in DIALOGUES"
          :key="d.id"
          :quote="d.quote"
          :speaker="d.speaker"
          :film="d.film"
          :visible="visibleCards.has(d.id)"
          film-accent
          compact
        />
      </div>

      <SequenceLoader
        v-if="!loaded"
        badge="SUIT UP PROTOCOL // BOOTING"
        label="Loading Mark LXXXV"
        :progress="loadProgress"
      />
    </div>
  </section>
</template>
