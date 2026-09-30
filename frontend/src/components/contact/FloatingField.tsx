"use client";

import React from "react";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  required,
  autoComplete,
}: FloatingInputProps) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className={`peer w-full rounded-xl border bg-surface-raised px-4 pb-2.5 pt-6 text-sm text-text-primary font-medium outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 placeholder-transparent focus:border-accent focus:shadow-sm dark:bg-[#08070D] dark:text-[#F8FAFC] dark:focus:border-[#8B5CF6]/50 ${
          error
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500"
            : "border-border-custom dark:border-[#262038]"
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-xs text-text-muted font-medium transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}

interface FloatingTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export function FloatingTextarea({
  id,
  label,
  value,
  onChange,
  error,
  required,
  rows = 4,
}: FloatingTextareaProps) {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder=" "
        className={`peer w-full resize-none rounded-xl border bg-surface-raised px-4 pb-2.5 pt-6 text-sm text-text-primary font-medium outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 placeholder-transparent focus:border-accent focus:shadow-sm dark:bg-[#08070D] dark:text-[#F8FAFC] dark:focus:border-[#8B5CF6]/50 ${
          error
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500"
            : "border-border-custom dark:border-[#262038]"
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-xs text-text-muted font-medium transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-accent"
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}

interface FloatingSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  options: string[];
}

export function FloatingSelect({
  id,
  label,
  value,
  onChange,
  error,
  required,
  options,
}: FloatingSelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`peer w-full appearance-none rounded-xl border bg-surface-raised px-4 pr-10 pb-2.5 pt-6 text-sm outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 focus:border-accent focus:shadow-sm dark:bg-[#08070D] dark:text-[#F8FAFC] dark:focus:border-[#8B5CF6]/50 ${
          error
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500"
            : "border-border-custom dark:border-[#262038]"
        } ${!value ? "text-text-muted" : "text-text-primary font-medium"}`}
      >
        <option value="" disabled className="bg-surface text-text-primary dark:bg-[#14141f] dark:text-white">
          Select a service
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface text-text-primary dark:bg-[#14141f] dark:text-white">
            {opt}
          </option>
        ))}
      </select>

      {/* Custom Chevron Arrow */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/3 flex items-center text-text-muted peer-focus:text-accent transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 z-10 origin-[0] text-xs transition-all duration-300 font-medium ${
          value
            ? "-translate-y-3 top-4 scale-75 text-accent"
            : "top-4 scale-100 text-text-muted peer-focus:-translate-y-3 peer-focus:top-4 peer-focus:scale-75 peer-focus:text-accent"
        }`}
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}
