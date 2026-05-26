import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SKILL_CATEGORIES } from "../data/skills";
import OrbitingIcons from "./OrbitingIcons";
import SkillProgressBar from "./SkillProgressBar";
import Revealer from "./motion/Revealer";

const headerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Skills() {
  const [activeId, setActiveId] = useState(SKILL_CATEGORIES[0].id);
  const active = SKILL_CATEGORIES.find((c) => c.id === activeId) ?? SKILL_CATEGORIES[0];

  return (
    <Revealer
      id="skills"
      className="relative overflow-hidden border-t border-white/5 bg-surface py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <motion.header
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400 sm:text-sm"
          >
            Core Expertise
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Skills for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              AI, automation & analytics
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base text-gray-400 sm:text-lg">
            Python, Machine Learning, Deep Learning, SQL, Power BI, and automation
            tools I use to ship intelligent, measurable solutions.
          </motion.p>
        </motion.header>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.6 }}
          >
            <OrbitingIcons
              key={activeId}
              icons={active.orbitIcons}
              label={active.label.split(" ")[0]}
            />
            <p className="mt-6 text-center text-sm text-gray-500">
              Orbiting stack for{" "}
              <span className="text-violet-300">{active.label}</span>
            </p>
          </motion.div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6 lg:p-8">
            <div
              role="tablist"
              aria-label="Skill categories"
              className="flex flex-wrap gap-2 border-b border-white/10 pb-5"
            >
              {SKILL_CATEGORIES.map((cat) => {
                const Icon = cat.tabIcon;
                const isActive = cat.id === activeId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveId(cat.id)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${
                      isActive
                        ? "border border-violet-500/40 bg-violet-600/20 text-violet-100 shadow-[0_0_28px_rgba(139,92,246,0.25)]"
                        : "border border-transparent text-gray-500 hover:border-white/10 hover:bg-white/5 hover:text-gray-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]"
                    }`}
                  >
                    <Icon className={isActive ? "text-violet-300" : "text-gray-500"} />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                role="tabpanel"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{active.label}</h3>
                  <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                    Proficiency
                  </span>
                </div>
                <ul className="space-y-1">
                  {active.skills.map((skill, i) => (
                    <SkillProgressBar
                      key={skill.name}
                      name={skill.name}
                      level={skill.level}
                      index={i}
                    />
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Revealer>
  );
}
