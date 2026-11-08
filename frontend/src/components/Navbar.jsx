import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useScrollTo } from "../hooks/useSmoothScroll";
import { NAV_LINKS, PROFILE } from "../data/profile";
import ThemeToggle from "./ui/ThemeToggle";

const NAV_OFFSET = -72;

function Logo({ onClick }) {
  return (
    <a
      href="#home"
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-lg"
      aria-label={`${PROFILE.name} — back to top`}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563eb] via-[#4f46e5] to-[#7c3aed] font-display text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgb(79_70_229/0.7)]">
        {PROFILE.initials}
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand-cyan" />
      </span>
      <span className="hidden font-display text-[0.95rem] font-semibold text-ink sm:inline">{PROFILE.name}</span>
    </a>
  );
}

export default function Navbar() {
  const scrollTo = useScrollTo();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);

  const go = (id) => (e) => {
    e?.preventDefault();
    setOpen(false);
    // let the drawer release the scroll lock before scrolling
    window.setTimeout(() => {
      scrollTo(`#${id}`, { offset: id === "home" ? 0 : NAV_OFFSET });
      history.replaceState(null, "", id === "home" ? window.location.pathname : `#${id}`);
    }, 20);
  };

  // Elevated style once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Drawer: scroll lock, Escape, focus management.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => drawerRef.current?.querySelector("a,button")?.focus(), 60);
    const toggleEl = toggleRef.current;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggleEl?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <nav
          aria-label="Primary"
          className={`mx-auto flex max-w-[76rem] items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
            scrolled
              ? "border-line bg-surface/80 shadow-[var(--shadow-nav)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <Logo onClick={go("home")} />

          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={go(id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative isolate block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-lg bg-surface-2"
                        transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                      />
                    )}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="#contact" onClick={go("contact")} className="btn btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex">
              Let&apos;s talk <ArrowUpRight size={16} aria-hidden />
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="icon-btn lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-[#050913]/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              id="mobile-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.42 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(340px,86vw)] flex-col border-l border-line bg-surface px-6 pb-8 pt-5 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">(menu)</span>
                <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={18} aria-hidden />
                </button>
              </div>

              <ul className="mt-8 space-y-1">
                {NAV_LINKS.map(({ id, label }, i) => {
                  const isActive = active === id;
                  return (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <a
                        href={`#${id}`}
                        onClick={go(id)}
                        aria-current={isActive ? "true" : undefined}
                        className={`flex items-baseline gap-4 rounded-xl px-3 py-3 font-display text-xl font-semibold transition-colors ${
                          isActive ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        <span className="font-mono text-xs font-normal text-brand-blue">0{i}</span>
                        {label}
                      </a>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-auto space-y-4 border-t border-line pt-6">
                <a href="#contact" onClick={go("contact")} className="btn btn-primary w-full">
                  Let&apos;s talk <ArrowUpRight size={16} aria-hidden />
                </a>
                <div className="flex items-center justify-center gap-2">
                  <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub">
                    <FaGithub aria-hidden />
                  </a>
                  <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn">
                    <FaLinkedin aria-hidden />
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
