import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ORBIT_DURATION = 28;

export default function OrbitingIcons({ icons, label = "AI Core" }) {
  const count = icons.length;
  const [radius, setRadius] = useState(110);

  useEffect(() => {
    const handleResize = () => {
      setRadius(window.innerWidth < 640 ? 80 : 110);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative mx-auto aspect-square w-[min(300px,85vw)] max-w-[320px]">
      <div className="absolute inset-0 rounded-full border border-dashed border-violet-500/20" />
      <div className="absolute inset-4 rounded-full border border-white/5 bg-violet-600/5" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_65%)]" />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
      >
        {icons.map((Icon, i) => {
          const angle = (360 / count) * i;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}px)`,
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
                whileHover={{
                  scale: 1.15,
                  boxShadow: "0 0 28px rgba(139,92,246,0.55)",
                }}
                className="flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-xl text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.2)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-violet-400/50 sm:h-12 sm:w-12 sm:text-2xl"
              >
                <Icon />
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 40px rgba(139,92,246,0.35)",
              "0 0 60px rgba(34,211,238,0.25)",
              "0 0 40px rgba(139,92,246,0.35)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-violet-500/30 bg-white/[0.06] backdrop-blur-xl sm:h-28 sm:w-28"
        >
          <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent sm:text-sm">
            {label}
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-gray-500 sm:text-xs">Stack</span>
        </motion.div>
      </div>
    </div>
  );
}
