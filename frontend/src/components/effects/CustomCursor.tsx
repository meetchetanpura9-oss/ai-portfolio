"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reducedMotion) return;

    setEnabled(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const cursorLabel = target.closest("[data-cursor-text]")?.getAttribute("data-cursor-text");
      if (cursorLabel) {
        setHoverText(cursorLabel);
        setIsHovered(true);
        return;
      }

      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.classList.contains("cursor-pointer");

      setIsHovered(isInteractive);
      setHoverText(null);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest text-[#0B0D0F]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        backgroundColor: "#B7F34A",
      }}
      animate={{
        width: hoverText ? 100 : isHovered ? 36 : 10,
        height: hoverText ? 36 : isHovered ? 36 : 10,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {hoverText && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-2 text-center truncate"
        >
          {hoverText}
        </motion.span>
      )}
    </motion.div>
  );
}
