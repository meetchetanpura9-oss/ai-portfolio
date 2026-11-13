import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import { api, apiErrorMessage } from "../../lib/api";
import PageShell, { Link } from "../site/PageShell";
import { usePageMeta } from "../site/navigation";

const PAGE_SIZE = 12;

export function CaseStudyCard({ study }) {
  return (
    <Link href={`/case-studies/${study.slug}`} className="card card-interactive group flex h-full flex-col overflow-hidden">
      {study.cover_image_url ? (
        <img src={study.cover_image_url} alt="" loading="lazy" className="aspect-[16/9] w-full border-b border-line object-cover" />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center border-b border-line bg-surface-2 text-subtle">
          <BookOpen size={28} aria-hidden />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {study.category && <span className="eyebrow">{study.category}</span>}
          {study.featured && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-amber">
              <Star size={12} aria-hidden /> Featured
            </span>
          )}
        </div>
        <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand-blue">{study.title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{study.summary}</p>
        {study.technologies?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {study.technologies.slice(0, 4).map((t) => (
              <span key={t} className="chip !text-[11px]">
                {t}
              </span>
            ))}
          </div>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-blue">
          Read case study <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function CaseStudiesIndex() {
  usePageMeta("Case Studies — Meet Chetanpura", "Deep dives into AI, agentic and full-stack projects: the problem, the architecture and the results.");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/case-studies", { params: { page, page_size: PAGE_SIZE, category: category || undefined } })
      .then(({ data: result }) => {
        if (!alive) return;
        setData(result);
        setError("");
      })
      .catch((err) => alive && setError(apiErrorMessage(err, "Could not load case studies.")));
    return () => {
      alive = false;
    };
  }, [page, category]);

  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const pick = (value) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <PageShell>
      <header className="max-w-2xl">
        <p className="eyebrow">case studies</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">How the projects were built</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">The problem, the architecture, the trade-offs and what came out of it.</p>
      </header>

      {data?.categories?.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["", ...data.categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => pick(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${category === c ? "border-brand-blue bg-brand-blue text-white" : "border-line bg-surface text-muted hover:text-ink"}`}
            >
              {c || "All"}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {error ? (
          <p className="card p-6 text-sm text-muted">{error}</p>
        ) : !data ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-80 animate-pulse" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <BookOpen size={28} className="text-subtle" aria-hidden />
            <p className="font-semibold text-ink">No case studies published yet</p>
            <p className="text-sm text-muted">Subscribe to the newsletter at the bottom of the portfolio to hear when the first one is out.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          <button type="button" className="btn btn-ghost !px-4 !py-2 text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span className="tabular-nums text-muted">
            {page} / {pages}
          </span>
          <button type="button" className="btn btn-ghost !px-4 !py-2 text-sm disabled:opacity-50" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </nav>
      )}
    </PageShell>
  );
}
