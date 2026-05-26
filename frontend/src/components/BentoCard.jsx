import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const cardBase =
  "group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 sm:p-6";

export default function BentoCard({
  children,
  className = "",
  delay = 0,
  glow = "violet",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  const glowMap = {
    violet: "from-violet-600/20 via-fuchsia-600/5 to-transparent group-hover:from-violet-600/30",
    cyan: "from-cyan-500/20 via-violet-600/5 to-transparent group-hover:from-cyan-500/30",
    fuchsia: "from-fuchsia-600/20 via-violet-600/5 to-transparent group-hover:from-fuchsia-600/30",
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`${cardBase} ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${glowMap[glow] ?? glowMap.violet}`}
      />
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:bg-violet-500/10 group-hover:blur-3xl" />
      <div className="relative z-10">{children}</div>
    </motion.article>
  );
}
