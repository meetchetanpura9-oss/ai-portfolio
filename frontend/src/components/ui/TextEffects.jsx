import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { easePremium } from "../../lib/motionVariants";

/**
 * Editorial motion primitives (letter reveal, word rise, scroll-lit text, arched sections).
 * All of them render the full text for screen readers and respect reduced motion.
 */

/** Letters rise into place one after another. `play` lets the hero wait for the intro loader. */
export function SplitChars({ text, play = true, delay = 0, stagger = 0.028, className = "", suffix = null }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  let i = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((word, w) => [
        w > 0 && " ",
        <span key={`${word}-${w}`} className="inline-block whitespace-nowrap" aria-hidden>
          {[...word].map((ch) => {
            const d = delay + i++ * stagger;
            return (
              <span key={`${ch}-${d}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: "110%", rotate: 8, opacity: 0 }}
                  animate={play ? { y: 0, rotate: 0, opacity: 1 } : undefined}
                  transition={{ duration: 0.75, delay: d, ease: easePremium }}
                >
                  {ch}
                </motion.span>
              </span>
            );
          })}
          {w === words.length - 1 && suffix}
        </span>,
      ])}
    </span>
  );
}

/** Words slide up from behind a mask when scrolled into view (used by section titles). */
export function RiseWords({ text, className = "", delay = 0 }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.1em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: easePremium }}
          >
            {word}
            {i < words.length - 1 && " "}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function LitWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}

/**
 * Paragraph whose words light up from faint to full as it scrolls through the viewport.
 * Accepts plain strings and inline elements (e.g. <strong>) as children.
 */
export function ScrollLitText({ children, as: Tag = "p", className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });

  if (reduce) return <Tag ref={ref} className={className}>{children}</Tag>;

  // Flatten children into word tokens, keeping inline element styling per word.
  const tokens = [];
  const push = (text, wrap) =>
    text.split(/(\s+)/).forEach((part) => part && tokens.push({ part, wrap }));
  [].concat(children).forEach((child) => {
    if (typeof child === "string") push(child);
    else if (child?.props?.children && typeof child.props.children === "string") {
      push(child.props.children, (w) => <child.type {...child.props}>{w}</child.type>);
    }
  });
  const words = tokens.filter((t) => t.part.trim());
  let n = 0;

  return (
    <Tag ref={ref} className={className}>
      {tokens.map((t, i) => {
        if (!t.part.trim()) return t.part;
        const start = n / words.length;
        const end = Math.min(1, start + 1.5 / words.length);
        n += 1;
        return (
          <LitWord key={i} progress={scrollYProgress} range={[start, end]}>
            {t.wrap ? t.wrap(t.part) : t.part}
          </LitWord>
        );
      })}
    </Tag>
  );
}

/**
 * Section that rises in with an arched top edge which flattens as it scrolls into place.
 * Drop-in replacement for <section className="section ...">.
 */
export function ArchSection({ className = "", children, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const curve = useTransform(scrollYProgress, [0, 1], [140, 0]);
  const radius = useMotionTemplate`50% ${curve}px`;

  return (
    <motion.section
      ref={ref}
      className={`${className} border-t border-line`}
      style={reduce ? undefined : { borderTopLeftRadius: radius, borderTopRightRadius: radius }}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
