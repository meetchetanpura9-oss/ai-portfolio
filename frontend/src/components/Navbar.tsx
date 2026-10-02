"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const links = [["Home", "/"], ["Work", "/work"], ["Capabilities", "/#services"], ["About", "/about"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 24); onScroll(); addEventListener("scroll", onScroll, { passive: true }); return () => removeEventListener("scroll", onScroll); }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);
  const close = () => setOpen(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className={`mx-auto flex max-w-[84rem] items-center justify-between rounded-full border px-4 py-3 transition-all duration-300 sm:px-5 ${scrolled ? "nav-scrolled" : "border-transparent bg-transparent"}`}>
          <Link href="/" className="flex items-center gap-3" aria-label="Meet Chetanpura, home">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-panel)] font-mono text-xs font-bold text-[var(--color-signal)]">MC</span>
            <span><b className="block text-sm leading-none">Meet Chetanpura</b><small className="type-caption mt-1 block text-[var(--color-dim)]">AI / SOFTWARE ENGINEERING</small></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            {links.map(([label, href]) => <Link className="type-navigation text-[var(--color-muted)] transition-colors hover:text-[var(--color-signal)]" href={href} key={href}>{label}</Link>)}
          </nav>
          <div className="mobile-hide items-center gap-2 md:flex"><ThemeToggle/><Link href="/#contact" className="btn-primary !min-h-10 !px-4 !py-2">Get in touch <ArrowUpRight size={15} /></Link></div>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--color-line)] md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </motion.div>
      </header>
      <AnimatePresence>
        {open && <motion.div id="mobile-navigation" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mobile-nav-panel fixed inset-0 z-40 flex flex-col px-6 pb-8 pt-28 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col border-t border-[var(--color-line)]" aria-label="Mobile navigation">
            {links.map(([label, href], i) => <Link onClick={close} className="flex items-center justify-between border-b border-[var(--color-line)] py-6 type-h3" href={href} key={href}><span>{label}</span><span className="type-caption text-[var(--color-signal)]">0{i + 1}</span></Link>)}
          </nav>
          <div className="mt-auto flex items-center gap-3"><ThemeToggle/><Link onClick={close} href="/#contact" className="btn-primary flex-1">Get in touch <ArrowUpRight size={17} /></Link></div>
        </motion.div>}
      </AnimatePresence>
    </>
  );
}
