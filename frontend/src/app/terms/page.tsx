import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use — Chetanpura Meet",
  description:
    "Terms of Use for Chetanpura Meet's AI portfolio website and related demonstration projects.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-void text-text-primary selection:bg-accent/30 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-muted hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Portfolio
        </Link>

        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-xs font-mono text-slate-400">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Notice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs font-mono text-text-dim">
            Last Updated: September 2026
          </p>
        </div>

        <div className="space-y-8 text-xs text-text-muted leading-relaxed">
          <section className="space-y-3 rounded-xl border border-border-custom bg-surface p-6">
            <h2 className="text-base font-bold text-text-primary font-display">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and navigating this portfolio (meetchetanpura.com), you agree to be bound by these Terms of Use and all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-border-custom bg-surface p-6">
            <h2 className="text-base font-bold text-text-primary font-display">
              2. Intellectual Property
            </h2>
            <p>
              All contents, design layouts, project case studies, code demonstrations, and graphics displayed on this website are the intellectual property of Chetanpura Meet unless otherwise attributed.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-border-custom bg-surface p-6">
            <h2 className="text-base font-bold text-text-primary font-display">
              3. Contact &amp; Inquiries
            </h2>
            <p>
              For inquiries regarding software engineering, AI consulting, or intellectual property rights, please contact{" "}
              <a href="mailto:meetchetanpura9@gmail.com" className="text-accent underline">
                meetchetanpura9@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
