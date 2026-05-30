import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SmoothScrollContext = createContext({
  scrollTo: () => {},
  progress: 0,
});

export function SmoothScrollProvider({ children }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateProgress = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      const target = limit > 0 ? Math.min(100, Math.max(0, (window.scrollY / limit) * 100)) : 0;
      setProgress(Math.round(target * 100) / 100);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  const scrollTo = useMemo(
    () => (target, options = {}) => {
      if (typeof target === "string") {
        const element = document.querySelector(target);
        if (element) {
          const offset = options.offset ?? 0;
          const top = Math.max(0, element.getBoundingClientRect().top + window.pageYOffset + offset);
          window.scrollTo({ top, behavior: "smooth" });
          return;
        }
      }

      const top = typeof target === "number" ? target : 0;
      window.scrollTo({ top, behavior: "smooth" });
    },
    []
  );

  const value = useMemo(() => ({ scrollTo, progress }), [scrollTo, progress]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
