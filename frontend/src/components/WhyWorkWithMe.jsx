import { motion } from "framer-motion";
import { HiOutlineCheckCircle } from "react-icons/hi";
import Revealer from "./motion/Revealer";

const REASONS = [
  "Business-focused AI solutions",
  "Strong analytical thinking",
  "Scalable automation systems",
  "Clean and efficient development",
  "Data-driven decision making",
  "Production-ready project mindset",
  "Modern AI & analytics expertise",
  "Continuous learning & innovation",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function WhyWorkWithMe() {
  return (
    <Revealer
      id="why-work-with-me"
      className="relative overflow-hidden border-t border-white/5 bg-surface-raised py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[420px] w-[min(900px,100%)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:items-center lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="lg:col-span-2"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400 sm:text-sm"
          >
            Why Work With Me?
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Let&apos;s build intelligent{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              solutions together
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-base leading-8 text-gray-400 sm:text-lg">
            Whether you need AI automation, business intelligence dashboards,
            machine learning models, or scalable data solutions, I can help transform
            your ideas into impactful digital systems.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            I focus on delivering practical, high-performance solutions that create
            measurable business value.
          </motion.p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
          {REASONS.map((reason, index) => (
            <motion.div
              key={reason}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-gray-300 backdrop-blur-xl"
            >
              <HiOutlineCheckCircle className="shrink-0 text-lg text-emerald-300" />
              <span>{reason}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Revealer>
  );
}
