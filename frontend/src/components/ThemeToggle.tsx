"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === "dark";
  return <button type="button" onClick={toggleTheme} disabled={!mounted} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="theme-switch">
    <span className={isDark ? "" : "active"}><Sun size={14}/></span><span className={isDark ? "active" : ""}><Moon size={14}/></span>
  </button>;
}
