import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiErrorMessage, postWithRetry } from "../../lib/api";
import PageShell, { Link } from "../site/PageShell";
import { usePageMeta } from "../site/navigation";

/** Landing page for the double opt-in link: /newsletter/confirm?token=… */
export default function NewsletterConfirm() {
  usePageMeta("Confirm your subscription", "Confirm your newsletter subscription.");
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [state, setState] = useState(token ? { status: "loading" } : { status: "error", message: "This confirmation link is incomplete. Please use the full link from the email." });
  const started = useRef(false);

  useEffect(() => {
    // Strict Mode mounts twice in development; confirm only once.
    if (!token || started.current) return;
    started.current = true;
    postWithRetry("/newsletter/confirm", { token })
      .then(({ data }) => setState({ status: "ok", message: data.message }))
      .catch((err) => setState({ status: "error", message: apiErrorMessage(err, "We could not confirm your subscription. Please try again.") }));
  }, [token]);

  return (
    <PageShell narrow>
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center" role="status" aria-live="polite">
        {state.status === "loading" ? (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-brand-blue" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Confirming your subscription…</h1>
            <p className="mt-2 text-sm text-muted">This can take a few seconds if the server is waking up.</p>
          </>
        ) : state.status === "ok" ? (
          <>
            <CheckCircle2 size={36} className="mx-auto text-brand-emerald" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">You're subscribed</h1>
            <p className="mt-2 text-sm text-muted">{state.message}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/case-studies" className="btn btn-primary text-sm">
                Read the case studies
              </Link>
              <Link href="/" className="btn btn-ghost text-sm">
                Back to portfolio
              </Link>
            </div>
          </>
        ) : (
          <>
            <XCircle size={36} className="mx-auto text-brand-rose" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Link not valid</h1>
            <p className="mt-2 text-sm text-muted">{state.message}</p>
            <Link href="/#contact" className="btn btn-ghost mt-6 text-sm">
              Subscribe again
            </Link>
          </>
        )}
      </div>
    </PageShell>
  );
}
