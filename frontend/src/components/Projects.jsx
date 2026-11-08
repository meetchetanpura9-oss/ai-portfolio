import { Fragment, useCallback, useMemo, useState } from "react";
import { ArchSection } from "./ui/TextEffects";
import { ArrowRight, ChevronDown, ExternalLink, ImageIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { PROJECTS, PROJECT_CATEGORIES } from "../data/projects";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import Modal from "./ui/Modal";
import ProjectCard from "./ProjectCard";

function Pending({ children = "Details coming soon." }) {
  return <p className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm italic text-subtle">{children}</p>;
}

function Block({ title, children }) {
  return (
    <section className="space-y-3">
      <h4 className="font-mono text-xs uppercase tracking-wider text-subtle">{title}</h4>
      {children}
    </section>
  );
}

function CaseStudy({ project }) {
  const { overview, problem, solution, tech, aiFeatures, architecture, screenshots, github, demo, tone } = project;
  return (
    <div className="space-y-8">
      <Block title="Overview">{overview ? <p className="leading-relaxed text-muted">{overview}</p> : <Pending />}</Block>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Block title="Problem">{problem ? <p className="text-sm leading-relaxed text-muted">{problem}</p> : <Pending />}</Block>
        <Block title="Solution">{solution ? <p className="text-sm leading-relaxed text-muted">{solution}</p> : <Pending />}</Block>
      </div>

      <Block title="Architecture / workflow">
        {architecture.length ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg p-4">
            {architecture.map((node, i) => (
              <Fragment key={node}>
                <span
                  className="rounded-lg border bg-surface px-3 py-2 text-sm font-medium text-ink"
                  style={{ borderColor: `color-mix(in srgb, ${tone} 40%, var(--line))` }}
                >
                  {node}
                </span>
                {i < architecture.length - 1 && <ArrowRight size={16} className="text-subtle" aria-hidden />}
              </Fragment>
            ))}
          </div>
        ) : (
          <Pending>Architecture diagram coming soon.</Pending>
        )}
      </Block>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Block title="Technologies">
          {tech.length ? (
            <ul className="flex flex-wrap gap-2">
              {tech.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <Pending />
          )}
        </Block>
        <Block title="Key features">
          {aiFeatures.length ? (
            <ul className="space-y-2">
              {aiFeatures.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tone }} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <Pending />
          )}
        </Block>
      </div>

      <Block title="Screenshots">
        {screenshots.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {screenshots.map((s) => (
              <img key={s.src} src={s.src} alt={s.alt} loading="lazy" className="w-full rounded-xl border border-line" />
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-sm text-subtle">
            <ImageIcon size={18} aria-hidden /> Screenshots coming soon
          </div>
        )}
      </Block>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        {github ? (
          <a href={github} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <FaGithub aria-hidden /> View on GitHub
          </a>
        ) : (
          <span className="btn btn-ghost cursor-not-allowed opacity-60">
            <FaGithub aria-hidden /> GitHub link coming soon
          </span>
        )}
        {demo && (
          <a href={demo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <ExternalLink size={16} aria-hidden /> Live demo
          </a>
        )}
      </div>
    </div>
  );
}

const ALL = "All";
const INITIAL = 6;

/** Featured first, then the rest in data order. */
const ORDERED = [...PROJECTS.filter((p) => p.featured), ...PROJECTS.filter((p) => !p.featured)];

export default function Projects() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState(ALL);
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setOpen(null), []);

  const counts = useMemo(() => {
    const c = {};
    PROJECTS.forEach((p) => {
      c[p.category] = (c[p.category] ?? 0) + 1;
    });
    return c;
  }, []);

  const tabs = [ALL, ...PROJECT_CATEGORIES.filter((t) => counts[t])];
  const filtered = filter === ALL ? ORDERED : ORDERED.filter((p) => p.category === filter);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL);
  const hidden = filtered.length - visible.length;

  return (
    <ArchSection id="projects" aria-labelledby="projects-title" className="section bg-bg-elevated">
      <div className="container-x">
        <SectionHeader
          id="projects-title"
          index="04"
          label="projects"
          title="Selected"
          highlight="work"
          lead={`${PROJECTS.length} projects across AI agents, data analytics and business software. Open any project for the full case study.`}
        />

        <Reveal>
          <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div role="tablist" aria-label="Project categories" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {tabs.map((t) => {
                const active = filter === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setFilter(t);
                      setExpanded(false);
                    }}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {t}
                    <span className={`font-mono text-[0.7rem] ${active ? "opacity-70" : "text-subtle"}`}>
                      {t === ALL ? PROJECTS.length : counts[t]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.06} className="h-full">
              <ProjectCard project={p} index={PROJECTS.indexOf(p)} onOpen={setOpen} />
            </Reveal>
          ))}
        </div>

        {hidden > 0 && (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost">
              Show all {filtered.length} projects <ChevronDown size={17} aria-hidden />
            </button>
          </div>
        )}
      </div>

      <Modal open={Boolean(open)} onClose={close} title={open?.title ?? ""} size="lg">
        {open && <CaseStudy project={open} />}
      </Modal>
    </ArchSection>
  );
}
