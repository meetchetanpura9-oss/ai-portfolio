import { useCallback, useEffect, useRef, useState } from "react";
import { Ban, Bold, BookOpen, CalendarClock, Copy, Eye, FlaskConical, Heading1, Heading2, Image as ImageIcon, Italic, Link as LinkIcon, List, Minus, Monitor, MousePointerClick, Pencil, Pilcrow, Plus, RefreshCw, Save, Search, Send, Smartphone, Trash2, Upload } from "lucide-react";
import { adminDelete, adminError, adminGet, adminPost, adminPut, adminUploadImage } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate, toLocalInputValue } from "./helpers";
import { Button, ConfirmDialog, Dialog, EmailPreview, EmptyState, Field, Notice, Pagination, Panel, SkeletonRows, StatusBadge, TextArea, TextInput } from "./ui";

const PAGE_SIZE = 20;
const EMPTY = { title: "", subject: "", preview_text: "", content: "" };
const STARTER = `# A short, clear headline

Hello,

Write your update here. Use **bold**, *italic* and [links](https://www.meetchetanpura.in).

[[button: Explore my portfolio | https://www.meetchetanpura.in]]
`;

/* ───────────────────────── Send / schedule dialog ───────────────────────── */
function SendDialog({ campaign, initialMode = "now", onClose, onDone }) {
  const { toast } = useToast();
  const [check, setCheck] = useState(null);
  const [mode, setMode] = useState(initialMode);
  const [when, setWhen] = useState(() => toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [reviewed, setReviewed] = useState(false);
  const [minWhen] = useState(() => toLocalInputValue(new Date(Date.now() + 3 * 60 * 1000)));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    adminPost(`/admin/newsletter/campaigns/${campaign.id}/preview`)
      .then((data) => alive && setCheck(data))
      .catch((err) => {
        toast(adminError(err, "Could not run the pre-send checks."), "error");
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [campaign.id, onClose, toast]);

  const submit = async () => {
    setBusy(true);
    try {
      const body = { confirm: true, expected_recipients: check.eligible_recipients };
      const result =
        mode === "now"
          ? await adminPost(`/admin/newsletter/campaigns/${campaign.id}/send`, body)
          : await adminPost(`/admin/newsletter/campaigns/${campaign.id}/schedule`, { ...body, scheduled_at: new Date(when).toISOString() });
      toast(mode === "now" ? `Campaign handed to Resend for ${result.recipient_count} subscriber(s).` : `Campaign scheduled for ${formatDate(result.scheduled_at, true)}.`, "success", 7000);
      onDone();
    } catch (err) {
      // Stays on screen: the admin needs to read why nothing was sent.
      toast(adminError(err, "The campaign was not sent."), "error", 0);
      onDone(true);
    } finally {
      setBusy(false);
    }
  };

  const n = check?.eligible_recipients ?? 0;
  return (
    <Dialog
      open
      onClose={busy ? () => {} : onClose}
      title={mode === "now" ? "Review and send" : "Review and schedule"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" icon={mode === "now" ? Send : CalendarClock} loading={busy} disabled={!check?.ready || !reviewed || (mode === "later" && !when)} onClick={submit}>
            {mode === "now" ? `Send now to ${n} subscriber${n === 1 ? "" : "s"}` : `Schedule for ${n} subscriber${n === 1 ? "" : "s"}`}
          </Button>
        </>
      }
    >
      {!check ? (
        <SkeletonRows rows={4} columns={2} />
      ) : (
        <div className="space-y-5">
          {!check.ready && (
            <Notice tone="rose">
              <p className="font-semibold">This campaign cannot be sent yet:</p>
              <ul className="mt-1 list-disc pl-4">
                {check.problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Notice>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Recipients</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{n.toLocaleString()}</p>
              <p className="mt-1 text-[11px] text-gray-500">Active, confirmed subscribers. Pending, unsubscribed and suppressed contacts are excluded.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Subject</p>
              <p className="mt-1 break-words text-sm font-semibold text-white">{check.subject || "—"}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Resend sync</p>
              <p className={`mt-1 text-sm font-semibold ${check.pending_sync ? "text-amber-300" : "text-emerald-300"}`}>{check.pending_sync ? `${check.pending_sync} change${check.pending_sync === 1 ? "" : "s"} pending` : "Up to date"}</p>
              <p className="mt-1 text-[11px] text-gray-500">{check.pending_sync ? "Synced automatically before sending. If that fails, nothing is sent." : "Resend has every confirmation and unsubscribe."}</p>
            </div>
          </div>

          <EmailPreview html={check.html} className="h-[340px]" />

          <fieldset className="space-y-2">
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery</legend>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-200">
              <input type="radio" name="send-mode" checked={mode === "now"} onChange={() => setMode("now")} className="accent-violet-500" />
              Send immediately
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-200">
              <input type="radio" name="send-mode" checked={mode === "later"} onChange={() => setMode("later")} className="accent-violet-500" />
              Schedule for later
            </label>
            {mode === "later" && (
              <div className="pl-6">
                <TextInput type="datetime-local" value={when} min={minWhen} onChange={(e) => setWhen(e.target.value)} aria-label="Send date and time" className="max-w-xs" />
                <p className="mt-1 text-[11px] text-gray-500">Your local time. Scheduled campaigns can be cancelled until they start sending.</p>
              </div>
            )}
          </fieldset>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm text-gray-200">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-0.5 accent-violet-500" />
            <span>
              I have reviewed the subject and preview, and I want to {mode === "now" ? "send" : "schedule"} this email to <strong>{n}</strong> real subscriber{n === 1 ? "" : "s"}. A sent email cannot be recalled.
            </span>
          </label>
        </div>
      )}
    </Dialog>
  );
}

/* ───────────────────────── Editor ───────────────────────── */
function CampaignEditor({ campaignId, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(campaignId ? null : { ...EMPTY, content: STARTER });
  const [meta, setMeta] = useState(null); // saved campaign (id, status, editable)
  const [previewHtml, setPreviewHtml] = useState("");
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(!campaignId);
  const [sending, setSending] = useState(null); // "now" | "later" | null
  const [studies, setStudies] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [device, setDevice] = useState("desktop");
  const textarea = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!campaignId) return undefined;
    let alive = true;
    adminGet(`/admin/newsletter/campaigns/${campaignId}`)
      .then((c) => {
        if (!alive) return;
        setMeta(c);
        setForm({ title: c.title, subject: c.subject, preview_text: c.preview_text || "", content: c.content });
      })
      .catch((err) => {
        toast(adminError(err, "Could not open this campaign."), "error");
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [campaignId, onClose, toast]);

  // Live preview, rendered by the server so it is exactly what subscribers get.
  const content = form?.content;
  const previewText = form?.preview_text;
  useEffect(() => {
    if (content === undefined) return undefined;
    const timer = setTimeout(() => {
      adminPost("/admin/newsletter/campaigns/preview", { content, preview_text: previewText || null })
        .then((data) => setPreviewHtml(data.html))
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [content, previewText]);

  const editable = !meta || meta.editable;
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDirty(true);
  };

  const insert = (before, after = "", placeholder = "") => {
    const el = textarea.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    setForm((f) => ({ ...f, content: next }));
    setDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  const insertBlock = (block) => insert(`\n\n${block}\n\n`);

  const save = async () => {
    if (!form.title.trim()) {
      toast("Give the newsletter a title.", "error");
      return null;
    }
    setBusy("save");
    try {
      const body = { ...form, preview_text: form.preview_text.trim() || null };
      const saved = meta ? await adminPut(`/admin/newsletter/campaigns/${meta.id}`, body) : await adminPost("/admin/newsletter/campaigns", body);
      setMeta(saved);
      setDirty(false);
      onSaved();
      return saved;
    } catch (err) {
      toast(adminError(err, "Could not save the draft."), "error");
      return null;
    } finally {
      setBusy("");
    }
  };

  const saveDraft = async () => {
    if (await save()) toast("Draft saved.", "success");
  };

  const sendTest = async () => {
    const saved = dirty || !meta ? await save() : meta;
    if (!saved) return;
    setBusy("test");
    try {
      const result = await adminPost(`/admin/newsletter/campaigns/${saved.id}/test`);
      toast(`Test email sent to ${result.to} only. Check your inbox.`, "success", 7000);
    } catch (err) {
      toast(adminError(err, "Test email failed."), "error", 0);
    } finally {
      setBusy("");
    }
  };

  const openSend = async (mode) => {
    const saved = dirty || !meta ? await save() : meta;
    if (saved) setSending(mode);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("upload");
    try {
      const asset = await adminUploadImage(file);
      insertBlock(`![${file.name.replace(/\.[^.]+$/, "")}](${asset.url})`);
    } catch (err) {
      toast(adminError(err, "Image upload failed."), "error");
    } finally {
      setBusy("");
    }
  };

  const openStudies = async () => {
    try {
      const data = await adminGet("/admin/case-studies", { status: "published", page_size: 50 });
      setStudies(data.items);
    } catch (err) {
      toast(adminError(err, "Could not load case studies."), "error");
    }
  };

  const insertStudy = (study) => {
    const url = `/case-studies/${study.slug}`;
    insertBlock([`## ${study.title}`, study.cover_image_url ? `\n![${study.title}](${study.cover_image_url})` : "", `\n${study.summary}`, `\n[[button: Read the case study | ${url}]]`].filter(Boolean).join("\n"));
    setStudies(null);
  };

  const tools = [
    { icon: Heading1, label: "Heading", run: () => insert("\n\n# ", "\n\n", "Heading") },
    { icon: Heading2, label: "Subheading", run: () => insert("\n\n## ", "\n\n", "Subheading") },
    { icon: Pilcrow, label: "Paragraph", run: () => insert("\n\n", "\n\n", "Write a new paragraph here.") },
    { icon: Bold, label: "Bold", run: () => insert("**", "**", "bold text") },
    { icon: Italic, label: "Italic", run: () => insert("*", "*", "italic text") },
    { icon: List, label: "Bullet list", run: () => insert("\n\n- ", "\n- Second point\n- Third point\n\n", "First point") },
    { icon: LinkIcon, label: "Link", run: () => insert("[", "](https://)", "link text") },
    { icon: ImageIcon, label: "Image URL", run: () => insertBlock("![Describe the image](https://)") },
    { icon: Upload, label: "Upload image", run: () => fileInput.current?.click() },
    { icon: MousePointerClick, label: "Button", run: () => insertBlock("[[button: Button label | https://www.meetchetanpura.in]]") },
    { icon: Minus, label: "Divider", run: () => insertBlock("---") },
    { icon: BookOpen, label: "Case study", run: openStudies },
  ];

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        size="xl"
        title={meta ? (editable ? `Edit: ${meta.title}` : meta.title) : "New newsletter"}
        footer={
          editable ? (
            <>
              <span className="mr-auto text-[11px] text-gray-500">{dirty ? "Unsaved changes" : meta ? "All changes saved" : ""}</span>
              <Button icon={Eye} onClick={() => setShowPreview((v) => !v)} className="lg:hidden">
                {showPreview ? "Editor" : "Preview"}
              </Button>
              <Button icon={Save} onClick={saveDraft} loading={busy === "save"}>
                Save draft
              </Button>
              <Button icon={FlaskConical} onClick={sendTest} loading={busy === "test"} title="Sends only to your admin email">
                Send test to me
              </Button>
              <Button icon={CalendarClock} onClick={() => openSend("later")}>
                Schedule…
              </Button>
              <Button variant="primary" icon={Send} onClick={() => openSend("now")}>
                Review &amp; send…
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Close</Button>
          )
        }
      >
        {!form ? (
          <SkeletonRows rows={6} columns={2} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={`space-y-4 ${showPreview ? "hidden lg:block" : ""}`}>
              {!editable && (
                <Notice tone="cyan">
                  This campaign is <strong>{meta.status}</strong> and is kept as a record. Duplicate it from the list to reuse the content.
                </Notice>
              )}
              {meta?.last_error && meta.status === "failed" && <Notice tone="rose">Last attempt failed: {meta.last_error}</Notice>}
              <Field label="Newsletter title" hint="Internal name — subscribers do not see it.">
                <TextInput value={form.title} onChange={set("title")} maxLength={200} disabled={!editable} placeholder="November update" />
              </Field>
              <Field label="Email subject">
                <TextInput value={form.subject} onChange={set("subject")} maxLength={200} disabled={!editable} placeholder="What I built this month" />
              </Field>
              <Field label="Preview text" hint="Optional. Shown next to the subject in most inboxes.">
                <TextInput value={form.preview_text} onChange={set("preview_text")} maxLength={200} disabled={!editable} />
              </Field>
              <div>
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400">Content (Markdown)</span>
                {editable && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {tools.map(({ icon: Icon, label, run }) => (
                      <button key={label} type="button" onClick={() => run()} title={label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-gray-300 hover:border-violet-500/40 hover:text-white">
                        <Icon size={13} aria-hidden />
                        {label}
                      </button>
                    ))}
                    <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={upload} />
                  </div>
                )}
                <TextArea ref={textarea} mono rows={18} value={form.content} onChange={set("content")} disabled={!editable} aria-label="Email content in Markdown" spellCheck />
                <p className="mt-1 text-[11px] text-gray-500">
                  {busy === "upload" ? "Uploading image…" : "An unsubscribe link is added to the footer of every campaign automatically."}
                </p>
              </div>
            </div>
            <div className={`${showPreview ? "" : "hidden lg:block"}`}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email preview</span>
                <div role="group" aria-label="Preview size" className="flex rounded-lg border border-white/10 p-0.5">
                  {[
                    ["desktop", Monitor, "Desktop"],
                    ["mobile", Smartphone, "Mobile"],
                  ].map(([id, Icon, label]) => (
                    <button key={id} type="button" onClick={() => setDevice(id)} aria-pressed={device === id} className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${device === id ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-200"}`}>
                      <Icon size={13} aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`mx-auto transition-[max-width] duration-200 ${device === "mobile" ? "max-w-[390px]" : "max-w-full"}`}>
                <EmailPreview html={previewHtml} className="h-[640px]" />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500">Rendered by the server — exactly what subscribers receive.</p>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={!!studies} onClose={() => setStudies(null)} title="Feature a case study" size="sm">
        {studies?.length === 0 ? (
          <p className="text-sm text-gray-400">No published case studies yet. Publish one in the Case Study Manager first.</p>
        ) : (
          <ul className="space-y-2">
            {studies?.map((study) => (
              <li key={study.id}>
                <button type="button" onClick={() => insertStudy(study)} className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-violet-500/40">
                  <span className="block text-sm font-semibold text-white">{study.title}</span>
                  <span className="mt-0.5 block text-[11px] text-gray-500">{study.category}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dialog>

      {sending && meta && (
        <SendDialog
          campaign={meta}
          initialMode={sending}
          onClose={() => setSending(null)}
          onDone={(failed) => {
            setSending(null);
            onSaved();
            if (!failed) onClose();
          }}
        />
      )}
    </>
  );
}

/* ───────────────────────── List ───────────────────────── */
const STATUS_TABS = [
  ["", "All", "all"],
  ["draft", "Drafts", "draft"],
  ["scheduled", "Scheduled", "scheduled"],
  ["sending", "Sending", "sending"],
  ["sent", "Sent", "sent"],
  ["failed", "Failed", "failed"],
  ["cancelled", "Cancelled", "cancelled"],
];

export default function CampaignsPanel({ openCampaignId, onOpened, createNew = false, onEditorClosed, onNavigate }) {
  const { toast } = useToast();
  const [query, setQuery] = useState({ page: 1, status: "", search: "" });
  const [searchText, setSearchText] = useState("");
  const { page } = query;
  const setPage = (next) => setQuery((q) => ({ ...q, page: next }));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(createNew ? { id: null } : null); // { id | null }
  const [confirm, setConfirm] = useState(null); // { type, campaign }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await adminGet("/admin/newsletter/campaigns", { page: query.page, page_size: PAGE_SIZE, status: query.status || undefined, search: query.search || undefined }));
      setFailed(false);
    } catch (err) {
      setFailed(true);
      toast(adminError(err, "Could not load campaigns."), "error");
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Opened from "Create Newsletter from Case Study".
  useEffect(() => {
    if (!openCampaignId) return;
    const timer = setTimeout(() => {
      setEditing({ id: openCampaignId });
      onOpened?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [openCampaignId, onOpened]);

  const closeEditor = useCallback(() => {
    setEditing(null);
    onEditorClosed?.();
  }, [onEditorClosed]);
  const filtered = Boolean(query.status || query.search);

  const act = async (fn, success) => {
    setBusy(true);
    try {
      await fn();
      if (success) toast(success, "success");
      setConfirm(null);
      load();
    } catch (err) {
      toast(adminError(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const items = data?.items || [];
  return (
    <div className="mt-8 space-y-6">
      <Panel
        title="Newsletter campaigns"
        description="Write, preview, test and send. Nothing reaches subscribers without your confirmation."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: null })}>
            New newsletter
          </Button>
        }
      >
        <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            {STATUS_TABS.filter(([id, , key]) => !id || id === query.status || data?.counts?.[key]).map(([id, label, key]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={query.status === id}
                onClick={() => setQuery((q) => ({ ...q, page: 1, status: id }))}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${query.status === id ? "border-violet-500/50 bg-violet-500/15 text-white" : "border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-100"}`}
              >
                {label}
                <span className="ml-1.5 tabular-nums text-gray-500">{data?.counts?.[key] ?? 0}</span>
              </button>
            ))}
          </div>
          <form
            role="search"
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery((q) => ({ ...q, page: 1, search: searchText.trim() }));
            }}
          >
            <div className="relative flex-1 lg:w-64">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden />
              <TextInput value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search title or subject…" aria-label="Search campaigns" className="!py-2 pl-10 text-xs" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {loading && !data ? (
          <SkeletonRows />
        ) : failed && !data ? (
          <EmptyState
            icon={RefreshCw}
            title="Campaigns could not be loaded"
            action={
              <Button icon={RefreshCw} onClick={load}>
                Try again
              </Button>
            }
          >
            The server did not answer. No campaign was changed.
          </EmptyState>
        ) : items.length === 0 && filtered ? (
          <EmptyState icon={Search} title="No campaigns match">
            Try a different search or status.
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No newsletters yet"
            action={
              <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: null })}>
                Write your first newsletter
              </Button>
            }
          >
            Start from a blank draft, or create one from a published case study in the Case Study Manager.
          </EmptyState>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`}>
            <table className="w-full min-w-[880px] border-collapse text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Newsletter</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Recipients</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Scheduled / sent</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((c) => {
                  const editable = c.status === "draft" || c.status === "failed";
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="max-w-[320px] px-5 py-3.5">
                        <button type="button" onClick={() => setEditing({ id: c.id })} className="block max-w-full truncate text-left font-semibold text-white hover:text-violet-300">
                          {c.title}
                        </button>
                        <span className="block truncate text-[11px] text-gray-500">{c.subject || "No subject yet"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5 tabular-nums">{c.recipient_count ?? "—"}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">{formatDate(c.created_at)}</td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">
                        {c.status === "scheduled" ? `Scheduled ${formatDate(c.scheduled_at, true)}` : c.sent_at ? `Sent ${formatDate(c.sent_at, true)}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" icon={editable ? Pencil : Eye} onClick={() => setEditing({ id: c.id })}>
                            {editable ? "Edit" : "View"}
                          </Button>
                          {(c.status === "sent" || c.status === "sending") && onNavigate && (
                            <Button variant="ghost" onClick={() => onNavigate("email-analytics")}>
                              Results
                            </Button>
                          )}
                          {(c.status === "scheduled" || c.status === "sending") && (
                            <Button variant="ghost" icon={RefreshCw} onClick={() => act(() => adminPost(`/admin/newsletter/campaigns/${c.id}/refresh`), "Status refreshed from Resend.")} title="Refresh status from Resend" />
                          )}
                          {c.status === "scheduled" && (
                            <Button variant="ghost" icon={Ban} onClick={() => setConfirm({ type: "cancel", campaign: c })}>
                              Cancel
                            </Button>
                          )}
                          <Button variant="ghost" icon={Copy} onClick={() => act(() => adminPost(`/admin/newsletter/campaigns/${c.id}/duplicate`), "Copied into a new draft.")} title="Duplicate as a new draft" />
                          {(editable || c.status === "cancelled") && <Button variant="ghost" icon={Trash2} onClick={() => setConfirm({ type: "delete", campaign: c })} title="Delete" />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onChange={setPage} />}
      </Panel>

      {editing && <CampaignEditor key={editing.id ?? "new"} campaignId={editing.id} onClose={closeEditor} onSaved={load} />}

      <ConfirmDialog
        open={confirm?.type === "cancel"}
        onClose={() => setConfirm(null)}
        loading={busy}
        danger
        title="Cancel this scheduled campaign?"
        confirmLabel="Cancel campaign"
        onConfirm={() => act(() => adminPost(`/admin/newsletter/campaigns/${confirm.campaign.id}/cancel`), "Scheduled campaign cancelled. Nothing was sent.")}
      >
        “{confirm?.campaign.title}” will not be sent. You can duplicate it into a new draft afterwards.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm?.type === "delete"}
        onClose={() => setConfirm(null)}
        loading={busy}
        danger
        title="Delete this newsletter?"
        confirmLabel="Delete"
        onConfirm={() => act(() => adminDelete(`/admin/newsletter/campaigns/${confirm.campaign.id}`), "Newsletter deleted.")}
      >
        “{confirm?.campaign.title}” will be permanently deleted.
      </ConfirmDialog>
    </div>
  );
}
