import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

const orbs = [
  {
    name: "orb-0",
    className: "top-[-12%] left-[-8%] w-[min(520px,90vw)] h-[min(520px,90vw)] bg-violet-600/30",
  },
  {
    name: "orb-1",
    className: "top-[20%] right-[-10%] w-[min(480px,85vw)] h-[min(480px,85vw)] bg-cyan-500/20",
  },
  {
    name: "orb-2",
    className: "bottom-[-15%] left-[25%] w-[min(400px,80vw)] h-[min(400px,80vw)] bg-fuchsia-600/25",
  },
];

export default function AnimatedBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(".orb-0", {
        x: 22,
        y: -16,
        duration: 24,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".orb-1", {
        x: -18,
        y: 20,
        duration: 20,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.to(".orb-2", {
        x: 16,
        y: 24,
        duration: 22,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      {orbs.map((orb) => (
        <div key={orb.name} className={`absolute ${orb.className} rounded-full blur-[100px] will-change-transform ${orb.name}`} />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 blur-3xl will-change-transform"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
