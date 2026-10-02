"use client";

import { motion } from "framer-motion";
import { Bot, BrainCircuit, Workflow, ChartNoAxesCombined } from "lucide-react";

const systems = [
  { icon: Bot, code: "AGT-01", title: "Agentic AI", text: "Tool-using AI agents with memory, guardrails, human checkpoints, and observable decision paths.", tags: ["Multi-agent", "RAG", "Function calling"] },
  { icon: BrainCircuit, code: "ML-02", title: "Machine learning", text: "Models and inference services designed around useful predictions—not just impressive notebooks.", tags: ["NLP", "Computer vision", "Forecasting"] },
  { icon: Workflow, code: "AUT-03", title: "Intelligent automation", text: "Reliable workflows that connect documents, internal tools, APIs, and repetitive operations end to end.", tags: ["Python", "Event-driven", "Integrations"] },
  { icon: ChartNoAxesCombined, code: "DAT-04", title: "Data intelligence", text: "Clean pipelines and decision interfaces that make fragmented operational data understandable and actionable.", tags: ["ETL", "Analytics", "BI systems"] },
];

export default function Services() {
  return (
    <section id="services" className="tech-section">
      <div className="shell">
        <div className="mb-14 max-w-3xl"><span className="type-label section-kicker">02 / Capabilities</span><h2 className="type-h2 mt-4">From model to working system.</h2><p className="type-body-lg mt-5 text-[var(--color-muted)]">The areas I work across when a problem calls for a mix of data, software, and thoughtful automation.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          {systems.map(({ icon: Icon, code, title, text, tags }, index) => (
            <motion.article key={code} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="tech-card group p-7 sm:p-9">
              <div className="relative z-10 flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel-raised)] text-[var(--color-signal)]"><Icon size={21} /></span><span className="type-caption text-[var(--color-dim)]">{code}</span></div>
              <div className="relative z-10 mt-14"><h3 className="type-h3">{title}</h3><p className="type-body-md mt-4 max-w-[34rem] text-[var(--color-muted)]">{text}</p><div className="mt-7 flex flex-wrap gap-2">{tags.map(tag => <span className="rounded-full border border-[var(--color-line)] px-3 py-1.5 type-caption text-[var(--color-muted)]" key={tag}>{tag}</span>)}</div></div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
