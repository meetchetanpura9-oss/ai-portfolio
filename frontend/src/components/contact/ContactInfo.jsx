import { motion } from "framer-motion";
import {
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlineClock,
} from "react-icons/hi";
import { FaGithub, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { CONTACT_LINKS } from "./constants";

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45 },
  }),
};

function createEmailUrl(email) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: "Portfolio inquiry",
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

const socialLinks = [
  {
    href: createEmailUrl(CONTACT_LINKS.email),
    icon: HiOutlineMail,
    label: "Email",
    text: CONTACT_LINKS.email,
  },
  {
    href: CONTACT_LINKS.whatsapp,
    icon: FaWhatsapp,
    label: "WhatsApp",
    text: "+91 99984 71715",
  },
  {
    href: CONTACT_LINKS.linkedin,
    icon: FaLinkedin,
    label: "LinkedIn",
    text: "@chetanpurameet",
  },
  {
    href: CONTACT_LINKS.github,
    icon: FaGithub,
    label: "GitHub",
    text: "@meetchetanpura9-oss",
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-4">
      <motion.div
        custom={0}
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-[box-shadow,border-color] duration-300 hover:border-violet-500/25 hover:shadow-[0_0_32px_rgba(139,92,246,0.12)]"
      >
        <div className="flex items-center gap-3">
          <span
            className={`relative flex h-3 w-3 ${CONTACT_LINKS.available ? "" : "opacity-50"}`}
          >
            {CONTACT_LINKS.available && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                CONTACT_LINKS.available ? "bg-emerald-400" : "bg-gray-500"
              }`}
            />
          </span>
          <div>
            <p className="text-sm font-medium text-white">
              {CONTACT_LINKS.available ? "Available for work" : "Limited availability"}
            </p>
            <p className="text-xs text-gray-500">Typically replies within 24-48h</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        custom={1}
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-3 sm:grid-cols-2"
      >
        {socialLinks.map(({ href, icon: Icon, label, text }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            aria-label={label}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-[box-shadow,border-color,color,background-color] duration-300 hover:border-violet-500/40 hover:bg-violet-500/5 hover:shadow-[0_0_32px_rgba(139,92,246,0.18)]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-900/30 text-xl text-violet-300 transition-colors duration-300 group-hover:bg-violet-500/15 group-hover:text-violet-200">
                <Icon />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 max-w-[12rem] text-xs leading-5 text-gray-400 break-words">
                  {text}
                </p>
              </div>
            </div>
          </motion.a>
        ))}
      </motion.div>

      <motion.div
        custom={2}
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
      >
        <div className="flex gap-3">
          <HiOutlineLocationMarker className="mt-0.5 shrink-0 text-xl text-violet-400" />
          <div>
            <p className="text-sm font-medium text-white">Location</p>
            <p className="mt-1 text-sm text-gray-500">{CONTACT_LINKS.location}</p>
            <p className="mt-2 text-xs text-gray-600">Open to remote & hybrid roles</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        custom={3}
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
      >
        <div className="flex gap-3">
          <HiOutlineClock className="mt-0.5 shrink-0 text-xl text-cyan-400" />
          <div>
            <p className="text-sm font-medium text-white">Timezone</p>
            <p className="mt-1 text-sm text-gray-500">IST (UTC+5:30)</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
