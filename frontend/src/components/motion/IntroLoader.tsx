"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroLoader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 5;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="intro-loader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0B0D0F] p-8 sm:p-14 text-[#F3F1EC] select-none pointer-events-auto"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-[#9A9A95]">
            <span>Meet Chetanpura</span>
            <span>AI Systems & Automation</span>
          </div>

          {/* Center Monogram */}
          <div className="my-auto flex flex-col items-center justify-center text-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl sm:text-6xl font-bold tracking-tight"
            >
              MC<span className="text-[#B7F34A]">.</span>AI
            </motion.span>
            <p className="mt-3 font-mono text-xs text-[#9A9A95] tracking-widest uppercase">
              Ahmedabad, India · Worldwide US Clients
            </p>
          </div>

          {/* Bottom Progress Bar */}
          <div className="flex items-end justify-between font-mono text-xs text-[#9A9A95]">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#B7F34A] animate-pulse" />
              <span>Loading System Interface</span>
            </div>
            <span className="font-bold text-[#F3F1EC] text-sm">{progress}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
