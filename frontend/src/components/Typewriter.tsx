"use client";

import { useTypewriter } from "../hooks/useTypewriter";

interface TypewriterProps {
  words: string[];
  className?: string;
}

export default function Typewriter({
  words,
  className = "",
  cursorClassName = "",
}: TypewriterProps & { cursorClassName?: string }) {
  const text = useTypewriter(words);

  return (
    <span className="inline-block">
      <span className={className}>{text}</span>
      <span
        className={`ml-1 inline-block h-[0.85em] w-[3px] animate-pulse rounded-full bg-gradient-to-b from-[#7C3AED] to-[#D946EF] dark:from-[#C084FC] dark:to-[#E879F9] align-middle ${cursorClassName}`}
        aria-hidden="true"
      />
    </span>
  );
}
