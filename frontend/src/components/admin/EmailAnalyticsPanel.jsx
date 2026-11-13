import { useCallback, useEffect, useState } from "react";
import { AlertOctagon, BarChart3, CheckCircle2, MailOpen, MailX, MousePointerClick, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { adminError, adminGet } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatMetric } from "./helpers";
import { FunnelBars } from "./charts";
import { Button, Dialog, EmptyState, KpiCard, Notice, Panel, Select, SkeletonRows, StatusBadge } from "./ui";

const rateHint = (value, label) => (value != null ? `${value}% ${label}` : "Not reported yet");

/** One campaign's results: funnel, problems, daily timeline and the latest events. */
function CampaignDetail({ campaignId, onClose }) {
  const { toast } = useToast();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let alive = true;
    adminGet(`/admin/newsletter/analytics/campaigns/${campaignId}`)
      .then((data) => alive && setDetail(data))
      .catch((err) => {
        toast(adminError(err, "Could not load this campaign's results."), "error");
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [campaignId, onClose, toast]);

  return (
    <Dialog open onClose={onClose} size="lg" title={detail ? detail.title : "Campaign results"}>
      {!detail ? (
        <SkeletonRows rows={5} columns={2} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
            <StatusBadge status={detail.status} />
            <span>
              Subject: <span className="text-gray-200">{detail.subject || "—"}</span>
            </span>
            <span>
              Recipients: <span className="tabular-nums text-gray-200">{formatMetric(detail.recipients)}</span>
            </span>
            <span className="font-mono text-[11px]">{detail.status === "scheduled" ? `Scheduled ${formatDate(detail.scheduled_at, true)}` : detail.sent_at ? `Sent ${formatDate(detail.sent_at, true)}` : ""}</span>
          </div>

          {!detail.tracking_available ? (
            <EmptyState icon={BarChart3} title="No webhook events for this campaign yet">
              {detail.status === "scheduled"
                ? "This campaign has not been sent yet."
                : "Resend has not reported any delivery events. They usually arrive within minutes of sending — if nothing appears, check the webhook in Newsletter Settings."}
            </EmptyState>
          ) : (
            <>
              <section>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery funnel · unique emails</h4>
                <FunnelBars
                  steps={[
                    { label: "Sent", value: detail.sent },
                    { label: "Delivered", value: detail.delivered, rate: detail.delivery_rate },
                    { label: "Opened", value: detail.opened, rate: detail.open_rate },
                    { label: "Clicked", value: detail.clicked, rate: detail.click_rate },
                  ]}
                />
                <p className="mt-2 text-[11px] text-gray-500">Percentages: delivered ÷ sent; opened and clicked ÷ delivered. Opens are approximate because many mail clients block tracking.</p>
              </section>

              <section className="grid grid-cols-3 gap-3">
                {[
                  ["Failed", detail.failed, "Could not be sent"],
                  ["Bounced", detail.bounced, detail.bounce_rate != null ? `${detail.bounce_rate}% of sent` : ""],
                  ["Complaints", detail.complained, "Marked as spam"],
                ].map(([label, value, hint]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-1 text-xl font-black tabular-nums text-white">{formatMetric(value)}</p>
                    <p className="text-[11px] text-gray-500">{hint}</p>
                  </div>
                ))}
              </section>

              {detail.timeline.length > 0 && (
                <section>
                  <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">By day</h4>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[520px] text-left text-xs tabular-nums text-gray-300">
                      <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <tr>
                          <th className="px-4 py-2.5">Date</th>
                          {["Sent", "Delivered", "Opened", "Clicked", "Bounced"].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-right">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {detail.timeline.map((day) => (
                          <tr key={day.date}>
                            <td className="px-4 py-2.5 font-mono text-[11px]">{formatDate(`${day.date}T00:00:00`)}</td>
                            {["sent", "delivered", "opened", "clicked", "bounced"].map((key) => (
                              <td key={key} className="px-3 py-2.5 text-right">
                                {day[key] || 0}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section>
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Latest events</h4>
                <ul className="max-h-56 space-y-1.5 overflow-y-auto pr-1 text-xs">
                  {detail.recent_events.map((e, i) => (
                    <li key={i} className="flex justify-between gap-3 text-gray-300">
                      <span className="min-w-0 truncate">
                        <span className="font-semibold capitalize text-white">{e.event_type.replace("_", " ")}</span> · {e.email || "unknown recipient"}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-gray-500">{formatDate(e.occurred_at, true)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}

/**
 * Delivery metrics reported by Resend webhooks. A dash means "not reported yet",
 * which is deliberately different from zero.
 */
export default function EmailAnalyticsPanel({ onNavigate }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const closeDetail = useCallback(() => setSelected(null), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminGet("/admin/newsletter/analytics"));
      setFailed(false);
    } catch (err) {
      setFailed(true);
      toast(adminError(err, "Could not load email analytics."), "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const t = data?.totals;
  const first = loading && !data;
  const anyEvents = data?.campaigns.some((c) => c.tracking_available);
  return (
    <div className="mt-8 space-y-6">
      {data && !data.webhook_configured && (
        <Notice>
          The Resend webhook is not configured, so delivery, open and click events cannot be recorded.{" "}
          <button type="button" className="underline" onClick={() => onNavigate("settings")}>
            See the setup checklist
          </button>
          .
        </Notice>
      )}
      {data && data.webhook_configured && data.campaigns.length > 0 && !anyEvents && (
        <Notice tone="cyan">No webhook events have been received yet, so every metric below shows “—” rather than a made-up zero.</Notice>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard loading={first} label="Emails sent" value={formatMetric(t?.sent)} hint={t ? `${formatMetric(t.recipients)} recipients targeted` : ""} icon={Send} accent="text-violet-400" />
        <KpiCard loading={first} label="Delivered" value={formatMetric(t?.delivered)} hint={rateHint(t?.delivery_rate, "delivery rate")} icon={CheckCircle2} accent="text-emerald-400" />
        <KpiCard loading={first} label="Opened" value={formatMetric(t?.opened)} hint={rateHint(t?.open_rate, "open rate (approx.)")} icon={MailOpen} accent="text-cyan-400" />
        <KpiCard loading={first} label="Clicked" value={formatMetric(t?.clicked)} hint={rateHint(t?.click_rate, "click-through rate")} icon={MousePointerClick} accent="text-fuchsia-400" />
        <KpiCard loading={first} label="Delivery failures" value={formatMetric(t?.failed)} hint="Could not be sent" icon={MailX} accent="text-rose-400" />
        <KpiCard loading={first} label="Bounced" value={formatMetric(t?.bounced)} hint={rateHint(t?.bounce_rate, "bounce rate")} icon={AlertOctagon} accent="text-amber-400" />
        <KpiCard loading={first} label="Spam complaints" value={formatMetric(t?.complained)} icon={ShieldAlert} accent="text-rose-400" />
        <KpiCard loading={first} label="Last webhook event" value={data?.last_webhook_at ? formatDate(data.last_webhook_at) : "—"} hint={data?.last_webhook_at ? formatDate(data.last_webhook_at, true) : "None received yet"} icon={BarChart3} accent="text-violet-400" />
      </div>

      <Panel
        title="Campaign results"
        description="Unique emails per event type, as reported by Resend. Select a campaign to inspect it."
        actions={
          <>
            {data?.campaigns.length > 0 && (
              <Select value="" onChange={(e) => e.target.value && setSelected(Number(e.target.value))} aria-label="Inspect a campaign" className="!w-56 !py-2 text-xs">
                <option value="">Inspect a campaign…</option>
                {data.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            )}
            <Button icon={RefreshCw} onClick={load} loading={loading && !!data}>
              Refresh
            </Button>
          </>
        }
      >
        {first ? (
          <SkeletonRows columns={6} />
        ) : failed && !data ? (
          <EmptyState
            icon={RefreshCw}
            title="Email analytics could not be loaded"
            action={
              <Button icon={RefreshCw} onClick={load}>
                Try again
              </Button>
            }
          >
            The server did not answer.
          </EmptyState>
        ) : !data?.campaigns.length ? (
          <EmptyState icon={BarChart3} title="No campaigns sent yet">
            Results appear here after a campaign is sent and Resend reports delivery events.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Sent</th>
                  <th className="px-4 py-3 text-right">Delivered</th>
                  <th className="px-4 py-3 text-right">Opened</th>
                  <th className="px-4 py-3 text-right">Clicked</th>
                  <th className="px-4 py-3 text-right">Failed</th>
                  <th className="px-4 py-3 text-right">Bounced</th>
                  <th className="px-4 py-3 text-right">Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {data.campaigns.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c.id)} className="cursor-pointer hover:bg-white/[0.02]">
                    <td className="max-w-[300px] px-5 py-3.5">
                      <button type="button" onClick={() => setSelected(c.id)} className="block max-w-full truncate text-left font-semibold text-white hover:text-violet-300">
                        {c.title}
                      </button>
                      <span className="block font-mono text-[11px] text-gray-500">
                        {c.status === "scheduled" ? `Scheduled ${formatDate(c.scheduled_at, true)}` : formatDate(c.sent_at, true)}
                        {!c.tracking_available && c.status !== "scheduled" && " · no events yet"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {formatMetric(c.sent)}
                      <span className="block text-[10px] text-gray-500">of {formatMetric(c.recipients)}</span>
                    </td>
                    {[
                      [c.delivered, c.delivery_rate],
                      [c.opened, c.open_rate],
                      [c.clicked, c.click_rate],
                    ].map(([value, pct], i) => (
                      <td key={i} className="px-4 py-3.5 text-right">
                        {formatMetric(value)}
                        {pct != null && <span className="block text-[10px] text-gray-500">{pct}%</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.failed)}</td>
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.bounced)}</td>
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.complained)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {selected && <CampaignDetail key={selected} campaignId={selected} onClose={closeDetail} />}
    </div>
  );
}
