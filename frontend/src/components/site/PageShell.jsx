import { navigate } from "./navigation";
import { PROFILE } from "../../data/profile";
import ThemeToggle from "../ui/ThemeToggle";

/** Internal link that keeps the single-page app loaded; modifier clicks still open new tabs. */
export function Link({ href, children, ...props }) {
  const onClick = (e) => {
    // Anchors on the home page (/#contact) need a real load so the browser scrolls to them.
    if (href.includes("#") || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

/** Minimal header/footer for pages outside the one-page portfolio. */
export default function PageShell({ children, narrow = false }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link href="/" className="font-display text-base font-semibold text-ink hover:text-brand-blue">
            {PROFILE.name}
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/case-studies" className="rounded-lg px-3 py-2 text-muted hover:text-ink">
              Case studies
            </Link>
            <Link href="/#contact" className="hidden rounded-lg px-3 py-2 text-muted hover:text-ink sm:inline">
              Contact
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main id="main" className={`container-x flex-1 py-10 sm:py-14 ${narrow ? "max-w-2xl" : ""}`}>
        {children}
      </main>
      <footer className="border-t border-line py-8">
        <div className="container-x flex flex-col gap-2 text-xs text-subtle sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {PROFILE.name}
          </span>
          <Link href="/" className="hover:text-ink">
            Back to portfolio
          </Link>
        </div>
      </footer>
    </div>
  );
}
