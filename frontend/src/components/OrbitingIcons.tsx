"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { IconType } from "react-icons";
import { useTheme } from "../context/ThemeContext";

interface OrbitingIconsProps {
  icons: IconType[];
  label: string;
}

export default function OrbitingIcons({ icons, label }: OrbitingIconsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Skill orbit diameter setting
  const orbitRadius = 110;

  const shadowSeq = isDark
    ? [
        "0 0 40px rgba(0, 255, 102, 0.22)",
        "0 0 60px rgba(0, 240, 255, 0.18)",
        "0 0 40px rgba(0, 255, 102, 0.22)",
      ]
    : [
        "0 0 40px rgba(5, 150, 105, 0.15)",
        "0 0 60px rgba(6, 182, 212, 0.12)",
        "0 0 40px rgba(5, 150, 105, 0.15)",
      ];

  return (
    <div className="relative flex h-[280px] w-[280px] items-center justify-center">
      {/* Back orbit paths */}
      <div className="absolute inset-0 rounded-full border border-dashed border-accent/15" />
      <div className="absolute inset-4 rounded-full border border-white/5 bg-accent/5" />

      {/* Orbit Container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        animate={isPaused ? {} : { rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {icons.map((Icon, index) => {
          const angle = (360 / icons.length) * index;
          return (
            <div
              key={index}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{
                transform: `rotate(${angle}deg) translateY(-${orbitRadius}px)`,
              }}
            >
              {/* Counter rotate icons to keep straight */}
              <motion.div
                animate={isPaused ? {} : { rotate: -360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                whileHover={{
                  scale: 1.15,
                  boxShadow: isDark ? "0 0 28px rgba(0,255,102,0.45)" : "0 0 28px rgba(5,150,105,0.35)",
                }}
                className="flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 dark:border-white/5 bg-white/[0.08] dark:bg-white/[0.02] text-xl text-text-primary shadow-[0_0_20px_var(--shadow-glow-volt)] backdrop-blur-xl transition-[border-color,box-shadow,transform] duration-300 hover:border-accent/50 sm:h-12 sm:w-12 sm:text-2xl"
              >
                <Icon />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* Central Badge */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            boxShadow: shadowSeq,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-accent/20 bg-white/[0.06] backdrop-blur-xl sm:h-28 sm:w-28"
        >
          <span className="bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent sm:text-sm">
            {label}
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-text-muted sm:text-xs">Stack</span>
        </motion.div>
      </div>
    </div>
  );
}
