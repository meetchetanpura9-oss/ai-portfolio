import { ArrowUp, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { NAV_LINKS, PROFILE } from "../data/profile";
import { useScrollTo } from "../hooks/useSmoothScroll";
import Newsletter from "./Newsletter";

export default function Footer() {
  const scrollTo = useScrollTo();
  const go = (id) => (e) => {
    e.preventDefault();
    scrollTo(`#${id}`, { offset: id === "home" ? 0 : -72 });
  };

  return (
    <footer className="relative border-t border-line bg-bg pb-10 pt-16">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <p className="font-display text-xl font-semibold text-ink">{PROFILE.name}</p>
            <p className="mt-1 text-sm text-muted">{PROFILE.role}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Building intelligent applications, AI-powered systems and autonomous agent workflows.
            </p>
            <div className="mt-5 flex gap-2">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="GitHub">
                <FaGithub aria-hidden />
              </a>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="LinkedIn">
                <FaLinkedin aria-hidden />
              </a>
              <a href={`mailto:${PROFILE.email}`} className="icon-btn" aria-label="Email">
                <Mail size={17} aria-hidden />
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow">(navigate)</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 md:grid-cols-1">
              {NAV_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} onClick={go(id)} className="text-sm text-muted transition-colors hover:text-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:justify-self-end">
            <Newsletter />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-subtle">
            © {new Date().getFullYear()} {PROFILE.name}. Designed &amp; built by Meet.
          </p>
          <a href="#home" onClick={go("home")} className="inline-flex items-center gap-1.5 font-mono text-xs text-subtle transition-colors hover:text-brand-blue">
            back to top <ArrowUp size={13} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
