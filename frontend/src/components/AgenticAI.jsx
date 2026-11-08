import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import AgentWorkflow from "./agentic/AgentWorkflow";
import { CAPABILITIES } from "./agentic/workflowSteps";

export default function AgenticAI() {
  return (
    <section id="agentic" aria-labelledby="agentic-title" className="section overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-neural-grid opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" aria-hidden />
      <div className="container-x relative">
        <SectionHeader
          id="agentic-title"
          index="03"
          label="agentic ai"
          title="How an AI agent"
          highlight="thinks and acts"
          lead="Agentic systems don't just answer — they plan, choose tools, act, check their own work and loop until the goal is met. Step through the loop below, or let it play."
        />

        <Reveal>
          <AgentWorkflow />
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06} className="card card-interactive p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon size={19} aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
