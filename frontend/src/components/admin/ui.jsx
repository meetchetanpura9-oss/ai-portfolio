/**
 * Small UI kit for the admin panels — same dark glass look as the existing dashboard.
 */
import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { STATUS_TONES } from "./helpers";

const TONES = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  gray: "border-white/15 bg-white/5 text-gray-300",
};

export function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex w-max items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONES[tone] || TONES.gray}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] || "gray"}>{status || "unknown"}</Badge>;
}

export function Panel({ title, description, actions, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.015] backdrop-blur-xl ${className}`}>
      {(title || actions) && (
        <header className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="font-display text-sm font-bold text-white">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function KpiCard({ label, value, hint, icon: Icon, accent = "text-violet-400", loading }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-5 backdrop-blur-xl transition-colors hover:border-white/20">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        {Icon && <Icon size={17} className={accent} aria-hidden />}
      </div>
      {loading ? (
        <div className="mt-3 h-7 w-16 animate-pulse rounded-md bg-white/10" />
      ) : (
        <p className="mt-2 text-2xl font-black tabular-nums text-white">{value}</p>
      )}
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

const BUTTONS = {
  primary: "border-violet-500/40 bg-violet-600/80 text-white hover:bg-violet-600",
  secondary: "border-white/10 bg-white/5 text-gray-200 hover:border-white/25 hover:text-white",
  danger: "border-rose-500/40 bg-rose-600/20 text-rose-200 hover:bg-rose-600/35",
  ghost: "border-transparent text-gray-400 hover:bg-white/5 hover:text-white",
};

export function Button({ variant = "secondary", icon: Icon, loading, children, className = "", ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTONS[variant]} ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : Icon ? <Icon size={14} aria-hidden /> : null}
      {children}
    </button>
  );
}

const FIELD = "w-full rounded-xl border border-white/10 bg-[#070b17] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-violet-500/50";

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[11px] text-rose-300">{error}</span> : hint ? <span className="mt-1 block text-[11px] text-gray-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props) {
  return <input {...props} className={`${FIELD} ${props.className || ""}`} />;
}

export function TextArea({ mono, ...props }) {
  return <textarea {...props} className={`${FIELD} resize-y leading-relaxed ${mono ? "font-mono text-[13px]" : ""} ${props.className || ""}`} />;
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${FIELD} ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function SkeletonRows({ rows = 5, columns = 4 }) {
  return (
    <div className="divide-y divide-white/5" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: columns }).map((__, c) => (
            <div key={c} className="h-3 flex-1 animate-pulse rounded bg-white/10" style={{ maxWidth: c === 0 ? "38%" : "18%" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-400">
          <Icon size={20} aria-hidden />
        </span>
      )}
      <p className="text-sm font-semibold text-white">{title}</p>
      {children && <p className="max-w-md text-xs leading-relaxed text-gray-500">{children}</p>}
      {action}
    </div>
  );
}

export function Notice({ tone = "amber", children }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed ${TONES[tone]}`}>
      <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-3 text-xs text-gray-500">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Prev
        </Button>
        <span className="tabular-nums">
          {page} / {pages}
        </span>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next <ChevronRight size={14} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/** Dark modal used for editors, previews and confirmations. Escape and backdrop close it. */
export function Dialog({ open, onClose, title, children, footer, size = "md" }) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative flex max-h-[94vh] w-full ${widths[size]} flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0a0f1f] text-white shadow-2xl sm:rounded-2xl`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <h3 id={titleId} className="truncate font-display text-base font-bold">
                {title}
              </h3>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
                <X size={17} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-3.5">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = "Confirm", danger, loading }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-gray-300">{children}</div>
    </Dialog>
  );
}

/** Renders server-built email HTML in a sandboxed frame: no scripts, no access to the admin session. */
export function EmailPreview({ html, className = "" }) {
  return (
    <iframe
      title="Email preview"
      sandbox=""
      srcDoc={html || ""}
      className={`w-full rounded-xl border border-white/10 bg-white ${className}`}
    />
  );
}
