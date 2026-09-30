import { useContext } from "react";
import { ScrollActionsContext, ScrollProgressContext, SmoothScrollContext } from "../context/ScrollContexts";

export function useScrollTo() {
  const ctx = useContext(ScrollActionsContext);
  if (ctx === null) {
    return (target: string | number, options: { offset?: number } = {}) => {
      if (typeof window === "undefined") return;
      const offset = options.offset ?? 0;
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
    };
  }
  return ctx;
}

export function useScrollProgress() {
  const ctx = useContext(ScrollProgressContext);
  return ctx ?? 0;
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  const scrollTo = useScrollTo();
  if (ctx === null) {
    return {
      scrollTo,
      progress: 0,
    };
  }
  return ctx;
}
