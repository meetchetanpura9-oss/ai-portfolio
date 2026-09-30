"use client";

import { motion } from "framer-motion";

interface SkillProgressBarProps {
  name: string;
  tier: "Proficient" | "Working Knowledge" | "Currently Learning";
  percentage?: number;
  index?: number;
}

export default function SkillProgressBar({
  name,
  tier,
  percentage = 88,
  index = 0,
}: SkillProgressBarProps) {
  return (
    <motion.li
      aria-label={`${name}: ${tier}, ${percentage}%`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="space-y-2 py-1"
    >
      {/* Skill Name & Percentage Label */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-text-primary font-display">
        <span>{name}</span>
        <span className="font-mono text-xs font-bold text-accent dark:text-[#38BDF8]">
          {percentage}%
        </span>
      </div>

      {/* Animated Glowing Progress Bar Track */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-raised border border-border-custom dark:border-white/10 dark:bg-[#181426]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.1, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:via-[#E879F9] dark:to-[#38BDF8] shadow-[0_0_12px_rgba(168,85,247,0.5)]"
        />
      </div>
    </motion.li>
  );
}
