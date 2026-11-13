import { useCallback, useEffect, useState } from "react";
import { Activity, AlertOctagon, Ban, CalendarClock, CheckCircle2, CircleAlert, Clock, FileText, MailOpen, MousePointerClick, RefreshCw, Send, UserMinus, Users } from "lucide-react";
import { adminError, adminGet } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatMetric } from "./helpers";
import { Legend, RateBars, TrendChart } from "./charts";
import { Button, EmptyState, KpiCard, Notice, Panel, SkeletonRows, StatusBadge } from "./ui";

const ACTIVITY_LABEL = { signed_up: "Signed up", confirmed: "Confirmed", unsubscribed: "Unsubscribed", suppressed: "Suppressed" };
const GROWTH_SERIES = [
  { key: "signups", label: "Sign-ups" },
  { key: "confirmed", label: "Confirmed" },
];
const RATE_SERIES = ["Delivery rate", "Open rate", "Click rate"];
const rate = (value) => formatMetric(value, "%");

function SectionLabel({ children }) {
  return <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">{children}</h2>;
}

function StatusRow({ ok, label, children }) {
  const Icon = ok ? CheckCircle2 : CircleAlert;
  return (
    <li className="flex items-start gap-3 px-5 py-3">
      <Icon size={16} aria-hidden className={`mt-0.5 shrink-0 ${ok ? "text-emerald-400" : "text-amber-400"}`} />
      <div className="min-w-0 text-xs">
        <p className="font-semibold text-white">{label}</p>
        <p className="mt-0.5 text-gray-500">{children}</p>
      </div>
    </li>
  );
}

/** Newsletter dashboard. Every number is read live from the database; "—" means not reported yet. */
export default function OverviewPanel({ onNavigate }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, analytics] = await Promise.all([adminGet("/admin/newsletter/overview"), adminGet("/admin/newsletter/analytics", { limit: 6 })]);
      setData(overview);
      setReport(analytics);
      setFailed(false);
    } catch (err) {
      setFailed(true);
      toast(adminError(err, "Could not load the overview."), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (failed && !data) {
    return (
      <div className="mt-8">
        <Panel>
          <EmptyState
            icon={CircleAlert}
            title="The overview could not be loaded"
            action={
              <Button icon={RefreshCw} onClick={load} loading={loading}>
                Try again
              </Button>
            }
          >
            The server did not answer. Your data is not affected.
          </EmptyState>
        </Panel>
      </div>
    );
  }

  const first = !data;
  const s = data?.subscribers;
  const c = data?.campaigns;
  const email = data?.email;
  const io = data?.integration;
  const growth = data?.growth || [];
  const growthTotal = growth.reduce((sum, day) => sum + day.signups + day.confirmed, 0);
  const tracked = (report?.campaigns || []).filter((row) => row.tracking_available);
  const setupGaps = io ? [!io.resend_configured && "Resend API key", !io.segment_configured && "newsletter segment", !io.webhook_configured && "webhook"].filter(Boolean) : [];
  const noEvents = "No delivery events reported yet";

  return (
    <div className="mt-8 space-y-8">
      {setupGaps.length > 0 && (
        <Notice>
          Newsletter setup is incomplete — missing: <strong>{setupGaps.join(", ")}</strong>.{" "}
          <button type="button" className="underline" onClick={() => onNavigate("settings")}>
            Open Newsletter Settings
          </button>{" "}
          for the checklist.
        </Notice>
      )}
      {io?.pending_sync > 0 && (
        <Notice tone="cyan">
          <strong>{io.pending_sync}</strong> subscriber change{io.pending_sync === 1 ? " is" : "s are"} waiting to sync with Resend. Campaigns cannot be sent until this is done.{" "}
          <button type="button" className="underline" onClick={() => onNavigate("subscribers")}>
            Go to Subscribers
          </button>
        </Notice>
      )}

      <section>
        <SectionLabel>Subscribers</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard loading={first} label="Total" value={s?.total.toLocaleString()} icon={Users} />
          <KpiCard loading={first} label="Active" value={s?.active.toLocaleString()} hint="Confirmed, receive campaigns" icon={CheckCircle2} accent="text-emerald-400" />
          <KpiCard loading={first} label="Pending" value={s?.pending.toLocaleString()} hint="Awaiting confirmation" icon={Clock} accent="text-amber-400" />
          <KpiCard loading={first} label="Unsubscribed" value={s?.unsubscribed.toLocaleString()} icon={UserMinus} accent="text-gray-400" />
          <KpiCard loading={first} label="Suppressed" value={s?.suppressed.toLocaleString()} hint="Bounced, complained or blocked" icon={Ban} accent="text-rose-400" />
        </div>
      </section>

      <section>
        <SectionLabel>Campaigns</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard loading={first} label="Total" value={c?.total.toLocaleString()} hint={c && c.failed + c.cancelled > 0 ? `${c.failed} failed · ${c.cancelled} cancelled` : undefined} icon={FileText} />
          <KpiCard loading={first} label="Drafts" value={c?.draft.toLocaleString()} icon={FileText} accent="text-gray-400" />
          <KpiCard loading={first} label="Scheduled" value={c?.scheduled.toLocaleString()} icon={CalendarClock} accent="text-cyan-400" />
          <KpiCard loading={first} label="Sent" value={c?.completed.toLocaleString()} hint={c?.sending ? `${c.sending} sending now` : undefined} icon={Send} accent="text-emerald-400" />
        </div>
      </section>

      <section>
        <SectionLabel>Email performance · all campaigns</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard loading={first} label="Delivery rate" value={rate(email?.delivery_rate)} hint={email?.events_recorded ? "Delivered ÷ sent" : noEvents} icon={CheckCircle2} accent="text-emerald-400" />
          <KpiCard loading={first} label="Open rate" value={rate(email?.open_rate)} hint={email?.events_recorded ? "Approximate — many clients block tracking" : noEvents} icon={MailOpen} accent="text-cyan-400" />
          <KpiCard loading={first} label="Click rate" value={rate(email?.click_rate)} hint={email?.events_recorded ? "Clicked ÷ delivered" : noEvents} icon={MousePointerClick} accent="text-violet-400" />
          <KpiCard loading={first} label="Bounce rate" value={rate(email?.bounce_rate)} hint={email?.events_recorded ? "Bounced ÷ sent" : noEvents} icon={AlertOctagon} accent="text-amber-400" />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Subscriber growth" description="New sign-ups and confirmations per day, last 30 days (UTC)." actions={growthTotal > 0 && <Legend items={GROWTH_SERIES.map((g) => g.label)} />}>
          {first ? (
            <SkeletonRows rows={4} columns={2} />
          ) : growthTotal === 0 ? (
            <EmptyState icon={Users} title="No sign-ups in the last 30 days">
              New subscribers from the form on your site will be charted here.
            </EmptyState>
          ) : (
            <div className="px-4 py-4">
              <TrendChart data={growth} series={GROWTH_SERIES} label="Daily newsletter sign-ups and confirmations for the last 30 days" />
            </div>
          )}
        </Panel>

        <Panel title="Campaign performance" description="Rates for your most recent campaigns, from Resend delivery events." actions={tracked.length > 0 && <Legend items={RATE_SERIES} />}>
          {!report ? (
            <SkeletonRows rows={4} columns={2} />
          ) : tracked.length === 0 ? (
            <EmptyState icon={Activity} title="No campaign results yet">
              {report.campaigns.length === 0 ? "Results appear after your first campaign is sent." : "Campaigns were sent, but Resend has not reported any delivery events yet."}
            </EmptyState>
          ) : (
            <div className="px-5 py-4">
              <RateBars series={RATE_SERIES} rows={tracked.slice(0, 5).map((row) => ({ id: row.id, title: row.title, values: [row.delivery_rate, row.open_rate, row.click_rate] }))} />
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recent campaigns" actions={<Button variant="ghost" onClick={() => onNavigate("campaigns")}>View all</Button>}>
          {first ? (
            <SkeletonRows rows={4} columns={2} />
          ) : data.recent_campaigns.length === 0 ? (
            <EmptyState icon={Send} title="No newsletters yet" action={<Button variant="primary" onClick={() => onNavigate("create-newsletter")}>Create newsletter</Button>} />
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent_campaigns.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">{row.title}</p>
                    <p className="font-mono text-[11px] text-gray-500">
                      {row.status === "scheduled" ? `Scheduled ${formatDate(row.scheduled_at, true)}` : row.sent_at ? `Sent ${formatDate(row.sent_at, true)}` : `Edited ${formatDate(row.updated_at)}`}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Subscription activity" actions={<Button variant="ghost" onClick={() => onNavigate("subscribers")}>View all</Button>}>
          {first ? (
            <SkeletonRows rows={4} columns={2} />
          ) : data.recent_subscribers.length === 0 ? (
            <EmptyState icon={Users} title="No subscribers yet" />
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent_subscribers.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">{row.email}</p>
                    <p className="text-[11px] text-gray-500">
                      {ACTIVITY_LABEL[row.activity] || row.activity} · <span className="font-mono">{formatDate(row.at, true)}</span>
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent email events" actions={<Button variant="ghost" onClick={() => onNavigate("email-analytics")}>Analytics</Button>}>
          {first ? (
            <SkeletonRows rows={4} columns={2} />
          ) : data.recent_events.length === 0 ? (
            <EmptyState icon={Activity} title="No email events yet">
              Delivery, open and click events arrive through the Resend webhook after a campaign is sent.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent_events.map((row, i) => (
                <li key={i} className="px-5 py-3 text-xs">
                  <p className="truncate text-gray-300">
                    <span className="font-semibold capitalize text-white">{row.event_type.replace("_", " ")}</span> · {row.email || "unknown recipient"}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">
                    {row.campaign || "Campaign"} · <span className="font-mono">{formatDate(row.occurred_at, true)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Integration status" description="Resend connection, webhook and contact synchronisation." actions={<Button variant="ghost" onClick={() => onNavigate("settings")}>Settings</Button>}>
        {!io ? (
          <SkeletonRows rows={3} columns={2} />
        ) : (
          <ul className="grid divide-y divide-white/5 md:grid-cols-2 md:divide-y-0 xl:grid-cols-4">
            <StatusRow ok={io.resend_configured} label="Resend API">{io.resend_configured ? "Connected" : "API key missing on the server"}</StatusRow>
            <StatusRow ok={io.segment_configured} label="Newsletter segment">{io.segment_configured ? "Configured" : "Segment ID missing"}</StatusRow>
            <StatusRow ok={io.webhook_configured && !!io.last_webhook_at} label="Webhook">
              {!io.webhook_configured ? "Signing secret missing" : io.last_webhook_at ? `Last event ${formatDate(io.last_webhook_at, true)}` : "Configured — no events received yet"}
            </StatusRow>
            <StatusRow ok={io.pending_sync === 0} label="Contact sync">{io.pending_sync === 0 ? "Resend is up to date" : `${io.pending_sync} change${io.pending_sync === 1 ? "" : "s"} pending`}</StatusRow>
          </ul>
        )}
      </Panel>
    </div>
  );
}
