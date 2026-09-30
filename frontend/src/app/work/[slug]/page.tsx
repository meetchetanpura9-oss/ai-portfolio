import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug, FEATURED_PROJECTS } from "../../../lib/projects";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer/Footer";

export async function generateStaticParams() {
  return FEATURED_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project || !project.caseStudy) {
    notFound();
  }

  const { caseStudy } = project;
  const nextProjectIndex = (FEATURED_PROJECTS.findIndex((p) => p.slug === slug) + 1) % FEATURED_PROJECTS.length;
  const nextProject = FEATURED_PROJECTS[nextProjectIndex];

  return (
    <div className="bg-[#0B0D0F] text-[#F3F1EC] min-h-screen selection:bg-[#B7F34A] selection:text-[#0B0D0F]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-36 pb-24">

        {/* Breadcrumb & Year Tag */}
        <div className="flex items-center justify-between font-mono text-xs text-[#9A9A95] border-b border-[#282B2D] pb-6 mb-12">
          <Link href="/#work" className="hover:text-[#B7F34A] transition-colors flex items-center gap-2">
            <span>← Back to Selected Work</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[#B7F34A] font-bold">{project.serviceCategory}</span>
            <span>{project.year}</span>
          </div>
        </div>

        {/* Case Study Title & Big Business Outcome */}
        <h1 className="hero-heading text-[#F3F1EC]">
          {project.title}
        </h1>

        <p className="font-display text-xl sm:text-3xl font-semibold text-[#B7F34A] mt-6 leading-tight">
          {caseStudy.oneLineOutcome}
        </p>

        {/* Overview Box */}
        <div className="editorial-card p-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="mono-meta text-[#9A9A95]">My Role</span>
            <p className="font-display text-sm font-semibold text-[#F3F1EC] mt-2">
              {caseStudy.role}
            </p>
          </div>

          <div>
            <span className="mono-meta text-[#9A9A95]">Technologies</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded bg-[#0B0D0F] border border-[#282B2D] font-mono text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="mono-meta text-[#9A9A95]">Core Impact</span>
            <p className="font-display text-sm font-bold text-[#B7F34A] mt-2">
              {project.impact}
            </p>
          </div>
        </div>

        {/* Challenge & Solution Sections */}
        <section className="mt-16 space-y-12">

          <div className="editorial-card p-8">
            <span className="mono-meta text-[#B7F34A]">01 — The Business Challenge</span>
            <h2 className="section-heading text-2xl font-bold mt-2 text-[#F3F1EC]">
              Operational Bottleneck
            </h2>
            <p className="body-large mt-4 text-[#9A9A95]">
              {caseStudy.challenge}
            </p>
          </div>

          <div className="editorial-card p-8">
            <span className="mono-meta text-[#B7F34A]">02 — The System Architecture</span>
            <h2 className="section-heading text-2xl font-bold mt-2 text-[#F3F1EC]">
              Engineered Solution
            </h2>
            <p className="body-large mt-4 text-[#9A9A95]">
              {caseStudy.solution}
            </p>

            {/* Architecture Node Blueprint */}
            <div className="mt-8 border-t border-[#282B2D] pt-8">
              <span className="mono-meta text-[#9A9A95] block mb-4">Pipeline Flow Diagram: {caseStudy.architectureDescription}</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {caseStudy.architectureNodes.map((node) => (
                  <div key={node.step} className="bg-[#0B0D0F] p-4 rounded-xl border border-[#282B2D]">
                    <span className="mono-meta text-[#B7F34A]">{node.step}</span>
                    <h4 className="font-display text-sm font-bold text-[#F3F1EC] mt-1">{node.label}</h4>
                    <p className="font-mono text-[11px] text-[#9A9A95] mt-2">{node.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="editorial-card p-8">
            <span className="mono-meta text-[#B7F34A]">03 — Quantified Business Impact</span>
            <h2 className="section-heading text-2xl font-bold mt-2 text-[#F3F1EC]">
              Measurable Outcomes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {caseStudy.keyResults.map((result) => (
                <div key={result.label} className="bg-[#0B0D0F] p-6 rounded-xl border border-[#282B2D] text-center">
                  <span className="font-display text-4xl font-extrabold text-[#B7F34A] block">
                    {result.value}
                  </span>
                  <span className="font-display text-sm font-bold text-[#F3F1EC] block mt-2">
                    {result.label}
                  </span>
                  <p className="font-mono text-xs text-[#9A9A95] mt-2">
                    {result.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="editorial-card p-8">
            <span className="mono-meta text-[#B7F34A]">04 — Key Engineering Insights</span>
            <h2 className="section-heading text-2xl font-bold mt-2 text-[#F3F1EC]">
              Lessons Learned & Takeaways
            </h2>
            <ul className="mt-6 space-y-4">
              {caseStudy.lessonsLearned.map((lesson, index) => (
                <li key={index} className="flex items-start gap-3 font-mono text-xs text-[#9A9A95] leading-relaxed">
                  <span className="text-[#B7F34A] font-bold">0{index + 1}.</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

        </section>

        {/* Next Project Footer Bar */}
        <div className="mt-20 border-t border-[#282B2D] pt-12 flex items-center justify-between">
          <div>
            <span className="mono-meta text-[#9A9A95]">Next Case Study</span>
            <h3 className="font-display text-2xl font-bold text-[#F3F1EC] mt-1">
              {nextProject.title}
            </h3>
          </div>

          <Link
            href={`/work/${nextProject.slug}`}
            className="btn-editorial-primary text-xs"
          >
            Read Next Case Study →
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
