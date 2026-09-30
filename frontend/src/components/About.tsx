"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const stack = ["Python", "FastAPI", "Next.js", "PostgreSQL", "LangChain", "Docker", "Power BI", "Azure"];

export default function About() {
  return <section id="about" className="tech-section"><div className="shell">
    <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><span className="type-label section-kicker">04 / The engineer</span><h2 className="type-h2 mt-4 max-w-[13ch]">Technical depth. Human judgment.</h2><p className="type-body-lg mt-7 max-w-2xl text-[var(--color-muted)]">I&apos;m Meet Chetanpura, an AI and automation engineer based in Ahmedabad. My work sits between machine intelligence and practical product engineering—turning raw models into systems people can trust, use, and measure.</p><a href="/about" className="mt-7 inline-flex items-center gap-2 type-button text-[var(--color-signal)]">View full profile <ArrowUpRight size={16}/></a></motion.div>
      <div className="tech-card p-7"><div className="relative z-10"><div className="flex items-center justify-between border-b border-[var(--color-line)] pb-5"><span className="type-label text-[var(--color-muted)]">Current vector</span><span className="type-caption text-[var(--color-signal)]">MCA · 2024—2026</span></div><p className="type-h4 mt-6">Master of Computer Applications</p><p className="type-body-sm mt-2 text-[var(--color-muted)]">GLS University · Machine learning, distributed systems, database architecture.</p></div></div>
    </div>
    <div className="mt-12 grid gap-5 border-t border-[var(--color-line)] pt-8 lg:grid-cols-[.6fr_1.4fr]"><span className="type-label text-[var(--color-dim)]">Selected technology</span><div className="flex flex-wrap gap-2">{stack.map(item => <span key={item} className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 type-caption text-[var(--color-muted)]">{item}</span>)}</div></div>
  </div></section>;
}
