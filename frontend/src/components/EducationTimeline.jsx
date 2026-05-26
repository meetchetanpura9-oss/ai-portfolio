import { motion } from "framer-motion";
import { HiOutlineAcademicCap } from "react-icons/hi";

const EDUCATION = [
  {
    period: "2025 - 2027",
    degree: "MCA",
    title: "Master of Computer Applications",
    institution: "Currently pursuing advanced studies in computer applications",
    status: "current",
  },
  {
    period: "2022 - 2025",
    degree: "B.Sc. (IT)",
    title: "Bachelor of Science in Information Technology",
    institution: "Earned degree with a foundation in programming, databases & analytics",
    status: "completed",
  },
  {
    period: "Completed 2022",
    degree: "HSC",
    title: "Higher Secondary Certificate",
    institution: "Completed higher secondary education",
    status: "completed",
  },
];

export default function EducationTimeline() {
  return (
    <ol className="relative space-y-0">
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-violet-500/60 via-fuchsia-500/30 to-transparent sm:left-[13px]" />

      {EDUCATION.map((item, i) => (
        <motion.li
          key={item.degree + item.period}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ delay: i * 0.1, duration: 0.45 }}
          className="group relative flex gap-4 pb-8 last:pb-0 sm:gap-5"
        >
          <div className="relative z-10 flex shrink-0 flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border sm:h-7 sm:w-7 ${
                item.status === "current"
                  ? "border-violet-400/60 bg-violet-600/30 shadow-[0_0_16px_rgba(139,92,246,0.5)]"
                  : "border-white/15 bg-white/5 group-hover:border-violet-500/40 group-hover:bg-violet-600/15"
              }`}
            >
              {item.status === "current" ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
              ) : (
                <HiOutlineAcademicCap className="text-[10px] text-gray-400 sm:text-xs" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 rounded-xl border border-transparent px-1 py-0.5 transition-colors duration-300 group-hover:border-white/5 group-hover:bg-white/[0.02] sm:px-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400/90 sm:text-xs">
                {item.period}
              </span>
              {item.status === "current" && (
                <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  In progress
                </span>
              )}
            </div>
            <h4 className="mt-1 text-base font-semibold text-white sm:text-lg">
              {item.degree}
              <span className="font-normal text-gray-500"> - </span>
              <span className="text-sm font-medium text-gray-300 sm:text-base">{item.title}</span>
            </h4>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.institution}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
