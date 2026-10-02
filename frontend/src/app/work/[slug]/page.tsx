import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, FEATURED_PROJECTS } from "../../../lib/projects";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer/Footer";

export async function generateStaticParams() {
  return FEATURED_PROJECTS.map((project) => ({ slug: project.slug }));
}

export default async function ProjectBriefPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-ink)]">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="shell max-w-5xl pb-24 pt-36">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-line)] pb-6 type-caption text-[var(--color-muted)]">
          <Link href="/work" className="hover:text-[var(--color-signal)]">← All work</Link>
          <span>Project brief / Details in review</span>
        </div>
        <section className="py-16 sm:py-24" aria-labelledby="project-title">
          <span className="type-label section-kicker">Work in progress</span>
          <h1 id="project-title" className="type-h1 mt-5 max-w-[15ch]">{project.title}</h1>
          <p className="type-body-lg mt-8 max-w-2xl text-[var(--color-muted)]">
            This project record is being reviewed before publication. I will share its context, my contribution, technical decisions, and any measured results when the supporting information is ready.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/work" className="btn-primary">Explore other work</Link>
            <Link href="/#contact" className="btn-secondary">Get in touch</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
