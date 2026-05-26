import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { PROJECTS } from "../data/projects";
import ProjectCard from "./ProjectCard";
import Revealer from "./motion/Revealer";

const headerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Projects() {
  return (
    <Revealer
      id="projects"
      className="relative overflow-hidden border-t border-white/5 bg-surface-raised py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[280px] w-[280px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff06_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <motion.header
            variants={headerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 sm:text-sm"
            >
              Featured Projects
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Featured{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                projects
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-base text-gray-400 sm:text-lg">
              Practical AI, automation, analytics, and deep learning work designed
              to solve business problems and create measurable value.
            </motion.p>
          </motion.header>

          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, x: 4 }}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-gray-300 backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-violet-500/30 hover:text-white hover:shadow-[0_0_28px_rgba(139,92,246,0.15)]"
          >
            View all projects
            <HiArrowRight />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </Revealer>
  );
}
