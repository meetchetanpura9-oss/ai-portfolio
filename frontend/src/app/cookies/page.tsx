import type { Metadata } from "next";
import Link from "next/link";
import { COOKIE_AUDIT_TABLE, COOKIE_CATEGORIES } from "../../components/cookie/cookie-config";
import CookieSettingsButton from "../../components/cookie/CookieSettingsButton";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar";
import { Cookie, ShieldCheck, ArrowLeft, Lock, BarChart3, Megaphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy — Chetanpura Meet",
  description:
    "Learn about how Chetanpura Meet's AI portfolio uses cookies, local storage technologies, and how you can manage your privacy preferences.",
};

export default function CookiePolicyPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400">
            <Cookie className="h-3.5 w-3.5" />
            <span>Transparency &amp; Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-display tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
            This Cookie Policy explains what cookies and local storage technologies are used on
            this website, why they are used, and how you can control your preferences at any time.
          </p>
          <p className="text-xs font-mono text-text-dim">
            Last Updated: September 2026 • Compliant with EC, ICO &amp; DPDP 2025 Guidance
          </p>
        </div>

        {/* Quick Preference Control Card */}
        <div className="mb-12 rounded-2xl border border-slate-800 bg-[#0F172A] p-6 text-slate-100 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                Your Privacy Settings
              </h2>
              <p className="text-xs text-slate-300">
                You can review or change your cookie choices for this browser at any time.
              </p>
            </div>
            <CookieSettingsButton variant="button" className="w-full sm:w-auto" />
          </div>
        </div>

        {/* What Are Cookies Section */}
        <section className="space-y-4 mb-12">
          <h2 className="text-xl font-bold text-text-primary font-display">
            1. What Are Cookies?
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Cookies are small text files stored on your browser or device when you visit a website.
            They allow the website to remember your actions and preferences (such as dark mode choice,
            session state, or cookie consent choices) over a period of time.
          </p>
        </section>

        {/* Categories Section */}
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-bold text-text-primary font-display">
            2. Cookie Categories We Use
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {COOKIE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="rounded-xl border border-border-custom bg-surface p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cat.id === "essential" && <Lock className="h-4 w-4 text-emerald-400" />}
                    {cat.id === "analytics" && <BarChart3 className="h-4 w-4 text-blue-400" />}
                    {cat.id === "marketing" && <Megaphone className="h-4 w-4 text-purple-400" />}
                    <h3 className="text-base font-bold text-text-primary font-display">
                      {cat.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                      cat.alwaysOn
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {cat.badgeText}
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {cat.detailedDesc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Audit Table */}
        <section className="space-y-4 mb-12">
          <h2 className="text-xl font-bold text-text-primary font-display">
            3. Cookies &amp; Storage Inventory
          </h2>
          <p className="text-xs text-text-muted">
            Below is an exact record of cookies and local storage mechanisms utilized across this application:
          </p>

          <div className="overflow-x-auto rounded-xl border border-border-custom bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised border-b border-border-custom text-text-primary font-mono">
                <tr>
                  <th className="p-3.5">Cookie / Key</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-text-muted">
                {COOKIE_AUDIT_TABLE.map((row) => (
                  <tr key={row.name} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-text-primary">
                      {row.name}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                          row.category === "Essential"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : row.category === "Analytics"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-purple-500/15 text-purple-400"
                        }`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="p-3.5 leading-relaxed">{row.purpose}</td>
                    <td className="p-3.5 font-mono text-[11px]">{row.duration}</td>
                    <td className="p-3.5 text-text-dim text-[11px]">{row.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact & Rights */}
        <section className="space-y-3 rounded-xl border border-border-custom bg-surface p-6">
          <h2 className="text-base font-bold text-text-primary font-display">
            4. Questions &amp; Data Rights
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            If you have questions regarding this Cookie Policy or your privacy choices, please reach out to{" "}
            <a href="mailto:meetchetanpura9@gmail.com" className="text-accent underline">
              meetchetanpura9@gmail.com
            </a>.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
