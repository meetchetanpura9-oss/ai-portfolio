"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import { LegacyProject } from "../types";

interface CaseStudyModalProps {
  project: LegacyProject | null;
  onClose: () => void;
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  if (!project || !project.caseStudy) return null;

  const { caseStudy } = project;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative my-8 w-full max-w-3xl rounded-3xl border border-border-custom bg-surface p-6 sm:p-8 text-text-primary shadow-2xl dark:border-[#8B5CF6]/40 dark:bg-[#181426]"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl border border-border-custom bg-surface-raised p-2 text-text-muted hover:border-accent hover:text-text-primary transition-colors cursor-pointer dark:border-[#262038] dark:bg-[#08070D]"
            aria-label="Close modal"
          >
            <HiX size={20} />
          </button>

          {/* Header */}
          <div className="border-b border-border-custom pb-5 dark:border-[#262038]">
            <span className="rounded-md border border-accent/30 bg-surface-raised px-3 py-1 font-mono text-xs uppercase tracking-wider text-accent font-bold dark:bg-[#08070D]">
              {project.category} • Technical Case Study
            </span>
            <h3 className="mt-3 text-2xl font-bold text-text-primary sm:text-3xl font-display">
              {project.title}
            </h3>
            <p className="mt-2 text-sm text-text-muted font-medium">
              {project.description}
            </p>
          </div>

          {/* Body */}
          <div className="mt-6 space-y-5">

            {/* Challenge & Approach */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border-custom bg-surface-raised p-4.5 dark:border-[#262038] dark:bg-[#08070D]">
                <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                  01. The Challenge
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-text-muted font-medium">
                  {caseStudy.challenge}
                </p>
              </div>

              <div className="rounded-2xl border border-border-custom bg-surface-raised p-4.5 dark:border-[#262038] dark:bg-[#08070D]">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#0284C7] dark:text-[#00F0FF] font-bold">
                  02. Engineering Approach
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-text-muted font-medium">
                  {caseStudy.approach}
                </p>
              </div>
            </div>

            {/* System Architecture */}
            <div className="rounded-2xl border border-border-custom bg-surface-raised p-4.5 dark:border-[#262038] dark:bg-[#110E1B]">
              <h4 className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
                03. System Architecture
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-text-primary font-medium">
                {caseStudy.architecture}
              </p>
            </div>

            {/* AI / ML Modeling */}
            <div className="rounded-2xl border border-border-custom bg-surface-raised p-4.5 dark:border-[#262038] dark:bg-[#110E1B]">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#0284C7] dark:text-[#00F0FF] font-bold">
                04. AI / ML Model Parameters
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-text-primary font-medium">
                {caseStudy.modelDetails}
              </p>
            </div>

            {/* Business Impact */}
            <div className="rounded-2xl border border-[#10B981]/40 bg-[#10B981]/10 p-4.5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#10B981] font-bold">
                05. Business Impact & ROI
              </h4>
              <p className="mt-1 text-sm font-bold text-text-primary">
                {caseStudy.businessResult}
              </p>
            </div>

            {/* Tech Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border-custom bg-surface-raised px-2.5 py-1 font-mono text-[10px] font-semibold text-text-muted dark:border-[#262038] dark:bg-[#08070D]"
                >
                  {t}
                </span>
              ))}
            </div>

          </div>

          {/* Footer CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-border-custom pt-5 dark:border-[#262038]">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="key-gloss inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                <HiExternalLink />
                Live Product Demo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border-custom bg-surface-raised px-5 py-2.5 text-xs font-bold text-text-primary hover:border-accent dark:border-[#262038] dark:bg-[#08070D] transition-all"
              >
                <FaGithub />
                GitHub Repository
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
