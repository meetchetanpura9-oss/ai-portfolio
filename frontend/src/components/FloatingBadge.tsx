"use client";

import { motion } from "framer-motion";

interface FloatingBadgeProps {
  label: string;
  className: string;
  delay?: number;
  duration?: number;
}

export default function FloatingBadge({
  label,
  className,
  delay = 0,
  duration = 4,
}: FloatingBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.06, borderColor: "var(--accent-color)" }}
      className={`absolute whitespace-nowrap rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-text-primary shadow-[0_0_20px_var(--shadow-glow-volt)] backdrop-blur-xl sm:px-4 sm:py-2 sm:text-sm ${className}`}
    >
      <span className="bg-gradient-to-r from-accent to-accent-cyan bg-clip-text text-transparent">
        {label}
      </span>
    </motion.div>
  );
}
