import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineMail, HiOutlineCheckCircle } from "react-icons/hi";
import { api } from "../lib/api";
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
      const response = await api.post("/newsletter/subscribe", {
        email: cleanEmail,
      });
      const msg = response.data.message || "Thank you for subscribing!";
      setMessage(msg);
      setSuccess(true);
      toast(msg, "success");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription failed", err);
      const detail = err.response?.data?.detail || "Subscription failed. Please check your email.";
      toast(detail, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-[0_8px_48px_rgba(0,0,0,0.35)]">
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                <HiOutlineMail className="text-xl" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white font-display uppercase">
                  Subscribe to Newsletter
                </h3>
                <p className="text-xs text-gray-500">
                  Stay updated on my latest AI research and project drops.
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
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-4 pr-4 text-xs text-white outline-none focus:border-violet-500/50 transition-all"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
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
              <h4 className="text-sm font-semibold text-white">Subscribed!</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                {message}
              </p>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="text-[10px] text-gray-500 hover:text-gray-300 underline mt-1"
            >
              Subscribe another email
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
