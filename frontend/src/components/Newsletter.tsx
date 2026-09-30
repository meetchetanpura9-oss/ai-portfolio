"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { HiOutlineMail, HiOutlineCheckCircle } from "react-icons/hi";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch (err) {
      console.error("Newsletter error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl sm:p-6 flex flex-col justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        {!subscribed ? (
          <motion.div
            key="subscribe-form"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
                <HiOutlineMail className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary text-sm sm:text-base font-display">
                  Weekly Insights
                </h3>
                <p className="text-xs text-text-muted">
                  Case studies, prompt guides & tech stacks
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/[0.02] py-2.5 pl-4 pr-4 text-xs text-text-primary outline-none focus:border-accent-cyan/50 transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-accent to-accent-cyan px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_var(--shadow-glow-volt)] hover:shadow-[0_0_30px_var(--shadow-glow-volt)] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Subscribe"
                )}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center space-y-3 py-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <HiOutlineCheckCircle className="text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-text-primary text-sm font-display">Subscribed!</h4>
              <p className="mt-1 text-xs text-text-muted">Thanks for joining the circle.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
