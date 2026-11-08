import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import ScrollProgress from "./components/effects/ScrollProgress";
import IntroLoader from "./components/IntroLoader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import AgenticAI from "./components/AgenticAI";
import Projects from "./components/Projects";
import Certifications from "./components/Certifications";
import ContactSection from "./components/contact/ContactSection";
import Footer from "./components/Footer";

// Admin screens are code-split so public visitors never download them.
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));

const AdminFallback = (
  <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
  </div>
);
import { api, wakeApi } from "./lib/api";

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [introDone, setIntroDone] = useState(false);
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);

    // Intercept pushState calls so react state updates instantly
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  useEffect(() => {
    // Wake the API (Render free plan sleeps) so forms respond quickly later.
    wakeApi();

    // Only track visitors on the public portfolio
    if (route === "/login" || route === "/admin") return;

    const trackVisitor = async () => {
      // Basic session-level throttle to avoid double-pings on the same session load
      if (sessionStorage.getItem("visitor_tracked")) return;

      try {
        const width = window.innerWidth;
        const device = width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";
        
        const ua = navigator.userAgent;
        let browser = "Other";
        if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) {
          browser = "Chrome";
        } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
          browser = "Safari";
        } else if (ua.includes("Firefox")) {
          browser = "Firefox";
        } else if (ua.includes("Edg")) {
          browser = "Edge";
        }

        await api.post("/analytics/track", {
          visited_page: "Home",
          device,
          browser,
        });

        sessionStorage.setItem("visitor_tracked", "true");
      } catch (err) {
        console.warn("Analytics tracking failed (not critical):", err);
      }
    };

    trackVisitor();
  }, [route]);

  // Routing Logic
  if (route === "/login") {
    return (
      <Suspense fallback={AdminFallback}>
        <AdminLogin onLoginSuccess={() => window.history.pushState(null, "", "/admin")} />
      </Suspense>
    );
  }

  if (route === "/admin") {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      // Redirect to login
      setTimeout(() => {
        window.history.pushState(null, "", "/login");
      }, 0);
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500" />
        </div>
      );
    }
    return (
      <Suspense fallback={AdminFallback}>
        <AdminDashboard />
      </Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AnimatePresence>{!introDone && <IntroLoader key="intro" onDone={handleIntroDone} />}</AnimatePresence>
        <ScrollProgress />
        <Navbar />
        <main id="main" className="relative">
          <Hero ready={introDone} />
          <About />
          <Skills />
          <AgenticAI />
          <Projects />
          <Certifications />
          <ContactSection />
        </main>
        <Footer />
      </SmoothScrollProvider>
    </MotionConfig>
  );
}

export default App;
