import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const glowRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, visible: false });
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disable mouse glow on touch devices to conserve CPU, battery, and avoid visual bugs
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    positionRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    let rafId;
    const update = () => {
      const target = pointerRef.current;
      const pos = positionRef.current;
      const deltaX = target.x - pos.x;
      const deltaY = target.y - pos.y;

      pos.x += deltaX * 0.12;
      pos.y += deltaY * 0.12;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        glowRef.current.style.opacity = target.visible ? "1" : "0";
      }

      rafId = requestAnimationFrame(update);
    };

    const handleMove = (event) => {
      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        visible: true,
      };
    };

    const handleLeave = () => {
      pointerRef.current.visible = false;
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave, { passive: true });

    rafId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[40] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.3),rgba(34,211,238,0.15),transparent_70%)] opacity-0 blur-[140px] transition-opacity duration-300 will-change-transform"
    />
  );
}
