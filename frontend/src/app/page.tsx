import { ToastProvider } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HorizontalWorkSection from "../components/projects/HorizontalWorkSection";
import Services from "../components/Services";
import ProcessSection from "../components/ProcessSection";
import About from "../components/About";
import ContactSection from "../components/contact/ContactSection";
import Footer from "../components/footer/Footer";

export default function Home() {
  return (
    <ToastProvider>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar />
      <main id="main-content" className="relative z-10 min-h-screen text-[var(--color-ink)]">
        <Hero />
        <HorizontalWorkSection />
        <Services />
        <ProcessSection />
        <About />
        <ContactSection />
      </main>
      <Footer />
    </ToastProvider>
  );
}
