import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

/**
 * Ambient neural-network particle field (2D canvas).
 * - Fewer nodes on small screens, DPR capped at 1.5
 * - Pauses when off-screen or when the tab is hidden
 * - Draws one static frame for reduced-motion users
 * - Colours come from CSS variables, so it follows the theme
 */
export default function NeuralCanvas({ className = "" }) {
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const styles = getComputedStyle(document.documentElement);
    const lineRGB = styles.getPropertyValue("--net-line").trim() || "37 99 235";
    const nodeRGB = styles.getPropertyValue("--net-node").trim() || "124 58 237";
    const isDark = theme === "dark";
    const lineAlpha = isDark ? 0.22 : 0.16;
    const nodeAlpha = isDark ? 0.7 : 0.45;

    let width = 0;
    let height = 0;
    let nodes = [];
    let raf = 0;
    let running = false;
    let visible = true;
    const LINK = 140;

    const seed = () => {
      const count = width < 640 ? 26 : width < 1024 ? 42 : 62;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.4 + 0.9,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const alpha = (1 - Math.sqrt(d2) / LINK) * lineAlpha;
            ctx.strokeStyle = `rgb(${lineRGB} / ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = `rgb(${nodeRGB} / ${nodeAlpha})`;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -10 || n.x > width + 10) n.vx *= -1;
        if (n.y < -10 || n.y > height + 10) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    start();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduceMotion, theme]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden />;
}
