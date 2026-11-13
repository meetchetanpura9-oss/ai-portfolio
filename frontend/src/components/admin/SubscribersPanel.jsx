import { useCallback, useEffect, useState } from "react";
import { Ban, Download, MailCheck, RefreshCw, Search, UserMinus, Users } from "lucide-react";
import { adminDownload, adminError, adminGet, adminPatch, adminPost } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate } from "./helpers";
import { Badge, Button, ConfirmDialog, Dialog, EmptyState, KpiCard, Pagination, Panel, Select, SkeletonRows, StatusBadge, TextInput } from "./ui";

const PAGE_SIZE = 20;

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 py-2.5 text-xs last:border-0">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-gray-200">{children}</span>
    </div>
  );
}

/** Whether Resend's copy of this contact matches ours. Only confirmed contacts are ever sent to Resend. */
function SyncState({ subscriber: s }) {
  if (s.resend_sync_pending) return <Badge tone="amber">Sync pending</Badge>;
  if (s.in_resend) return <Badge tone="emerald">Synced</Badge>;
  if (s.status === "active") return <Badge tone="amber">Not synced</Badge>;
  return <span className="text-gray-600" title="Only confirmed subscribers are sent to Resend">Not in Resend</span>;
}

export default function SubscribersPanel() {
  const { toast } = useToast();
  const [query, setQuery] = useState({ page: 1, search: "", status: "", sort: "newest" });
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null); // { action, subscriber }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(
        await adminGet("/admin/newsletter/subscribers", {
          page: query.page,
          page_size: PAGE_SIZE,
          search: query.search || undefined,
          status: query.status || undefined,
          sort: query.sort,
        })
      );
    } catch (err) {
      toast(adminError(err, "Could not load subscribers."), "error");
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const update = (patch) => setQuery((q) => ({ ...q, page: 1, ...patch }));

  const openDetail = async (id) => {
    try {
      setDetail(await adminGet(`/admin/newsletter/subscribers/${id}`));
    } catch (err) {
      toast(adminError(err, "Could not load this subscriber."), "error");
    }
  };

  const runAction = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      const result = await adminPatch(`/admin/newsletter/subscribers/${confirm.subscriber.id}`, { action: confirm.action });
      toast(result.message || `Subscriber is now ${result.status}.`, "success");
      setConfirm(null);
      setDetail(null);
      load();
    } catch (err) {
      toast(adminError(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      await adminDownload(
        "/admin/newsletter/subscribers/export",
        { search: query.search || undefined, status: query.status || undefined },
        `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err) {
      toast(adminError(err, "Export failed."), "error");
    }
  };

  const sync = async () => {
    setBusy(true);
    try {
      const result = await adminPost("/admin/newsletter/subscribers/sync");
      toast(result.remaining ? `Synced ${result.synced}; ${result.remaining} still pending — run it again.` : `Resend is up to date (${result.synced} synced).`, result.remaining ? "info" : "success");
      load();
    } catch (err) {
      toast(adminError(err, "Sync failed."), "error");
    } finally {
      setBusy(false);
    }
  };

  const counts = data?.counts;
  const items = data?.items || [];
  const CONFIRM_COPY = {
    unsubscribe: { title: "Unsubscribe this contact?", label: "Unsubscribe", body: "They will stop receiving campaigns. Only they can subscribe again, by confirming a new sign-up." },
    suppress: { title: "Suppress this contact?", label: "Suppress", body: "Use this for addresses that must never be emailed again. It cannot be undone from the dashboard." },
    resend_confirmation: { title: "Send the confirmation email again?", label: "Send email", body: "A new confirmation link is emailed to this address. They become active only after they click it." },
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard loading={!counts} label="Total" value={counts?.total.toLocaleString()} icon={Users} />
        <KpiCard loading={!counts} label="Active" value={counts?.active.toLocaleString()} hint="Receive campaigns" icon={MailCheck} accent="text-emerald-400" />
        <KpiCard loading={!counts} label="Pending" value={counts?.pending.toLocaleString()} hint="Not confirmed yet" icon={RefreshCw} accent="text-amber-400" />
        <KpiCard loading={!counts} label="Unsubscribed" value={counts?.unsubscribed.toLocaleString()} icon={UserMinus} accent="text-gray-400" />
        <KpiCard loading={!counts} label="Suppressed" value={counts?.suppressed.toLocaleString()} hint="Never emailed again" icon={Ban} accent="text-rose-400" />
      </div>

      <Panel
        title="Newsletter subscribers"
        description="Only active (confirmed) subscribers receive campaigns."
        actions={
          <>
            <Button icon={RefreshCw} onClick={sync} loading={busy} title="Push pending subscriber changes to Resend">
              Sync with Resend
            </Button>
            <Button icon={Download} onClick={exportCsv}>
              Export CSV
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            update({ search: searchText.trim() });
          }}
        >
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden />
            <TextInput value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search by email…" aria-label="Search by email" className="pl-10" />
          </div>
          <Select value={query.status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status" className="md:w-44">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="suppressed">Suppressed</option>
          </Select>
          <Select value={query.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by signup date" className="md:w-44">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </Select>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {loading && !data ? (
          <SkeletonRows />
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title={query.search || query.status ? "No subscribers match these filters" : "No subscribers yet"}>
            {query.search || query.status ? "Try a different search or clear the status filter." : "Sign-ups from the newsletter form on your site will appear here."}
          </EmptyState>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`}>
            <table className="w-full min-w-[1020px] border-collapse text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Consent</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Signed up</th>
                  <th className="px-5 py-3">Confirmed</th>
                  <th className="px-5 py-3">Unsubscribed</th>
                  <th className="px-5 py-3">Resend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((s) => (
                  <tr key={s.id} onClick={() => openDetail(s.id)} className="cursor-pointer transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-semibold text-white">{s.email}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5">{s.consent_given ? <span className="text-emerald-300">Given · {formatDate(s.consent_timestamp)}</span> : <span className="text-amber-300">Not recorded</span>}</td>
                    <td className="px-5 py-3.5 text-gray-400">{s.subscription_source || "—"}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">{formatDate(s.created_at)}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">
                      {s.confirmed_at ? formatDate(s.confirmed_at) : <span className="font-sans text-gray-600">{s.status === "pending" ? "Awaiting" : "—"}</span>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">
                      {s.unsubscribed_at ? (
                        <span title={`Source: ${s.unsubscribe_source || "unknown"}`}>
                          {formatDate(s.unsubscribed_at)} <span className="font-sans text-gray-600">· {s.unsubscribe_source || "unknown"}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <SyncState subscriber={s} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={query.page} pageSize={PAGE_SIZE} total={data.total} onChange={(page) => setQuery((q) => ({ ...q, page }))} />}
      </Panel>

      <Dialog
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.email || "Subscriber"}
        footer={
          detail && (
            <>
              {detail.status === "pending" && (
                <Button icon={MailCheck} onClick={() => setConfirm({ action: "resend_confirmation", subscriber: detail })}>
                  Resend confirmation
                </Button>
              )}
              {(detail.status === "active" || detail.status === "pending") && (
                <Button icon={UserMinus} onClick={() => setConfirm({ action: "unsubscribe", subscriber: detail })}>
                  Unsubscribe
                </Button>
              )}
              {detail.status !== "suppressed" && (
                <Button variant="danger" icon={Ban} onClick={() => setConfirm({ action: "suppress", subscriber: detail })}>
                  Suppress
                </Button>
              )}
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            <div>
              <Row label="Status">
                <StatusBadge status={detail.status} />
              </Row>
              <Row label="First name">{detail.first_name || "—"}</Row>
              <Row label="Signed up">{formatDate(detail.created_at, true)}</Row>
              <Row label="Source">{detail.subscription_source || "—"}</Row>
              <Row label="Consent">{detail.consent_given ? `Given on ${formatDate(detail.consent_timestamp, true)}` : "Not recorded (cannot be emailed campaigns)"}</Row>
              {detail.consent_text && <Row label="Consent wording">“{detail.consent_text}”</Row>}
              <Row label="Confirmed">{formatDate(detail.confirmed_at, true)}</Row>
              <Row label="Welcome email">{formatDate(detail.welcome_sent_at, true)}</Row>
              <Row label="Last unsubscribed">{detail.unsubscribed_at ? `${formatDate(detail.unsubscribed_at, true)} (${detail.unsubscribe_source || "unknown"})` : "—"}</Row>
              <Row label="Resend sync">
                <SyncState subscriber={detail} />
              </Row>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Recent campaign activity</p>
              {detail.recent_events.length === 0 ? (
                <p className="text-xs text-gray-500">No delivery events recorded for this subscriber.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {detail.recent_events.map((e, i) => (
                    <li key={i} className="flex justify-between gap-3 text-gray-300">
                      <span>
                        <span className="font-semibold capitalize text-white">{e.event_type.replace("_", " ")}</span> · {e.campaign || "campaign"}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-gray-500">{formatDate(e.occurred_at, true)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={runAction}
        loading={busy}
        danger={confirm?.action === "suppress"}
        title={confirm ? CONFIRM_COPY[confirm.action].title : ""}
        confirmLabel={confirm ? CONFIRM_COPY[confirm.action].label : ""}
      >
        {confirm && (
          <>
            <p className="font-semibold text-white">{confirm.subscriber.email}</p>
            <p className="mt-2">{CONFIRM_COPY[confirm.action].body}</p>
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
