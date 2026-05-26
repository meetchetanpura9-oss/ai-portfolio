import { motion } from "framer-motion";
import {
  HiOutlineChartBar,
  HiOutlineChip,
  HiOutlineCode,
  HiOutlineDatabase,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
} from "react-icons/hi";
import BentoCard from "./BentoCard";
import Revealer from "./motion/Revealer";

const SERVICES = [
  {
    title: "AI Automation",
    description:
      "Automating repetitive workflows and business operations using Python and AI-powered systems.",
    icon: HiOutlineLightningBolt,
    glow: "violet",
  },
  {
    title: "Machine Learning Solutions",
    description:
      "Building predictive models and intelligent systems for real-world business applications.",
    icon: HiOutlineChip,
    glow: "fuchsia",
  },
  {
    title: "Business Intelligence Dashboards",
    description:
      "Creating interactive Power BI dashboards for data visualization and strategic decision-making.",
    icon: HiOutlineChartBar,
    glow: "cyan",
  },
  {
    title: "Data Analytics",
    description:
      "Transforming raw data into actionable insights using SQL, Excel, Python, and visualization tools.",
    icon: HiOutlineDatabase,
    glow: "cyan",
  },
  {
    title: "Deep Learning Applications",
    description:
      "Developing advanced AI solutions using neural networks and deep learning frameworks.",
    icon: HiOutlineSparkles,
    glow: "fuchsia",
  },
  {
    title: "Custom AI Tools",
    description:
      "Building scalable AI products tailored to business needs and automation goals.",
    icon: HiOutlineCode,
    glow: "violet",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Services() {
  return (
    <Revealer
      id="services"
      className="relative overflow-hidden border-t border-white/5 bg-surface py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-1/4 h-[360px] w-[360px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <motion.header
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mb-10 max-w-2xl sm:mb-14"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400 sm:text-sm"
          >
            Services I Offer
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            AI services for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              smarter operations
            </span>
          </motion.h2>
        </motion.header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ title, description, icon: Icon, glow }, index) => (
            <BentoCard key={title} delay={index * 0.06} glow={glow}>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Icon className="text-xl text-violet-300" />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{description}</p>
            </BentoCard>
          ))}
        </div>
      </div>
    </Revealer>
  );
}
