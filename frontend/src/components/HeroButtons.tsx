"use client";

import { motion } from "framer-motion";
import { HiArrowRight, HiDownload } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useScrollTo } from "../hooks/useSmoothScroll";
import { CONTACT_LINKS } from "./contact/constants";

export default function HeroButtons() {
  const scrollTo = useScrollTo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4"
    >
      {/* MagicShot Style Glossy Gradient Primary CTA */}
      <a
        href="#work"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#work", { offset: -80 });
        }}
        className="key-gloss group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-7 py-3.5 text-sm font-extrabold uppercase tracking-wider transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <span className="relative flex items-center gap-2 z-10">
          <span>Explore Products</span>
          <HiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
        </span>
      </a>

      {/* Glass Secondary CTA */}
      <a
        href="/cv.pdf"
        download
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-custom bg-surface px-6 py-3.5 text-sm font-bold text-text-primary backdrop-blur-md shadow-sm transition-all duration-200 hover:border-accent hover:text-accent dark:border-[#262038] dark:bg-[#181426] dark:text-[#F8FAFC] dark:hover:border-[#8B5CF6] dark:hover:shadow-[0_0_24px_rgba(139,92,246,0.2)] cursor-pointer"
      >
        <span>Download Resume</span>
        <HiDownload className="text-base text-accent dark:text-[#C084FC]" />
      </a>

      {/* Social Icons */}
      <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:ml-2">
        <a
          href={CONTACT_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          className="rounded-xl border border-border-custom bg-surface p-3.5 text-text-muted shadow-sm transition-all hover:border-accent hover:text-text-primary dark:border-[#262038] dark:bg-[#181426] dark:text-[#94A3B8] dark:hover:border-[#8B5CF6] dark:hover:text-[#F8FAFC]"
        >
          <FaGithub size={18} />
        </a>
        <a
          href={CONTACT_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          className="rounded-xl border border-border-custom bg-surface p-3.5 text-text-muted shadow-sm transition-all hover:border-accent hover:text-text-primary dark:border-[#262038] dark:bg-[#181426] dark:text-[#94A3B8] dark:hover:border-[#8B5CF6] dark:hover:text-[#F8FAFC]"
        >
          <FaLinkedin size={18} />
        </a>
      </div>
    </motion.div>
  );
}
