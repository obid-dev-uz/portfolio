<script setup lang="ts">
import SiteNavbar from "../components/ui/SiteNavbar.vue";
import HeroSection from "../components/sections/HeroSection.vue";
import CinematicReveal from "../components/sections/CinematicReveal.vue";
import SystemsNominal from "../components/sections/SystemsNominal.vue";
import SiteFooter from "../components/sections/SiteFooter.vue";
</script>

<template>
  <SiteNavbar />
  <main>
    <HeroSection />
    <CinematicReveal />
    <SystemsNominal />
  </main>
  <SiteFooter />
</template>
