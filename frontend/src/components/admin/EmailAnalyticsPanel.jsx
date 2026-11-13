import { useCallback, useEffect, useState } from "react";
import { AlertOctagon, BarChart3, CheckCircle2, MailOpen, MousePointerClick, RefreshCw, Send, UserMinus } from "lucide-react";
import { adminError, adminGet } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate, formatMetric } from "./helpers";
import { Button, EmptyState, KpiCard, Notice, Panel, SkeletonRows, StatusBadge } from "./ui";

/**
 * Delivery metrics reported by Resend webhooks. A dash means "not reported yet",
 * which is deliberately different from zero.
 */
export default function EmailAnalyticsPanel({ onNavigate }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminGet("/admin/newsletter/analytics"));
    } catch (err) {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard loading={first} label="Recipients" value={formatMetric(t?.recipients)} hint="Across sent campaigns" icon={Send} accent="text-violet-400" />
        <KpiCard loading={first} label="Delivered" value={formatMetric(t?.delivered)} hint={t?.delivery_rate != null ? `${t.delivery_rate}% delivery rate` : "Not reported yet"} icon={CheckCircle2} accent="text-emerald-400" />
        <KpiCard loading={first} label="Opened" value={formatMetric(t?.opened)} hint="Approximate — many clients block tracking" icon={MailOpen} accent="text-cyan-400" />
        <KpiCard loading={first} label="Clicked" value={formatMetric(t?.clicked)} hint={t?.click_rate != null ? `${t.click_rate}% click rate` : "Not reported yet"} icon={MousePointerClick} accent="text-fuchsia-400" />
        <KpiCard loading={first} label="Bounced" value={formatMetric(t?.bounced)} icon={AlertOctagon} accent="text-amber-400" />
        <KpiCard loading={first} label="Spam complaints" value={formatMetric(t?.complained)} icon={AlertOctagon} accent="text-rose-400" />
        <KpiCard loading={first} label="Unsubscribed" value={formatMetric(t?.unsubscribes)} hint="Current total, all campaigns" icon={UserMinus} accent="text-gray-400" />
        <KpiCard loading={first} label="Last webhook event" value={data?.last_webhook_at ? formatDate(data.last_webhook_at) : "—"} hint={data?.last_webhook_at ? formatDate(data.last_webhook_at, true) : "None received yet"} icon={BarChart3} accent="text-violet-400" />
      </div>

      <Panel
        title="Per-campaign results"
        description="Unique emails per event type, as reported by Resend."
        actions={
          <Button icon={RefreshCw} onClick={load} loading={loading && !!data}>
            Refresh
          </Button>
        }
      >
        {first ? (
          <SkeletonRows columns={6} />
        ) : !data?.campaigns.length ? (
          <EmptyState icon={BarChart3} title="No campaigns sent yet">
            Results appear here after a campaign is sent and Resend reports delivery events.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Recipients</th>
                  <th className="px-4 py-3 text-right">Delivered</th>
                  <th className="px-4 py-3 text-right">Opened</th>
                  <th className="px-4 py-3 text-right">Clicked</th>
                  <th className="px-4 py-3 text-right">Bounced</th>
                  <th className="px-4 py-3 text-right">Complaints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {data.campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="max-w-[300px] px-5 py-3.5">
                      <span className="block truncate font-semibold text-white">{c.title}</span>
                      <span className="block font-mono text-[11px] text-gray-500">
                        {c.status === "scheduled" ? `Scheduled ${formatDate(c.scheduled_at, true)}` : formatDate(c.sent_at, true)}
                        {!c.tracking_available && c.status !== "scheduled" && " · no events yet"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.recipients)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {formatMetric(c.delivered)}
                      {c.delivery_rate != null && <span className="block text-[10px] text-gray-500">{c.delivery_rate}%</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {formatMetric(c.opened)}
                      {c.open_rate != null && <span className="block text-[10px] text-gray-500">{c.open_rate}%</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {formatMetric(c.clicked)}
                      {c.click_rate != null && <span className="block text-[10px] text-gray-500">{c.click_rate}%</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.bounced)}</td>
                    <td className="px-4 py-3.5 text-right">{formatMetric(c.complained)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
