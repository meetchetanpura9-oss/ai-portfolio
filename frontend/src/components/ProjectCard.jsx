import { motion } from "framer-motion";
import { HiExternalLink, HiOutlineCode } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import BentoCard from "./BentoCard";
import TiltCard from "./effects/TiltCard";

const btnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300";

export default function ProjectCard({ project, delay = 0 }) {
  const hasDemo = Boolean(project.demo);

  return (
    <TiltCard className="h-full">
    <BentoCard
      className="flex h-full flex-col"
      delay={delay}
      glow={project.glow}
    >
      <div
        className={`relative mb-4 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${project.accent} p-4 sm:mb-5 h-28 sm:h-32 flex flex-col justify-between`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-violet-300 sm:text-xs">
            {project.category}
          </span>
          {project.featured && (
            <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200 sm:text-xs">
              Featured
            </span>
          )}
        </div>
        <motion.div
          className="flex justify-end opacity-30"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <HiOutlineCode className="text-3xl sm:text-4xl text-white/80" />
        </motion.div>
      </div>

      <h3 className="font-bold text-white text-lg sm:text-xl">
        {project.title}
      </h3>
      <p className="mt-2 flex-1 leading-relaxed text-gray-400 text-sm">
        {project.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
        {project.tech.map((tag) => (
          <motion.span
            key={tag}
            whileHover={{ scale: 1.05, y: -1 }}
            className="rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-gray-300 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-violet-500/35 hover:shadow-[0_0_16px_rgba(139,92,246,0.12)]"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5 sm:mt-6">
        {hasDemo ? (
          <motion.a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`${btnClass} flex-1 border border-violet-500/40 bg-violet-600/25 text-violet-100 shadow-[0_0_24px_rgba(139,92,246,0.2)] hover:border-violet-400/60 hover:shadow-[0_0_32px_rgba(139,92,246,0.35)] sm:flex-none`}
          >
            <HiExternalLink className="text-base" />
            Live Demo
          </motion.a>
        ) : (
          <span
            className={`${btnClass} flex-1 cursor-not-allowed border border-white/10 bg-white/5 text-gray-500 sm:flex-none`}
            title="Demo coming soon"
          >
            <HiExternalLink className="text-base opacity-50" />
            Demo Soon
          </span>
        )}

        <motion.a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`${btnClass} flex-1 border border-white/15 bg-white/5 text-gray-200 hover:border-white/25 hover:bg-white/10 sm:flex-none`}
        >
          <FaGithub className="text-base" />
          GitHub
        </motion.a>
      </div>
    </BentoCard>
    </TiltCard>
  );
}
