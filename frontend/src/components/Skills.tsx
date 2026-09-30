"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILL_CATEGORIES } from "../data/skills";
import SkillProgressBar from "./SkillProgressBar";
import OrbitingIcons from "./OrbitingIcons";
import Revealer from "./motion/Revealer";

export default function Skills() {
  const [activeId, setActiveId] = useState(SKILL_CATEGORIES[0].id);

  const active = SKILL_CATEGORIES.find((c) => c.id === activeId) ?? SKILL_CATEGORIES[0];

  return (
    <Revealer
      id="skills"
      className="relative border-t border-border-custom bg-surface-raised/40 py-20 sm:py-28 transition-colors duration-300 dark:border-white/10"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Section Header */}
        <header className="mb-10 max-w-3xl sm:mb-14">
          <p className="font-mono text-xs uppercase tracking-wider text-accent font-bold dark:text-[#C084FC]">
            CORE EXPERTISE
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl font-display">
            Skills for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:via-[#E879F9] dark:to-[#38BDF8]">AI, automation & analytics</span>
          </h2>
          <p className="mt-4 text-base text-text-muted sm:text-lg font-medium leading-relaxed">
            A transparent breakdown of my engineering capabilities organized by domain and proficiency tier.
          </p>
        </header>

        {/* 2-Column Split: Orbiting Stack Animation (Left) & Proficiency Progress Bars (Right) */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">

          {/* Left Column: Slowly Revolving Orbiting Stack (Col 5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-border-custom bg-surface p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-[#100D1C]/85 min-h-[380px] shadow-2xl">
            <OrbitingIcons icons={active.orbitIcons} label={active.label.split(" ")[0]} />
            <p className="mt-6 font-mono text-xs font-semibold text-text-muted dark:text-[#94A3B8] text-center">
              Orbiting stack for <span className="text-accent font-bold dark:text-[#C084FC]">{active.label}</span>
            </p>
          </div>

          {/* Right Column: Category Tabs & Proficiency Bars (Col 7) */}
          <div className="lg:col-span-7 rounded-3xl border border-border-custom bg-surface p-6 sm:p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-[#100D1C]/85 shadow-2xl">

            {/* Category Tab Buttons */}
            <div className="mb-8 flex flex-wrap gap-2 border-b border-border-custom pb-6 dark:border-white/10">
              {SKILL_CATEGORIES.map((cat) => {
                const Icon = cat.tabIcon;
                const isActive = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveId(cat.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "key-gloss text-white shadow-lg"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-raised dark:hover:bg-[#181426]"
                    }`}
                  >
                    <Icon className="text-sm" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary font-display">
                {active.label}
              </h3>
              <span className="rounded-full bg-accent/15 border border-accent/30 px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-accent dark:text-[#38BDF8] dark:border-[#38BDF8]/40 dark:bg-[#38BDF8]/15">
                PROFICIENCY
              </span>
            </div>

            {/* Progress Bars List */}
            <AnimatePresence mode="wait">
              <motion.ul
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {active.skills.map((skill, i) => (
                  <SkillProgressBar
                    key={skill.name}
                    name={skill.name}
                    tier={skill.tier}
                    percentage={skill.percentage}
                    index={i}
                  />
                ))}
              </motion.ul>
            </AnimatePresence>

          </div>

        </div>

      </div>
    </Revealer>
  );
}
