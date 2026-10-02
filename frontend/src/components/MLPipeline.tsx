import { ArrowDownRight, ArrowRight, Database, ScanSearch, BrainCircuit, RefreshCw } from "lucide-react";
import styles from "./MLPipeline.module.css";

const stages = [
  { number: "01", icon: Database, title: "Data", text: "Collect useful signals and understand their limits.", detail: "INPUT" },
  { number: "02", icon: ScanSearch, title: "Features", text: "Turn messy inputs into context a system can use.", detail: "REPRESENTATION" },
  { number: "03", icon: BrainCircuit, title: "Model", text: "Build and evaluate an approach against the task.", detail: "INFERENCE" },
  { number: "04", icon: RefreshCw, title: "Feedback", text: "Watch the outcome and improve with real evidence.", detail: "ITERATION" },
];

export default function MLPipeline() {
  return (
    <section id="ml-system" className="tech-section" aria-labelledby="ml-system-title">
      <div className="shell">
        <div className={styles.heading}>
          <div>
            <span className="type-label section-kicker">03 / System thinking</span>
            <h2 id="ml-system-title" className="type-h2 mt-4 max-w-[17ch]">Intelligence is a system, not a single model.</h2>
          </div>
          <p className="type-body-md max-w-md text-[var(--color-muted)]">A conceptual view of how machine learning can connect data, software, and human feedback. Each stage affects what the next one can do.</p>
        </div>
        <div className={styles.scene}>
          <div className={styles.track}>
            {stages.map(({ number, icon: Icon, title, text, detail }, index) => (
              <div className={styles.step} key={number}>
                <article className={styles.card}>
                  <div className={styles.cardTop}><span>{number} / 04</span><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></div>
                  <div className={styles.stack} aria-hidden="true"><span /><span /><span /></div>
                  <span className={styles.detail}>{detail}</span>
                  <h3 className="type-h4">{title}</h3>
                  <p className="type-body-md mt-3 text-[var(--color-muted)]">{text}</p>
                </article>
                {index < stages.length - 1 && <div className={styles.connector} aria-hidden="true"><ArrowRight className={styles.wideArrow} size={19} /><ArrowDownRight className={styles.narrowArrow} size={19} /></div>}
              </div>
            ))}
          </div>
        </div>
        <p className={styles.footnote}>Conceptual model / actual architecture depends on the problem and available evidence.</p>
      </div>
    </section>
  );
}
