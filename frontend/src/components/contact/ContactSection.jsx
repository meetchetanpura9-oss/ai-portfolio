import SectionHeader from "../ui/SectionHeader";
import { ArchSection } from "../ui/TextEffects";
import Reveal from "../ui/Reveal";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";

export default function ContactSection() {
  return (
    <ArchSection id="contact" aria-labelledby="contact-title" className="section bg-bg-elevated">
      <div className="pointer-events-none absolute inset-0 bg-neural-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_65%)]" aria-hidden />
      <div className="container-x relative">
        <SectionHeader
          id="contact-title"
          index="06"
          label="contact"
          title="Let's build something"
          highlight="intelligent"
          lead="Have a project, a role or an idea involving AI agents, machine learning or automation? Send a message — I read every one."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <Reveal>
            <ContactInfo />
          </Reveal>
          <Reveal delay={0.08} className="card p-5 sm:p-8">
            <h3 className="mb-6 text-lg font-semibold text-ink">Send a message</h3>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </ArchSection>
  );
}
