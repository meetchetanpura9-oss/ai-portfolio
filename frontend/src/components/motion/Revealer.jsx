import { motion } from "framer-motion";
import { RevealContainer } from "../../lib/motionVariants";

export default function Revealer({ className = "", children, ...props }) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={RevealContainer}
      {...props}
    >
      {children}
    </motion.section>
  );
}
