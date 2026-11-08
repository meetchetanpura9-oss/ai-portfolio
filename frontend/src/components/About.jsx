import { ArrowRight, Bot, Server, LineChart, MapPin, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PROFILE } from "../data/profile";
import { PROJECTS } from "../data/projects";
import { CERTIFICATIONS } from "../data/certifications";
import Reveal from "./ui/Reveal";
import { RiseWords, ScrollLitText } from "./ui/TextEffects";
import { useScrollTo } from "../hooks/useSmoothScroll";

/*
 * About — "story → strengths".
 * Three blocks only: short story, profile card, what I bring.
 * Focus areas and process already live in Skills / Agentic AI, so they are not repeated here.
 */

const STATS = [
  { value: `${PROJECTS.length}+`, label: "Projects" },
  { value: String(CERTIFICATIONS.length), label: "Certifications" },
];

const STRENGTHS = [
  {
    icon: Bot,
    title: "Agentic & LLM apps",
    text: "Agents and chatbots on Gemini, Groq and Azure AI Foundry that reason, call tools and act on their own.",
    tone: "var(--brand-violet)",
  },
  {
    icon: Server,
    title: "Backend engineering",
    text: "REST APIs with Flask and FastAPI, SQL databases, authentication and clean MVC structure.",
    tone: "var(--brand-blue)",
  },
  {
    icon: LineChart,
    title: "Data & analytics",
    text: "Pandas, Scikit-learn, Excel and Power BI to turn raw data into clear decisions.",
    tone: "var(--brand-emerald)",
  },
];

function ProfileCard() {
  const scrollTo = useScrollTo();
  return (
    <div className="card mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden lg:max-w-none">
      {/* portrait frame */}
      <div className="p-3 pb-0">
        <div className="relative rounded-[1.25rem] bg-gradient-to-br from-[#2563eb] via-[#06b6d4] to-[#7c3aed] p-[2px] shadow-[0_20px_45px_-20px_rgb(37_99_235/0.55)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(1.25rem-2px)] bg-surface-2">
            <picture>
              <source srcSet="/portrait.webp" type="image/webp" />
              <img
                src="/portrait.jpg"
                alt={`Portrait of ${PROFILE.name}`}
                width="640"
                height="800"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_20%] transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
            </picture>
            {/* bottom fade + caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="font-display text-xl font-semibold leading-tight">{PROFILE.name}</p>
              <p className="mt-0.5 text-sm text-white/80">{PROFILE.role}</p>
            </div>
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[0.7rem] font-medium text-white backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="inline-flex items-center gap-1.5 font-mono text-xs text-subtle">
          <MapPin size={12} aria-hidden /> {PROFILE.location} · {PROFILE.timezone}
        </p>

        <dl className="mt-4 grid grid-cols-2 divide-x divide-line rounded-xl border border-line bg-bg">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col-reverse px-2 py-3 text-center">
              <dt className="mt-0.5 text-[0.7rem] text-subtle">{label}</dt>
              <dd className="font-display text-xl font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#contact", { offset: -72 });
            }}
            className="btn btn-primary flex-1 !py-2.5 text-sm"
          >
            Let&apos;s talk <ArrowRight size={16} aria-hidden />
          </a>
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="icon-btn !h-11 !w-11" aria-label="GitHub profile">
            <FaGithub aria-hidden />
          </a>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="icon-btn !h-11 !w-11" aria-label="LinkedIn profile">
            <FaLinkedin aria-hidden />
          </a>
          <a href={`mailto:${PROFILE.email}`} className="icon-btn !h-11 !w-11" aria-label={`Email ${PROFILE.email}`}>
            <Mail size={17} aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
          {/* story + strengths */}
          <div className="flex flex-col">
            <Reveal>
              <p className="eyebrow">
                <span className="text-subtle">(01)</span> about
              </p>
            </Reveal>
            <h2 id="about-title" className="mt-3 max-w-2xl text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl lg:text-[2.6rem]">
              <RiseWords text="I turn ideas into" />{" "}
              <RiseWords text="working AI products." delay={0.12} className="serif-accent text-[1.12em]" />
            </h2>

            <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-ink sm:text-[1.05rem]">
              <ScrollLitText>
                I&apos;m <span className="font-semibold">Meet</span>, an MCA student at Parul University and a Python developer who
                builds AI-powered software end to end: the model, the backend around it and the interface people actually use.
              </ScrollLitText>
              <ScrollLitText>
                I started with Flask backends and data analysis. Today I build LLM agents and automation, such as a
                lead-intelligence engine that crawls the web, scores leads with LLMs and runs outreach on its own.
              </ScrollLitText>
              <ScrollLitText className="font-medium">
                I care about software that is useful, measurable and reliable, not just impressive in a demo.
              </ScrollLitText>
            </div>

            <Reveal delay={0.1} className="card mt-8 p-6 sm:p-7 lg:mt-auto">
              <h3 className="font-mono text-xs uppercase tracking-wider text-subtle">What I bring</h3>
              <ul className="mt-5 space-y-5">
                {STRENGTHS.map(({ icon: Icon, title, text, tone }) => (
                  <li key={title} className="flex gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
                    >
                      <Icon size={19} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-display text-base font-semibold text-ink">{title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <ProfileCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
