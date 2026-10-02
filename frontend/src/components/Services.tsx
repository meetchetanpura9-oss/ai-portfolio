"use client";

import { motion } from "framer-motion";
import { Bot, BrainCircuit, Workflow, ChartNoAxesCombined } from "lucide-react";
import styles from "./EditorialServices.module.css";

const systems = [
  { icon: Bot, code: "AGT-01", title: "Agentic AI", text: "Tool-using AI agents with memory, guardrails, human checkpoints, and observable decision paths.", tags: ["Multi-agent", "RAG", "Function calling"] },
  { icon: BrainCircuit, code: "ML-02", title: "Machine learning", text: "Models and inference services designed around useful predictions—not just impressive notebooks.", tags: ["NLP", "Computer vision", "Forecasting"] },
  { icon: Workflow, code: "AUT-03", title: "Intelligent automation", text: "Reliable workflows that connect documents, internal tools, APIs, and repetitive operations end to end.", tags: ["Python", "Event-driven", "Integrations"] },
  { icon: ChartNoAxesCombined, code: "DAT-04", title: "Data intelligence", text: "Clean pipelines and decision interfaces that make fragmented operational data understandable and actionable.", tags: ["ETL", "Analytics", "BI systems"] },
];

export default function Services() {
  return (
    <section id="services" className={styles.section} aria-labelledby="services-title">
      <div className={styles.shell}>
        <div className={styles.heading}><span className={styles.eyebrow}>[ WHAT I WORK ON ]</span><h2 id="services-title">IDEAS INTO<br/><em>SYSTEMS.</em></h2><p>The areas I work across when a problem calls for data, software, and thoughtful automation.</p></div>
        <div className={styles.list}>
          {systems.map(({ icon: Icon, code, title, text, tags }, index) => (
            <motion.article key={code} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className={styles.row}>
              <span className={styles.number}>0{index + 1}</span>
              <div><div className={styles.title}><Icon size={26} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3></div><p>{text}</p></div>
              <div className={styles.tags}>{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
