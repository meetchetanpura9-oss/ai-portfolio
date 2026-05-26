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
    setOpen(false);
    scrollTo(href, { offset: -100, duration: 1.3 });
  };

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        setScrolled(currentY > 24);
        setShowNav(currentY < 96 || currentY < lastY);

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
  }, []);

  return (
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
          className="text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            CM
          </span>
          <span className="text-white/90">.</span>
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = activeSection === link.href.slice(1);
            return (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => handleNav(link.href)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    active
                      ? "text-white"
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
          className="hidden rounded-xl border border-violet-500/40 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.25)] transition-shadow hover:shadow-[0_0_32px_rgba(139,92,246,0.4)] md:inline-block"
        >
          Let&apos;s Connect
        </motion.button>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-gray-300 transition-colors hover:border-violet-400/40 hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a12]/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col p-4">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => handleNav(link.href)}
                    className="block w-full rounded-lg px-4 py-3 text-left text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <li className="mt-2 border-t border-white/10 pt-2">
                <button
                  type="button"
                  onClick={() => handleNav("#contact")}
                  className="block w-full rounded-xl bg-violet-600/30 px-4 py-3 text-center font-medium text-violet-200"
                >
                  Let&apos;s Connect
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
