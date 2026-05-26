import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    let lenis;
    let animationFrame;
    let active = true;

    async function initSmoothScroll() {
      const module = await import("@studio-freight/lenis");
      const Lenis = module.default || module;

      if (!active) return;

      lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: true,
        direction: "vertical",
      });

      function raf(time) {
        if (!lenis) return;
        lenis.raf(time);
        animationFrame = requestAnimationFrame(raf);
      }

      animationFrame = requestAnimationFrame(raf);
    }

    initSmoothScroll();

    return () => {
      active = false;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (lenis) lenis.destroy();
    };
  }, []);

  return null;
}
