import { useEffect, useState } from "react";
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
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import Newsletter from "./components/Newsletter";
import { api } from "./lib/api";

function App() {
  const [route, setRoute] = useState(window.location.pathname);

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
    return <AdminLogin onLoginSuccess={() => window.history.pushState(null, "", "/admin")} />;
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
    return <AdminDashboard />;
  }

  return (
    <SmoothScrollProvider>
      <div className="relative bg-void text-white">
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
          <footer className="relative border-t border-white/5 bg-void pb-12 pt-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
              {/* Footer columns: description & newsletter */}
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-20 pb-12 items-start text-left">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                    Meet Chetanpura
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                    AI Research Engineer & Full-Stack Developer building high-performance 
                    distributed systems, autonomous agents, and enterprise-grade SaaS models.
                  </p>
                </div>
                <div className="flex md:justify-end">
                  <Newsletter />
                </div>
              </div>

              {/* Bottom Copyright & Metrics */}
              <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 md:flex-row">
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
