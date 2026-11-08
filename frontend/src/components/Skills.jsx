import { useEffect, useRef, useState } from "react";
import { ArchSection } from "./ui/TextEffects";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SKILL_CATEGORIES } from "../data/skills";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";

/** Wider cards in the bento grid — keeps 7 categories filling full rows. */
const SPAN = {
  ml: "md:col-span-2 lg:col-span-2",
  agentic: "lg:col-span-2",
};

const totalSkills = new Set(SKILL_CATEGORIES.flatMap((c) => c.skills.map((s) => s.name))).size;

/**
 * Skills as a capability matrix: one compact card per domain with its tools as pills.
 * Phones get a swipeable snap carousel (one card tall); md+ gets a bento grid.
 */
export default function Skills() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  // Track which card is centred in the mobile carousel.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const onScroll = () => {
      const cards = [...track.children];
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      cards.forEach((card, i) => {
        const mid = card.offsetLeft + card.offsetWidth / 2;
        if (Math.abs(mid - center) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - center)) best = i;
      });
      setActive(best);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    const card = track?.children[i];
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <ArchSection id="skills" aria-labelledby="skills-title" className="section bg-bg-elevated">
      <div className="container-x">
        <SectionHeader
          id="skills-title"
          index="02"
          label="skills"
          title="The stack behind"
          highlight="intelligent systems"
          lead="From classical machine learning to LLM-powered agents — plus the backend and frontend engineering that turns models into products."
        />

        {/* summary strip */}
        <Reveal>
          <div className="flex items-center justify-between gap-4 border-y border-line py-3">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-subtle">
              <span className="text-ink">{totalSkills}</span> technologies
              <span className="mx-2 text-line-strong">/</span>
              <span className="text-ink">{SKILL_CATEGORIES.length}</span> domains
            </p>
            {/* mobile carousel controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={() => goTo(Math.max(0, active - 1))}
                disabled={active === 0}
                className="icon-btn !h-8 !w-8 disabled:opacity-40"
                aria-label="Previous skill category"
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <span className="w-10 text-center font-mono text-xs text-muted" aria-live="polite">
                {String(active + 1).padStart(2, "0")}/{String(SKILL_CATEGORIES.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => goTo(Math.min(SKILL_CATEGORIES.length - 1, active + 1))}
                disabled={active === SKILL_CATEGORIES.length - 1}
                className="icon-btn !h-8 !w-8 disabled:opacity-40"
                aria-label="Next skill category"
              >
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          </div>
        </Reveal>

        {/* cards: carousel on phones, bento grid from md */}
        <Reveal>
          <ul
            ref={trackRef}
            aria-label="Skill categories"
            className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
          >
            {SKILL_CATEGORIES.map((cat, i) => (
              <li key={cat.id} className={`w-[86%] shrink-0 snap-center sm:w-[60%] md:w-auto ${SPAN[cat.id] ?? ""}`}>
                <CategoryCard category={cat} index={i} />
              </li>
            ))}
          </ul>
        </Reveal>

        {/* mobile progress dots */}
        <div className="mt-4 flex justify-center gap-1.5 md:hidden">
          {SKILL_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${cat.label}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-brand-blue" : "w-1.5 bg-line-strong"}`}
            />
          ))}
        </div>
      </div>
    </ArchSection>
  );
}

function CategoryCard({ category, index }) {
  const { label, icon: Icon, tone, skills } = category;
  return (
    <article className="card card-interactive group relative flex h-full flex-col overflow-hidden p-5">
      {/* accent line */}
      <span className="absolute inset-x-0 top-0 h-0.5 opacity-70" style={{ background: tone }} aria-hidden />

      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105"
            style={{ background: `color-mix(in srgb, ${tone} 13%, transparent)`, color: tone }}
          >
            <Icon size={19} aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold leading-tight text-ink">{label}</h3>
            <p className="mt-0.5 text-xs text-subtle">
              {skills.length} {skills.length === 1 ? "skill" : "skills"}
            </p>
          </div>
        </div>
        <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
      </header>

      <ul className="mt-5 flex flex-wrap gap-2">
        {skills.map(({ name, icon: SkillIcon }) => (
          <li
            key={name}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-[0.8rem] font-medium text-ink"
          >
            <SkillIcon size={14} style={{ color: tone }} aria-hidden />
            {name}
          </li>
        ))}
      </ul>
    </article>
  );
}
