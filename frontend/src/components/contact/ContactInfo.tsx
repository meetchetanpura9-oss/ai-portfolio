"use client";

import { HiOutlineMail, HiOutlineLocationMarker } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { CONTACT_LINKS } from "./constants";

const socialLinks = [
  {
    href: `mailto:${CONTACT_LINKS.email}`,
    icon: HiOutlineMail,
    label: "Email",
    text: CONTACT_LINKS.email,
  },
  {
    href: CONTACT_LINKS.linkedin,
    icon: FaLinkedin,
    label: "LinkedIn",
    text: "LinkedIn Profile",
  },
  {
    href: CONTACT_LINKS.github,
    icon: FaGithub,
    label: "GitHub",
    text: "GitHub Profile",
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-4">

      {/* Availability Status */}
      <div className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm dark:border-[#262038] dark:bg-[#181426]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981]" />
          </span>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Available for Opportunities
            </p>
            <p className="text-xs text-text-muted font-medium">AI Engineering, Data Science & Automation</p>
          </div>
        </div>
      </div>

      {/* Direct Communication Channels */}
      <div className="space-y-2.5">
        {socialLinks.map(({ href, icon: Icon, label, text }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-border-custom bg-surface p-4 hover:border-accent transition-all cursor-pointer shadow-sm dark:border-[#262038] dark:bg-[#181426]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-custom bg-surface-raised text-accent dark:border-[#262038] dark:bg-[#08070D]">
                <Icon className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">{label}</p>
                <p className="text-xs text-text-muted font-mono font-medium">{text}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-accent font-bold">
              CONNECT →
            </span>
          </a>
        ))}
      </div>

      {/* Location */}
      <div className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm dark:border-[#262038] dark:bg-[#181426]">
        <div className="flex gap-3">
          <HiOutlineLocationMarker className="mt-0.5 text-lg text-accent dark:text-[#00F0FF]" />
          <div>
            <p className="text-xs font-bold text-text-primary">Location & Timezone</p>
            <p className="text-xs text-text-muted font-medium mt-0.5">{CONTACT_LINKS.location} • IST (UTC+5:30)</p>
          </div>
        </div>
      </div>

    </div>
  );
}
