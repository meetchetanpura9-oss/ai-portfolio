import { Variants } from "framer-motion";

/**
 * Editorial Motion Architecture & Utility Configs
 * High-end smooth easing, staggered line reveals, clip-path reveals.
 */

export const EASE_EDITORIAL = [0.16, 1, 0.3, 1] as const; // Smooth ease-out

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_EDITORIAL },
  },
};

export const lineRevealContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const lineRevealItem: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: "0%",
    transition: { duration: 0.85, ease: EASE_EDITORIAL },
  },
};

export const imageClipReveal: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    scale: 1,
    transition: { duration: 1.1, ease: EASE_EDITORIAL },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export const cardHoverVariant: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3, ease: EASE_EDITORIAL },
  },
};
