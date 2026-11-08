import Reveal from "./Reveal";
import { RiseWords } from "./TextEffects";

/**
 * Consistent section heading: "(02) skills" index label, title, optional lead text.
 */
export default function SectionHeader({ index, label, title, highlight, lead, align = "left", id }) {
  const centered = align === "center";
  return (
    <header className={`mb-8 max-w-3xl sm:mb-10 ${centered ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className="eyebrow">
          <span className="text-subtle">({index})</span> {label}
        </p>
      </Reveal>
      <h2 id={id} className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-4xl lg:text-[2.9rem]">
        <RiseWords text={title} />
        {highlight && (
          <>
            {" "}
            <RiseWords text={highlight} delay={0.12} className="serif-accent text-[1.12em]" />
          </>
        )}
      </h2>
      {lead && (
        <Reveal delay={0.12}>
          <p className={`mt-4 text-base leading-relaxed text-muted sm:text-lg ${centered ? "mx-auto" : ""} max-w-2xl`}>
            {lead}
          </p>
        </Reveal>
      )}
    </header>
  );
}
