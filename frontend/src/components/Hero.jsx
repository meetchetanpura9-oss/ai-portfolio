import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import Typewriter from "./Typewriter";
import HeroButtons from "./HeroButtons";
import FloatingBadge from "./FloatingBadge";
import TiltCard from "./effects/TiltCard";

const ROLES = [
  "AI Automation Solutions",
  "Machine Learning Systems",
  "Intelligent Business Dashboards",
  "Data-Driven Decision Making",
  "End-to-End AI Products",
  "Workflow Automation",
  "Predictive Analytics Solutions",
  "Business Intelligence Systems",
  "Scalable AI Infrastructure",
];

const SKILLS = [
  { label: "Python", className: "top-1 left-1 sm:top-0 sm:left-5 hidden sm:block", delay: 0.2, duration: 3.8 },
  { label: "TensorFlow", className: "top-16 right-0 sm:top-24 sm:right-0 hidden sm:block", delay: 0.35, duration: 4.2 },
  { label: "PyTorch", className: "top-[43%] -left-1 sm:-left-2 hidden sm:block", delay: 0.5, duration: 3.5 },
  { label: "SQL", className: "bottom-24 left-1 sm:bottom-20 sm:left-0 hidden sm:block", delay: 0.65, duration: 4 },
  { label: "Power BI", className: "bottom-4 right-5 sm:bottom-2 sm:right-10 hidden sm:block", delay: 0.8, duration: 3.9 },
  { label: "LLMs", className: "bottom-[38%] right-0 hidden sm:block", delay: 0.95, duration: 4.3 },
];

const HERO_IMAGES = [
  "/linkedin.jpg",
  "/hero-2.png.jpeg",
  "/hero-3.png.jpeg",
  "/hero-4.png.jpeg",
];

const TAGLINE_WORDS = ["Automation", "Intelligence", "Innovation"];

const IMAGE_CHANGE_MS = 10000;

const STATS = [
  { value: "12+", label: "AI case studies" },
  { value: "8x", label: "Faster insights" },
  { value: "95%", label: "Model reliability" },
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
    <div className="relative min-h-screen overflow-hidden bg-void text-white">
      <AnimatedBackground />
      <Navbar />

      <main
        id="hero"
        className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-12 lg:pb-24 lg:pt-36"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-1 lg:order-1 text-left">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
              </span>
              <span className="text-xs text-cyan-300 font-mono sm:text-sm">Open to opportunities</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-2 text-base text-gray-500 sm:text-lg font-mono"
            >
              Hello, I&apos;m
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-[11vw] xs:text-5xl font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-8xl font-display"
            >
              <span className="block bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">Meet Chetanpura</span>
              <span className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
                {TAGLINE_WORDS.map((word) => (
                  <span
                    key={word}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-gray-300 shadow-[0_0_28px_rgba(139,92,246,0.12)] backdrop-blur-md xs:text-sm sm:px-4 sm:text-xl lg:text-2xl"
                  >
                    {word}
                  </span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-6 text-sm sm:text-base md:text-lg font-bold text-cyan-300 tracking-wider font-mono uppercase"
            >
              AI Engineer | Automation Specialist | Data Analyst
            </motion.p>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-4 text-lg font-semibold text-gray-400 sm:text-xl lg:text-2xl font-display"
            >
              <span className="text-gray-500">I deliver</span>
              <Typewriter
                words={ROLES}
                className="ml-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text font-bold text-transparent"
              />
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-gray-400 sm:text-lg"
            >
              I specialize in Python, Machine Learning, Deep Learning, Data Analytics, and AI Automation. I design and build intelligent systems that automate complex workflows, transform data into actionable insights, and solve real-world engineering challenges.
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
                  <p className="mt-0.5 text-[9px] uppercase tracking-wider text-gray-500 sm:text-xs sm:tracking-[0.3em]">
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
            className="order-2 flex justify-center lg:order-2"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[480px] px-4">
              {/* Outer Pulsing Glow */}
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-violet-600/30 via-fuchsia-600/10 to-cyan-500/20 blur-2xl opacity-80" />

              {/* Animated HUD brackets (futuristic scanner corners) */}
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Top-Left Bracket */}
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-1 top-1 h-6 w-6 border-l-2 border-t-2 border-cyan-400 rounded-tl-xl" 
                />
                {/* Top-Right Bracket */}
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute right-1 top-1 h-6 w-6 border-r-2 border-t-2 border-fuchsia-400 rounded-tr-xl" 
                />
                {/* Bottom-Left Bracket */}
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.0 }}
                  className="absolute left-1 bottom-1 h-6 w-6 border-l-2 border-b-2 border-violet-400 rounded-bl-xl" 
                />
                {/* Bottom-Right Bracket */}
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute right-1 bottom-1 h-6 w-6 border-r-2 border-b-2 border-cyan-400 rounded-br-xl" 
                />
                
                {/* Subtle tech crosshairs in center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-25">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                  <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white" />
                </div>
              </div>

              {/* Glowing Outer Gradient Border Frame wrapped in TiltCard */}
              <TiltCard maxTilt={10}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                  className="relative mx-auto aspect-[3/4] w-full rounded-[2rem] p-[2.5px] bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_50px_rgba(139,92,246,0.25)] hover:shadow-[0_0_70px_rgba(139,92,246,0.45)] transition-shadow duration-500"
                >
                  {/* Inner Glassmorphic container */}
                  <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-[#070b1a]/90 p-1 backdrop-blur-xl">
                    {/* Subtle Grid overlay for digital tech look */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
                    
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={HERO_IMAGES[activeImage]}
                        src={HERO_IMAGES[activeImage]}
                        alt="Meet Chetanpura - AI Engineer"
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        onError={(event) => {
                          event.currentTarget.src = "/linkedin.jpg";
                        }}
                        className="h-full w-full rounded-[1.7rem] object-cover object-center transition-transform duration-700 hover:scale-105"
                      />
                    </AnimatePresence>
                  </div>
                </motion.div>
              </TiltCard>

              {/* Premium pagination dots indicator */}
              <div className="mt-5 flex justify-center gap-2 relative z-20">
                {HERO_IMAGES.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeImage === index
                        ? "w-6 bg-gradient-to-r from-violet-400 to-cyan-300"
                        : "w-2 bg-white/20 hover:bg-white/35"
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
