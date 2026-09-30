"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./NeuralCore.module.css";

const nodes = [
  [50, 7], [76, 15], [91, 38], [88, 68], [67, 87], [37, 91], [13, 69], [9, 38], [27, 16],
];

export default function NeuralCore() {
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), { stiffness: 110, damping: 24 });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [9, -9]), { stiffness: 110, damping: 24 });

  return (
    <motion.div
      ref={ref}
      className={styles.stage}
      style={{ rotateX, rotateY }}
      onPointerMove={(event) => {
        const box = ref.current?.getBoundingClientRect();
        if (!box) return;
        pointerX.set((event.clientX - box.left) / box.width - 0.5);
        pointerY.set((event.clientY - box.top) / box.height - 0.5);
      }}
      onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
      aria-label="Animated three-dimensional AI agent network"
      role="img"
    >
      <div className={styles.scan} />
      <div className={`${styles.orbit} ${styles.orbitOne}`}><span /></div>
      <div className={`${styles.orbit} ${styles.orbitTwo}`}><span /></div>
      <div className={`${styles.orbit} ${styles.orbitThree}`}><span /></div>
      <div className={styles.coreShell}>
        <div className={styles.coreGrid} />
        <div className={styles.coreGlow} />
        <div className={styles.coreMark}>AI</div>
      </div>
      {nodes.map(([left, top], index) => (
        <span key={index} className={styles.node} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * -0.34}s` }} />
      ))}
      <div className={`${styles.label} ${styles.labelTop}`}><i />AGENT ORCHESTRATION</div>
      <div className={`${styles.label} ${styles.labelRight}`}><i />RAG PIPELINE</div>
      <div className={`${styles.label} ${styles.labelBottom}`}><i />AUTOMATION LAYER</div>
    </motion.div>
  );
}
