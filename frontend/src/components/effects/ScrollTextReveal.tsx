"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface ScrollTextRevealProps {
  text: string;
  className?: string;
}

export default function ScrollTextReveal({ text, className = "" }: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = text.split(" ");

  return (
    <span ref={containerRef} className={`relative flex flex-wrap leading-tight ${className}`}>
      {words.map((word, wordIndex) => {
        const start = wordIndex / words.length;
        const end = (wordIndex + 1) / words.length;

        return (
          <Word key={wordIndex} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </span>
  );
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const color = useTransform(progress, range, ["rgba(136, 146, 176, 0.2)", "#fafafa"]);

  return (
    <motion.span style={{ opacity, color }} className="mr-2.5 inline-block will-change-[opacity,color] font-semibold">
      {children}
    </motion.span>
  );
}
