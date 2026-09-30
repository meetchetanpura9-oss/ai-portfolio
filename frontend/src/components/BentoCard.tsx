"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const cardBase =
  "group relative h-full overflow-hidden rounded-3xl border border-border-custom bg-surface p-6 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#100D1C]/85 text-text-primary";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: "violet" | "cyan" | "magenta" | string;
  innerClassName?: string;
  onClick?: () => void;
}

export default function BentoCard({
  children,
  className = "",
  delay = 0,
  glow = "violet",
  innerClassName = "",
  onClick,
}: BentoCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  // Mouse tracking states for interactive spotlight
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowColors: Record<string, string> = {
    violet: "rgba(168, 85, 247, 0.18)",
    cyan: "rgba(56, 189, 248, 0.16)",
    magenta: "rgba(236, 72, 153, 0.18)",
  };

  const activeGlow = glowColors[glow] || glowColors.violet;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`${cardBase} hover:border-accent/40 hover:shadow-[0_12px_40px_rgba(139,92,246,0.18)] ${className}`}
    >
      {/* Interactive spotlight backdrop */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, ${activeGlow}, transparent 80%)`,
          }}
        />
      )}

      {/* Glossy corner highlight */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-[#8B5CF6]/15 group-hover:blur-3xl" />

      <div className={`relative z-10 ${innerClassName}`}>{children}</div>
    </motion.article>
  );
}
