import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BadgeCheck, CalendarDays, ChevronDown, ExternalLink, Eye, Hash } from "lucide-react";
import { CERTIFICATIONS, CERT_CATEGORIES } from "../data/certifications";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import Modal from "./ui/Modal";

const ALL = "All";
const INITIAL = 6;

const CATEGORY_TONE = {
  "Artificial Intelligence": "var(--brand-violet)",
  "Machine Learning": "var(--brand-blue)",
  "Generative AI": "var(--brand-cyan)",
  "Cloud Computing": "var(--brand-emerald)",
  "Software Development": "var(--brand-rose)",
  "Data Analytics": "var(--brand-amber)",
  Other: "var(--subtle)",
};

function formatDate(ym) {
  if (!ym) return null;
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, (m || 1) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const isPdf = (file) => /\.pdf($|\?)/i.test(file);

function CertCard({ cert, onView }) {
  const tone = CATEGORY_TONE[cert.category] ?? CATEGORY_TONE.Other;
  return (
    <article className="card card-interactive flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${tone} 12%, transparent)`, color: tone }}
        >
          <Award size={20} aria-hidden />
        </span>
        <span className="chip !py-1 !text-[0.7rem]" style={{ color: tone }}>
          {cert.category}
        </span>
      </div>

      <h3 className="mt-5 text-base font-semibold leading-snug text-ink sm:text-lg">{cert.title}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
        <BadgeCheck size={15} className="text-brand-emerald" aria-hidden /> {cert.issuer}
      </p>

      <dl className="mt-4 space-y-1.5 font-mono text-xs text-subtle">
        {cert.issueDate && (
          <div className="flex items-center gap-2">
            <CalendarDays size={13} aria-hidden />
            <dt className="sr-only">Issued</dt>
            <dd>{formatDate(cert.issueDate)}</dd>
          </div>
        )}
        {cert.credentialId && (
          <div className="flex items-center gap-2">
            <Hash size={13} aria-hidden />
            <dt className="sr-only">Credential ID</dt>
            <dd className="truncate">{cert.credentialId}</dd>
          </div>
        )}
      </dl>

      {cert.skills?.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {cert.skills.map((s) => (
            <li key={s} className="chip !px-2.5 !py-1 !text-[0.72rem]">
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        {cert.file && (
          <button type="button" onClick={() => onView(cert)} className="btn btn-ghost flex-1 !py-2 text-sm">
            <Eye size={15} aria-hidden /> View
          </button>
        )}
        {cert.verifyUrl && (
          <a href={cert.verifyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost flex-1 !py-2 text-sm">
            Verify <ExternalLink size={14} aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}

export default function Certifications() {
  const [filter, setFilter] = useState(ALL);
  const [viewing, setViewing] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const close = useCallback(() => setViewing(null), []);

  const counts = useMemo(() => {
    const c = Object.fromEntries(CERT_CATEGORIES.map((k) => [k, 0]));
    CERTIFICATIONS.forEach((cert) => {
      c[cert.category] = (c[cert.category] ?? 0) + 1;
    });
    return c;
  }, []);

  const list = filter === ALL ? CERTIFICATIONS : CERTIFICATIONS.filter((c) => c.category === filter);
  const tabs = [ALL, ...CERT_CATEGORIES.filter((k) => counts[k])];
  const visible = expanded ? list : list.slice(0, INITIAL);

  return (
    <section id="certifications" aria-labelledby="cert-title" className="section">
      <div className="container-x">
        <SectionHeader
          id="cert-title"
          index="05"
          label="certifications"
          title="Certifications &"
          highlight="learning"
          lead="Verified credentials and continuous learning across AI, machine learning and software development."
        />

        <Reveal>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div role="tablist" aria-label="Certificate categories" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {tabs.map((t) => {
                const active = filter === t;
                const count = t === ALL ? CERTIFICATIONS.length : counts[t];
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setFilter(t);
                      setExpanded(false);
                    }}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {t}
                    <span className={`font-mono text-[0.7rem] ${active ? "opacity-70" : "text-subtle"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {list.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((cert) => (
                    <CertCard key={cert.id} cert={cert} onView={setViewing} />
                  ))}
                </div>
              ) : (
                <div className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
                  <Award size={26} className="text-subtle" aria-hidden />
                  <p className="text-sm text-muted">No certificates in this category yet — new credentials are on the way.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {list.length > visible.length && (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost">
                Show all {list.length} certificates <ChevronDown size={17} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={Boolean(viewing)} onClose={close} title={viewing?.title ?? ""} size="xl">
        {viewing?.file &&
          (isPdf(viewing.file) ? (
            <iframe src={viewing.file} title={viewing.title} className="h-[70vh] w-full rounded-xl border border-line bg-white" />
          ) : (
            <img src={viewing.file} alt={`${viewing.title} certificate`} className="mx-auto max-h-[75vh] w-auto rounded-xl border border-line" />
          ))}
      </Modal>
    </section>
  );
}
