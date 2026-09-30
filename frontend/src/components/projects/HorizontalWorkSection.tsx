"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PROJECTS } from "../../lib/projects";

export default function HorizontalWorkSection() {
  return (
    <section id="work" className="tech-section">
      <div className="shell">
        <div className="mb-14 grid gap-7 border-b border-[var(--color-line)] pb-10 lg:grid-cols-[1fr_25rem] lg:items-end">
          <div><span className="type-label section-kicker">01 / Selected systems</span><h2 className="type-h2 mt-4 max-w-[14ch]">Built to perform beyond the demo.</h2></div>
          <p className="type-body-md text-[var(--color-muted)]">Production-minded AI products that connect models, data, interfaces, and real operational workflows.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURED_PROJECTS.map((project, index) => (
            <motion.article key={project.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .6, delay: index * .08 }} className={`tech-card group min-h-[29rem] p-6 sm:p-8 ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-12" : ""}`}>
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4 type-caption text-[var(--color-dim)]"><span className="text-[var(--color-signal)]">{project.serviceCategory}</span><span>{project.year}</span></div>
                <h3 className="type-h3 mt-8 max-w-[16ch] transition-colors group-hover:text-[var(--color-signal)]">{project.title}</h3>
                <p className="type-body-md mt-4 max-w-xl text-[var(--color-muted)]">{project.oneLiner}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-8">{project.technologies.slice(0, 5).map(tech => <span key={tech} className="rounded-full border border-[var(--color-line)] px-3 py-1.5 type-caption text-[var(--color-muted)]">{tech}</span>)}</div>
              </div>
              <div className={`relative z-10 mt-8 flex flex-col justify-end rounded-[1.2rem] border border-[var(--color-line)] bg-[#080c0dcc] p-6 ${index === 0 ? "md:mt-0" : ""}`}>
                <span className="type-label text-[var(--color-dim)]">Measured outcome</span>
                <p className="type-h4 mt-3 text-[var(--color-signal)]">{project.impact}</p>
                <Link href={`/work/${project.slug}`} className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-5 type-button">View case study <ArrowUpRight size={17} /></Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
