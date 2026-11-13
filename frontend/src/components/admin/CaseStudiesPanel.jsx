import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ExternalLink, EyeOff, Globe, Mail, Pencil, Plus, Save, Search, Trash2, Upload } from "lucide-react";
import { adminDelete, adminError, adminGet, adminPost, adminPut, adminUploadImage } from "../../lib/adminApi";
import { useToast } from "../../hooks/useToast";
import { formatDate, splitLines } from "./helpers";
import { Badge, Button, ConfirmDialog, Dialog, EmptyState, Field, Notice, Pagination, Panel, Select, SkeletonRows, StatusBadge, TextArea, TextInput } from "./ui";

const PAGE_SIZE = 20;

const SECTIONS = [
  ["problem_statement", "Problem statement"],
  ["project_overview", "Project overview"],
  ["solution", "Solution"],
  ["technical_architecture", "Technical architecture"],
  ["implementation", "Implementation"],
  ["results", "Results"],
  ["challenges", "Challenges"],
  ["lessons_learned", "Lessons learned"],
];

const EMPTY = {
  title: "",
  slug: "",
  summary: "",
  category: "",
  cover_image_url: "",
  ...Object.fromEntries(SECTIONS.map(([key]) => [key, ""])),
  architecture_steps: "",
  technologies: "",
  key_features: "",
  screenshots: "",
  github_url: "",
  live_demo_url: "",
  seo_title: "",
  seo_description: "",
  featured: false,
};

/** API detail -> editable form (lists become one item per line). */
function toForm(study) {
  return {
    title: study.title || "",
    slug: study.slug || "",
    summary: study.summary || "",
    category: study.category || "",
    cover_image_url: study.cover_image_url || "",
    ...Object.fromEntries(SECTIONS.map(([key]) => [key, study.source?.[key] || ""])),
    architecture_steps: (study.architecture_steps || []).join("\n"),
    technologies: (study.technologies || []).join("\n"),
    key_features: (study.key_features || []).join("\n"),
    screenshots: (study.screenshots || []).map((s) => (s.alt ? `${s.src} | ${s.alt}` : s.src)).join("\n"),
    github_url: study.github_url || "",
    live_demo_url: study.live_demo_url || "",
    seo_title: study.seo_title_raw || "",
    seo_description: study.seo_description_raw || "",
    featured: !!study.featured,
  };
}

/** Editable form -> CaseStudyWrite payload. */
function toPayload(form) {
  const orNull = (v) => v.trim() || null;
  return {
    title: form.title.trim(),
    slug: orNull(form.slug),
    summary: form.summary.trim(),
    category: orNull(form.category),
    cover_image_url: orNull(form.cover_image_url),
    ...Object.fromEntries(SECTIONS.map(([key]) => [key, form[key]])),
    architecture_steps: splitLines(form.architecture_steps),
    technologies: splitLines(form.technologies),
    key_features: splitLines(form.key_features),
    screenshots: splitLines(form.screenshots).map((line) => {
      const [src, ...alt] = line.split("|");
      return { src: src.trim(), alt: alt.join("|").trim() };
    }),
    github_url: orNull(form.github_url),
    live_demo_url: orNull(form.live_demo_url),
    seo_title: orNull(form.seo_title),
    seo_description: orNull(form.seo_description),
    featured: form.featured,
  };
}

/* ───────────────────────── Editor ───────────────────────── */
function CaseStudyEditor({ studyId, categories, onClose, onSaved, onCreateNewsletter }) {
  const { toast } = useToast();
  const [form, setForm] = useState(studyId ? null : { ...EMPTY });
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState("");
  const [dirty, setDirty] = useState(false);
  const coverInput = useRef(null);
  const shotInput = useRef(null);

  useEffect(() => {
    if (!studyId) return undefined;
    let alive = true;
    adminGet(`/admin/case-studies/${studyId}`)
      .then((study) => {
        if (!alive) return;
        setMeta(study);
        setForm(toForm(study));
      })
      .catch((err) => {
        toast(adminError(err, "Could not open this case study."), "error");
        onClose();
      });
    return () => {
      alive = false;
    };
  }, [studyId, onClose, toast]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast("Give the case study a title.", "error");
      return null;
    }
    setBusy("save");
    try {
      const body = toPayload(form);
      const saved = meta ? await adminPut(`/admin/case-studies/${meta.id}`, body) : await adminPost("/admin/case-studies", body);
      setMeta(saved);
      setForm(toForm(saved));
      setDirty(false);
      onSaved();
      return saved;
    } catch (err) {
      toast(adminError(err, "Could not save the case study."), "error");
      return null;
    } finally {
      setBusy("");
    }
  };

  const togglePublish = async () => {
    const saved = dirty || !meta ? await save() : meta;
    if (!saved) return;
    const publishing = saved.status !== "published";
    setBusy("publish");
    try {
      const result = await adminPost(`/admin/case-studies/${saved.id}/${publishing ? "publish" : "unpublish"}`);
      setMeta(result);
      onSaved();
      toast(publishing ? "Published. No email was sent — create a newsletter separately if you want one." : "Moved back to draft. The public page is hidden.", "success", 7000);
    } catch (err) {
      toast(adminError(err), "error", 0);
    } finally {
      setBusy("");
    }
  };

  const createNewsletter = async () => {
    setBusy("newsletter");
    try {
      const result = await adminPost(`/admin/case-studies/${meta.id}/newsletter`);
      toast("Newsletter draft created. Review it before sending.", "success");
      onCreateNewsletter(result.campaign_id);
    } catch (err) {
      toast(adminError(err), "error");
    } finally {
      setBusy("");
    }
  };

  const upload = (target) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("upload");
    try {
      const asset = await adminUploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "");
      setForm((f) =>
        target === "cover"
          ? { ...f, cover_image_url: asset.url }
          : { ...f, screenshots: [f.screenshots.trim(), `${asset.url} | ${alt}`].filter(Boolean).join("\n") }
      );
      setDirty(true);
    } catch (err) {
      toast(adminError(err, "Image upload failed."), "error");
    } finally {
      setBusy("");
    }
  };

  const published = meta?.status === "published";
  return (
    <Dialog
      open
      onClose={onClose}
      size="xl"
      title={meta ? `Edit: ${meta.title}` : "New case study"}
      footer={
        <>
          <span className="mr-auto text-[11px] text-gray-500">{dirty ? "Unsaved changes" : meta ? "All changes saved" : ""}</span>
          {published && (
            <>
              <a href={`/case-studies/${meta.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:border-white/25 hover:text-white">
                <ExternalLink size={14} aria-hidden /> View page
              </a>
              <Button icon={Mail} onClick={createNewsletter} loading={busy === "newsletter"} disabled={dirty} title={dirty ? "Save first" : "Creates a draft only — nothing is sent"}>
                Create newsletter draft
              </Button>
            </>
          )}
          <Button icon={Save} onClick={save} loading={busy === "save"}>
            Save
          </Button>
          <Button variant={published ? "secondary" : "primary"} icon={published ? EyeOff : Globe} onClick={togglePublish} loading={busy === "publish"}>
            {published ? "Unpublish" : "Publish"}
          </Button>
        </>
      }
    >
      {!form ? (
        <SkeletonRows rows={8} columns={2} />
      ) : (
        <div className="space-y-6">
          {meta && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
              <StatusBadge status={meta.status} />
              {meta.published_at && <span>Published {formatDate(meta.published_at)}</span>}
              <span>· Updated {formatDate(meta.updated_at, true)}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <TextInput value={form.title} onChange={set("title")} maxLength={200} placeholder="Multi-agent research assistant" />
            </Field>
            <Field label="URL slug" hint="Optional. Generated from the title when empty.">
              <TextInput value={form.slug} onChange={set("slug")} maxLength={220} placeholder="multi-agent-research-assistant" />
            </Field>
            <Field label="Category" hint="Required before publishing.">
              <Select value={form.category} onChange={set("category")}>
                <option value="">Choose a category…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cover image URL">
              <div className="flex gap-2">
                <TextInput value={form.cover_image_url} onChange={set("cover_image_url")} maxLength={500} placeholder="https:// or /projects/…" />
                <Button icon={Upload} onClick={() => coverInput.current?.click()} loading={busy === "upload"} title="Upload an image (max 2 MB)" />
                <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={upload("cover")} />
              </div>
            </Field>
          </div>

          <Field label="Summary" hint="Required before publishing. Shown on cards and in link previews.">
            <TextArea rows={3} value={form.summary} onChange={set("summary")} maxLength={2000} />
          </Field>

          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sections (Markdown) — fill at least one</p>
            <div className="grid gap-4 lg:grid-cols-2">
              {SECTIONS.map(([key, label]) => (
                <Field key={key} label={label}>
                  <TextArea mono rows={6} value={form[key]} onChange={set(key)} maxLength={50000} />
                </Field>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Architecture steps" hint="One per line, in order.">
              <TextArea rows={5} value={form.architecture_steps} onChange={set("architecture_steps")} />
            </Field>
            <Field label="Technologies" hint="One per line.">
              <TextArea rows={5} value={form.technologies} onChange={set("technologies")} />
            </Field>
            <Field label="Key features" hint="One per line.">
              <TextArea rows={5} value={form.key_features} onChange={set("key_features")} />
            </Field>
          </div>

          <Field label="Screenshots" hint="One per line: image URL | alt text">
            <div className="space-y-2">
              <TextArea mono rows={3} value={form.screenshots} onChange={set("screenshots")} />
              <Button icon={Upload} onClick={() => shotInput.current?.click()} loading={busy === "upload"}>
                Upload screenshot
              </Button>
              <input ref={shotInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={upload("shot")} />
            </div>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="GitHub link">
              <TextInput value={form.github_url} onChange={set("github_url")} maxLength={500} placeholder="https://github.com/…" />
            </Field>
            <Field label="Live demo link">
              <TextInput value={form.live_demo_url} onChange={set("live_demo_url")} maxLength={500} placeholder="https://…" />
            </Field>
            <Field label="SEO title" hint="Optional. Defaults to the title.">
              <TextInput value={form.seo_title} onChange={set("seo_title")} maxLength={200} />
            </Field>
            <Field label="SEO description" hint="Optional. Defaults to the summary.">
              <TextInput value={form.seo_description} onChange={set("seo_description")} maxLength={320} />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-200">
            <input type="checkbox" checked={form.featured} onChange={set("featured")} className="accent-violet-500" />
            Feature this case study (listed first)
          </label>

          <Notice tone="cyan">Publishing makes the page public but never emails anyone. Newsletters are always a separate, reviewed step.</Notice>
        </div>
      )}
    </Dialog>
  );
}

/* ───────────────────────── List ───────────────────────── */
export default function CaseStudiesPanel({ onCreateNewsletter }) {
  const { toast } = useToast();
  const [query, setQuery] = useState({ page: 1, search: "", status: "" });
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id | null }
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(
        await adminGet("/admin/case-studies", {
          page: query.page,
          page_size: PAGE_SIZE,
          search: query.search || undefined,
          status: query.status || undefined,
        })
      );
    } catch (err) {
      toast(adminError(err, "Could not load case studies."), "error");
    } finally {
      setLoading(false);
    }
  }, [query, toast]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const closeEditor = useCallback(() => setEditing(null), []);

  const remove = async () => {
    setBusy(true);
    try {
      await adminDelete(`/admin/case-studies/${deleting.id}`, { confirm: true });
      toast("Case study deleted.", "success");
      setDeleting(null);
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
        title="Case study manager"
        description="Write project deep-dives for /case-studies. Drafts are never public."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: null })}>
            New case study
          </Button>
        }
      >
        <form
          className="flex flex-col gap-2 border-b border-white/5 px-5 py-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery((q) => ({ ...q, page: 1, search: searchText.trim() }));
          }}
        >
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden />
            <TextInput value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search by title…" className="pl-9" aria-label="Search case studies" />
          </div>
          <Select value={query.status} onChange={(e) => setQuery((q) => ({ ...q, page: 1, status: e.target.value }))} className="sm:max-w-[180px]" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          <Button type="submit">Search</Button>
        </form>

        {loading && !data ? (
          <SkeletonRows />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={query.search || query.status ? "No matching case studies" : "No case studies yet"}
            action={
              <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: null })}>
                Write a case study
              </Button>
            }
          >
            Published case studies appear on the public /case-studies page and can be turned into a newsletter draft.
          </EmptyState>
        ) : (
          <div className={`overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`}>
            <table className="w-full min-w-[720px] border-collapse text-left text-xs text-gray-300">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-3">Case study</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-[340px] px-5 py-3.5">
                      <button type="button" onClick={() => setEditing({ id: s.id })} className="block max-w-full truncate text-left font-semibold text-white hover:text-violet-300">
                        {s.title}
                      </button>
                      <span className="block truncate font-mono text-[11px] text-gray-500">/case-studies/{s.slug}</span>
                    </td>
                    <td className="px-5 py-3.5">{s.category || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        <StatusBadge status={s.status} />
                        {s.featured && <Badge tone="violet">featured</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">{formatDate(s.updated_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" icon={Pencil} onClick={() => setEditing({ id: s.id })}>
                          Edit
                        </Button>
                        {s.status === "published" && (
                          <a href={`/case-studies/${s.slug}`} target="_blank" rel="noreferrer" title="View public page" className="inline-flex items-center rounded-xl px-3 py-2 text-gray-400 hover:bg-white/5 hover:text-white">
                            <ExternalLink size={14} aria-hidden />
                          </a>
                        )}
                        <Button variant="ghost" icon={Trash2} onClick={() => setDeleting(s)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={query.page} pageSize={PAGE_SIZE} total={data.total} onChange={(page) => setQuery((q) => ({ ...q, page }))} />}
      </Panel>

      {editing && (
        <CaseStudyEditor
          key={editing.id ?? "new"}
          studyId={editing.id}
          categories={data?.categories || []}
          onClose={closeEditor}
          onSaved={load}
          onCreateNewsletter={(campaignId) => {
            setEditing(null);
            onCreateNewsletter(campaignId);
          }}
        />
      )}

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} loading={busy} danger title="Delete this case study?" confirmLabel="Delete">
        “{deleting?.title}” will be permanently deleted{deleting?.status === "published" ? " and its public page will stop working" : ""}. Newsletters that featured it are kept.
      </ConfirmDialog>
    </div>
  );
}
