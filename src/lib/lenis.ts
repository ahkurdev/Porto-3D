import Lenis from "lenis";

const lenis = new Lenis({
  autoRaf: true,
  anchors: false,
  lerp: 0.12,
});

// debug/testing hook
(window as unknown as Record<string, unknown>).__lenis = lenis;

export default lenis;
