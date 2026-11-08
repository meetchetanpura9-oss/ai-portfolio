import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useScrollTo } from "../hooks/useSmoothScroll";
import { easePremium } from "../lib/motionVariants";
import { PROFILE } from "../data/profile";
import { PROJECTS } from "../data/projects";
import ArchitectureDiagram from "./hero/ArchitectureDiagram";
import { SplitChars } from "./ui/TextEffects";

const FOCUS = [
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Agentic AI",
  "Multi-Agent Systems",
  "RAG Pipelines",
  "Workflow Orchestration",
  "Intelligent Automation",
];

/** Words cycled in the "I build …" line. */
const BUILDS = ["LLM-powered agents", "RAG pipelines", "machine learning models", "intelligent automation"];

const META = [
  { label: "Projects", value: `${PROJECTS.length}+ built` },
  { label: "Focus", value: "Agentic AI & ML" },
  { label: "Based in", value: PROFILE.location },
];

/** Serif-italic accent phrase that rolls to the next word every few seconds. */
function RotatingWord({ words, active }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || reduce) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2800);
    return () => clearInterval(id);
  }, [active, reduce, words.length]);

  return (
    <span className="relative block h-[1.25em] overflow-hidden" aria-live="off">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          className="serif-accent absolute inset-x-0 top-0 whitespace-nowrap text-[1.12em] leading-[1.1]"
          initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.55, ease: easePremium }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Front page — clean editorial layout: oversized name that assembles letter by letter,
 * a serif-italic accent phrase, pill CTAs and a logo-strip style focus marquee.
 * `ready` stays false while the intro loader is on screen so the entrance plays in view.
 */
export default function Hero({ ready = true }) {
  const scrollTo = useScrollTo();
  const fade = (delay, y = 18) => ({
    initial: { opacity: 0, y },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.8, delay, ease: easePremium },
  });
  const nameChars = PROFILE.name.replace(/\s/g, "").length;
  const afterName = 0.25 + nameChars * 0.035;

  const jump = (id) => (e) => {
    e.preventDefault();
    scrollTo(id, { offset: -72 });
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-24 sm:pt-28 lg:pt-32"
    >
      {/* soft light from the top, otherwise a clean canvas */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--brand-violet) 14%, transparent), color-mix(in srgb, var(--brand-blue) 6%, transparent) 60%, transparent)",
        }}
        aria-hidden
      />

      <div className="container-x relative flex-1">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
          {/* copy */}
          <div className="text-left">
            {/* availability pill — live status */}
            <motion.div
              {...fade(0.05)}
              className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 shadow-[var(--shadow-card)] backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-emerald" />
              </span>
              <span className="text-xs font-medium text-muted sm:text-[0.8rem]">Open to AI/ML &amp; Agentic AI roles</span>
            </motion.div>

            <motion.p {...fade(0.12)} className="mt-8 text-lg font-medium text-muted sm:text-xl">
              Hi, I’m
            </motion.p>

            <h1
              id="hero-title"
              className="mt-1 font-sans text-[clamp(3.1rem,14vw,6.25rem)] font-bold leading-[0.98] tracking-[-0.045em] text-ink"
            >
              <SplitChars
                text={PROFILE.name}
                play={ready}
                delay={0.2}
                stagger={0.035}
                suffix={
                  <motion.span
                    className="inline-block text-brand-violet"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={ready ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 14, delay: afterName }}
                  >
                    .
                  </motion.span>
                }
              />
            </h1>

            <motion.div
              {...fade(afterName + 0.05)}
              className="mt-5 max-w-xl font-sans text-[clamp(1.55rem,6.2vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink"
            >
              I design &amp; build
              <RotatingWord words={BUILDS} active={ready} />
            </motion.div>

            <motion.p
              {...fade(afterName + 0.15)}
              className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-muted sm:text-lg"
            >
              {PROFILE.intro}
            </motion.p>

            <motion.div {...fade(afterName + 0.25)} className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" onClick={jump("#projects")} className="pill pill-dark">
                View Projects <ArrowRight size={17} aria-hidden />
              </a>
              <a href="#contact" onClick={jump("#contact")} className="pill pill-brand">
                <Mail size={17} aria-hidden /> Contact Me
              </a>
            </motion.div>

            {/* meta row */}
            <motion.dl
              {...fade(afterName + 0.35)}
              className="mt-10 grid grid-cols-3 gap-x-4 border-t border-line pt-6 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-4"
            >
              {META.map(({ label, value }) => (
                <div key={label}>
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-subtle">{label}</dt>
                  <dd className="mt-1.5 text-[0.82rem] font-medium leading-snug text-ink sm:whitespace-nowrap sm:text-sm">{value}</dd>
                </div>
              ))}
            </motion.dl>

            <motion.div {...fade(afterName + 0.45)} className="mt-6 flex items-center gap-2">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub profile">
                <FaGithub size={17} aria-hidden />
              </a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn profile">
                <FaLinkedin size={17} aria-hidden />
              </a>
              <a href={`mailto:${PROFILE.email}`} className="icon-btn" aria-label={`Email ${PROFILE.email}`}>
                <Mail size={17} aria-hidden />
              </a>
            </motion.div>
          </div>

          {/* visual */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 1.1, delay: afterName, ease: easePremium }}
            className="pb-2"
          >
            <ArchitectureDiagram ready={ready} />
          </motion.div>
        </div>
      </div>

      {/* focus strip — styled like a client-logo strip */}
      <motion.div {...fade(afterName + 0.5, 10)} className="relative mt-14 py-6 sm:mt-16" aria-label="Focus areas">
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <ul className="animate-marquee flex w-max gap-14 pr-14 motion-reduce:animate-none">
            {[...FOCUS, ...FOCUS].map((item, i) => (
              <li
                key={`${item}-${i}`}
                aria-hidden={i >= FOCUS.length}
                className="whitespace-nowrap font-sans text-base font-semibold tracking-[-0.01em] text-subtle transition-colors hover:text-ink sm:text-lg"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
