import { useSmoothScroll } from "../../context/SmoothScrollContext";

export default function ScrollProgress() {
  const { progress } = useSmoothScroll();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-1 bg-white/5 backdrop-blur-xl">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_18px_rgba(168,85,247,0.65)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
