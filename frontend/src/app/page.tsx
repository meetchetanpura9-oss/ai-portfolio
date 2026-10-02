import { ToastProvider } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Manifesto from "../components/Manifesto";
import HorizontalWorkSection from "../components/projects/HorizontalWorkSection";
import Services from "../components/Services";
import MLPipeline from "../components/MLPipeline";
import ProcessSection from "../components/ProcessSection";
import About from "../components/About";
import ContactSection from "../components/contact/ContactSection";
import Footer from "../components/footer/Footer";
import styles from "./HomeEditorial.module.css";

export default function Home() {
  return (
    <ToastProvider>
      <div className={styles.page}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content" className="relative z-10 min-h-screen text-[var(--color-ink)]">
          <Hero />
          <Manifesto />
          <HorizontalWorkSection />
          <Services />
          <MLPipeline />
          <ProcessSection />
          <About />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
