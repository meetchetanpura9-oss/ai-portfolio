import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PROFILE, displayUrl } from "../../data/profile";

const LINKS = [
  { href: `mailto:${PROFILE.email}`, icon: Mail, label: "Email", text: PROFILE.email, external: false },
  { href: PROFILE.linkedin, icon: FaLinkedin, label: "LinkedIn", text: displayUrl(PROFILE.linkedin), external: true },
  { href: PROFILE.github, icon: FaGithub, label: "GitHub", text: displayUrl(PROFILE.github), external: true },
];

function Terminal() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0b1020] text-[#c9d4ee] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]/80" />
        <span className="ml-3 font-mono text-[0.68rem] text-[#7d89a4]">~/meet — contact</span>
      </div>
      <div className="space-y-1.5 px-4 py-4 font-mono text-[0.78rem] leading-relaxed sm:text-[0.82rem]">
        <p>
          <span className="text-[#22d3ee]">meet@studio</span>
          <span className="text-[#7d89a4]">:~$</span> contact --status
        </p>
        <p>
          <span className="text-[#34d399]">●</span> {PROFILE.available ? "available" : "limited availability"}
          <span className="text-[#7d89a4]"> — {PROFILE.availability.toLowerCase()}</span>
        </p>
        <p className="text-[#7d89a4]">› response: {PROFILE.responseTime.toLowerCase()}</p>
        <p className="text-[#7d89a4]">› timezone: {PROFILE.timezone}</p>
        <p>
          <span className="text-[#22d3ee]">meet@studio</span>
          <span className="text-[#7d89a4]">:~$</span>{" "}
          <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#5b8cff]" aria-hidden />
        </p>
      </div>
    </div>
  );
}

export default function ContactInfo() {
  return (
    <div className="space-y-4">
      <Terminal />

      <ul className="space-y-3">
        {LINKS.map(({ href, icon: Icon, label, text, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="card card-interactive group flex items-center gap-4 p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-lg text-brand-blue">
                <Icon aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{label}</span>
                <span className="block truncate font-mono text-xs text-muted">{text}</span>
              </span>
              <ArrowUpRight size={18} className="shrink-0 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-blue" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      <div className="card flex items-center gap-3 p-4">
        <MapPin size={18} className="shrink-0 text-brand-violet" aria-hidden />
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">{PROFILE.location}</span> · open to remote &amp; hybrid work
        </p>
      </div>
    </div>
  );
}
