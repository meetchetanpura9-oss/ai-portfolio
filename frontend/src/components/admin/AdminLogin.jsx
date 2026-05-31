import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export default function AdminLogin({ onLoginSuccess }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const { access_token, user_name } = response.data;
      localStorage.setItem("adminToken", access_token);
      localStorage.setItem("adminName", user_name);
      
      toast(`Welcome back, ${user_name}!`, "success");
      onLoginSuccess();
    } catch (err) {
      console.error("Login failed:", err);
      const detail = err.response?.data?.detail || "Authentication failed. Check credentials.";
      setError(detail);
      toast(detail, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 font-sans text-white">
      {/* Background ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_12px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-[0_0_24px_rgba(139,92,246,0.35)]">
            <HiOutlineLockClosed className="text-2xl text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-white font-display">
            Meet Chetanpura
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Secure Administrator Authorization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-400"
            >
              {error}
            </motion.div>
          )}

          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Administrator Email"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-violet-500/50 focus:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-300"
            />
            <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500" />
          </div>

          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Secure Password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none focus:border-violet-500/50 focus:shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-all duration-300"
            />
            <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-500" />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.3)] transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Authenticating…
              </span>
            ) : (
              "Sign In to Console"
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="#"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = ""; // Switch back to portfolio
            }}
          >
            &larr; Back to Portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
