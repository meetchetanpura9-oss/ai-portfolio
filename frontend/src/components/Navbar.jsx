import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useSmoothScroll } from "../context/SmoothScrollContext";

const links = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { scrollTo } = useSmoothScroll();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [activeSection, setActiveSection] = useState("hero");

  const handleNav = (href) => {
    // 1. Initiate smooth scrolling first
    scrollTo(href, { offset: -80, duration: 1.3 });
    
    // 2. Delay menu closing to prevent mobile browsers (like iOS Safari) 
    // from canceling the scroll when the clicked element is unmounted.
    setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 24);
        
        // Show navbar when scrolling up or near top. Hide when scrolling down.
        // If the mobile menu is open, always show the header.
        if (open) {
          setShowNav(true);
        } else {
          setShowNav(currentY < 96 || currentY < lastY);
        }

        const sections = ["hero", "about", "services", "projects", "playground", "skills", "why-work-with-me", "contact"];
        const offset = currentY + window.innerHeight * 0.35;
        let currentSection = "hero";

        sections.forEach((id) => {
          const element = document.getElementById(id);
          if (element && element.offsetTop <= offset) {
            currentSection = id;
          }
        });

        setActiveSection(currentSection);
        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-12 transition-transform duration-300 ease-out ${
          showNav ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all duration-500 sm:px-6 ${
            scrolled
              ? "bg-white/10 border-white/10"
              : "bg-white/5 border-white/5"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleNav("#hero");
            }}
            className="text-lg font-bold tracking-tight cursor-pointer"
          >
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              CM
            </span>
            <span className="text-white/90">.</span>
          </button>

          {/* Desktop Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = activeSection === link.href.slice(1);
              return (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => handleNav(link.href)}
                    className={`rounded-lg px-4 py-2 text-sm transition-colors cursor-pointer ${
                      active
                        ? "text-white bg-white/5"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNav("#contact")}
            className="hidden rounded-xl border border-violet-500/40 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-shadow hover:shadow-[0_0_32px_rgba(139,92,246,0.4)] md:inline-block cursor-pointer"
          >
            Let&apos;s Connect
          </motion.button>

          {/* Mobile menu hamburger toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:border-violet-400/40 hover:bg-white/10 md:hidden cursor-pointer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
          </button>
        </nav>
      </motion.header>

      {/* Premium Full-Screen Mobile Navigation Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0.05, duration: 0.55 }}
            className="fixed inset-0 z-40 flex flex-col bg-[#050816]/98 backdrop-blur-2xl md:hidden"
          >
            {/* Header spacer in full-screen overlay */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#050816]/50">
              <span className="text-lg font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                CM.
              </span>
              <button
                type="button"
                aria-label="Close menu"
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <HiX size={22} />
              </button>
            </div>

            {/* Vertically Staggered Navigation Items */}
            <div className="flex-1 flex flex-col justify-center px-8 space-y-12">
              <ul className="space-y-6">
                {links.map((link, i) => {
                  const active = activeSection === link.href.slice(1);
                  return (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, ease: "easeOut" }}
                    >
                      <button
                        type="button"
                        onClick={() => handleNav(link.href)}
                        className={`block w-full py-2 text-left text-3xl font-bold font-display transition-colors cursor-pointer ${
                          active
                            ? "bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <span className="text-violet-500 font-mono text-sm mr-4">0{i + 1}.</span>
                        {link.label}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Extra details & call to action in overlay */}
              <div className="border-t border-white/5 pt-8 space-y-5">
                <button
                  type="button"
                  onClick={() => handleNav("#contact")}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-center font-semibold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] cursor-pointer"
                >
                  Let&apos;s Connect
                </button>
                <div className="text-center text-xs text-gray-500 font-mono">
                  meetchetanpura9@gmail.com
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
