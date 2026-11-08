import { motion, useReducedMotion } from "framer-motion";

/**
 * Central hero visual: a small feed-forward network inside orbit rings,
 * with signal pulses travelling input → hidden → output.
 * Pure SVG + framer-motion. Colours use theme CSS variables.
 */

const LAYERS = [
  { x: 92, count: 4 },
  { x: 196, count: 5 },
  { x: 300, count: 5 },
  { x: 400, count: 3 },
];

const NODES = LAYERS.map(({ x, count }, li) => {
  const gap = 62;
  const top = 250 - ((count - 1) * gap) / 2;
  return Array.from({ length: count }, (_, i) => ({ id: `${li}-${i}`, x, y: top + i * gap, layer: li }));
});

const EDGES = [];
for (let l = 0; l < NODES.length - 1; l++) {
  for (const a of NODES[l]) for (const b of NODES[l + 1]) EDGES.push({ a, b, id: `${a.id}>${b.id}` });
}

// Deterministic pulse routes (one node per layer) so the animation looks intentional.
const ROUTES = [
  [0, 1, 2, 0],
  [1, 3, 1, 1],
  [2, 0, 3, 2],
  [3, 2, 4, 1],
  [1, 4, 0, 0],
  [0, 2, 2, 2],
];

function routeKeyframes(route) {
  const pts = route.map((idx, layer) => NODES[layer][idx]);
  return { cx: pts.map((p) => p.x), cy: pts.map((p) => p.y) };
}

const ORBIT = { transformBox: "view-box", transformOrigin: "250px 250px" };

const TAGS = [
  { label: "LLM", style: { top: "9%", left: "6%" } },
  { label: "RAG", style: { top: "14%", right: "4%" } },
  { label: "Agents", style: { bottom: "12%", left: "2%" } },
  { label: "Tools", style: { bottom: "8%", right: "8%" } },
];

export default function NeuralCore() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* soft halo */}
      <div
        className="absolute inset-[12%] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--brand-blue) 22%, transparent), color-mix(in srgb, var(--brand-violet) 12%, transparent) 55%, transparent 72%)",
        }}
        aria-hidden
      />

      <svg viewBox="0 0 500 500" className="relative h-full w-full" role="img" aria-labelledby="neural-core-title">
        <title id="neural-core-title">Illustration of a neural network with signals flowing between layers</title>
        <defs>
          <linearGradient id="nc-edge" x1="0" x2="1">
            <stop offset="0%" style={{ stopColor: "var(--brand-blue)" }} />
            <stop offset="100%" style={{ stopColor: "var(--brand-violet)" }} />
          </linearGradient>
          <radialGradient id="nc-pulse">
            <stop offset="0%" style={{ stopColor: "var(--brand-cyan)", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "var(--brand-cyan)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* orbit rings */}
        <circle cx="250" cy="250" r="232" fill="none" style={{ stroke: "var(--line)" }} strokeWidth="1" />
        <circle
          cx="250"
          cy="250"
          r="206"
          fill="none"
          className="stroke-line-strong"
          strokeWidth="1"
          strokeDasharray="2 10"
          style={reduce ? undefined : { ...ORBIT, animation: "orbit-spin 80s linear infinite" }}
        />
        {!reduce && (
          <g style={{ ...ORBIT, animation: "orbit-spin 36s linear infinite reverse" }}>
            <circle cx="250" cy="18" r="4" className="fill-brand-cyan" />
            <circle cx="456" cy="250" r="3" className="fill-brand-violet" />
          </g>
        )}

        {/* edges */}
        <g stroke="url(#nc-edge)" strokeOpacity="0.22" strokeWidth="1">
          {EDGES.map(({ a, b, id }) => (
            <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          ))}
        </g>

        {/* pulses */}
        {!reduce &&
          ROUTES.map((route, i) => {
            const { cx, cy } = routeKeyframes(route);
            return (
              <motion.circle
                key={i}
                r="7"
                fill="url(#nc-pulse)"
                initial={{ cx: cx[0], cy: cy[0], opacity: 0 }}
                animate={{ cx, cy, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.6, delay: i * 0.55, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
              />
            );
          })}

        {/* nodes */}
        {NODES.flat().map((n) => {
          const isOut = n.layer === LAYERS.length - 1;
          const isIn = n.layer === 0;
          const tone = isIn ? "var(--brand-blue)" : isOut ? "var(--brand-violet)" : "var(--brand-cyan)";
          return (
            <g key={n.id}>
              {isOut && !reduce && (
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r="14"
                  className="fill-brand-violet"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.25, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: 1.8 + Number(n.id.split("-")[1]) * 0.6 }}
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={isOut ? 9 : 7}
                style={{ fill: "var(--surface)", stroke: tone }}
                strokeWidth="2"
              />
              <circle cx={n.x} cy={n.y} r="2.5" style={{ fill: tone }} />
            </g>
          );
        })}

        {/* layer labels */}
        <g style={{ fontFamily: "var(--font-mono)", fill: "var(--subtle)" }} fontSize="10" textAnchor="middle" letterSpacing="1">
          <text x="92" y="438">input</text>
          <text x="248" y="438">hidden layers</text>
          <text x="400" y="438">output</text>
        </g>
      </svg>

      {/* floating tags */}
      {TAGS.map((t, i) => (
        <motion.span
          key={t.label}
          className="chip absolute bg-surface font-mono text-[0.72rem] shadow-[var(--shadow-card)]"
          style={t.style}
          initial={{ opacity: 0, y: 8 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -6, 0] }}
          transition={
            reduce
              ? { delay: 0.6 + i * 0.1 }
              : { opacity: { delay: 0.6 + i * 0.1 }, y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut" } }
          }
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
          {t.label}
        </motion.span>
      ))}
    </div>
  );
}
