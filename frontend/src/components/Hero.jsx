import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import Typewriter from "./Typewriter";
import HeroButtons from "./HeroButtons";
import FloatingBadge from "./FloatingBadge";

const ROLES = [
  "AI Engineering Lead",
  "ML Systems Architect",
  "Product-focused Data Scientist",
  "Intelligent Automation Builder",
];

const SKILLS = [
  { label: "Python", className: "top-1 left-1 sm:top-0 sm:left-5", delay: 0.2, duration: 3.8 },
  { label: "TensorFlow", className: "top-16 right-0 sm:top-24 sm:right-0", delay: 0.35, duration: 4.2 },
  { label: "PyTorch", className: "top-[43%] -left-1 sm:-left-2", delay: 0.5, duration: 3.5 },
  { label: "SQL", className: "bottom-24 left-1 sm:bottom-20 sm:left-0", delay: 0.65, duration: 4 },
  { label: "Power BI", className: "bottom-4 right-5 sm:bottom-2 sm:right-10", delay: 0.8, duration: 3.9 },
  { label: "LLMs", className: "bottom-[38%] right-0 hidden sm:block", delay: 0.95, duration: 4.3 },
];

const HERO_IMAGES = [
  "/linkedin.png",
  "/hero-2.png",
  "/hero-3.png",
  "/hero-4.png",
];

const IMAGE_CHANGE_MS = 10000;

const STATS = [
  { value: "12+", label: "AI case studies" },
  { value: "8x", label: "Faster insights" },
  { value: "95%", label: "Model reliability" },
];

const KEYWORDS = [
  { label: "Automation", gradient: "from-violet-300 via-fuchsia-300 to-cyan-300" },
  { label: "Intelligence", gradient: "from-cyan-300 via-violet-300 to-fuchsia-300" },
  { label: "Innovation", gradient: "from-fuchsia-300 via-cyan-300 to-violet-300" },
];

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_IMAGES.length);
    }, IMAGE_CHANGE_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-surface text-white">
      <AnimatedBackground />
      <Navbar />

      <main
        id="hero"
        className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-12 lg:pb-24 lg:pt-36"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs text-gray-300 sm:text-sm">Open to opportunities</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-2 text-base text-gray-500 sm:text-lg"
            >
              Hello, I&apos;m
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl md:text-6xl lg:text-7xl font-display"
            >
              <span className="block">Chetanpura Meet</span>
              <span className="mt-2 block max-w-full break-words text-3xl font-semibold text-gray-300 sm:text-4xl lg:text-5xl">
                Engineering AI products for business-grade impact.
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xl font-semibold text-gray-400 sm:text-2xl lg:text-3xl"
            >
              <span className="text-gray-500">I deliver</span>
              <Typewriter
                words={ROLES}
                className="ml-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text font-bold text-transparent"
              />
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              {KEYWORDS.map((keyword) => (
                <span
                  key={keyword.label}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-xl"
                >
                  <span
                    className={`bg-gradient-to-r ${keyword.gradient} bg-clip-text text-transparent tracking-wide`}
                  >
                    {keyword.label}
                  </span>
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg"
            >
              I partner with startups and product teams to build AI systems that
              automate decisions, unlock new revenue, and scale with confidence.
              My work is focused on production-ready ML, explainable outcomes, and
              measurable business value.
            </motion.p>

            <HeroButtons />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:mt-14 sm:gap-10"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs uppercase tracking-[0.3em] text-gray-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="order-1 flex justify-center lg:order-2"
          >
            <div className="relative w-full max-w-[390px] sm:max-w-[440px] lg:max-w-[500px]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 m-auto h-[min(100%,470px)] w-[min(100%,470px)] rounded-full border border-dashed border-violet-500/25"
              />

              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto aspect-square w-[min(340px,82vw)] sm:w-[390px] lg:w-[430px]"
              >
                <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-violet-600/40 via-fuchsia-600/20 to-cyan-500/30 blur-2xl" />

                <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/20 bg-white/5 p-1 shadow-[0_0_80px_rgba(139,92,246,0.35)] backdrop-blur-sm">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={HERO_IMAGES[activeImage]}
                      src={HERO_IMAGES[activeImage]}
                      alt="Chetanpura Meet - AI Engineer"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                      onError={(event) => {
                        event.currentTarget.src = "/linkedin.png";
                      }}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </AnimatePresence>
                </div>
              </motion.div>

              <div className="mt-6 flex justify-center gap-2">
                {HERO_IMAGES.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeImage === index
                        ? "w-7 bg-violet-300"
                        : "w-2.5 bg-white/20 hover:bg-white/35"
                    }`}
                    aria-label={`Show hero image ${index + 1}`}
                  />
                ))}
              </div>

              {SKILLS.map((skill) => (
                <FloatingBadge key={skill.label} {...skill} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
