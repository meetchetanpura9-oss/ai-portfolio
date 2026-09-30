"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import NeuralCore from "./NeuralCore";

const capabilities = ["Agentic AI", "Machine Learning", "Automation Systems", "Intelligent Products"];

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-10">
      <div className="shell relative z-10 grid items-center gap-12 lg:grid-cols-[1.07fr_.93fr] lg:gap-8">
        <div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="type-label mb-8 flex items-center gap-3 text-[var(--color-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] shadow-[0_0_16px_var(--color-signal)]" />
            Independent AI engineer · Ahmedabad / Global
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .08, ease: [0.16,1,0.3,1] }} className="type-display-lg max-w-[10ch]">
            Intelligence,
            <br />engineered to
            <br /><span className="text-[var(--color-signal)]">move business.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .24 }} className="type-body-lg mt-8 max-w-[39rem] text-[var(--color-muted)]">
            I design and build AI agents, machine-learning systems, and automation infrastructure that turn complex operations into focused, scalable products.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .7, delay: .38 }} className="mt-9 flex flex-wrap gap-3">
            <a href="#work" className="btn-primary">Explore systems <ArrowDownRight size={17} /></a>
            <a href="#contact" className="btn-secondary">Start a project <ArrowUpRight size={17} /></a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }} className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-[var(--color-line)] pt-5">
            {capabilities.map((item, index) => <span key={item} className="type-caption text-[var(--color-dim)]"><b className="mr-2 text-[var(--color-signal)]">0{index + 1}</b>{item}</span>)}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .14, ease: [0.16,1,0.3,1] }} className="relative lg:translate-x-6">
          <NeuralCore />
          <div className="mx-auto mt-4 flex w-full max-w-[35rem] items-center justify-between px-2 type-caption text-[var(--color-dim)]">
            <span>MC / INTELLIGENCE CORE</span><span>STATUS: <b className="text-[var(--color-signal)]">ONLINE</b></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
