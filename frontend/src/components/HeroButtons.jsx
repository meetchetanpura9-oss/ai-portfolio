import { motion } from "framer-motion";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import { useScrollTo } from "../hooks/useSmoothScroll";

const btnBase =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-semibold sm:px-8 sm:py-4 sm:text-base";

export default function HeroButtons() {
  const scrollTo = useScrollTo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
    >
      <motion.a
        href="#projects"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#projects", { offset: -80 });
        }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`${btnBase} bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 text-white shadow-[0_0_40px_rgba(139,92,246,0.45)]`}
      >
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        <span className="relative flex items-center gap-2">
          Explore flagship projects
          <HiArrowRight className="text-lg" />
        </span>
      </motion.a>

      <motion.a
        href="/cv.pdf"
        download
        whileHover={{
          scale: 1.03,
          y: -2,
          boxShadow: "0 0 32px rgba(139,92,246,0.18)",
        }}
        whileTap={{ scale: 0.98 }}
        className={`${btnBase} border border-white/15 bg-white/5 text-white backdrop-blur-md`}
      >
        <HiDownload className="text-lg text-cyan-300" />
        Download portfolio brief
      </motion.a>
    </motion.div>
  );
}
