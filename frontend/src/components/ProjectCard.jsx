import { ArrowUpRight, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";

/** Generated artwork — a small node graph tinted with the project tone. */
function CardArt({ icon: Icon, tone, index }) {
  const seed = index * 37;
  const pts = Array.from({ length: 7 }, (_, i) => ({
    x: 30 + ((seed + i * 53) % 240),
    y: 20 + ((seed * 3 + i * 41) % 110),
  }));
  return (
    <div
      className="relative h-40 overflow-hidden border-b border-line"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${tone} 14%, var(--surface-2)), var(--surface-2))` }}
    >
      <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {pts.map((a, i) =>
          pts.slice(i + 1, i + 3).map((b, j) => (
            <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="1" style={{ stroke: tone, opacity: 0.3 }} />
          ))
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 3 === 0 ? 3.5 : 2.5} style={{ fill: tone, opacity: 0.6 }} />
        ))}
      </svg>
      <span
        className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105"
        style={{ color: tone }}
      >
        <Icon size={22} aria-hidden />
      </span>
      <span className="absolute right-5 top-5 font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
    </div>
  );
}

export default function ProjectCard({ project, index, onOpen }) {
  const { title, category, overview, tech, github, demo, icon, tone } = project;

  return (
    <article className="card card-interactive group flex h-full flex-col overflow-hidden">
      <CardArt icon={icon} tone={tone} index={index} />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {category && (
          <p className="font-mono text-[0.68rem] uppercase tracking-wider" style={{ color: tone }}>
            {category}
          </p>
        )}
        <h3 className="mt-1.5 text-lg font-semibold leading-snug text-ink">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {overview || <span className="italic text-subtle">Case study coming soon.</span>}
        </p>

        {tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tech.slice(0, 5).map((t) => (
              <li key={t} className="chip !px-2.5 !py-1 !text-[0.72rem]">
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <button type="button" onClick={() => onOpen(project)} className="btn btn-ghost flex-1 !py-2 text-sm">
            View case study <ArrowUpRight size={15} aria-hidden />
          </button>
          {github ? (
            <a href={github} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={`${title} on GitHub`}>
              <FaGithub aria-hidden />
            </a>
          ) : (
            <span className="icon-btn cursor-not-allowed opacity-40" title="GitHub link coming soon" aria-hidden>
              <FaGithub />
            </span>
          )}
          {demo && (
            <a href={demo} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label={`${title} live demo`}>
              <ExternalLink size={16} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
