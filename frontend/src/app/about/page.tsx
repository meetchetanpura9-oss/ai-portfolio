import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import AboutGallery from "../../components/AboutGallery";
import Footer from "../../components/footer/Footer";
import TechTicker from "../../components/TechTicker";
import { siteContent } from "../../data/siteContent";

export const metadata = { title: "About — Meet Chetanpura", description: "Professional background, education, and engineering approach of AI systems engineer Meet Chetanpura." };

export default function AboutPage() {
  return <div className="relative min-h-screen"><Navbar/><main>
    <section className="shell grid min-h-screen items-center gap-12 pb-20 pt-32 lg:grid-cols-[.86fr_1.14fr]">
      <div><span className="type-label section-kicker">About / Meet Chetanpura</span><h1 className="type-h1 mt-5">{siteContent.about.headline}</h1><p className="type-body-lg mt-7 text-[var(--color-muted)]">{siteContent.about.summary}</p><p className="type-body-md mt-5 text-[var(--color-muted)]">My approach is problem-first: understand the operational constraint, design the smallest dependable system, then make its intelligence measurable and transparent.</p><Link className="btn-primary mt-9" href="/#contact">Work with me <ArrowUpRight size={17}/></Link></div>
      <AboutGallery/>
    </section>
    <TechTicker/>
    <section className="tech-section"><div className="shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="type-label section-kicker">Professional timeline</span><h2 className="type-h2 mt-4">Built through curiosity and practice.</h2></div><div className="border-t border-[var(--color-line)]">{siteContent.about.milestones.map(item => <article key={item.period} className="grid gap-4 border-b border-[var(--color-line)] py-8 sm:grid-cols-[8rem_1fr]"><span className="type-caption text-[var(--color-signal)]">{item.period}</span><div><h3 className="type-h4">{item.title}</h3><p className="type-caption mt-2 text-[var(--color-dim)]">{item.place}</p><p className="type-body-md mt-3 text-[var(--color-muted)]">{item.detail}</p></div></article>)}</div></div></section>
  </main><Footer/></div>;
}
