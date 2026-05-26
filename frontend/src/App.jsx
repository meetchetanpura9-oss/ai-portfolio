import { motion } from "framer-motion";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import ScrollProgress from "./components/effects/ScrollProgress";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Playground from "./components/Playground";
import Skills from "./components/Skills";
import Services from "./components/Services";
import WhyWorkWithMe from "./components/WhyWorkWithMe";
import ContactSection from "./components/contact/ContactSection";
import SystemMetrics from "./components/effects/SystemMetrics";
import MouseGlow from "./components/effects/MouseGlow";

function App() {
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen bg-void text-white">
        <ScrollProgress />
        <MouseGlow />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-[2]"
        >
          <Hero />
          <About />
          <Services />
          <Projects />
          <Playground />
          <Skills />
          <WhyWorkWithMe />
          <ContactSection />

          {/* High-Tech Footer */}
          <footer className="relative border-t border-white/5 bg-void pb-12 pt-8">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-12">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <p className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} Meet Chetanpura. All rights reserved.
                </p>
                <SystemMetrics />
              </div>
            </div>
          </footer>
        </motion.div>
      </div>
    </SmoothScrollProvider>
  );
}

export default App;
