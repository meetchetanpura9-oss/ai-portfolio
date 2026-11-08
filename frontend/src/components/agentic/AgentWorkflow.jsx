import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { WORKFLOW_STEPS as STEPS } from "./workflowSteps";

const STEP_MS = 2800;
const VB_W = 600;
const VB_H = 380;

const edgePath = (a, b) => `M${a.pos[0]} ${a.pos[1]} L${b.pos[0]} ${b.pos[1]}`;
const EDGES = STEPS.slice(0, -1).map((s, i) => ({ id: `${s.id}-${STEPS[i + 1].id}`, d: edgePath(s, STEPS[i + 1]), tone: STEPS[i + 1].tone }));
const LOOP_D = "M300 232 C 254 210, 254 170, 300 148";

const ring = (tone) => `0 0 0 4px color-mix(in srgb, ${tone} 18%, transparent), 0 12px 32px -12px color-mix(in srgb, ${tone} 55%, transparent)`;

function NodeCard({ step, index, state, onSelect, compact = false }) {
  const Icon = step.icon;
  const active = state === "active";
  const done = state === "done";
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-current={active ? "step" : undefined}
      aria-label={`Step ${index + 1}: ${step.label}`}
      className={`group flex w-full items-center gap-3 rounded-2xl border bg-surface text-left transition-[border-color,box-shadow,transform] duration-300 ${
        compact ? "px-3.5 py-3" : "flex-col justify-center gap-2 px-2 py-3 text-center"
      } ${active ? "scale-[1.04]" : "hover:-translate-y-0.5"}`}
      style={{
        borderColor: active ? step.tone : done ? `color-mix(in srgb, ${step.tone} 35%, var(--line))` : "var(--line)",
        boxShadow: active ? ring(step.tone) : "var(--shadow-card)",
      }}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
        style={{
          background: `color-mix(in srgb, ${step.tone} ${active ? 18 : 10}%, transparent)`,
          color: active || done ? step.tone : "var(--subtle)",
        }}
      >
        <Icon size={19} aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={`block font-display text-[0.82rem] font-semibold leading-tight sm:text-sm ${active ? "text-ink" : "text-muted"}`}>
          {step.label}
        </span>
        <span className="mt-0.5 block font-mono text-[0.62rem] uppercase tracking-wider text-subtle">
          {String(index + 1).padStart(2, "0")} · {step.role.split(" ")[0]}
        </span>
      </span>
    </button>
  );
}

export default function AgentWorkflow() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const isPlaying = playing && !reduce;

  useEffect(() => {
    if (!isPlaying || !inView) return undefined;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => window.clearTimeout(t);
  }, [step, isPlaying, inView]);

  const select = (i) => {
    setStep(i);
    setPlaying(false);
  };
  const prev = () => select((step - 1 + STEPS.length) % STEPS.length);
  const next = () => select((step + 1) % STEPS.length);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  };

  const current = STEPS[step];
  const stateOf = (i) => (i === step ? "active" : i < step ? "done" : "idle");

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]" onKeyDown={onKeyDown}>
      {/* ---------- Diagram ---------- */}
      <div className="card overflow-hidden p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-subtle">agent_loop.illustration</p>
          <span className="chip !py-1 font-mono !text-[0.68rem]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: current.tone }} />
            illustrative
          </span>
        </div>

        {/* desktop / tablet graph */}
        <div className="relative hidden md:block" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
            {/* base edges */}
            {EDGES.map((e) => (
              <path key={e.id} d={e.d} fill="none" strokeWidth="2" style={{ stroke: "var(--line-strong)" }} strokeDasharray="4 6" />
            ))}
            {/* completed edges */}
            {EDGES.map((e, i) =>
              i < step - 1 ? (
                <path key={`done-${e.id}`} d={e.d} fill="none" strokeWidth="2" style={{ stroke: e.tone, opacity: 0.45 }} />
              ) : null
            )}
            {/* incoming edge to the active node */}
            {step > 0 && (
              <motion.path
                key={`active-${step}`}
                d={EDGES[step - 1].d}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ stroke: EDGES[step - 1].tone }}
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            )}
            {/* data particles on the active edge */}
            {step > 0 && !reduce &&
              [0, 1, 2].map((p) => (
                <circle key={`p-${step}-${p}`} r="3.5" style={{ fill: EDGES[step - 1].tone }}>
                  <animateMotion dur="1.4s" begin={`${p * 0.45}s`} repeatCount="indefinite" path={EDGES[step - 1].d} />
                </circle>
              ))}

            {/* retry loop: evaluation → planner */}
            <path
              d={LOOP_D}
              fill="none"
              strokeWidth="1.6"
              strokeDasharray="3 5"
              style={{ stroke: "var(--brand-amber)", opacity: step === 4 ? 0.95 : 0.35, transition: "opacity .3s" }}
              markerEnd="url(#loop-arrow)"
            />
            <defs>
              <marker id="loop-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" style={{ fill: "var(--brand-amber)" }} />
              </marker>
            </defs>
            {step === 4 && !reduce && (
              <circle r="3" style={{ fill: "var(--brand-amber)" }}>
                <animateMotion dur="1.6s" repeatCount="indefinite" path={LOOP_D} />
              </circle>
            )}
            <text
              x="246"
              y="194"
              textAnchor="end"
              fontSize="10"
              style={{ fontFamily: "var(--font-mono)", fill: "var(--subtle)", opacity: step === 4 ? 1 : 0.7 }}
            >
              retry if check fails
            </text>
          </svg>

          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="absolute w-[24%] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(s.pos[0] / VB_W) * 100}%`, top: `${(s.pos[1] / VB_H) * 100}%` }}
            >
              <NodeCard step={s} index={i} state={stateOf(i)} onSelect={select} />
            </div>
          ))}
        </div>

        {/* mobile vertical flow */}
        <ol className="relative space-y-3 md:hidden">
          <span className="absolute bottom-6 left-[2.2rem] top-6 w-px bg-line-strong" aria-hidden />
          {STEPS.map((s, i) => (
            <li key={s.id} className="relative">
              <NodeCard step={s} index={i} state={stateOf(i)} onSelect={select} compact />
            </li>
          ))}
        </ol>
      </div>

      {/* ---------- Detail panel ---------- */}
      <div className="card flex flex-col p-5 sm:p-6" aria-live="polite">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-subtle">
            step {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-wider" style={{ color: current.tone }}>
            {current.role}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex-1"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `color-mix(in srgb, ${current.tone} 14%, transparent)`, color: current.tone }}
              >
                <current.icon size={21} aria-hidden />
              </span>
              <h3 className="text-xl font-semibold text-ink sm:text-2xl">{current.label}</h3>
            </div>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{current.description}</p>

            <div className="mt-5 overflow-hidden rounded-xl border border-line bg-bg">
              <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-brand-rose/70" />
                <span className="h-2 w-2 rounded-full bg-brand-amber/70" />
                <span className="h-2 w-2 rounded-full bg-brand-emerald/70" />
                <span className="ml-2 font-mono text-[0.65rem] text-subtle">trace (example)</span>
              </div>
              <pre className="overflow-x-auto px-3 py-3 font-mono text-[0.72rem] leading-relaxed text-muted sm:text-xs">
                {current.trace.map((line) => (
                  <span key={line} className="block whitespace-pre">
                    {line}
                  </span>
                ))}
              </pre>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* progress + controls */}
        <div className="mt-6">
          <div className="flex gap-1.5" role="tablist" aria-label="Workflow steps">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === step}
                aria-label={s.label}
                onClick={() => select(i)}
                className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? s.tone : "var(--line)" }}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button type="button" onClick={prev} className="icon-btn" aria-label="Previous step">
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button type="button" onClick={next} className="icon-btn" aria-label="Next step">
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
            {reduce ? (
              <span className="font-mono text-[0.68rem] text-subtle">use arrows to step through</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!playing && step === STEPS.length - 1) setStep(0);
                  setPlaying((p) => !p);
                }}
                className="btn btn-ghost !px-3.5 !py-2 text-sm"
                aria-pressed={playing}
              >
                {playing ? <Pause size={15} aria-hidden /> : step === STEPS.length - 1 ? <RotateCcw size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                {playing ? "Pause" : step === STEPS.length - 1 ? "Replay" : "Play"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
