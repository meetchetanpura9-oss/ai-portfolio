import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050816] text-white"
        >
          <div className="relative flex flex-col items-center gap-6 rounded-[2rem] border border-white/10 bg-white/5 px-10 py-12 shadow-[0_0_80px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 shadow-[0_0_36px_rgba(139,92,246,0.22)]">
              <HiSparkles className="h-10 w-10" />
            </div>
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Launching portfolio</p>
              <p className="text-3xl font-semibold tracking-tight text-white">AI engineering showcase</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gray-400">
              <span className="inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              <span>Optimal UI, premium motion, industry-grade presence</span>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
