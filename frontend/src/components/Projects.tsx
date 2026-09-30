"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { PROJECTS } from "../data/projects";
import ProjectCard from "./ProjectCard";
import CaseStudyModal from "./CaseStudyModal";
import Revealer from "./motion/Revealer";
import { LegacyProject } from "../types";
import { CONTACT_LINKS } from "./contact/constants";

type FilterType = "ALL" | "AI_PRODUCTS" | "AUTOMATION" | "DATA_ANALYTICS";

interface FilterTab {
  id: FilterType;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { id: "ALL", label: "All AI Products" },
  { id: "AI_PRODUCTS", label: "AI & ML" },
  { id: "AUTOMATION", label: "Automation" },
  { id: "DATA_ANALYTICS", label: "Data Analytics" },
];

export default function Projects() {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<LegacyProject | null>(null);

  const filteredProjects = PROJECTS.filter((project) => {
    if (filter === "ALL") return true;
    if (filter === "AI_PRODUCTS") {
      return (
        project.category.includes("Machine Learning") ||
        project.category.includes("Generative AI") ||
        project.category.includes("AI Products")
      );
    }
    if (filter === "AUTOMATION") {
      return project.category.includes("Automation");
    }
    if (filter === "DATA_ANALYTICS") {
      return (
        project.category.includes("Analytics") ||
        project.category.includes("Engineering") ||
        project.category.includes("Data")
      );
    }
    return true;
  });

  return (
    <Revealer
      id="projects"
      className="relative border-t border-border-custom bg-void py-20 sm:py-28 transition-colors duration-300"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
              AI & Data Portfolio Showcase
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl font-display">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:via-[#E879F9] dark:to-[#38BDF8]">Intelligent Products</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-text-muted sm:text-lg font-medium">
              Real-world AI models, autonomous automation agents, and analytical systems built to solve enterprise challenges.
            </p>
          </div>

          <a
            href={CONTACT_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-border-custom bg-surface px-5 py-3 text-xs font-bold text-text-primary shadow-sm hover:border-accent dark:border-[#262038] dark:bg-[#181426] dark:text-[#F8FAFC] transition-all cursor-pointer"
          >
            <span>View GitHub Portfolio</span>
            <HiArrowRight className="text-accent" />
          </a>
        </div>

        {/* Filter Navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          <div className="flex flex-wrap rounded-xl border border-border-custom bg-surface-raised p-1 shadow-sm dark:border-[#262038] dark:bg-[#181426]">
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-lg px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive
                      ? "key-gloss"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full"
              >
                <ProjectCard
                  project={project}
                  delay={i * 0.05}
                  onOpenCaseStudy={(p) => setSelectedCaseStudy(p)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Expandable Case Study Modal */}
        <CaseStudyModal
          project={selectedCaseStudy}
          onClose={() => setSelectedCaseStudy(null)}
        />

      </div>
    </Revealer>
  );
}
