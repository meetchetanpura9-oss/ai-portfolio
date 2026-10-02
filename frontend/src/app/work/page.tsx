import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FEATURED_PROJECTS } from "../../lib/projects";
import Navbar from "../../components/Navbar";
import Footer from "../../components/footer/Footer";

export default function WorkIndexPage() {
  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-ink)]">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="shell pb-24 pt-36">
        <div className="mb-12 border-b border-[var(--color-line)] pb-10">
          <span className="type-label section-kicker">Work / Project records</span>
          <h1 className="type-h1 mt-4">Work in context.</h1>
          <p className="type-body-lg mt-5 max-w-2xl text-[var(--color-muted)]">
            These briefs are being reviewed. I will add project roles, implementation details, and outcomes as supporting artifacts are cleared for publication.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURED_PROJECTS.map((project, index) => (
            <article key={project.id} className="tech-card flex min-h-72 flex-col p-7 sm:p-9">
              <div className="relative z-10 flex items-center justify-between type-caption text-[var(--color-dim)]">
                <span className="text-[var(--color-signal)]">Project brief</span><span>0{index + 1}</span>
              </div>
              <h2 className="relative z-10 type-h3 mt-10">{project.title}</h2>
              <p className="relative z-10 type-body-md mt-3 text-[var(--color-muted)]">Details and evidence in preparation.</p>
              <Link href={`/work/${project.slug}`} className="relative z-10 mt-auto flex items-center justify-between border-t border-[var(--color-line)] pt-5 type-button">
                View brief <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <p className="type-body-md mt-12 text-[var(--color-muted)]">Interested in a particular kind of system? <Link className="text-[var(--color-signal)] underline underline-offset-4" href="/#contact">Get in touch</Link>.</p>
      </main>
      <Footer />
    </div>
  );
}
