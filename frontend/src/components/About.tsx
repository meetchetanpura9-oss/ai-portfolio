"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const stack = ["Python", "FastAPI", "Next.js", "PostgreSQL", "LangChain", "Docker", "Power BI", "Azure"];

export default function About() {
  return <section id="about" className="tech-section"><div className="shell">
    <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><span className="type-label section-kicker">04 / About Meet</span><h2 className="type-h2 mt-4 max-w-[13ch]">Technical depth. Human judgment.</h2><p className="type-body-lg mt-7 max-w-2xl text-[var(--color-muted)]">I&apos;m Meet Chetanpura. My interests sit between machine learning and practical product engineering: understanding a problem, building a useful system, and explaining the choices behind it.</p><a href="/about" className="mt-7 inline-flex items-center gap-2 type-button text-[var(--color-signal)]">View full profile <ArrowUpRight size={16}/></a></motion.div>
      <div className="tech-card p-7"><div className="relative z-10"><span className="type-label text-[var(--color-muted)]">How I approach a project</span><p className="type-h4 mt-6">Start with the problem, then choose the tools.</p><p className="type-body-sm mt-3 text-[var(--color-muted)]">A clear scope, testable decisions, and documentation make the technical work easier to evaluate and maintain.</p></div></div>
    </div>
    <div className="mt-12 grid gap-5 border-t border-[var(--color-line)] pt-8 lg:grid-cols-[.6fr_1.4fr]"><span className="type-label text-[var(--color-dim)]">Selected technology</span><div className="flex flex-wrap gap-2">{stack.map(item => <span key={item} className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 type-caption text-[var(--color-muted)]">{item}</span>)}</div></div>
  </div></section>;
}
