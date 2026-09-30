"use client";
import { motion } from "framer-motion";

const phases = [
  ["01", "Map the signal", "Find the workflow bottleneck, the data available, and the one business outcome worth improving."],
  ["02", "Design the system", "Define the smallest dependable architecture, guardrails, interfaces, and success metrics."],
  ["03", "Build the intelligence", "Ship in visible increments, test against real edge cases, and keep humans in control."],
  ["04", "Operate and evolve", "Deploy with observability, document the system, and improve it using production feedback."],
];

export default function ProcessSection() {
  return <section id="process" className="tech-section"><div className="shell">
    <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
      <div className="lg:sticky lg:top-32 lg:self-start"><span className="type-label section-kicker">03 / Operating model</span><h2 className="type-h2 mt-4 max-w-[10ch]">Clarity before complexity.</h2><p className="type-body-md mt-6 max-w-sm text-[var(--color-muted)]">A rigorous path from uncertain idea to useful, maintainable AI system.</p></div>
      <div className="border-t border-[var(--color-line)]">
        {phases.map(([number, title, text], index) => <motion.div key={number} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group grid gap-4 border-b border-[var(--color-line)] py-8 sm:grid-cols-[5rem_1fr] sm:py-10">
          <span className="type-caption pt-1 text-[var(--color-signal)]">PHASE {number}</span><div className="grid gap-3 md:grid-cols-[.75fr_1.25fr]"><h3 className="type-h4 transition-colors group-hover:text-[var(--color-signal)]">{title}</h3><p className="type-body-md text-[var(--color-muted)]">{text}</p></div>
        </motion.div>)}
      </div>
    </div>
  </div></section>;
}
