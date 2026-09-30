"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineDatabase,
  HiOutlineChip,
  HiOutlineLightningBolt,
  HiOutlineTrendingUp,
} from "react-icons/hi";

const STATUS_ITEMS = [
  { label: "AI Systems", status: "ONLINE" },
  { label: "Agentic RAG", status: "RUNNING" },
  { label: "ML Pipelines", status: "ACTIVE" },
  { label: "Analytics Engine", status: "CONNECTED" },
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Data Ingestion",
    description: "Extracting raw structured & unstructured data from databases, web APIs, and documents.",
    icon: HiOutlineDatabase,
    tech: "SQL • PostgreSQL • Pandas • Web Scrapers",
  },
  {
    step: "02",
    title: "ML & Intelligence",
    description: "Applying predictive classification, time-series forecasting, and RAG semantic search.",
    icon: HiOutlineChip,
    tech: "Scikit-learn • XGBoost • LangChain • PyTorch",
  },
  {
    step: "03",
    title: "Agentic Automation",
    description: "Orchestrating autonomous Python workflows, API integrations, and validation gates.",
    icon: HiOutlineLightningBolt,
    tech: "FastAPI • Python • Docker • Webhooks",
  },
  {
    step: "04",
    title: "Business Impact",
    description: "Delivering actionable Power BI dashboards, automated triggers, and measurable ROI.",
    icon: HiOutlineTrendingUp,
    tech: "Power BI • Executive Reports • Cost Savings",
  },
];

export default function SystemStatus() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative overflow-hidden border-t border-border-custom bg-void py-16 sm:py-20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Header & Status LED Badges */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border-custom pb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border-custom bg-surface-raised px-3.5 py-1 text-xs font-mono font-bold text-accent dark:border-[#8B5CF6]/30 dark:bg-[#181426] dark:text-[#C084FC]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              MAGICSHOT ARCHITECTURE ENGINE
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl font-display">
              End-to-End <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:to-[#00F0FF]">AI Data Pipeline</span> Architecture
            </h2>
            <p className="mt-2 text-sm text-text-muted max-w-2xl font-medium">
              How raw business data transforms into operational automation and measurable enterprise value.
            </p>
          </div>

          {/* System Status Badges */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {STATUS_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 rounded-xl border border-border-custom bg-surface px-3.5 py-2 shadow-sm dark:border-[#262038] dark:bg-[#181426]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                </span>
                <span className="text-xs font-bold text-text-primary">{item.label}</span>
                <span className="font-mono text-[9px] font-bold text-[#10B981] uppercase tracking-wider">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeStep === index;
            return (
              <motion.div
                key={item.step}
                whileHover={{ y: -4 }}
                onClick={() => setActiveStep(index)}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "border-accent bg-surface shadow-md dark:border-[#8B5CF6] dark:bg-[#181426] dark:shadow-[0_0_32px_rgba(139,92,246,0.2)]"
                    : "border-border-custom bg-surface/70 hover:border-accent/50 dark:border-[#262038] dark:bg-[#110E1B] dark:hover:border-[#8B5CF6]/50 dark:hover:bg-[#181426]/70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent dark:text-[#C084FC]">{item.step}.</span>
                    <div className={`p-2.5 rounded-xl border ${isActive ? "border-accent/40 bg-accent/10 text-accent dark:border-[#8B5CF6]/50 dark:bg-[#8B5CF6]/15 dark:text-[#C084FC]" : "border-border-custom bg-surface-raised text-text-muted dark:border-[#262038] dark:bg-[#08070D]"}`}>
                      <Icon className="text-lg" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-text-primary font-display">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-text-muted font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-border-custom pt-3 dark:border-[#262038]">
                  <span className="font-mono text-[11px] font-semibold text-accent dark:text-[#00F0FF]">
                    {item.tech}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
