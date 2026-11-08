import { useScrollProgress } from "../../hooks/useSmoothScroll";

export default function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-[2px]" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-[#2563eb] via-[#06b6d4] to-[#7c3aed] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
