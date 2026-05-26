import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Lenis from "@studio-freight/lenis";

const SmoothScrollContext = createContext({
  scrollTo: () => {},
  progress: 0,
  lenis: null,
});

export function SmoothScrollProvider({ children }) {
  const [progress, setProgress] = useState(0);
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const instance = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: true,
      direction: "vertical",
      gestureOrientation: "vertical",
      lerp: 0.08,
    });

    let rafId;
    let lastProgress = -1;

    const loop = (time) => {
      instance.raf(time);
      const target = instance.limit ? Math.min(100, Math.max(0, (instance.scroll / instance.limit) * 100)) : 0;
      if (Math.abs(target - lastProgress) > 0.2) {
        setProgress(Math.round(target * 100) / 100);
        lastProgress = target;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    setLenis(instance);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      instance.destroy();
    };
  }, []);

  const scrollTo = useMemo(() => {
    return (target, options = {}) => {
      if (!lenis) {
        if (typeof target === "string") {
          const element = document.querySelector(target);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            return;
          }
        }
        window.scrollTo({ top: typeof target === "number" ? target : 0, behavior: "smooth" });
        return;
      }

      if (typeof target === "string") {
        const element = document.querySelector(target);
        if (element) {
          lenis.scrollTo(element, options);
          return;
        }
      }

      lenis.scrollTo(target, options);
    };
  }, [lenis]);

  const value = useMemo(() => ({ scrollTo, progress, lenis }), [scrollTo, progress, lenis]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
