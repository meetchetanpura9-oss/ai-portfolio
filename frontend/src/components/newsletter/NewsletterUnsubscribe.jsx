import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailX, XCircle } from "lucide-react";
import { api, apiErrorMessage, postWithRetry } from "../../lib/api";
import PageShell, { Link } from "../site/PageShell";
import { usePageMeta } from "../site/navigation";

/**
 * /newsletter/unsubscribe?token=…
 * Opening the link only looks it up; the visitor must click to unsubscribe, because
 * mail scanners pre-open links.
 */
export default function NewsletterUnsubscribe() {
  usePageMeta("Unsubscribe", "Unsubscribe from the newsletter.");
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [state, setState] = useState(token ? { status: "loading" } : { status: "error", message: "This unsubscribe link is incomplete. Please use the full link from the email." });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let alive = true;
    api
      .get("/newsletter/unsubscribe", { params: { token } })
      .then(({ data }) => alive && setState({ status: data.status === "unsubscribed" ? "done" : "ask", email: data.email, already: data.status === "unsubscribed" }))
      .catch((err) => alive && setState({ status: "error", message: apiErrorMessage(err, "This unsubscribe link is not valid.") }));
    return () => {
      alive = false;
    };
  }, [token]);

  const unsubscribe = async () => {
    setBusy(true);
    try {
      const { data } = await postWithRetry(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`);
      setState((s) => ({ ...s, status: "done", already: data.already, message: data.message }));
    } catch (err) {
      setState({ status: "error", message: apiErrorMessage(err, "We could not process this right now. Please try again shortly.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell narrow>
      <div className="card mx-auto mt-6 max-w-lg p-8 text-center" aria-live="polite">
        {state.status === "loading" ? (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-brand-blue" aria-hidden />
            <p className="mt-4 text-sm text-muted">Checking your link…</p>
          </>
        ) : state.status === "ask" ? (
          <>
            <MailX size={36} className="mx-auto text-brand-amber" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Unsubscribe from the newsletter?</h1>
            <p className="mt-2 text-sm text-muted">
              <strong className="text-ink">{state.email}</strong> will stop receiving newsletter emails.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={unsubscribe} disabled={busy} className="btn btn-primary text-sm disabled:opacity-70">
                {busy && <Loader2 size={15} className="animate-spin" aria-hidden />}
                Unsubscribe
              </button>
              <Link href="/" className="btn btn-ghost text-sm">
                Keep me subscribed
              </Link>
            </div>
          </>
        ) : state.status === "done" ? (
          <>
            <CheckCircle2 size={36} className="mx-auto text-brand-emerald" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">{state.already ? "Already unsubscribed" : "You've been unsubscribed"}</h1>
            <p className="mt-2 text-sm text-muted">
              {state.email ? (
                <>
                  <strong className="text-ink">{state.email}</strong> will not receive further newsletter emails.
                </>
              ) : (
                state.message || "You will not receive further newsletter emails."
              )}
            </p>
            <Link href="/" className="btn btn-ghost mt-6 text-sm">
              Back to portfolio
            </Link>
          </>
        ) : (
          <>
            <XCircle size={36} className="mx-auto text-brand-rose" aria-hidden />
            <h1 className="mt-4 font-display text-xl font-semibold">Link not valid</h1>
            <p className="mt-2 text-sm text-muted">{state.message}</p>
          </>
        )}
      </div>
    </PageShell>
  );
}
