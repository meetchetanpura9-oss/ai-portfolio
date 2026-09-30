"use client";

import React from "react";
import { useCookie } from "../../context/CookieContext";
import { Settings } from "lucide-react";

interface CookieSettingsButtonProps {
  className?: string;
  variant?: "link" | "button";
}

export default function CookieSettingsButton({
  className = "",
  variant = "link",
}: CookieSettingsButtonProps) {
  const { openPreferences } = useCookie();

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={openPreferences}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <Settings className="h-3.5 w-3.5" />
        <span>Cookie Settings</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={`inline-flex items-center gap-1 hover:text-blue-400 transition-colors focus:outline-none focus:underline ${className}`}
    >
      <Settings className="h-3 w-3" />
      <span>Cookie Settings</span>
    </button>
  );
}
