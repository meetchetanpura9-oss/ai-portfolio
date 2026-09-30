"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { siteContent } from "../data/siteContent";

export default function ProblemSection() {
  return <section className="tech-section"><div className="shell">
    <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]"><div><span className="type-label section-kicker">Our operating purpose</span><h2 className="type-h2 mt-4 max-w-[12ch]">AI should solve the work behind the work.</h2><p className="type-body-lg mt-6 max-w-xl text-[var(--color-muted)]">{siteContent.company.promise}</p><a className="mt-8 inline-flex items-center gap-2 type-button text-[var(--color-signal)]" href="#contact">Discuss your bottleneck <ArrowUpRight size={16}/></a></div>
      <div className="border-t border-[var(--color-line)]">{siteContent.problems.map((problem, index) => <motion.article key={problem.code} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="grid gap-4 border-b border-[var(--color-line)] py-7 sm:grid-cols-[3rem_1fr]"><span className="type-caption text-[var(--color-signal)]">{problem.code}</span><div><h3 className="type-h4">{problem.title}</h3><p className="type-body-md mt-2 text-[var(--color-muted)]">{problem.text}</p></div></motion.article>)}</div>
    </div>
  </div></section>;
}
