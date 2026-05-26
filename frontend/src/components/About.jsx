import { motion } from "framer-motion";
import {
  HiOutlineChip,
  HiOutlineDatabase,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineCode,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { SiTensorflow, SiPytorch, SiPython, SiOpenai } from "react-icons/si";
import BentoCard from "./BentoCard";
import EducationTimeline from "./EducationTimeline";
import Revealer from "./motion/Revealer";

const FOCUS_AREAS = [
  { label: "AI & Machine Learning", icon: HiOutlineChip, color: "text-violet-400" },
  { label: "Automation Engineering", icon: HiOutlineLightningBolt, color: "text-fuchsia-400" },
  { label: "Data & Analytics", icon: HiOutlineDatabase, color: "text-cyan-400" },
  { label: "Business Intelligence", icon: HiOutlineChartBar, color: "text-emerald-400" },
];

const STACK = [
  { name: "Python", icon: SiPython },
  { name: "TensorFlow", icon: SiTensorflow },
  { name: "PyTorch", icon: SiPytorch },
  { name: "AI Automation", icon: SiOpenai },
];

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

export default function About() {
  return (
    <Revealer id="about" className="relative overflow-hidden border-t border-white/5 bg-surface py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[400px] w-[min(800px,100%)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <motion.header
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400 sm:text-sm"
          >
            About Me
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-display"
          >
            AI & Automation Engineer focused on
            <span className="ml-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              business impact
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-base text-gray-400 sm:text-lg">
            I am a passionate AI & Automation Engineer with a strong foundation in
            Python, Machine Learning, Deep Learning, SQL, Power BI, and Business
            Intelligence. I focus on building scalable AI systems, automation
            workflows, and intelligent dashboards that help businesses increase
            efficiency and make smarter decisions.
          </motion.p>
        </motion.header>

        <div className="grid auto-rows-[minmax(120px,auto)] grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* Main bio — large bento cell */}
          <BentoCard
            className="md:col-span-2 lg:row-span-2"
            delay={0}
            glow="violet"
          >
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-200">
                  <HiOutlineCode className="text-sm" />
                  Practical AI systems
                </span>
                <h3 className="mt-4 text-xl font-bold sm:text-2xl">Production-ready AI engineering</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base">
                  With experience in data analytics, model development, and automation
                  architecture, I bridge the gap between technology and business impact.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                  My goal is to create AI-powered solutions that are practical, measurable,
                  and production-ready.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                  I continuously explore emerging technologies in Artificial Intelligence,
                  Agentic AI, Data Science, and Automation Engineering to stay ahead in the
                  rapidly evolving tech landscape.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Business-focused", "Data-driven", "Production-ready"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 transition-colors duration-300 hover:border-violet-500/30 hover:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* AI branding card */}
          <BentoCard className="lg:col-span-1" delay={0.08} glow="fuchsia">
            <div className="flex h-full flex-col">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-600/15">
                <HiOutlineChip className="text-xl text-fuchsia-300" />
              </div>
              <h3 className="text-lg font-bold">AI Engineer</h3>
              <p className="mt-2 flex-1 text-sm text-gray-500">
                Designing intelligent systems from model development to automation workflows
                and measurable business delivery.
              </p>
              <p className="mt-4 font-mono text-2xl font-bold text-fuchsia-300/90">01</p>
              <p className="text-xs text-gray-500">Build - Train - Deploy</p>
            </div>
          </BentoCard>

          {/* Data Science branding */}
          <BentoCard className="lg:col-span-1" delay={0.12} glow="cyan">
            <div className="flex h-full flex-col">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-600/15">
                <HiOutlineChartBar className="text-xl text-cyan-300" />
              </div>
              <h3 className="text-lg font-bold">Data Scientist</h3>
              <p className="mt-2 flex-1 text-sm text-gray-500">
                Turning raw data into actionable insights, KPI reporting, and dashboards
                stakeholders can trust.
              </p>
              <p className="mt-4 font-mono text-2xl font-bold text-cyan-300/90">02</p>
              <p className="text-xs text-gray-500">Explore - Model - Explain</p>
            </div>
          </BentoCard>

          {/* Focus areas */}
          <BentoCard className="md:col-span-2 lg:col-span-2" delay={0.16} glow="violet">
            <h3 className="text-lg font-bold">Core focus</h3>
            <p className="mt-1 text-sm text-gray-500">Domains I build across daily</p>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FOCUS_AREAS.map(({ label, icon: Icon, color }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.06] hover:shadow-[0_0_24px_rgba(139,92,246,0.08)]"
                >
                  <Icon className={`shrink-0 text-lg ${color}`} />
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* Stack */}
          <BentoCard className="lg:col-span-2" delay={0.2} glow="cyan">
            <h3 className="text-lg font-bold">Tech stack</h3>
            <p className="mt-1 text-sm text-gray-500">Tools behind the solutions</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {STACK.map(({ name, icon: Icon }) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition-[border-color,box-shadow] duration-300 hover:border-violet-500/35 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                >
                  <Icon className="text-lg text-violet-300" />
                  {name}
                </motion.div>
              ))}
              {["SQL", "PostgreSQL", "Power BI", "Scikit-learn", "Pandas", "NumPy", "Git & GitHub"].map((tool) => (
                <motion.span
                  key={tool}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-400 transition-[border-color,box-shadow] duration-300 hover:border-cyan-500/30 hover:text-gray-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                >
                  {tool}
                </motion.span>
              ))}
            </div>
          </BentoCard>

          {/* Education timeline */}
          <BentoCard className="md:col-span-2 lg:col-span-2 lg:row-span-2" delay={0.24} glow="violet">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold sm:text-xl">Education</h3>
                <p className="mt-1 text-sm text-gray-500">Academic journey</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <HiOutlineGlobeAlt className="text-lg text-violet-300" />
              </div>
            </div>
            <EducationTimeline />
          </BentoCard>

          {/* Highlight stat cards */}
          <BentoCard className="lg:col-span-1" delay={0.28} glow="fuchsia">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-500">Projects</p>
            <p className="mt-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-4xl font-bold text-transparent">
              12+
            </p>
            <p className="mt-2 text-sm text-gray-500">
              End-to-end AI, analytics & automation builds
            </p>
          </BentoCard>

          <BentoCard className="lg:col-span-1" delay={0.32} glow="cyan">
            <p className="font-mono text-xs uppercase tracking-wider text-gray-500">Certifications</p>
            <p className="mt-2 bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-4xl font-bold text-transparent">
              8+
            </p>
            <p className="mt-2 text-sm text-gray-500">
              AI, automation & data credentials
            </p>
          </BentoCard>
        </div>
      </div>
    </Revealer>
  );
}
