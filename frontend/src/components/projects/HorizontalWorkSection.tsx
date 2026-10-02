"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PROJECTS } from "../../lib/projects";
import styles from "./EditorialWork.module.css";

export default function HorizontalWorkSection() {
  const reducedMotion = useReducedMotion();
  return (
    <section id="work" className={styles.section} aria-labelledby="work-title">
      <div className={styles.shell}>
        <div className={styles.heading}>
          <div><span className={styles.eyebrow}>[ SELECTED WORK / BRIEFS IN REVIEW ]</span><h2 id="work-title">WORK<span>.</span></h2></div>
          <p>Four project records. Technical details, roles, and outcomes will appear here when supporting material has been reviewed.</p>
        </div>
        <div className={styles.list}>
          {FEATURED_PROJECTS.map((project, index) => (
            <motion.article key={project.id} initial={reducedMotion ? false : { opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: reducedMotion ? 0 : .7, delay: reducedMotion ? 0 : .08 }} className={styles.project}>
              <div className={styles.copy}>
                <span className={styles.index}>0{index + 1} / PROJECT BRIEF</span>
                <h3>{project.title}</h3>
                <p>Scope, role, and supporting artifacts are awaiting review.</p>
                <Link href={`/work/${project.slug}`} className={styles.link}>EXPLORE BRIEF <ArrowUpRight size={20} aria-hidden="true" /></Link>
              </div>
              <div className={`${styles.art} ${styles[`art${index + 1}`]}`} aria-hidden="true">
                <div className={styles.artHeader}><span>MEET / SYSTEM STUDY</span><span>0{index + 1}</span></div>
                <div className={styles.orbit}><span /><span /><span /><i /><i /><i /></div>
                <div className={styles.artFooter}><span>DATA</span><span>MODEL</span><span>DECISION</span></div>
              </div>
            </motion.article>
          ))}
        </div>
        <Link href="/work" className={styles.all}>VIEW ALL PROJECT BRIEFS <ArrowUpRight size={19} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
