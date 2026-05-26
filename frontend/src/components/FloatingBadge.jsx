import { motion } from "framer-motion";

export default function FloatingBadge({ label, className, delay = 0, duration = 4 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5 },
        y: { delay: delay + 0.5, duration, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.06, borderColor: "rgba(167,139,250,0.5)" }}
      className={`absolute whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-xl sm:px-4 sm:py-2 sm:text-sm ${className}`}
    >
      <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
        {label}
      </span>
    </motion.div>
  );
}
