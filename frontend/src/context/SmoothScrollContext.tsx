"use client";

import { useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import { ScrollActionsContext, ScrollProgressContext, SmoothScrollContext } from "./ScrollContexts";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Fallback scroll listener for progress calculations when smooth scroll is disabled
      const handleScroll = () => {
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        const current = limit > 0 ? (window.scrollY / limit) * 100 : 0;
        setProgress(Math.round(current * 100) / 100);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    setLenisInstance(lenis);

    // Sync Lenis with requestAnimationFrame
    let rafId: number;
    const update = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);

    // Track scroll progress
    lenis.on("scroll", (e) => {
      setProgress(Math.round(e.progress * 100 * 100) / 100);
    });

    // Initial check
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    const current = limit > 0 ? (window.scrollY / limit) * 100 : 0;
    setProgress(Math.round(current * 100) / 100);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const scrollTo = useMemo(
    () => (target: string | number, options: { offset?: number } = {}) => {
      if (typeof window === "undefined") return;

      const offset = options.offset ?? 0;

      if (lenisInstance) {
        lenisInstance.scrollTo(target, { offset, immediate: false });
        return;
      }

      // Fallback standard scrolling if Lenis is not active (e.g. prefers-reduced-motion)
      if (typeof target === "string") {
        const element = document.querySelector(target);
        if (element) {
          const top = Math.max(0, element.getBoundingClientRect().top + window.pageYOffset + offset);
          window.scrollTo({ top, behavior: "smooth" });
          return;
        }
      }

      const top = typeof target === "number" ? target : 0;
      window.scrollTo({ top, behavior: "smooth" });
    },
    [lenisInstance]
  );

  const contextValue = useMemo(() => ({ scrollTo, progress }), [scrollTo, progress]);

  return (
    <ScrollActionsContext.Provider value={scrollTo}>
      <ScrollProgressContext.Provider value={progress}>
        <SmoothScrollContext.Provider value={contextValue}>
          {children}
        </SmoothScrollContext.Provider>
      </ScrollProgressContext.Provider>
    </ScrollActionsContext.Provider>
  );
}
