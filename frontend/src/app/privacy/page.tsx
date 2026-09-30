import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar";
import { Shield, ArrowLeft, Mail, Database, Lock, UserCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Chetanpura Meet",
  description:
    "Privacy policy and data protection disclosure for Chetanpura Meet's AI portfolio, detailing how contact information and technical data are processed under DPDP 2025 and global standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-void text-text-primary selection:bg-accent/30 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-muted hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Portfolio
        </Link>

        {/* Page Header */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono text-purple-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Data Protection &amp; Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            Your privacy and trust are paramount. This notice explains how personal data submitted through this portfolio is collected, stored, processed, and protected.
          </p>
          <p className="text-xs font-mono text-text-dim">
            Effective Date: September 2026 • Compliant with India DPDP Act &amp; Rules 2025 &amp; Global Privacy Standards
          </p>
        </div>

        <div className="space-y-10">
          {/* Section 1: Data Collection */}
          <section className="space-y-4 rounded-xl border border-border-custom bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-text-primary font-display">
                1. Information We Collect
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              When you interact with the contact forms or direct communication features on this portfolio, we may collect the following personal information:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-text-muted pl-2 font-mono">
              <li>Full Name</li>
              <li>Email Address</li>
              <li>Phone Number (if voluntarily provided)</li>
              <li>Message Content &amp; Project Requirements</li>
            </ul>
          </section>

          {/* Section 2: Purpose of Processing */}
          <section className="space-y-4 rounded-xl border border-border-custom bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-text-primary font-display">
                2. Purpose of Data Processing
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Any personal data collected via the contact form is processed strictly for the following legitimate purposes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-text-muted pl-2">
              <li>Responding to project proposals, consulting requests, and career inquiries.</li>
              <li>Communicating project estimates, timeline updates, or professional collaborations.</li>
              <li>Ensuring security, anti-spam validation, and website operational integrity.</li>
            </ul>
          </section>

          {/* Section 3: Separate Architecture & Storage */}
          <section className="space-y-4 rounded-xl border border-border-custom bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Database className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-text-primary font-display">
                3. Privacy Architecture &amp; Storage
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              We maintain a strictly decoupled architecture for privacy:
            </p>
            <div className="rounded-lg bg-surface-raised p-4 border border-border-custom text-xs space-y-2 text-text-muted">
              <p>
                <strong className="text-text-primary font-mono">Cookie Consent:</strong> Stored strictly in your browser (first-party cookie). No personal data or database queries are sent to remember cookie choices.
              </p>
              <p>
                <strong className="text-text-primary font-mono">Contact Submissions:</strong> Processed via secure Next.js API endpoints and routed to protected Supabase PostgreSQL storage / email relay. Messages are retained only for as long as necessary to address your inquiry.
              </p>
            </div>
          </section>

          {/* Section 4: Indian DPDP Framework 2025 Compliance */}
          <section className="space-y-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-text-primary font-display">
                4. Indian Digital Personal Data Protection (DPDP) Compliance
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Under India’s Digital Personal Data Protection Rules, 2025 (MeitY guidance):
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-text-muted pl-2">
              <li>
                <strong className="text-text-primary">Free &amp; Unambiguous Consent:</strong> All data collection is based on clear affirmative action when you submit a form or accept optional cookies.
              </li>
              <li>
                <strong className="text-text-primary">Right to Withdraw Consent:</strong> You may request deletion of your contact records or withdraw consent at any time.
              </li>
              <li>
                <strong className="text-text-primary">No Sale of Data:</strong> We do not sell, rent, or trade your personal information to any third party for marketing or commercial gain.
              </li>
            </ul>
          </section>

          {/* Section 5: Data Subject Rights & Contact */}
          <section className="space-y-4 rounded-xl border border-border-custom bg-surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <UserCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-text-primary font-display">
                5. Exercising Your Data Rights
              </h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              You have the right to request access to, correction of, or permanent erasure of any personal data submitted to Chetanpura Meet.
            </p>
            <p className="text-xs text-text-muted">
              To submit a data request or privacy question, contact:{" "}
              <a href="mailto:meetchetanpura9@gmail.com" className="text-accent font-semibold underline">
                meetchetanpura9@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
