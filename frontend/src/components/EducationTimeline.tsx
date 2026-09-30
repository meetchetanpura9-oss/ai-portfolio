"use client";

import { motion } from "framer-motion";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { EducationItem } from "../types";

const EDUCATION: EducationItem[] = [
  {
    period: "2025 - 2027",
    degree: "MCA",
    title: "Master of Computer Applications",
    institution: "Advanced studies in AI, machine learning, data engineering & software architecture.",
    status: "current",
  },
  {
    period: "2022 - 2025",
    degree: "B.Sc. (IT)",
    title: "Bachelor of Science in Information Technology",
    institution: "Comprehensive foundation in programming, database management, & applied analytics.",
    status: "completed",
  },
  {
    period: "Completed 2022",
    degree: "HSC",
    title: "Higher Secondary Certificate",
    institution: "Higher secondary education with a science & mathematics focus.",
    status: "completed",
  },
];

export default function EducationTimeline() {
  return (
    <ol className="relative space-y-0">
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-border-custom dark:bg-[#262038] sm:left-[13px]" />

      {EDUCATION.map((item, i) => (
        <motion.li
          key={item.degree + item.period}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="group relative flex gap-4 pb-6 last:pb-0 sm:gap-5"
        >
          <div className="relative z-10 flex shrink-0 flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border sm:h-7 sm:w-7 ${
                item.status === "current"
                  ? "border-accent bg-accent/20 shadow-sm"
                  : "border-border-custom bg-surface-raised dark:border-[#262038] dark:bg-[#08070D]"
              }`}
            >
              {item.status === "current" ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              ) : (
                <HiOutlineAcademicCap className="text-[10px] text-text-muted sm:text-xs" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-transparent p-2 transition-colors duration-200 group-hover:border-border-custom group-hover:bg-surface-raised/50 dark:group-hover:border-[#262038] dark:group-hover:bg-[#08070D]/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-accent dark:text-[#C084FC]">
                {item.period}
              </span>
              {item.status === "current" && (
                <span className="rounded-md border border-[#10B981]/30 bg-[#10B981]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10B981]">
                  In Progress
                </span>
              )}
            </div>
            <h4 className="mt-1 text-base font-bold text-text-primary sm:text-lg font-display">
              {item.degree} — <span className="font-normal text-text-muted text-sm">{item.title}</span>
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-text-muted font-medium">{item.institution}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
