"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { siteContent } from "../data/siteContent";

export default function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const started = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const next = Math.min(100, ((now - started) / 2500) * 100);
      setProgress(next);
      if (next < 100) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const complete = window.setTimeout(onComplete, 2900);
    return () => { cancelAnimationFrame(frame); clearTimeout(complete); document.body.style.overflow = ""; };
  }, [onComplete]);

  return <motion.div className="entry-screen" initial={{ opacity: 1 }} exit={{ opacity: 0, y: "-5%" }} transition={{ duration: .65, ease: [0.16,1,0.3,1] }}>
    <div className="entry-grid" aria-hidden />
    <div className="entry-content">
      <div className="entry-top type-label"><span>{siteContent.brand.entryEyebrow}</span><span>{String(Math.round(progress)).padStart(3, "0")}%</span></div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }}>
        <p className="type-label text-[var(--color-signal)]">A question before we begin</p>
        <h1 className="type-display-md mt-6 max-w-[14ch]">{siteContent.brand.entryQuestion}</h1>
        <p className="type-body-lg mt-7 max-w-2xl text-[var(--color-muted)]">{siteContent.brand.entryCopy}</p>
      </motion.div>
      <div className="entry-bottom"><div className="entry-progress"><span style={{ width: `${progress}%` }} /></div><button onClick={onComplete} className="entry-button type-button">Enter the system <ArrowRight size={17}/></button></div>
    </div>
  </motion.div>;
}
