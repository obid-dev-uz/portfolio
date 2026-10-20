<script setup lang="ts">
import { ref, shallowRef } from "vue";
import EyebrowBadge from "../ui/EyebrowBadge.vue";
import HudCorners from "../ui/HudCorners.vue";
import QuoteCard from "../ui/QuoteCard.vue";
import SequenceLoader from "../ui/SequenceLoader.vue";
import { useFrameSequence } from "../../composables/useFrameSequence";
import { BEATS, CINE_FRAME_COUNT, cineFramePath } from "../../data/cinematic";

const sectionRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const h2InevitableRef = ref<HTMLHeadingElement | null>(null);
const h2IronManRef = ref<HTMLHeadingElement | null>(null);
const outroRef = ref<HTMLDivElement | null>(null);
const progressFillRef = ref<HTMLDivElement | null>(null);
const seqReadoutRef = ref<HTMLSpanElement | null>(null);

const visibleBeats = shallowRef(new Set<string>());
let prevVisibleIds = "";

const DESKTOP_POSITION = [
  "top-[24%] left-6 md:left-12",
  "top-1/2 -translate-y-1/2 left-6 md:left-12",
  "bottom-24 left-6 md:bottom-28 md:left-12",
];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const { loadProgress, loaded } = useFrameSequence({
  count: CINE_FRAME_COUNT,
  path: cineFramePath,
  section: sectionRef,
  canvas: canvasRef,
  onProgress(progress, frameIndex) {
    if (h2InevitableRef.value) {
      h2InevitableRef.value.style.opacity = String(clamp01((0.52 - progress) / 0.1));
    }

    if (h2IronManRef.value) {
      h2IronManRef.value.style.opacity = String(clamp01((progress - 0.48) / 0.1));
    }

    if (outroRef.value) {
      const op = clamp01((progress - 0.86) / 0.06);
      outroRef.value.style.opacity = String(op);
      outroRef.value.style.transform = `translateY(${(1 - op) * 14}px)`;
    }

    if (progressFillRef.value) {
      progressFillRef.value.style.transform = `scaleX(${progress})`;
    }

    if (seqReadoutRef.value) {
      seqReadoutRef.value.textContent = `SEQ ${String(frameIndex + 1).padStart(3, "0")} / ${CINE_FRAME_COUNT}`;
    }

    const next = new Set<string>();
    for (const b of BEATS) {
      if (progress >= b.show && progress <= b.hide) next.add(b.id);
    }
    const ids = [...next].sort().join(",");
    if (ids !== prevVisibleIds) {
      prevVisibleIds = ids;
      visibleBeats.value = next;
    }
  },
});
</script>

<template>
  <section ref="sectionRef" id="cinematic" class="scroll-animation relative border-t border-white/5 bg-background">
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
        style="background: radial-gradient(120% 80% at 50% 90%, transparent 30%, rgba(10, 10, 11, 0.45) 70%, rgba(10, 10, 11, 0.85) 100%)"
      />

      <HudCorners />

      <div
        class="pointer-events-none absolute right-6 top-28 z-10 flex max-w-[46ch] flex-col items-end gap-5 text-right md:right-12 md:top-32"
      >
        <EyebrowBadge>TITAN II // FINAL FRAME</EyebrowBadge>
        <div class="relative self-stretch">
          <h2
            ref="h2InevitableRef"
            class="font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl lg:text-7xl"
            style="transition: opacity 240ms ease-out"
          >
            I am
            <br />
            <span class="text-accent">Inevitable.</span>
          </h2>
          <h2
            ref="h2IronManRef"
            class="absolute inset-0 font-sans text-4xl font-semibold leading-[0.98] tracking-tighter text-foreground md:text-6xl lg:text-7xl"
            style="opacity: 0; transition: opacity 240ms ease-out"
          >
            And I am
            <br />
            <span class="text-accent">Iron Man.</span>
          </h2>
        </div>
        <p class="max-w-[42ch] font-sans text-sm leading-relaxed text-zinc-400 md:text-base">
          Endgame &mdash; the snap heard across the universe. J.A.R.V.I.S. held the last frame so we could rebuild
          from it.
        </p>
      </div>

      <div class="pointer-events-none absolute left-6 top-20 z-10 flex items-center gap-2 md:left-10 md:top-24">
        <div class="h-px w-8 bg-accent/60" />
        <span class="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-400">
          Flight Log &mdash; Archived
        </span>
      </div>

      <div class="pointer-events-none absolute right-6 top-20 z-10 flex items-center gap-3 md:right-10 md:top-24">
        <span ref="seqReadoutRef" class="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
          SEQ 001 / {{ CINE_FRAME_COUNT }}
        </span>
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
          <span>MARK III // ARCHIVE</span>
          <span>J.A.R.V.I.S. // PLAYBACK</span>
          <span>Scroll &darr;</span>
        </div>
      </div>

      <div
        v-for="(b, i) in BEATS"
        :key="b.id"
        class="pointer-events-none absolute z-20 hidden w-[420px] max-w-[90vw] md:block"
        :class="DESKTOP_POSITION[i]"
      >
        <QuoteCard
          :label="b.label"
          :quote="b.quote"
          :speaker="b.speaker"
          :film="b.film"
          :visible="visibleBeats.has(b.id)"
        />
      </div>

      <div class="pointer-events-none absolute inset-x-0 top-[36%] z-20 flex flex-col gap-3 px-6 md:hidden">
        <QuoteCard
          v-for="b in BEATS"
          :key="b.id"
          :label="b.label"
          :quote="b.quote"
          :speaker="b.speaker"
          :film="b.film"
          :visible="visibleBeats.has(b.id)"
          compact
        />
      </div>

      <div
        ref="outroRef"
        class="pointer-events-none absolute bottom-24 right-6 z-10 flex flex-col items-end gap-4 md:bottom-32 md:right-12"
        style="opacity: 0; transition: opacity 80ms linear"
      >
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Next &mdash; engage</span>
        <a
          href="#systems"
          class="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground backdrop-blur-md transition-all duration-200 hover:bg-white/[0.12] active:translate-y-[1px]"
        >
          Open diagnostics
          <span aria-hidden="true">&darr;</span>
        </a>
      </div>

      <SequenceLoader
        v-if="!loaded"
        badge="FLIGHT LOG // RESTORING"
        label="Rendering Mark III"
        :progress="loadProgress"
      />
    </div>
  </section>
</template>
