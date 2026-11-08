import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { apiErrorMessage, postWithRetry } from "../lib/api";
import { useToast } from "../hooks/useToast";

export default function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      toast("Please enter your email address.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await postWithRetry("/newsletter/subscribe", { email: cleanEmail });
      const msg = response.data.message || "Thank you for subscribing!";
      setMessage(msg);
      setSuccess(true);
      toast(msg, "success");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription failed", err);
      toast(apiErrorMessage(err, "Subscription failed. Please check your email."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md p-5 sm:p-6">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Mail size={18} aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">Newsletter</h3>
                <p className="text-xs text-muted">Occasional updates on new AI projects and experiments.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-blue"
              />
              <button type="submit" disabled={loading} className="btn btn-primary !px-4 !py-2.5 text-sm disabled:opacity-70">
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-label="Subscribing" /> : "Subscribe"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 py-2 text-center" role="status">
            <CheckCircle2 size={28} className="text-brand-emerald" aria-hidden />
            <h4 className="text-sm font-semibold text-ink">Subscribed!</h4>
            <p className="max-w-[280px] text-xs text-muted">{message}</p>
            <button type="button" onClick={() => setSuccess(false)} className="mt-1 text-xs text-subtle underline hover:text-ink">
              Subscribe another email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
