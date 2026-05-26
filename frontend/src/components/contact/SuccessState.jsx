import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";

export default function SuccessState({ onReset, email }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_48px_rgba(52,211,153,0.25)]"
      >
        <HiCheckCircle className="text-4xl text-emerald-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-2xl font-bold text-white"
      >
        Message sent successfully
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-3 max-w-sm text-sm text-gray-400"
      >
        Thank you for reaching out. A confirmation email has been sent to{' '}
        <span className="font-medium text-white">
          {email ?? "your address"}
        </span>
        , and I&apos;ll respond as soon as possible.
      </motion.p>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="mt-8 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-violet-500/30 hover:text-white"
      >
        Send another message
      </motion.button>
    </motion.div>
  );
}
