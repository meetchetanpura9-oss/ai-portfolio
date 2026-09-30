"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ToastProvider } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HorizontalWorkSection from "../components/projects/HorizontalWorkSection";
import Services from "../components/Services";
import ProcessSection from "../components/ProcessSection";
import About from "../components/About";
import ContactSection from "../components/contact/ContactSection";
import Footer from "../components/footer/Footer";
import IntroScreen from "../components/IntroScreen";
import TechTicker from "../components/TechTicker";
import ProblemSection from "../components/ProblemSection";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const completeIntro = useCallback(() => setShowIntro(false), []);
  return (
    <ToastProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-transparent text-[var(--color-ink)]">
        <AnimatePresence>{showIntro && <IntroScreen onComplete={completeIntro} />}</AnimatePresence>
        <a className="skip-link" href="#main-content">Skip to content</a>

        {/* Fixed Editorial Navigation */}
        <Navbar />

        {/* Homepage Section Flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
          role="main"
          id="main-content"
        >
          <Hero />
          <TechTicker />
          <ProblemSection />
          <HorizontalWorkSection />
          <Services />
          <ProcessSection />
          <About />
          <ContactSection />
          <Footer />
        </motion.div>

      </div>
    </ToastProvider>
  );
}
