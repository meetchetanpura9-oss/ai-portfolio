"use client";

import { motion } from "framer-motion";
import { HiExternalLink, HiOutlineBookOpen } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { LegacyProject } from "../types";
import BentoCard from "./BentoCard";

interface ProjectCardProps {
  project: LegacyProject;
  delay?: number;
  onOpenCaseStudy?: (project: LegacyProject) => void;
}

export default function ProjectCard({
  project,
  delay = 0,
  onOpenCaseStudy,
}: ProjectCardProps) {
  const hasDemo = Boolean(project.demo);
  const hasCaseStudy = Boolean(project.caseStudy);

  return (
    <motion.div layout className="h-full">
      <BentoCard className="flex h-full flex-col justify-between" delay={delay} glow={project.glow}>
        <div>
          {/* Category Tag & Featured Pill */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="rounded-md border border-accent/30 bg-surface-raised px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-accent font-bold dark:bg-[#08070D]">
              {project.category}
            </span>
            {project.featured && (
              <span className="rounded-md border border-[#10B981]/30 bg-[#10B981]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10B981]">
                FEATURED PRODUCT
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-text-primary text-lg sm:text-xl font-display">
            {project.title}
          </h3>

          {/* Problem & Solution */}
          <div className="mt-4 space-y-2.5">
            <div className="rounded-xl border border-border-custom bg-surface-raised p-3 dark:border-[#262038] dark:bg-[#08070D]">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-accent font-bold">
                Problem:
              </span>
              <p className="mt-1 text-xs leading-relaxed text-text-muted font-medium">
                {project.problem}
              </p>
            </div>

            <div className="rounded-xl border border-border-custom bg-surface-raised p-3 dark:border-[#262038] dark:bg-[#08070D]">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#10B981] font-bold">
                Solution:
              </span>
              <p className="mt-1 text-xs leading-relaxed text-text-primary font-medium">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Impact Metric */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-bold text-[#10B981]">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Impact: {project.impact}</span>
          </div>

          {/* Tech Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border-custom bg-surface-raised px-2.5 py-1 font-mono text-[10px] font-semibold text-text-muted dark:border-[#262038] dark:bg-[#08070D]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border-custom pt-4 dark:border-[#262038]">
          {hasCaseStudy && (
            <button
              type="button"
              onClick={() => onOpenCaseStudy?.(project)}
              className="key-gloss flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            >
              <HiOutlineBookOpen className="text-sm" />
              <span>Explore Case Study</span>
            </button>
          )}

          {hasDemo ? (
            <a
              href={project.demo!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0284C7]/40 bg-[#0284C7]/15 px-3 py-2 text-xs font-bold text-[#0284C7] dark:border-[#00F0FF]/40 dark:bg-[#00F0FF]/15 dark:text-[#00F0FF] transition-all"
            >
              <HiExternalLink className="text-sm" />
              <span>Demo</span>
            </a>
          ) : null}

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-custom bg-surface-raised px-3 py-2 text-xs font-bold text-text-primary hover:border-accent dark:border-[#262038] dark:bg-[#08070D] transition-all"
            >
              <FaGithub className="text-sm text-accent" />
              <span>Source</span>
            </a>
          )}
        </div>
      </BentoCard>
    </motion.div>
  );
}
