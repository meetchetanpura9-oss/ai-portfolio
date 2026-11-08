import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./ThemeContextInstance";

const STORAGE_KEY = "theme";

function readInitialTheme() {
  if (typeof document === "undefined") return "light";
  // index.html sets data-theme before React mounts — trust it to avoid a mismatch.
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function readSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  const applyTheme = useCallback((next, { animate = true } = {}) => {
    const root = document.documentElement;
    if (animate) {
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 380);
    }
    root.setAttribute("data-theme", next);
    setThemeState(next);
  }, []);

  const setTheme = useCallback(
    (next) => {
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — theme still applies for this visit */
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Follow OS changes until the visitor makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => {
      if (!readSavedTheme()) applyTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [applyTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
