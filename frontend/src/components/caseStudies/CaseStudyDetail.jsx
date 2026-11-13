import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Link2 } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { api, apiErrorMessage } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import PageShell, { Link } from "../site/PageShell";
import { usePageMeta } from "../site/navigation";
import { CaseStudyCard } from "./CaseStudiesIndex";

const SECTIONS = [
  ["problem_statement", "Problem"],
  ["project_overview", "Overview"],
  ["solution", "Solution"],
  ["technical_architecture", "Technical architecture"],
  ["implementation", "Implementation"],
  ["results", "Results"],
  ["challenges", "Challenges"],
  ["lessons_learned", "Lessons learned"],
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function ListBlock({ title, items, ordered }) {
  if (!items?.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <Tag className={`mt-4 space-y-2 text-muted ${ordered ? "list-decimal" : "list-disc"} pl-5`}>
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {item}
          </li>
        ))}
      </Tag>
    </section>
  );
}

export default function CaseStudyDetail({ slug }) {
  const { toast } = useToast();
  const [study, setStudy] = useState(null);
  const [error, setError] = useState(null); // { notFound, message }

  useEffect(() => {
    // App remounts this page per slug (key), so state starts empty for each study.
    let alive = true;
    api
      .get(`/case-studies/${encodeURIComponent(slug)}`)
      .then(({ data }) => alive && setStudy(data))
      .catch((err) => alive && setError({ notFound: err.response?.status === 404, message: apiErrorMessage(err, "Could not load this case study.") }));
    return () => {
      alive = false;
    };
  }, [slug]);

  usePageMeta(study ? study.seo_title : error?.notFound ? "Case study not found" : null, study?.seo_description);

  // Canonical link for search engines.
  useEffect(() => {
    if (!study?.canonical_url) return undefined;
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = study.canonical_url;
    document.head.appendChild(link);
    return () => link.remove();
  }, [study?.canonical_url]);

  const shareUrl = study?.canonical_url || window.location.href;
  // Link-preview crawlers do not run JavaScript, so social shares point at the API's
  // Open Graph page, which redirects people to the canonical URL.
  const apiBase = api.defaults.baseURL || "";
  const socialUrl = study && /^https?:\/\//.test(apiBase) ? `${apiBase}/case-studies/${study.slug}/share` : shareUrl;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Link copied.", "success");
    } catch {
      toast("Could not copy the link.", "error");
    }
  };

  if (error) {
    return (
      <PageShell narrow>
        <div className="card mt-6 p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-ink">{error.notFound ? "Case study not found" : "Something went wrong"}</h1>
          <p className="mt-2 text-sm text-muted">{error.notFound ? "It may have been moved or unpublished." : error.message}</p>
          <Link href="/case-studies" className="btn btn-ghost mt-6 text-sm">
            All case studies
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!study) {
    return (
      <PageShell narrow>
        <div className="space-y-4" aria-busy="true" aria-label="Loading">
          <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-2" />
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-surface-2" />
        </div>
      </PageShell>
    );
  }

  const filled = SECTIONS.filter(([key]) => study.sections?.[key]);
  return (
    <PageShell narrow>
      <article>
        <Link href="/case-studies" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft size={15} aria-hidden /> All case studies
        </Link>

        <header className="mt-6">
          <p className="eyebrow">
            {study.category}
            {study.published_at && <span className="text-subtle"> · {formatDate(study.published_at)}</span>}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">{study.title}</h1>
          {study.summary && <p className="mt-4 text-lg leading-relaxed text-muted">{study.summary}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {study.github_url && (
              <a href={study.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !px-4 !py-2 text-sm">
                <FaGithub aria-hidden /> Source code
              </a>
            )}
            {study.live_demo_url && (
              <a href={study.live_demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary !px-4 !py-2 text-sm">
                <ExternalLink size={15} aria-hidden /> Live demo
              </a>
            )}
          </div>
        </header>

        {study.cover_image_url && <img src={study.cover_image_url} alt="" className="mt-8 w-full rounded-2xl border border-line object-cover" />}

        {study.technologies?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
            {study.technologies.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}

        {filled.map(([key, label]) => (
          <section key={key} className="mt-10">
            <h2 className="font-display text-xl font-semibold text-ink">{label}</h2>
            {/* Rendered and escaped by the backend's safe Markdown renderer. */}
            <div className="md-prose mt-4" dangerouslySetInnerHTML={{ __html: study.sections[key] }} />
            {key === "technical_architecture" && <ListBlock title="Architecture flow" items={study.architecture_steps} ordered />}
          </section>
        ))}
        {!study.sections?.technical_architecture && <ListBlock title="Architecture flow" items={study.architecture_steps} ordered />}
        <ListBlock title="Key features" items={study.key_features} />

        {study.screenshots?.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-ink">Screenshots</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {study.screenshots.map((shot) => (
                <figure key={shot.src}>
                  <img src={shot.src} alt={shot.alt || ""} loading="lazy" className="w-full rounded-xl border border-line" />
                  {shot.alt && <figcaption className="mt-1.5 text-xs text-subtle">{shot.alt}</figcaption>}
                </figure>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-6">
          <span className="mr-2 text-sm text-muted">Share:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(socialUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="icon-btn"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin aria-hidden />
          </a>
          <button type="button" onClick={copyLink} className="icon-btn" aria-label="Copy link">
            <Link2 size={16} aria-hidden />
          </button>
        </footer>
      </article>

      {study.related?.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-ink">More case studies</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {study.related.slice(0, 2).map((r) => (
              <CaseStudyCard key={r.id} study={r} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
