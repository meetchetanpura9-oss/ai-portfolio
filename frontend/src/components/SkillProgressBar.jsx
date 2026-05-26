import { motion } from "framer-motion";

export default function SkillProgressBar({ name, level, index = 0 }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ x: 4 }}
      className="group rounded-xl border border-transparent px-2 py-2 transition-[border-color,background,box-shadow] duration-300 hover:border-white/10 hover:bg-white/[0.03] hover:shadow-[0_0_24px_rgba(139,92,246,0.08)]"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-white">
          {name}
        </span>
        <span className="font-mono text-xs text-violet-400/90">{level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ delay: 0.15 + index * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />
        </motion.div>
      </div>
    </motion.li>
  );
}
