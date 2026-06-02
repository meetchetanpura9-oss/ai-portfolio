import { useRef } from "react";
import { motion } from "framer-motion";

/**
 * Subtle 3D tilt on hover — use around bento / project cards.
 */
export default function TiltCard({ children, className = "", maxTilt = 8 }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    if (window.innerWidth < 768) return; // Disable tilt on touch/mobile screens
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = "none"; // Bypasses CSS transition during tracking for zero lag
    el.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) {
      // Smooth return to center transition
      el.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
      el.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale3d(1,1,1)";
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`preserve-3d ${className}`}
    >
      {children}
    </motion.div>
  );
}
