"use client";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import ContactForm from "./ContactForm";
import { CONTACT_LINKS } from "./constants";

export default function ContactSection() {
  return <section id="contact" className="tech-section"><div className="shell">
    <div className="tech-card p-6 sm:p-10 lg:p-14"><div className="relative z-10 grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
      <div><span className="type-label section-kicker">05 / Start a conversation</span><h2 className="type-h2 mt-5 max-w-[10ch]">Build what comes next.</h2><p className="type-body-md mt-6 max-w-md text-[var(--color-muted)]">Tell me what is slowing your team down, what data you have, and what a meaningful result looks like.</p>
        <div className="mt-10 space-y-3"><a className="flex items-center gap-3 type-body-sm text-[var(--color-muted)] hover:text-[var(--color-signal)]" href={`mailto:${CONTACT_LINKS.email}`}><Mail size={17}/>{CONTACT_LINKS.email}</a><a className="flex items-center gap-3 type-body-sm text-[var(--color-muted)] hover:text-[var(--color-signal)]" href={CONTACT_LINKS.github} target="_blank" rel="noreferrer"><Github size={17}/>GitHub <ArrowUpRight size={14}/></a><a className="flex items-center gap-3 type-body-sm text-[var(--color-muted)] hover:text-[var(--color-signal)]" href={CONTACT_LINKS.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/>LinkedIn <ArrowUpRight size={14}/></a></div>
      </div>
      <div><h3 className="type-h4 mb-6">Project brief</h3><ContactForm /></div>
    </div></div>
  </div></section>;
}
