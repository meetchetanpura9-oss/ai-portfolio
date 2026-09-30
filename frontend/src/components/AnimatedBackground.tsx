"use client";

import dynamic from "next/dynamic";
const InteractiveParticles = dynamic(() => import("./effects/InteractiveParticles"), { ssr: false });

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-void z-0 transition-colors duration-300" aria-hidden>
      <div className="theme-background-image" />
      <div className="theme-background-wash" />

      {/* Full-Page Interactive Neural Network Particles */}
      <InteractiveParticles />

      {/* Ambient Spotlight 1 (Violet) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.15),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(139,92,246,0.22),transparent_70%)]" />

      {/* Ambient Spotlight 2 (Cyan / Hot Pink) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(228,0,124,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(0,240,255,0.08),transparent_70%)]" />

      {/* Subtle Grid Dot Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(120,120,120,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" />
    </div>
  );
}
