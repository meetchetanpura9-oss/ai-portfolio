import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Clock, FileText, Send, UserMinus } from "lucide-react";
import { adminError, adminGet } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { Button, KpiCard, Notice, Panel } from "./ui";

/** Newsletter & content KPIs. Every number is read live from the database. */
export default function OverviewPanel({ onNavigate }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([adminGet("/admin/newsletter/overview"), adminGet("/admin/newsletter/settings")])
      .then(([overview, settings]) => {
        if (!alive) return;
        setData(overview);
        setConfig(settings);
      })
      .catch((err) => alive && toast(adminError(err, "Could not load the overview."), "error"));
    return () => {
      alive = false;
    };
  }, [toast]);

  const loading = !data;
  const s = data?.subscribers;
  const setupGaps = config
    ? [
        !config.resend_configured && "RESEND_API_KEY",
        !config.segment_configured && "RESEND_NEWSLETTER_SEGMENT_ID",
        !config.webhook_secret_configured && "RESEND_WEBHOOK_SECRET",
      ].filter(Boolean)
    : [];

  return (
    <div className="mt-8 space-y-6">
      {setupGaps.length > 0 && (
        <Notice>
          Newsletter setup is incomplete — missing on the server: <strong>{setupGaps.join(", ")}</strong>.{" "}
          <button type="button" className="underline" onClick={() => onNavigate("settings")}>
            Open Settings
          </button>{" "}
          for the checklist.
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard loading={loading} label="Active subscribers" value={s?.active.toLocaleString()} hint="Confirmed, receive campaigns" icon={CheckCircle2} accent="text-emerald-400" />
        <KpiCard loading={loading} label="Pending confirmations" value={s?.pending.toLocaleString()} hint="Signed up, not confirmed yet" icon={Clock} accent="text-amber-400" />
        <KpiCard
          loading={loading}
          label="Unsubscribed contacts"
          value={s ? (s.unsubscribed + s.suppressed).toLocaleString() : ""}
          hint={s ? `${s.unsubscribed} opted out · ${s.suppressed} suppressed` : ""}
          icon={UserMinus}
          accent="text-rose-400"
        />
        <KpiCard loading={loading} label="Total newsletters" value={data?.campaigns.total.toLocaleString()} hint={data ? `${data.campaigns.draft} draft · ${data.campaigns.scheduled} scheduled` : ""} icon={FileText} accent="text-violet-400" />
        <KpiCard loading={loading} label="Campaigns sent" value={data?.campaigns.sent.toLocaleString()} icon={Send} accent="text-cyan-400" />
        <KpiCard loading={loading} label="Published case studies" value={data?.case_studies.published.toLocaleString()} hint={data ? `${data.case_studies.draft} in draft` : ""} icon={BookOpen} accent="text-fuchsia-400" />
      </div>

      <Panel title="Quick actions" description="Publishing a case study and sending a newsletter are always separate steps.">
        <div className="flex flex-wrap gap-2 px-5 py-4">
          <Button variant="primary" icon={BookOpen} onClick={() => onNavigate("case-studies")}>
            Write a case study
          </Button>
          <Button icon={Send} onClick={() => onNavigate("campaigns")}>
            Create a newsletter
          </Button>
          <Button onClick={() => onNavigate("subscribers")}>Manage subscribers</Button>
          <Button onClick={() => onNavigate("email-analytics")}>View email analytics</Button>
        </div>
      </Panel>
    </div>
  );
}
