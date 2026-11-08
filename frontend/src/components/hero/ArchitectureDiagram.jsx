import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Bot, Database, FolderGit2, Sparkles, User, Wrench } from "lucide-react";
import { PROJECTS } from "../../data/projects";
import { CERTIFICATIONS } from "../../data/certifications";
import { easePremium } from "../../lib/motionVariants";

const projectCount = PROJECTS.filter((p) => p.title).length;
const certCount = CERTIFICATIONS.filter((c) => c.title).length;

/** One request cycle, in seconds. Every signal shares it so they stay in sync. */
const CYCLE = 5;

const PATHS = {
  query: "M210 64 L210 140",
  tools: "M150 224 C150 275 70 270 70 320",
  vector: "M210 224 L210 320",
  llm: "M270 224 C270 275 350 270 350 320",
  response: "M320 182 C402 182 402 36 280 36",
};

const BOTTOM = [
  { id: "tools", x: 10, label: "Tools", sub: "APIs · code", icon: Wrench, tone: "var(--brand-amber)" },
  { id: "vector", x: 150, label: "Vector DB", sub: "embeddings", icon: Database, tone: "var(--brand-emerald)" },
  { id: "llm", x: 290, label: "LLM", sub: "reasoning", icon: Sparkles, tone: "var(--brand-violet)" },
];

/* ----- SVG pieces ----- */

function IconTile({ x, y, size, icon: Icon, tone }) {
  const pad = size * 0.25;
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.28} style={{ fill: `color-mix(in srgb, ${tone} 14%, transparent)` }} />
      <Icon x={x + pad} y={y + pad} width={size - pad * 2} height={size - pad * 2} style={{ color: tone }} strokeWidth={2} aria-hidden />
    </g>
  );
}

function Box({ x, y, w, h, highlight }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={14}
      style={{
        fill: "var(--surface)",
        stroke: highlight ? "url(#arch-stroke)" : "var(--line-strong)",
        strokeWidth: highlight ? 1.6 : 1,
        filter: "drop-shadow(0 6px 14px rgb(11 21 48 / 0.08))",
      }}
    />
  );
}

/** A dot that travels a path during a slice of the cycle and is hidden otherwise. */
function Signal({ path, tone, keyTimes, keyPoints, showTimes, showValues }) {
  return (
    <circle r={4.5} style={{ fill: tone, filter: `drop-shadow(0 0 6px ${tone})` }} opacity={0}>
      <animateMotion
        path={path}
        dur={`${CYCLE}s`}
        repeatCount="indefinite"
        calcMode="linear"
        keyTimes={keyTimes}
        keyPoints={keyPoints}
      />
      <animate attributeName="opacity" dur={`${CYCLE}s`} repeatCount="indefinite" calcMode="discrete" keyTimes={showTimes} values={showValues} />
    </circle>
  );
}

/** Out to a component and back to the agent, starting at fraction `t` of the cycle. */
const roundTrip = (t) => ({
  keyTimes: `0;${t};${t + 0.2};${t + 0.4};1`,
  keyPoints: "0;0;1;0;0",
  showTimes: `0;${t};${t + 0.4}`,
  showValues: "0;1;0",
});

export default function ArchitectureDiagram({ ready = true }) {
  const reduce = useReducedMotion();
  const animate = ready && !reduce;

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {/* soft brand glow */}
      <div
        className="pointer-events-none absolute -inset-8 -z-10 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--brand-blue) 20%, transparent), color-mix(in srgb, var(--brand-violet) 10%, transparent) 65%, transparent)",
        }}
        aria-hidden
      />

      <figure className="card overflow-hidden !rounded-2xl">
        {/* header */}
        <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-subtle">System architecture</span>
          <span className="flex items-center gap-3 font-mono text-[0.62rem] text-subtle">
            <Legend tone="var(--brand-blue)" label="request" />
            <Legend tone="var(--brand-cyan)" label="tool call" />
            <Legend tone="var(--brand-violet)" label="response" />
          </span>
        </figcaption>

        <div className="bg-neural-grid px-1.5 py-3 sm:px-5 sm:py-5">
          <svg
            viewBox="0 0 420 412"
            className="h-auto w-full"
            role="img"
            aria-label="Architecture diagram: a user query goes to an AI agent, which calls tools, a vector database and an LLM, then returns a response to the user."
          >
            <defs>
              <linearGradient id="arch-stroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--brand-blue)" />
                <stop offset="100%" stopColor="var(--brand-violet)" />
              </linearGradient>
              <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 1 L9 5 L0 9 z" style={{ fill: "var(--line-strong)" }} />
              </marker>
            </defs>

            {/* connectors */}
            {Object.entries(PATHS).map(([id, d]) => (
              <path
                key={id}
                d={d}
                fill="none"
                markerEnd="url(#arch-arrow)"
                markerStart={id !== "query" && id !== "response" ? "url(#arch-arrow)" : undefined}
                strokeDasharray="5 5"
                style={{ stroke: "var(--line-strong)", strokeWidth: 1.4 }}
              >
                {animate && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.2s" repeatCount="indefinite" />}
              </path>
            ))}

            {/* connector labels */}
            <text x={220} y={106} className="font-mono" style={{ fill: "var(--subtle)", fontSize: 10 }}>query</text>
            <text
              x={392}
              y={112}
              className="font-mono"
              textAnchor="middle"
              transform="rotate(90 392 112)"
              style={{ fill: "var(--subtle)", fontSize: 10 }}
            >
              response
            </text>

            {/* user */}
            <Box x={140} y={8} w={140} h={56} />
            <IconTile x={154} y={22} size={28} icon={User} tone="var(--brand-blue)" />
            <text x={192} y={33} style={{ fill: "var(--ink)", fontSize: 13, fontWeight: 600 }} className="font-display">User</text>
            <text x={192} y={49} style={{ fill: "var(--subtle)", fontSize: 10 }}>sends a query</text>

            {/* agent */}
            <Box x={100} y={140} w={220} h={84} highlight />
            {animate && (
              <rect x={100} y={140} width={220} height={84} rx={14} fill="none" style={{ stroke: "var(--brand-blue)" }} strokeWidth={1.5}>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
              </rect>
            )}
            <IconTile x={116} y={162} size={40} icon={Bot} tone="var(--brand-blue)" />
            <text x={168} y={178} style={{ fill: "var(--ink)", fontSize: 15, fontWeight: 600 }} className="font-display">AI Agent</text>
            <text x={168} y={196} className="font-mono" style={{ fill: "var(--subtle)", fontSize: 10 }}>plan · reason · act</text>
            <text x={168} y={211} className="font-mono" style={{ fill: "var(--brand-blue)", fontSize: 9, letterSpacing: 1 }}>ORCHESTRATOR</text>

            {/* components */}
            {BOTTOM.map(({ id, x, label, sub, icon, tone }) => (
              <g key={id}>
                <Box x={x} y={320} w={120} h={84} />
                <IconTile x={x + 46} y={332} size={28} icon={icon} tone={tone} />
                <text x={x + 60} y={378} textAnchor="middle" style={{ fill: "var(--ink)", fontSize: 13, fontWeight: 600 }} className="font-display">
                  {label}
                </text>
                <text x={x + 60} y={393} textAnchor="middle" style={{ fill: "var(--subtle)", fontSize: 10 }}>{sub}</text>
              </g>
            ))}

            {/* signals */}
            {animate && (
              <g>
                <Signal path={PATHS.query} tone="var(--brand-blue)" keyTimes="0;0.16;1" keyPoints="0;1;1" showTimes="0;0.16" showValues="1;0" />
                <Signal path={PATHS.tools} tone="var(--brand-cyan)" {...roundTrip(0.2)} />
                <Signal path={PATHS.vector} tone="var(--brand-cyan)" {...roundTrip(0.24)} />
                <Signal path={PATHS.llm} tone="var(--brand-cyan)" {...roundTrip(0.28)} />
                <Signal
                  path={PATHS.response}
                  tone="var(--brand-violet)"
                  keyTimes="0;0.72;0.92;1"
                  keyPoints="0;0;1;1"
                  showTimes="0;0.72;0.92"
                  showValues="0;1;0"
                />
              </g>
            )}
          </svg>
        </div>
      </figure>

      {/* stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.7, delay: 0.9, ease: easePremium }}
        className="relative mx-auto mt-3 grid w-full grid-cols-2 sm:-mt-4 sm:w-[88%] divide-x divide-line rounded-xl border border-line bg-surface/95 shadow-[var(--shadow-card)] backdrop-blur-md"
      >
        <Stat icon={FolderGit2} value={`${projectCount}+`} label="Projects built" tone="var(--brand-blue)" />
        <Stat icon={BadgeCheck} value={certCount} label="Certifications" tone="var(--brand-emerald)" />
      </motion.div>
    </div>
  );
}

function Legend({ tone, label }) {
  return (
    <span className="hidden items-center gap-1 min-[400px]:inline-flex">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

function Stat({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-3 py-3">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
      >
        <Icon size={16} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold leading-none text-ink">{value}</p>
        <p className="mt-1 truncate text-[0.7rem] text-subtle">{label}</p>
      </div>
    </div>
  );
}
