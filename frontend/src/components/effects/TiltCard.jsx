import { useRef } from "react";
import { motion } from "framer-motion";

/**
 * Subtle 3D tilt on hover — use around bento / project cards.
 */
export default function TiltCard({ children, className = "", maxTilt = 8 }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)";
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`preserve-3d transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
}
