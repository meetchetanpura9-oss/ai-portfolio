import Link from "next/link";
import { FEATURED_PROJECTS } from "../../lib/projects";
import Navbar from "../../components/Navbar";
import Footer from "../../components/footer/Footer";

export default function WorkIndexPage() {
  return (
    <div className="bg-[#0B0D0F] text-[#F3F1EC] min-h-screen selection:bg-[#B7F34A] selection:text-[#0B0D0F]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24">
        <div className="border-b border-[#282B2D] pb-10 mb-16">
          <span className="mono-meta text-[#B7F34A]">All Case Studies</span>
          <h1 className="hero-heading text-[#F3F1EC] mt-3">
            Selected Work & AI Systems
          </h1>
          <p className="body-large mt-4 text-[#9A9A95] max-w-2xl">
            Detailed technical case studies explaining business challenges, FastAPI system architectures, multi-agent pipelines, and measured results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURED_PROJECTS.map((project, idx) => (
            <article key={project.id} className="editorial-card p-8 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-[#9A9A95] border-b border-[#282B2D] pb-4 mb-6">
                  <span className="text-[#B7F34A] font-bold">{project.serviceCategory}</span>
                  <span>{project.year}</span>
                </div>

                <h2 className="project-heading text-[#F3F1EC] group-hover:text-[#B7F34A] transition-colors">
                  {project.title}
                </h2>
                <p className="body-large mt-3 text-[#9A9A95]">
                  {project.oneLiner}
                </p>

                <div className="mt-6 space-y-2 bg-[#151819] p-4 rounded-xl border border-[#282B2D]">
                  <p className="font-mono text-xs text-[#F3F1EC]">
                    <span className="text-[#9A9A95]">Impact:</span> {project.impact}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#282B2D] flex items-center justify-between">
                <Link
                  href={`/work/${project.slug}`}
                  className="font-display text-sm font-semibold text-[#F3F1EC] group-hover:text-[#B7F34A] transition-colors inline-flex items-center gap-2"
                >
                  <span>Read Detailed Case Study</span>
                  <span>→</span>
                </Link>
                <span className="mono-meta text-[#9A9A95]">0{idx + 1}</span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
