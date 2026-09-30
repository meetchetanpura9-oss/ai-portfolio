"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCookie } from "../../context/CookieContext";
import { COOKIE_CATEGORIES } from "./cookie-config";
import { X, Check, Shield, Info, Sliders } from "lucide-react";

export default function CookiePreferences() {
  const { isPreferencesOpen, closePreferences, consent, savePreferences, acceptAll } =
    useCookie();

  const [analytics, setAnalytics] = useState<boolean>(false);
  const [marketing, setMarketing] = useState<boolean>(false);

  // Sync internal toggle state when modal opens
  useEffect(() => {
    if (isPreferencesOpen && consent) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [isPreferencesOpen, consent]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreferencesOpen) {
        closePreferences();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreferencesOpen, closePreferences]);

  if (!isPreferencesOpen) return null;

  const handleSave = () => {
    savePreferences({
      essential: true,
      analytics,
      marketing,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePreferences}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#0F172A] p-6 text-slate-100 shadow-2xl shadow-slate-950/90 z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20">
                <Sliders className="h-5 w-5" />
              </span>
              <div>
                <h2
                  id="cookie-preferences-title"
                  className="text-lg font-bold text-white font-display"
                >
                  Privacy Preferences
                </h2>
                <p className="text-xs text-slate-400">
                  Choose which optional cookies you want to allow.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closePreferences}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              aria-label="Close preferences modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="py-4 space-y-5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {COOKIE_CATEGORIES.map((cat) => {
              const isEssential = cat.id === "essential";
              const isChecked = isEssential
                ? true
                : cat.id === "analytics"
                ? analytics
                : marketing;

              const toggleHandler = () => {
                if (isEssential) return;
                if (cat.id === "analytics") setAnalytics(!analytics);
                if (cat.id === "marketing") setMarketing(!marketing);
              };

              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-slate-700/80"
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-display">
                        {cat.title}
                      </h3>
                      {cat.alwaysOn ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                          <Check className="h-3 w-3" /> Always active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                          Optional
                        </span>
                      )}
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isChecked}
                      disabled={isEssential}
                      onClick={toggleHandler}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEssential
                          ? "bg-emerald-600/80 cursor-not-allowed"
                          : isChecked
                          ? "bg-blue-600"
                          : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isChecked ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {cat.shortDesc}
                  </p>

                  <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-300">Examples:</strong>{" "}
                      {cat.examples.join(", ")}.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={acceptAll}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Allow all categories
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <Shield className="h-3.5 w-3.5" />
              Save preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
