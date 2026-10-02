"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Code2 } from "lucide-react";
import NeuralCore from "./NeuralCore";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : delay },
  });

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-[min(55rem,100svh)] items-center overflow-hidden pb-14 pt-32 sm:pb-20">
      <div className="shell relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-10">
        <div>
          <motion.p {...reveal(0)} className="type-label mb-7 flex items-center gap-3 text-[var(--color-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-signal)]" aria-hidden="true" />
            Meet Chetanpura / AI &amp; software engineering
          </motion.p>
          <motion.h1 {...reveal(0.08)} id="hero-title" className="type-display-lg max-w-[12ch]">
            Building useful AI into <span className="text-[var(--color-signal)]">real software.</span>
          </motion.h1>
          <motion.p {...reveal(0.18)} className="type-body-lg mt-7 max-w-[37rem] text-[var(--color-muted)]">
            I work across machine learning, automation, and product engineering. Explore my work and approach, or tell me about a problem you want to solve.
          </motion.p>
          <motion.div {...reveal(0.28)} className="mt-9 flex flex-wrap gap-3">
            <a href="#work" className="btn-primary">View work <ArrowDownRight size={17} aria-hidden="true" /></a>
            <a href="#contact" className="btn-secondary">Discuss a project <ArrowUpRight size={17} aria-hidden="true" /></a>
          </motion.div>
          <motion.div {...reveal(0.36)} className="mt-12 grid gap-3 border-t border-[var(--color-line)] pt-6 sm:grid-cols-2">
            <a href="/about" className="audience-link">
              <BriefcaseBusiness size={20} aria-hidden="true" />
              <span><strong>For hiring teams</strong><small>Background, skills, and contribution</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="#services" className="audience-link">
              <Code2 size={20} aria-hidden="true" />
              <span><strong>For project teams</strong><small>Capabilities and working approach</small></span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </motion.div>
        </div>
        <motion.div {...reveal(0.15)} className="relative lg:translate-x-4">
          <NeuralCore />
          <p className="mx-auto mt-4 max-w-[35rem] text-center type-caption text-[var(--color-dim)]">Illustrative system visual / interaction follows your motion preference</p>
        </motion.div>
      </div>
    </section>
  );
}
