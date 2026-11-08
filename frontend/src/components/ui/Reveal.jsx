import { motion } from "framer-motion";
import { easePremium as EASE } from "../../lib/motionVariants";

/** Fade-and-rise on first scroll into view. Respects reduced motion via MotionConfig. */
export default function Reveal({ as = "div", delay = 0, y = 22, className = "", children, ...rest }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}
