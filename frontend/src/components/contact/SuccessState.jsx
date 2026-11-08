import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessState({ onReset, email }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-14 text-center"
      role="status"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-emerald/12 text-brand-emerald"
      >
        <CheckCircle2 size={32} aria-hidden />
      </motion.div>
      <h3 className="text-2xl font-semibold text-ink">Message sent</h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        Thank you for reaching out. A confirmation email has been sent to{" "}
        <span className="font-medium text-ink">{email ?? "your address"}</span>, and I&apos;ll get back to you soon.
      </p>
      <button type="button" onClick={onReset} className="btn btn-ghost mt-8 text-sm">
        Send another message
      </button>
    </motion.div>
  );
}
