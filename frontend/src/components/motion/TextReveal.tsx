"use client";

import { motion } from "framer-motion";
import { lineRevealContainer, lineRevealItem } from "../../lib/motion";

interface TextRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}

export default function TextReveal({
  lines,
  className = "",
  lineClassName = "",
  as = "h1",
}: TextRevealProps) {
  const Component = motion[as];

  return (
    <Component
      variants={lineRevealContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`flex flex-col ${className}`}
    >
      {lines.map((line, index) => (
        <span key={index} className="overflow-hidden inline-block py-0.5">
          <motion.span
            variants={lineRevealItem}
            className={`inline-block ${lineClassName}`}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
