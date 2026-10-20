<script setup lang="ts">
defineProps<{
  quote: string;
  speaker: string;
  film: string;
  label?: string;
  visible: boolean;
  /** Smaller variant used in the mobile stack. */
  compact?: boolean;
  /** Film caption colour: accent (hero) or muted (cinematic). */
  filmAccent?: boolean;
}>();
</script>

<template>
  <figure
    class="card-surface pointer-events-auto transition-all duration-400 ease-out"
    :class="[
      compact ? 'p-5' : 'p-6',
      visible ? 'translate-y-0 opacity-100' : compact ? 'translate-y-4 opacity-0' : 'translate-y-5 opacity-0',
    ]"
  >
    <span
      v-if="label"
      class="font-mono uppercase text-accent"
      :class="compact ? 'text-[9px] tracking-[0.28em]' : 'text-[10px] tracking-[0.3em]'"
    >
      {{ label }}
    </span>
    <blockquote
      class="font-sans font-medium leading-snug text-foreground"
      :class="[compact ? 'text-base' : 'text-xl tracking-tight', label && (compact ? 'mt-2' : 'mt-3')]"
    >
      &ldquo;{{ quote }}&rdquo;
    </blockquote>
    <figcaption class="flex items-center justify-between" :class="compact ? 'mt-3' : 'mt-4'">
      <span class="font-sans text-zinc-300" :class="compact ? 'text-xs' : 'text-sm'">{{ speaker }}</span>
      <span
        class="font-mono uppercase"
        :class="[
          compact ? 'text-[9px] tracking-[0.2em]' : 'text-[10px] tracking-[0.24em]',
          filmAccent ? 'text-accent' : 'text-zinc-400',
        ]"
      >
        {{ film }}
      </span>
    </figcaption>
  </figure>
</template>
