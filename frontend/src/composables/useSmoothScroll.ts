import { onBeforeUnmount, onMounted } from "vue";
import Lenis from "lenis";

export function useSmoothScroll() {
  let lenis: Lenis | null = null;

  onMounted(() => {
    lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.1,
      anchors: true,
      autoRaf: true,
    });
  });

  onBeforeUnmount(() => {
    lenis?.destroy();
    lenis = null;
  });
}
