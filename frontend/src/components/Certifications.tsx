"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CERTIFICATIONS } from "../data/certifications";
import BentoCard from "./BentoCard";
import Revealer from "./motion/Revealer";
import { Certification } from "../types";
import Image from "next/image";
import { HiExternalLink, HiX } from "react-icons/hi";

export default function Certifications() {
  const [selectedBadge, setSelectedBadge] = useState<Certification | null>(null);

  const featuredCert = CERTIFICATIONS.find(
    (cert) => cert.id === "microsoft-ai-skills-fest-2026"
  );
  const otherCerts = CERTIFICATIONS.filter(
    (cert) => cert.id !== "microsoft-ai-skills-fest-2026"
  );

  return (
    <Revealer
      id="certifications"
      className="relative border-t border-border-custom bg-void py-20 sm:py-28 transition-colors duration-300"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* Header */}
        <header className="mb-10 max-w-2xl sm:mb-14">
          <p className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
            Credentials & Verification
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl font-display">
            Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#D946EF] to-[#0284C7] dark:from-[#C084FC] dark:to-[#00F0FF]">Certifications</span>
          </h2>
          <p className="mt-4 text-base text-text-muted sm:text-lg font-medium">
            Recognized certifications validating expertise in Artificial Intelligence, Deep Learning, Applied Automation, and Data Science.
          </p>
        </header>

        {/* Featured Certificate Card */}
        {featuredCert && (
          <div className="mb-10">
            <BentoCard className="w-full" glow="magenta">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-between">

                {/* Badge Image */}
                <div className="relative shrink-0 overflow-hidden rounded-2xl border border-border-custom bg-surface-raised p-4 h-48 w-48 flex items-center justify-center dark:border-[#262038] dark:bg-[#08070D]">
                  <Image
                    src={featuredCert.badgeImage}
                    alt={`${featuredCert.title} Badge`}
                    fill
                    sizes="180px"
                    className="object-contain p-2"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-md border border-[#D946EF]/40 bg-[#D946EF]/15 px-2 py-0.5 font-mono text-[9px] font-bold text-[#E879F9]">
                    FEATURED BADGE
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-accent font-bold">{featuredCert.issuer}</span>
                      <span className="text-xs text-text-muted font-medium">• {featuredCert.issueDate}</span>
                    </div>

                    <h3 className="mt-1 font-bold text-text-primary text-xl sm:text-2xl font-display">
                      {featuredCert.title}
                    </h3>

                    <p className="mt-2 text-xs leading-relaxed text-text-muted font-medium">
                      {featuredCert.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {featuredCert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-border-custom bg-surface-raised px-2.5 py-1 font-mono text-[10px] font-semibold text-text-muted dark:border-[#262038] dark:bg-[#08070D]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border-custom pt-4 dark:border-[#262038]">
                    {featuredCert.credentialUrl && (
                      <a
                        href={featuredCert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="key-gloss inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all"
                      >
                        <HiExternalLink className="text-sm" />
                        <span>Verify Credential</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(featuredCert)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border-custom bg-surface-raised px-4.5 py-2.5 text-xs font-bold text-text-primary hover:border-accent dark:border-[#262038] dark:bg-[#08070D] transition-colors cursor-pointer"
                    >
                      View Badge Detail
                    </button>
                  </div>
                </div>

              </div>
            </BentoCard>
          </div>
        )}

        {/* Other Credentials Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {otherCerts.map((cert, index) => (
            <BentoCard key={cert.id} delay={index * 0.04} glow={cert.glowColor}>
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[11px] text-accent font-bold">{cert.issuer}</span>
                    <span className="font-mono text-[10px] text-text-muted font-medium">{cert.issueDate}</span>
                  </div>

                  <h3 className="font-bold text-text-primary text-base font-display">
                    {cert.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-text-muted font-medium line-clamp-3">
                    {cert.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {cert.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded border border-border-custom bg-surface-raised px-2 py-0.5 font-mono text-[10px] font-semibold text-text-muted dark:border-[#262038] dark:bg-[#08070D]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-border-custom pt-3 flex justify-end dark:border-[#262038]">
                  <button
                    type="button"
                    onClick={() => setSelectedBadge(cert)}
                    className="text-xs font-mono font-bold text-accent hover:underline cursor-pointer"
                  >
                    View Credential →
                  </button>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full rounded-3xl border border-border-custom bg-surface p-6 text-text-primary shadow-2xl dark:border-[#8B5CF6]/40 dark:bg-[#181426]"
            >
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="absolute right-4 top-4 rounded-xl border border-border-custom bg-surface-raised p-2 text-text-muted hover:text-text-primary cursor-pointer dark:border-[#262038] dark:bg-[#08070D]"
              >
                <HiX size={18} />
              </button>

              <span className="font-mono text-xs text-accent font-bold">{selectedBadge.issuer}</span>
              <h3 className="mt-1 text-xl font-bold font-display pr-6 text-text-primary">{selectedBadge.title}</h3>
              <p className="text-xs text-text-muted font-mono mt-0.5">{selectedBadge.issueDate}</p>

              <div className="relative mx-auto my-5 h-44 w-44 rounded-2xl border border-border-custom bg-surface-raised p-3 flex items-center justify-center dark:border-[#262038] dark:bg-[#08070D]">
                <Image
                  src={selectedBadge.badgeImage}
                  alt={`${selectedBadge.title} badge`}
                  fill
                  className="object-contain p-2"
                />
              </div>

              <p className="text-xs text-text-muted font-medium leading-relaxed mb-5">
                {selectedBadge.description}
              </p>

              {selectedBadge.credentialUrl && (
                <a
                  href={selectedBadge.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="key-gloss flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold uppercase tracking-wider"
                >
                  <span>Verify Credential</span>
                  <HiExternalLink />
                </a>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Revealer>
  );
}
