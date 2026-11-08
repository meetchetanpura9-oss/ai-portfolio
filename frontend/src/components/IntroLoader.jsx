import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { MessageSquareText, BrainCircuit, Wrench, Bot, Send, ArrowRight } from "lucide-react";
import { easePremium } from "../lib/motionVariants";

/**
 * Opening sequence: a compact agent workflow boots up node by node,
 * then hands over to a "Welcome to Meet's Portfolio" message.
 *
 * - ~3s total, skippable (button, click on the backdrop, Enter / Escape / Space)
 * - Graph tilts gently toward the pointer on desktop
 * - Reduced-motion visitors go straight to the welcome message
 */

const STEPS = [
  { label: "Request", status: "Receiving request…", icon: MessageSquareText, tone: "var(--muted)" },
  { label: "Plan", status: "Planning the task…", icon: BrainCircuit, tone: "var(--brand-violet)" },
  { label: "Tools", status: "Selecting tools…", icon: Wrench, tone: "var(--brand-blue)" },
  { label: "Act", status: "Executing actions…", icon: Bot, tone: "var(--brand-cyan)" },
  { label: "Respond", status: "Composing response…", icon: Send, tone: "var(--brand-emerald)" },
];

const STEP_MS = 430;
const WELCOME_MS = 1300;

export default function IntroLoader({ onDone }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? STEPS.length : 0);
  const finished = useRef(false);
  const welcome = step >= STEPS.length;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  // drive the sequence
  useEffect(() => {
    const t = window.setTimeout(
      () => (welcome ? finish() : setStep((s) => s + 1)),
      welcome ? (reduce ? 900 : WELCOME_MS) : STEP_MS
    );
    return () => window.clearTimeout(t);
  }, [step, welcome, reduce, finish]);

  // scroll lock + keyboard skip
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e) => {
      if (["Escape", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [finish]);

  // pointer tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-1, 1], [7, -7]), { stiffness: 120, damping: 18 });
  const rotY = useSpring(useTransform(mx, [-1, 1], [-9, 9]), { stiffness: 120, damping: 18 });
  const onPointerMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set((e.clientX / window.innerWidth) * 2 - 1);
    my.set((e.clientY / window.innerHeight) * 2 - 1);
  };

  const progress = Math.min(step, STEPS.length - 1) / (STEPS.length - 1);
  const pct = Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg px-4"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.55, ease: easePremium } }}
      onPointerMove={onPointerMove}
      onClick={finish}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Meet's portfolio"
    >
      {/* ambience */}
      <div className="pointer-events-none absolute inset-0 bg-neural-grid [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[min(900px,130vw)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--brand-blue) 18%, transparent), color-mix(in srgb, var(--brand-violet) 10%, transparent) 60%, transparent)",
        }}
        aria-hidden
      />

      <motion.div
        className="relative w-full max-w-xl text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -28, scale: 0.98, transition: { duration: 0.5, ease: easePremium } }}
        transition={{ duration: 0.5, ease: easePremium }}
      >
        <p className="font-mono text-xs text-subtle">
          <span className="text-brand-blue">agent</span>.boot(<span className="text-brand-violet">&quot;portfolio&quot;</span>)
        </p>

        {/* workflow graph */}
        <motion.div
          className="relative mx-auto mt-8 max-w-md [perspective:900px]"
          style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        >
          {/* rail */}
          <div className="absolute left-[10%] right-[10%] top-[26px] h-[2px] rounded-full bg-line" aria-hidden />
          <motion.div
            className="absolute left-[10%] top-[26px] h-[2px] rounded-full bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 80}%` }}
            transition={{ duration: STEP_MS / 1000, ease: "easeInOut" }}
            aria-hidden
          >
            {!welcome && (
              <span className="absolute -right-1.5 -top-[5px] h-3 w-3 rounded-full bg-brand-cyan shadow-[0_0_14px_var(--brand-cyan)]" />
            )}
          </motion.div>

          <ol className="relative flex justify-between">
            {STEPS.map(({ label, icon: Icon, tone }, i) => {
              const done = step > i;
              const active = step === i;
              const lit = done || active || welcome;
              return (
                <li key={label} className="flex w-[20%] flex-col items-center">
                  <motion.span
                    className="relative flex h-[54px] w-[54px] items-center justify-center rounded-2xl border bg-surface"
                    animate={{
                      scale: active ? 1.12 : 1,
                      borderColor: lit ? tone : "var(--line)",
                      color: lit ? tone : "var(--subtle)",
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      boxShadow: active
                        ? `0 0 0 5px color-mix(in srgb, ${tone} 18%, transparent), 0 10px 30px -8px color-mix(in srgb, ${tone} 60%, transparent)`
                        : "var(--shadow-card)",
                    }}
                  >
                    <Icon size={22} aria-hidden />
                    {active && !reduce && (
                      <motion.span
                        className="absolute inset-0 rounded-2xl border"
                        style={{ borderColor: tone }}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        aria-hidden
                      />
                    )}
                  </motion.span>
                  <span className={`mt-3 font-mono text-[0.65rem] uppercase tracking-wider sm:text-[0.7rem] ${lit ? "text-ink" : "text-subtle"}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </motion.div>

        {/* status → welcome */}
        <div className="mt-10 min-h-[176px] sm:min-h-[150px]">
          <AnimatePresence mode="wait">
            {!welcome ? (
              <motion.div key="status" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <motion.p
                  key={step}
                  className="font-mono text-sm text-muted"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16 }}
                  aria-live="polite"
                >
                  <span className="text-brand-blue">›</span> {STEPS[step].status}
                </motion.p>
              </motion.div>
            ) : (
              <motion.div key="welcome" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  className="eyebrow"
                >
                  <span className="text-brand-emerald">●</span> goal complete
                </motion.p>
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 16, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }}
                  transition={{ duration: 0.6, ease: easePremium }}
                  className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[2.6rem]"
                >
                  Welcome to <span className="text-signal">Meet&apos;s</span> Portfolio
                </motion.p>
                <motion.p
                  variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  className="mt-3 text-base text-muted sm:text-lg"
                >
                  AI/ML &amp; Agentic AI Developer
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* progress */}
        <div className="mx-auto mt-2 flex max-w-[220px] items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
          <span className="w-9 text-right font-mono text-[0.68rem] text-subtle">{pct}%</span>
        </div>
      </motion.div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-6 right-6 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs text-muted transition-colors hover:border-brand-blue hover:text-brand-blue"
        autoFocus
      >
        Skip intro <ArrowRight size={13} aria-hidden />
      </button>
    </motion.div>
  );
}
