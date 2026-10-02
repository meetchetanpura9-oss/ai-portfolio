"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PROJECTS } from "../../lib/projects";
import styles from "./WorkDepth.module.css";

export default function HorizontalWorkSection() {
  return (
    <section id="work" className="tech-section">
      <div className="shell">
        <div className="mb-14 grid gap-7 border-b border-[var(--color-line)] pb-10 lg:grid-cols-[1fr_25rem] lg:items-end">
          <div><span className="type-label section-kicker">01 / Work</span><h2 className="type-h2 mt-4 max-w-[14ch]">The work, with context.</h2></div>
          <p className="type-body-md text-[var(--color-muted)]">These project briefs are being reviewed. Technical details and outcomes will be published with supporting evidence.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURED_PROJECTS.map((project, index) => (
            <motion.article key={project.id} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .6, delay: index * .08 }} className={`tech-card group min-h-[29rem] p-6 sm:p-8 ${styles.card} ${index === 0 ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-12" : ""}`}>
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4 type-caption text-[var(--color-dim)]"><span className="text-[var(--color-signal)]">Project brief</span><span>0{index + 1}</span></div>
                <h3 className="type-h3 mt-8 max-w-[16ch] transition-colors group-hover:text-[var(--color-signal)]">{project.title}</h3>
                <p className="type-body-md mt-4 max-w-xl text-[var(--color-muted)]">Scope, role, and supporting artifacts are awaiting review.</p>
                <div className="mt-auto pt-8 type-caption text-[var(--color-dim)]">Details in preparation</div>
              </div>
              <div className={`project-preview relative z-10 mt-8 flex flex-col justify-between rounded-[1.2rem] border border-[var(--color-line)] p-6 ${styles.preview} ${index === 0 ? "md:mt-0" : ""}`}>
                <span className="type-label text-[var(--color-dim)]">Project record / 0{index + 1}</span>
                <div className="project-preview-graphic" aria-hidden="true"><span /><span /><span /></div>
                <Link href={`/work/${project.slug}`} className="flex items-center justify-between border-t border-[var(--color-line)] pt-5 type-button">View brief <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
