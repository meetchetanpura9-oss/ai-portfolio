import { motion } from "framer-motion";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";
import Revealer from "../motion/Revealer";

const headerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ContactSection() {
  return (
    <Revealer
      id="contact"
      className="relative overflow-hidden border-t border-white/5 bg-surface py-20 sm:py-28"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[500px] w-[min(900px,100%)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.18),transparent_65%)]" />
        <motion.div
          className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-violet-600/15 blur-[100px]"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-[80px]"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <motion.header
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mb-12 text-center sm:mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-xs uppercase tracking-[0.2em] text-violet-400 sm:text-sm"
          >
            Let&apos;s Connect
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Let&apos;s create{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              intelligent systems
            </span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg"
          >
            Interested in collaborating, building AI solutions, or discussing innovative
            projects? Let&apos;s create intelligent systems that automate processes, unlock
            insights, and drive business growth.
          </motion.p>
        </motion.header>

        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-2"
          >
            <ContactInfo />
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_8px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="relative z-10">
                <h3 className="mb-6 text-lg font-semibold text-white">Send a message</h3>
                <ContactForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Revealer>
  );
}
