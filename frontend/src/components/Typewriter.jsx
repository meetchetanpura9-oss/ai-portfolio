import { useTypewriter } from "../hooks/useTypewriter";

export default function Typewriter({ words, className = "" }) {
  const text = useTypewriter(words);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block h-[1em] w-[3px] animate-pulse bg-violet-400 align-middle" />
    </span>
  );
}
