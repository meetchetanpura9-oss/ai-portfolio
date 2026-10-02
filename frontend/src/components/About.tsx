"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./EditorialAbout.module.css";

const stack = ["Python", "FastAPI", "Next.js", "PostgreSQL", "LangChain", "Docker", "Power BI", "Azure"];

export default function About() {
  return <section id="about" className={styles.section} aria-labelledby="about-title"><div className={styles.shell}>
    <div className={styles.grid}>
      <div className={styles.portrait}><Image src="/hero-2.png.jpeg" alt="Meet Chetanpura standing outdoors" fill sizes="(max-width: 850px) 100vw, 40vw" /></div>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={styles.copy}>
        <span className={styles.eyebrow}>[ ABOUT MEET ]</span>
        <h2 id="about-title">CURIOUS BY NATURE.<br/><em>TECHNICAL BY CHOICE.</em></h2>
        <p>I&apos;m Meet Chetanpura. My interests sit between machine learning and practical product engineering: understanding a problem, building a useful system, and explaining the choices behind it.</p>
        <p>For a hiring team, this is a view of how I think and what I am learning. For a project team, it is a starting point for a conversation about the problem you need to solve.</p>
        <a href="/about" className={styles.link}>READ MY PROFILE <ArrowUpRight size={19} aria-hidden="true" /></a>
      </motion.div>
    </div>
    <div className={styles.stack}><span>SELECTED TECHNOLOGY</span><div>{stack.map(item => <span key={item}>{item}</span>)}</div></div>
  </div></section>;
}
