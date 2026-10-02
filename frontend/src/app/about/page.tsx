import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import AboutGallery from "../../components/AboutGallery";
import Footer from "../../components/footer/Footer";
import { siteContent } from "../../data/siteContent";

export const metadata = { title: "About — Meet Chetanpura", description: "Professional background, education, and engineering approach of AI systems engineer Meet Chetanpura." };

export default function AboutPage() {
  return <div className="relative min-h-screen"><a className="skip-link" href="#main-content">Skip to content</a><Navbar/><main id="main-content">
    <section className="shell grid min-h-screen items-center gap-12 pb-20 pt-32 lg:grid-cols-[.86fr_1.14fr]">
      <div><span className="type-label section-kicker">About / Meet Chetanpura</span><h1 className="type-h1 mt-5">{siteContent.about.headline}</h1><p className="type-body-lg mt-7 text-[var(--color-muted)]">{siteContent.about.summary}</p><p className="type-body-md mt-5 text-[var(--color-muted)]">I start by understanding the problem and the people using the result. From there, I map the data, choose a practical architecture, and make the tradeoffs visible.</p><Link className="btn-primary mt-9" href="/#contact">Get in touch <ArrowUpRight size={17}/></Link></div>
      <AboutGallery/>
    </section>
    <section className="tech-section"><div className="shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="type-label section-kicker">How I work</span><h2 className="type-h2 mt-4">Curiosity, then clarity.</h2></div><div className="border-t border-[var(--color-line)]">{[
      ["01", "Understand the context", "Identify the users, constraints, available data, and what success would mean."],
      ["02", "Make technical choices visible", "Compare approaches, explain tradeoffs, and define a scope that can be tested."],
      ["03", "Build and learn", "Implement in small increments, check edge cases, and document what is still uncertain."],
    ].map(([number, title, detail]) => <article key={number} className="grid gap-4 border-b border-[var(--color-line)] py-8 sm:grid-cols-[8rem_1fr]"><span className="type-caption text-[var(--color-signal)]">{number}</span><div><h3 className="type-h4">{title}</h3><p className="type-body-md mt-3 text-[var(--color-muted)]">{detail}</p></div></article>)}</div></div></section>
  </main><Footer/></div>;
}
