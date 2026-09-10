import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  autoRaf: true,
  anchors: false,
});

// pump lenis scroll into ScrollTrigger via gsap ticker (pola resmi lenis+gsap)
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// debug/testing hook
(window as unknown as Record<string, unknown>).__lenis = lenis;

export default lenis;
