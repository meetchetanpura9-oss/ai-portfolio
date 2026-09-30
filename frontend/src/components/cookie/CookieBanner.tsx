"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookie } from "../../context/CookieContext";
import Link from "next/link";
import { Cookie, Settings, ShieldCheck } from "lucide-react";

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectOptional, openPreferences } = useCookie();

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Cookie consent banner"
        role="dialog"
        aria-describedby="cookie-banner-description"
        initial={{ opacity: 0, y: 50, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-6 z-[9999] max-w-2xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] p-5 sm:p-6 text-slate-100 shadow-2xl shadow-slate-950/80 backdrop-blur-xl">
          {/* Subtle blue ambient accent blur */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4">
            {/* Header / Intro */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20">
                  <Cookie className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-white font-display">
                    Privacy &amp; Cookies
                  </h2>
                  <p className="text-xs text-slate-400">
                    Your privacy matters on this portfolio
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              id="cookie-banner-description"
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
            >
              We use essential cookies to operate this website. Optional analytics
              cookies help us understand how visitors interact with the portfolio to
              continuously improve user experience.{" "}
              <Link
                href="/cookies"
                className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
              >
                Read Cookie Policy
              </Link>
            </p>

            {/* Equal-Weight Action Buttons */}
            {/* Desktop: row layout [ Reject optional ] [ Manage preferences ] [ Accept all ] */}
            {/* Mobile (390px): stacked full-width buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={rejectOptional}
                className="order-2 sm:order-1 flex-1 sm:flex-initial inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 active:scale-[0.98]"
              >
                Reject optional
              </button>

              <button
                type="button"
                onClick={openPreferences}
                className="order-3 sm:order-2 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 active:scale-[0.98]"
              >
                <Settings className="h-3.5 w-3.5" />
                Manage preferences
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="order-1 sm:order-3 flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-[0.98]"
              >
                <ShieldCheck className="h-4 w-4" />
                Accept all
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
