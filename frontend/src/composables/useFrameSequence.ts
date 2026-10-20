import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

type Options = {
  count: number;
  path: (n: number) => string;
  section: Ref<HTMLElement | null>;
  canvas: Ref<HTMLCanvasElement | null>;
  /** Called once per animation frame while scrolling, after the frame is drawn. */
  onProgress: (progress: number, frameIndex: number) => void;
};

// Canvas backing store is sized per devicePixelRatio; above 2x the cost grows
// fast on phones with no visible gain for photographic frames.
const MAX_DPR = 2;

/**
 * Scroll-driven image sequence: preloads `count` frames, draws the one matching
 * the section's scroll progress onto a cover-fitted canvas.
 */
export function useFrameSequence({ count, path, section, canvas, onProgress }: Options) {
  const loadProgress = ref(0);
  const loaded = ref(false);

  let frames: HTMLImageElement[] = [];
  let lastFrame = -1;
  let scrollTicking = false;
  let resizeTicking = false;
  let cancelled = false;

  function drawFrame(index: number) {
    const el = canvas.value;
    const img = frames[index];
    if (!el || !img || !img.complete || !img.naturalWidth) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const cw = el.width;
    const ch = el.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    let drawW: number;
    let drawH: number;
    if (cw / ch > imgRatio) {
      drawW = cw;
      drawH = cw / imgRatio;
    } else {
      drawH = ch;
      drawW = ch * imgRatio;
    }

    if (window.innerWidth <= 768) {
      drawW *= 1.3;
      drawH *= 1.3;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);
  }

  function resizeCanvas() {
    resizeTicking = false;
    const el = canvas.value;
    if (!el) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    el.width = window.innerWidth * dpr;
    el.height = window.innerHeight * dpr;
    el.style.width = window.innerWidth + "px";
    el.style.height = window.innerHeight + "px";
    drawFrame(Math.max(lastFrame, 0));
  }

  function update() {
    scrollTicking = false;
    const el = section.value;
    if (!el || !loaded.value) return;

    const rect = el.getBoundingClientRect();
    const scrollable = el.offsetHeight - window.innerHeight;
    const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / scrollable));

    const frameIndex = Math.min(count - 1, Math.floor(progress * count));
    if (frameIndex !== lastFrame) {
      lastFrame = frameIndex;
      drawFrame(frameIndex);
    }

    onProgress(progress, frameIndex);
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(update);
  }

  function onResize() {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(resizeCanvas);
  }

  function preload() {
    let settled = 0;
    const settle = () => {
      if (cancelled) return;
      settled++;
      loadProgress.value = settled / count;
      if (settled === count) {
        loaded.value = true;
        // Sync to the current scroll position (e.g. after a reload mid-page).
        update();
      }
    };

    frames = Array.from({ length: count }, (_, i) => {
      const img = new Image();
      img.onload = settle;
      img.onerror = settle;
      img.src = path(i + 1);
      return img;
    });
  }

  onMounted(() => {
    preload();
    resizeCanvas();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    cancelled = true;
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
  });

  return { loadProgress, loaded };
}
