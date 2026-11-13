import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw, UploadCloud } from "lucide-react";
import { adminError, adminGet, adminPost } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "./helpers";
import { Button, Notice, Panel, SkeletonRows } from "./ui";

function Check({ ok, optional, label, children }) {
  const Icon = ok ? CheckCircle2 : CircleAlert;
  const tone = ok ? "text-emerald-400" : optional ? "text-gray-500" : "text-amber-400";
  return (
    <li className="flex items-start gap-3 px-5 py-3.5">
      <Icon size={17} className={`mt-0.5 shrink-0 ${tone}`} aria-hidden />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {label}
          {optional && !ok && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">optional</span>}
        </p>
        <div className="mt-0.5 break-words text-xs leading-relaxed text-gray-500">{children}</div>
      </div>
    </li>
  );
}

const code = "rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-gray-200";

/** Read-only view of the server's newsletter configuration. Secrets are never returned. */
export default function SettingsPanel() {
  const { toast } = useToast();
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCfg(await adminGet("/admin/newsletter/settings"));
    } catch (err) {
      toast(adminError(err, "Could not load newsletter settings."), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await adminPost("/admin/newsletter/subscribers/sync");
      toast(
        result.remaining > 0 ? `Synced ${result.synced}. ${result.remaining} still waiting — run it again.` : `Synced ${result.synced} change(s) to Resend.`,
        result.remaining > 0 ? "info" : "success"
      );
      load();
    } catch (err) {
      toast(adminError(err, "Sync failed."), "error", 0);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <Panel
        title="Newsletter setup"
        description="Values are set as environment variables on the server (Render). Secrets are never shown here."
        actions={
          <Button icon={RefreshCw} onClick={load} loading={loading && !!cfg}>
            Re-check
          </Button>
        }
      >
        {!cfg ? (
          <SkeletonRows rows={6} columns={2} />
        ) : (
          <ul className="divide-y divide-white/5">
            <Check ok={cfg.resend_configured} label="Resend API key">
              {cfg.resend_configured ? (
                <>
                  Sending as <span className={code}>{cfg.sender}</span>
                </>
              ) : (
                <>
                  Set <span className={code}>RESEND_API_KEY</span> and a verified sending domain. Without it no confirmation or campaign email can be sent.
                </>
              )}
            </Check>
            <Check ok={cfg.segment_configured} label="Resend audience segment">
              {cfg.segment_configured ? "Confirmed subscribers are synced to your Resend segment." : (
                <>
                  Set <span className={code}>RESEND_NEWSLETTER_SEGMENT_ID</span> so campaigns know who to send to.
                </>
              )}
            </Check>
            <Check ok={cfg.webhook_secret_configured} label="Resend webhook">
              {cfg.webhook_secret_configured ? (
                <>Signing secret set. Last event received: {cfg.last_webhook_at ? formatDate(cfg.last_webhook_at, true) : "none yet"}.</>
              ) : (
                <>
                  In Resend, add a webhook pointing to <span className={code}>{"<API URL>"}/webhooks/resend</span> and set <span className={code}>RESEND_WEBHOOK_SECRET</span>. Needed for delivery analytics, bounces and complaints.
                </>
              )}
            </Check>
            <Check ok={!!cfg.admin_email} label="Admin email (test sends)">
              {cfg.admin_email ? (
                <>
                  Test emails go only to <span className={code}>{cfg.admin_email}</span>.
                </>
              ) : (
                <>
                  Set <span className={code}>ADMIN_EMAIL</span> to enable “Send test to me”.
                </>
              )}
            </Check>
            <Check ok={cfg.double_opt_in} label="Double opt-in">
              {cfg.double_opt_in
                ? `On. Confirmation links expire after ${cfg.confirmation_hours} hours.`
                : "Off — new signups become active immediately. Turning NEWSLETTER_DOUBLE_OPT_IN on is strongly recommended."}
            </Check>
            <Check ok={cfg.dedicated_signing_secret} optional label="Dedicated link-signing secret">
              {cfg.dedicated_signing_secret ? "Confirmation and unsubscribe links use their own secret." : (
                <>
                  Links are signed with the app secret. Set <span className={code}>NEWSLETTER_CONFIRMATION_SECRET</span> to separate them.
                </>
              )}
            </Check>
            <Check ok={cfg.postal_address_configured} optional label="Postal address in footer">
              {cfg.postal_address_configured ? "Included in every campaign footer." : (
                <>
                  Some anti-spam laws (e.g. CAN-SPAM) require one. Set <span className={code}>NEWSLETTER_POSTAL_ADDRESS</span>.
                </>
              )}
            </Check>
            <Check ok label="Site URL used in emails">
              <span className={code}>{cfg.app_base_url}</span> — confirmation, unsubscribe and case-study links point here.
            </Check>
          </ul>
        )}
      </Panel>

      {cfg && (
        <Panel title="Resend sync" description="Subscriber changes are pushed to Resend automatically; this retries anything that failed.">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-300">
              <strong className="tabular-nums text-white">{cfg.pending_sync}</strong> subscriber change{cfg.pending_sync === 1 ? "" : "s"} waiting to sync.
            </p>
            <Button icon={UploadCloud} onClick={sync} loading={syncing} disabled={!cfg.resend_configured || cfg.pending_sync === 0}>
              Sync now
            </Button>
          </div>
          {!cfg.resend_configured && (
            <div className="px-5 pb-4">
              <Notice>Configure the Resend API key first.</Notice>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
