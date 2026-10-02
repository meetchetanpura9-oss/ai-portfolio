"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import styles from "./EditorialHero.module.css";

export default function Hero() {
  const reducedMotion = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 48 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reducedMotion ? 0 : .85, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="hero" aria-labelledby="hero-title" className={styles.hero}>
      <div className={styles.photo} aria-hidden="true">
        <Image src="/hero-3.png.jpeg" alt="" fill priority sizes="(max-width: 700px) 100vw, 60vw" className={styles.portrait} />
      </div>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <motion.div {...reveal(0)} className={styles.topline}>
          <span>MEET CHETANPURA</span><span>AI / ML + SOFTWARE ENGINEERING</span>
        </motion.div>
        <div className={styles.center}>
          <motion.p {...reveal(.1)} className={styles.intro}>Hello, I&apos;m Meet. I build useful intelligence into real software.</motion.p>
          <h1 id="hero-title" className={styles.title}>
            <motion.span {...reveal(.12)}>INTELLIGENT</motion.span>
            <motion.span {...reveal(.24)} className={styles.indent}>SYSTEMS<span className={styles.period}>.</span></motion.span>
            <motion.span {...reveal(.36)}>HUMAN IMPACT<span className={styles.period}>.</span></motion.span>
          </h1>
          <motion.div {...reveal(.48)} className={styles.actions}>
            <Link href="#work">EXPLORE THE WORK <ArrowUpRight size={18} aria-hidden="true" /></Link>
            <Link href="#contact">START A CONVERSATION <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </motion.div>
        </div>
        <motion.div {...reveal(.58)} className={styles.bottomline}>
          <span>PERSONAL PORTFOLIO / 2026</span>
          <span>SCROLL TO EXPLORE <ArrowDownRight size={19} aria-hidden="true" /></span>
        </motion.div>
      </div>
    </section>
  );
}
