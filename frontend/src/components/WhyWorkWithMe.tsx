"use client";

import { motion } from "framer-motion";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Revealer from "./motion/Revealer";

const REASONS = [
  "End-to-end AI application design, testing, and production optimization",
  "High-performance automated data pipelines and extraction scripts",
  "Explainable machine learning outcomes aligned directly with business KPIs",
  "Clear data storytelling using interactive Power BI dashboards",
  "Clean, maintainable, and well-documented codebase architecture",
  "Agile execution focused on speed of delivery and practical utility",
  "Structured problem solving with proactive communication",
  "Flexible collaboration model for teams, startups, and enterprises",
];

export default function WhyWorkWithMe() {
  return (
    <Revealer className="border-t border-border-custom bg-surface-raised/40 py-20 sm:py-28 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">

          <div className="flex flex-col justify-center lg:col-span-2">
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
              Engineering Partnership
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl font-display">
              Why Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:to-[#00F0FF]">With Me</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted font-medium">
              Whether you need AI automation, predictive machine learning models, custom data dashboards, or full-stack software, I deliver practical solutions that generate measurable value.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-muted font-medium">
              I prioritize technical credibility, clean code, and fast turnaround times.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:col-span-3">
            {REASONS.map((reason, index) => (
              <motion.div
                key={reason}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="flex items-start gap-3 rounded-2xl border border-border-custom bg-surface p-4.5 text-xs font-semibold text-text-primary shadow-sm dark:border-[#262038] dark:bg-[#181426]"
              >
                <HiOutlineCheckCircle className="shrink-0 text-base text-[#10B981] mt-0.5" />
                <span>{reason}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </Revealer>
  );
}
