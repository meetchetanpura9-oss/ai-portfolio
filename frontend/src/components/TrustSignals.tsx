"use client";

import { HiCheckCircle } from "react-icons/hi";

const DOMAINS = [
  "AI / Machine Learning",
  "Data Analytics & BI",
  "Workflow AI Automation",
  "Full-Stack AI Applications",
];

const TECH_BADGES = [
  "Python",
  "FastAPI",
  "Scikit-learn",
  "SQL",
  "Power BI",
  "Next.js",
  "PostgreSQL",
  "AI Agents",
  "RAG",
];

export default function TrustSignals() {
  return (
    <section className="relative z-20 border-y border-border-custom bg-surface-glass backdrop-blur-md py-5 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Domain Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
              Core Stack:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {DOMAINS.map((domain) => (
                <div
                  key={domain}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-custom bg-surface px-3 py-1 text-xs font-semibold text-text-primary shadow-sm dark:border-[#262038] dark:bg-[#181426]"
                >
                  <HiCheckCircle className="text-[#10B981] text-sm shrink-0" />
                  <span>{domain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tech Chips */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border-custom pt-3 lg:border-t-0 lg:pt-0">
            {TECH_BADGES.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-border-custom bg-surface-raised px-2.5 py-1 text-xs font-mono text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary dark:border-[#262038] dark:bg-[#08070D]"
              >
                {tech}
              </span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
