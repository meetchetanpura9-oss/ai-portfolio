"use client";

import { useEffect, useRef, useState } from "react";

export function useMagnetic(strength = 0.38, range = 70) {
  const ref = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect user motion preferences
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const distanceX = e.clientX - elX;
      const distanceY = e.clientY - elY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < range) {
        // Pull towards cursor
        setPosition({
          x: distanceX * strength,
          y: distanceY * strength,
        });
      } else {
        // Snap back
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    el.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, range]);

  const style = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    transition: position.x !== 0 || position.y !== 0
      ? "transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)"
      : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  return { ref, style };
}
