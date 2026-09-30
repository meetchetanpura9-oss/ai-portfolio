"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Layers, ArrowDown } from "lucide-react";

interface Phase {
  number: string;
  title: string;
  tagline: string;
  summary: string;
  points: string[];
  accentColor: string;
  badge: string;
}

const PHASES: Phase[] = [
  {
    number: "01",
    title: "Discover",
    tagline: "Uncovering Ground Truth",
    summary:
      "80% of tech projects fail because no one asked the right question. We start at the uncomfortable truth.",
    points: [
      "Deep dive into real business workflows vs org-chart assumptions",
      "Identifying hidden data silos and operational bottlenecks",
      "Absolute clarity before a single line of code is written",
    ],
    accentColor: "#A855F7",
    badge: "PHASE 01 • INVESTIGATION",
  },
  {
    number: "02",
    title: "Diagnose",
    tagline: "Root-Cause Architecture",
    summary:
      "Symptoms are easy to see. Root causes take rigorous engineering and data investigation.",
    points: [
      "Tracing issues back to structural data & pipeline sources",
      "Analyzing latency, throughput, and system dependencies",
      "Building an actionable diagnostic roadmap for execution",
    ],
    accentColor: "#3B82F6",
    badge: "PHASE 02 • ANALYSIS",
  },
  {
    number: "03",
    title: "Design",
    tagline: "Constraint-Driven Blueprint",
    summary:
      "A plan only earns its place if it survives contact with enterprise production reality.",
    points: [
      "Custom AI/ML architecture engineered for your exact stack",
      "Every technical decision tied to measurable SLA outcomes",
      "Interactive proof-of-concept validation before full build",
    ],
    accentColor: "#10B981",
    badge: "PHASE 03 • BLUEPRINT",
  },
  {
    number: "04",
    title: "Deliver",
    tagline: "Incremental Production Ships",
    summary:
      "Execution is where most traditional methodologies quietly collapse. We ship in production increments.",
    points: [
      "Shipped in clean, fully-tested deployment cycles",
      "Built with maintainable code standards for your internal team",
      "Zero-downtime integration with continuous monitoring",
    ],
    accentColor: "#F59E0B",
    badge: "PHASE 04 • SHIP & DEPLOY",
  },
  {
    number: "05",
    title: "Evolve",
    tagline: "Continuous Optimization",
    summary:
      "The system isn't finished when it launches—that's when continuous intelligence begins.",
    points: [
      "Real-time monitoring of model accuracy, drift & API latency",
      "Iterative AI refinements based on live production feedback",
      "Self-sustaining workflows that scale seamlessly with growth",
    ],
    accentColor: "#EC4899",
    badge: "PHASE 05 • SCALE & ITERATE",
  },
];

export default function Methodology() {
  const targetRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  // Track scroll progress inside the 400vh section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring physics interpolation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });

  // Transform 0 -> 1 progress to discrete 100% horizontal slide offsets (0%, -100%, -200%, -300%, -400%)
  const x = useTransform(smoothProgress, [0, 0.2, 0.4, 0.6, 0.8], ["0%", "-100%", "-200%", "-300%", "-400%"]);

  // Overall progress bar fill line
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Synchronize active step index
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const step = Math.min(4, Math.floor(latest * 5));
      setActiveStep(step);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-transparent" id="methodology">
      {/* Sticky Fullscreen Viewport Container */}
      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden py-6 sm:py-10">

        {/* Top Header & Step Navigation Bar */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-custom pb-5">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border-custom bg-surface-raised px-3 py-1 font-mono text-xs font-bold text-accent dark:border-[#8B5CF6]/30 dark:text-[#C084FC]">
                <Layers className="h-3.5 w-3.5" />
                <span>THE FRAMEWORK</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl font-display">
                The 5 Method Concept.
              </h2>
            </div>

            {/* Step Navigation Progress Indicator */}
            <div className="flex flex-col gap-2 w-full md:w-80">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-text-muted">
                <span className="text-accent">METHOD {activeStep + 1} OF 05</span>
                <span className="text-text-primary">{PHASES[activeStep].title.toUpperCase()}</span>
              </div>

              {/* 5 Step Indicator Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {PHASES.map((p, idx) => {
                  const isActive = idx === activeStep;
                  const isCompleted = idx < activeStep;
                  return (
                    <div
                      key={p.number}
                      className={`flex-1 h-2 rounded-full transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? "bg-accent shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                          : isCompleted
                          ? "bg-[#10B981]"
                          : "bg-surface-raised border border-border-custom dark:bg-[#181426]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Overall Progress Line */}
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-surface-raised dark:bg-[#181426] mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:via-[#E879F9] dark:to-[#38BDF8]"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 100% Width Horizontal Slide Track */}
        <div className="relative w-full my-auto overflow-hidden py-2">
          <motion.div style={{ x }} className="flex w-[500%] h-full">
            {PHASES.map((phase, index) => {
              const isActive = index === activeStep;
              return (
                <div
                  key={phase.number}
                  className="w-[100vw] shrink-0 flex justify-center items-center px-4 sm:px-6 lg:px-8"
                >
                  <motion.div
                    animate={{
                      scale: isActive ? 1 : 0.95,
                      opacity: isActive ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full max-w-3xl rounded-3xl border border-border-custom bg-surface/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl dark:border-[#262038] dark:bg-[#100D1C]/95 flex flex-col justify-between min-h-[420px] sm:min-h-[460px] overflow-hidden"
                  >
                    {/* Top Color Accent Line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${phase.accentColor}, transparent)`,
                      }}
                    />

                    {/* Watermark Number */}
                    <span
                      className="pointer-events-none absolute right-6 bottom-4 font-display text-9xl sm:text-[13rem] font-extrabold text-text-primary/5 dark:text-white/5 select-none leading-none"
                      aria-hidden="true"
                    >
                      {phase.number}
                    </span>

                    <div>
                      {/* Badge & Step Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="rounded-full px-3.5 py-1 font-mono text-xs font-bold tracking-wider uppercase border"
                          style={{
                            borderColor: `${phase.accentColor}40`,
                            backgroundColor: `${phase.accentColor}15`,
                            color: phase.accentColor,
                          }}
                        >
                          {phase.badge}
                        </span>

                        <span className="font-mono text-xs font-bold text-text-muted border border-border-custom px-2.5 py-1 rounded-full bg-surface-raised dark:border-[#262038]">
                          METHOD {phase.number} / 05
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-text-primary mb-2">
                        {phase.title}.
                      </h3>
                      <p className="text-sm font-mono font-semibold text-accent mb-5">
                        {"// "}{phase.tagline}
                      </p>

                      {/* Summary Quote Box */}
                      <div className="border-l-2 border-accent/40 pl-4 py-1 mb-6 bg-accent/5 rounded-r-lg">
                        <p className="text-base sm:text-lg leading-relaxed text-text-primary font-medium">
                          &ldquo;{phase.summary}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-3 border-t border-border-custom pt-5">
                      {phase.points.map((point) => (
                        <div key={point} className="flex items-start gap-3">
                          <CheckCircle2
                            className="h-5 w-5 shrink-0 mt-0.5"
                            style={{ color: phase.accentColor }}
                          />
                          <span className="text-sm sm:text-base text-text-primary font-medium leading-relaxed">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Status Bar */}
                    <div className="mt-8 flex items-center justify-between text-xs font-mono text-text-muted pt-4 border-t border-border-custom">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>STEP {phase.number} OF 05</span>
                      </span>

                      {index === PHASES.length - 1 ? (
                        <span className="inline-flex items-center gap-2 text-[#10B981] font-bold animate-pulse bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/30">
                          <span>ALL 5 METHODS COMPLETE — RESUMING VERTICAL SCROLL</span>
                          <ArrowDown className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-accent font-bold bg-accent/10 px-3 py-1 rounded-full border border-accent/30">
                          <span>COMPLETE METHOD {phase.number} → SCROLL FOR NEXT</span>
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom Scroll Indicator Cue */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted pt-3 border-t border-border-custom">
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>ONE-BY-ONE HORIZONTAL METHOD FOCUS</span>
            </span>

            <span className="hidden sm:inline-block text-text-dim">
              Method {activeStep + 1} active • Scroll down to reveal Method {Math.min(5, activeStep + 2)} • Vertical scroll auto-resumes after Method 05
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
