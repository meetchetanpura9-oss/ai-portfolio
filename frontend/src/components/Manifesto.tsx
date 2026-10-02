import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NeuralNetworkScene from "./NeuralNetworkScene";
import styles from "./Manifesto.module.css";

export default function Manifesto() {
  return (
    <section className={styles.section} aria-labelledby="manifesto-title">
      <div className={styles.shell}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>[ THE IDEA ]</span>
          <h2 id="manifesto-title">From raw signals to <em>useful systems.</em></h2>
          <p>Machine learning has to live somewhere: in a product, a workflow, or a decision someone can understand. I work at that intersection of models, data, and software.</p>
          <div className={styles.paths}>
            <Link href="/about">FOR HIRING TEAMS <ArrowUpRight size={17} aria-hidden="true" /></Link>
            <Link href="#services">FOR PROJECT TEAMS <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.visual}>
          <NeuralNetworkScene />
          <p>CONCEPTUAL SYSTEM MAP / MOVE POINTER TO EXPLORE</p>
        </div>
      </div>
    </section>
  );
}
