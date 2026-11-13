/**
 * Admin Control Console — newsletter workspace.
 *
 * Every API module is mocked, so no request leaves the test process (src/test/setup.js
 * additionally blocks fetch/XHR). No real subscriber data is used.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const toast = vi.fn();
vi.mock("../../../hooks/useToast", () => ({ useToast: () => ({ toast }) }));
vi.mock("../../../lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  apiErrorMessage: (err, fallback) => err?.message || fallback,
}));
vi.mock("../../../lib/adminApi", () => ({
  adminGet: vi.fn(),
  adminPost: vi.fn(),
  adminPut: vi.fn(),
  adminPatch: vi.fn(),
  adminDelete: vi.fn(),
  adminDownload: vi.fn(),
  adminUploadImage: vi.fn(),
  adminError: (err, fallback = "Something went wrong.") => err?.message || fallback,
}));

import { api } from "../../../lib/api";
import { adminGet, adminPost } from "../../../lib/adminApi";
import AdminDashboard from "../AdminDashboard";

const OVERVIEW = {
  subscribers: { total: 12, active: 7, pending: 3, unsubscribed: 1, suppressed: 1 },
  campaigns: { total: 4, sent: 1, completed: 1, sending: 0, scheduled: 1, draft: 2, failed: 0, cancelled: 0 },
  case_studies: { published: 1, draft: 0 },
  email: { events_recorded: false, delivery_rate: null, open_rate: null, click_rate: null, bounce_rate: null },
  growth: [
    { date: "2026-11-11", signups: 0, confirmed: 0, unsubscribed: 0 },
    { date: "2026-11-12", signups: 2, confirmed: 1, unsubscribed: 0 },
  ],
  recent_campaigns: [{ id: 1, title: "November update", status: "draft", updated_at: "2026-11-12T10:00:00Z" }],
  recent_subscribers: [{ id: 5, email: "reader@example.org", status: "pending", activity: "signed_up", at: "2026-11-12T10:00:00Z" }],
  recent_events: [],
  integration: { resend_configured: true, segment_configured: true, webhook_configured: true, last_webhook_at: null, pending_sync: 2 },
};
const SUBSCRIBERS = {
  items: [
    { id: 1, email: "active@example.org", status: "active", consent_given: true, consent_timestamp: "2026-11-01T10:00:00Z", subscription_source: "website-footer", created_at: "2026-11-01T10:00:00Z", confirmed_at: "2026-11-01T10:05:00Z", in_resend: true, resend_sync_pending: false },
    { id: 2, email: "waiting@example.org", status: "pending", consent_given: true, consent_timestamp: "2026-11-02T10:00:00Z", subscription_source: "website-footer", created_at: "2026-11-02T10:00:00Z", in_resend: false, resend_sync_pending: false },
  ],
  total: 45,
  page: 1,
  page_size: 20,
  counts: { total: 45, active: 30, pending: 10, unsubscribed: 4, suppressed: 1 },
};
const CAMPAIGNS = {
  items: [{ id: 9, title: "RAG deep dive", subject: "How retrieval works", status: "draft", recipient_count: null, created_at: "2026-11-10T10:00:00Z", updated_at: "2026-11-10T10:00:00Z" }],
  total: 1,
  page: 1,
  page_size: 20,
  counts: { all: 3, draft: 2, sent: 1 },
};
const ANALYTICS = { webhook_configured: true, last_webhook_at: null, totals: { recipients: 0 }, campaigns: [] };
const SETTINGS = {
  resend_configured: true, sender: "Meet <hello@example.org>", sender_configured: true, admin_email: "admin@example.org", segment_configured: true,
  webhook_secret_configured: true, webhook_url: "https://api.example.org/webhooks/resend", last_webhook_at: null, double_opt_in: true, confirmation_hours: 48,
  app_base_url: "https://www.example.org", api_base_url: "https://api.example.org", dedicated_signing_secret: true, postal_address_configured: false, pending_sync: 0,
};

function mockApi(overrides = {}) {
  adminGet.mockImplementation(async (url, params) => {
    for (const [prefix, value] of Object.entries(overrides)) {
      if (url.startsWith(prefix)) return typeof value === "function" ? value(url, params) : value;
    }
    if (url === "/admin/newsletter/overview") return OVERVIEW;
    if (url === "/admin/newsletter/analytics") return ANALYTICS;
    if (url === "/admin/newsletter/settings") return SETTINGS;
    if (url === "/admin/newsletter/subscribers") return SUBSCRIBERS;
    if (url === "/admin/newsletter/campaigns") return CAMPAIGNS;
    if (url === "/admin/case-studies") return { items: [], total: 0, page: 1, page_size: 20, categories: [] };
    throw new Error(`Unmocked GET ${url}`);
  });
  adminPost.mockImplementation(async (url, body) => {
    if (url === "/admin/newsletter/campaigns/preview") return { html: "<p>preview</p>" };
    if (url === "/admin/newsletter/campaigns") return { id: 21, status: "draft", editable: true, ...body };
    if (url === "/admin/newsletter/campaigns/21/test") return { sent: true, to: "admin@example.org" };
    if (url === "/admin/newsletter/campaigns/21/preview") return { subject: body?.subject || "Hello", html: "<p>final</p>", eligible_recipients: 7, pending_sync: 0, ready: true, problems: [] };
    throw new Error(`Unmocked POST ${url}`);
  });
  api.get.mockImplementation(async (url) => {
    if (url === "/admin/contacts") return { data: { contacts: [{ id: 1, full_name: "Asha Client", service: "AI Agent", inquiry_type: "hiring", notification_status: "sent", country: "India", created_at: "2026-11-01T10:00:00Z", status: "new" }], total: 1 } };
    if (url === "/analytics/summary") return { data: { total_views: 10, unique_visitors: 4, conversion_rate: 2, countries: [], browsers: [], devices: [] } };
    throw new Error(`Unmocked api.get ${url}`);
  });
}

const sidebar = () => within(screen.getByTestId("desktop-sidebar"));
const heading = (name) => screen.findByRole("heading", { level: 1, name });
function renderAt(hash = "") {
  window.history.replaceState(null, "", `/admin${hash}`);
  return render(<AdminDashboard />);
}

beforeEach(() => {
  toast.mockClear();
  localStorage.setItem("adminToken", "test-token");
  localStorage.setItem("adminName", "Meet");
  mockApi();
});

describe("sidebar navigation", () => {
  it("shows Inquiries, Site Analytics and the Newsletter group with all seven sections", async () => {
    renderAt();
    await heading("Inquiries");
    const nav = sidebar();
    expect(nav.getByText("Control Console")).toBeInTheDocument();
    for (const label of ["Inquiries", "Site Analytics", "Newsletter Overview", "Subscribers", "Campaigns", "Create Newsletter", "Case Studies", "Email Analytics", "Newsletter Settings"]) {
      expect(nav.getByRole("button", { name: label })).toBeInTheDocument();
    }
    expect(nav.getByRole("button", { name: "Inquiries" })).toHaveAttribute("aria-current", "page");
  });

  it("opens every newsletter section, marks it active and keeps it in the URL", async () => {
    const user = userEvent.setup();
    renderAt();
    await heading("Inquiries");
    const sections = [
      ["Newsletter Overview", "#newsletter"],
      ["Subscribers", "#subscribers"],
      ["Campaigns", "#campaigns"],
      ["Case Studies", "#case-studies"],
      ["Email Analytics", "#email-analytics"],
      ["Newsletter Settings", "#settings"],
    ];
    for (const [label, hash] of sections) {
      await user.click(sidebar().getByRole("button", { name: label }));
      await heading(label);
      expect(window.location.hash).toBe(hash);
      expect(sidebar().getByRole("button", { name: label })).toHaveAttribute("aria-current", "page");
    }
  });

  it("restores the section from the URL on a direct visit or refresh", async () => {
    renderAt("#subscribers");
    await heading("Subscribers");
    expect(await screen.findByText("active@example.org")).toBeInTheDocument();
    expect(adminGet).toHaveBeenCalledWith("/admin/newsletter/subscribers", expect.objectContaining({ page: 1 }));
  });

  it("falls back to Inquiries for an unknown hash and follows Back/Forward", async () => {
    const user = userEvent.setup();
    renderAt("#not-a-section");
    await heading("Inquiries");
    await user.click(sidebar().getByRole("button", { name: "Subscribers" }));
    await heading("Subscribers");
    window.history.replaceState(null, "", "/admin#settings");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await heading("Newsletter Settings");
  });

  it("collapses and expands the Newsletter group, but never hides the active section", async () => {
    const user = userEvent.setup();
    renderAt();
    await heading("Inquiries");
    const toggle = sidebar().getByRole("button", { name: "Newsletter" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(sidebar().queryByRole("button", { name: "Subscribers" })).not.toBeInTheDocument());
    await user.click(toggle);
    await user.click(await sidebar().findByRole("button", { name: "Subscribers" }));
    await heading("Subscribers");
    await user.click(toggle); // on a newsletter page the group stays open
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses the desktop sidebar to icons and remembers it", async () => {
    const user = userEvent.setup();
    renderAt();
    await heading("Inquiries");
    await user.click(sidebar().getByRole("button", { name: "Collapse sidebar" }));
    expect(sidebar().getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
    expect(sidebar().getByRole("button", { name: "Subscribers" })).toHaveAttribute("title", "Subscribers");
    expect(localStorage.getItem("adminSidebarCollapsed")).toBe("1");
  });

  it("works as a drawer on mobile: opens, navigates, then closes", async () => {
    const user = userEvent.setup();
    renderAt();
    await heading("Inquiries");
    expect(screen.queryByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const drawer = await screen.findByRole("dialog", { name: "Navigation" });
    await user.click(within(drawer).getByRole("button", { name: "Email Analytics" }));
    await heading("Email Analytics");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    await screen.findByRole("dialog", { name: "Navigation" });
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument());
  });

  it("keeps the existing Inquiries and Site Analytics sections working", async () => {
    const user = userEvent.setup();
    renderAt();
    expect(await screen.findByText("Asha Client")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send test email/ })).toBeInTheDocument();
    await user.click(sidebar().getByRole("button", { name: "Site Analytics" }));
    await heading("Site Analytics");
    expect(await screen.findByText("Traffic by Country")).toBeInTheDocument();
  });
});

describe("newsletter overview", () => {
  it("shows live counts and a dash — not zero — for rates with no webhook data", async () => {
    renderAt("#newsletter");
    await heading("Newsletter Overview");
    expect(await screen.findByText("reader@example.org")).toBeInTheDocument();
    const card = (label) => screen.getAllByText(label).map((el) => el.closest("div.rounded-2xl")).find(Boolean);
    expect(within(card("Suppressed")).getByText("1")).toBeInTheDocument();
    expect(within(card("Delivery rate")).getByText("—")).toBeInTheDocument();
    expect(within(card("Open rate")).getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/waiting to sync with Resend/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /sign-ups and confirmations/ })).toBeInTheDocument();
    expect(screen.getByText("No campaign results yet")).toBeInTheDocument();
    expect(screen.getByText("No email events yet")).toBeInTheDocument();
  });

  it("shows skeletons while loading, then an error state with a working retry", async () => {
    let fail = true;
    mockApi({ "/admin/newsletter/overview": () => (fail ? Promise.reject(new Error("Network down")) : OVERVIEW) });
    const user = userEvent.setup();
    renderAt("#newsletter");
    expect(screen.getAllByLabelText("Loading").length).toBeGreaterThan(0);
    expect(await screen.findByText("The overview could not be loaded")).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith("Network down", "error");
    fail = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("reader@example.org")).toBeInTheDocument();
  });
});

describe("subscribers", () => {
  it("searches, filters by status and paginates through the API", async () => {
    const user = userEvent.setup();
    renderAt("#subscribers");
    expect(await screen.findByText("waiting@example.org")).toBeInTheDocument();
    expect(screen.getByText("Synced")).toBeInTheDocument();
    expect(screen.getByText("Not in Resend")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Search by email" }), "active@");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(adminGet).toHaveBeenLastCalledWith("/admin/newsletter/subscribers", expect.objectContaining({ search: "active@", page: 1 })));

    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by status" }), "pending");
    await waitFor(() => expect(adminGet).toHaveBeenLastCalledWith("/admin/newsletter/subscribers", expect.objectContaining({ status: "pending", search: "active@" })));

    await user.click(screen.getByRole("button", { name: /Next/ }));
    await waitFor(() => expect(adminGet).toHaveBeenLastCalledWith("/admin/newsletter/subscribers", expect.objectContaining({ page: 2 })));
  });
});

describe("campaigns and the newsletter editor", () => {
  it("filters and searches the campaign list", async () => {
    const user = userEvent.setup();
    renderAt("#campaigns");
    expect(await screen.findByText("RAG deep dive")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: /Drafts/ }));
    await waitFor(() => expect(adminGet).toHaveBeenLastCalledWith("/admin/newsletter/campaigns", expect.objectContaining({ status: "draft" })));
    await user.type(screen.getByRole("textbox", { name: "Search campaigns" }), "rag");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await waitFor(() => expect(adminGet).toHaveBeenLastCalledWith("/admin/newsletter/campaigns", expect.objectContaining({ search: "rag", status: "draft" })));
  });

  it("Create Newsletter opens the editor with formatting tools and a server-rendered preview", async () => {
    renderAt("#create-newsletter");
    const editor = await screen.findByRole("dialog", { name: "New newsletter" });
    for (const tool of ["Heading", "Subheading", "Paragraph", "Bold", "Italic", "Bullet list", "Link", "Upload image", "Button", "Divider", "Case study"]) {
      expect(within(editor).getByRole("button", { name: tool })).toBeInTheDocument();
    }
    expect(within(editor).getByRole("button", { name: "Mobile" })).toHaveAttribute("aria-pressed", "false");
    await waitFor(() => expect(adminPost).toHaveBeenCalledWith("/admin/newsletter/campaigns/preview", expect.objectContaining({ content: expect.any(String) })));
    expect(within(editor).getByTitle("Email preview")).toHaveAttribute("sandbox", "");
  });

  it("saves a draft, sends a test to the admin only, and never sends without explicit review", async () => {
    const user = userEvent.setup();
    renderAt("#create-newsletter");
    const editor = await screen.findByRole("dialog", { name: "New newsletter" });

    await user.click(within(editor).getByRole("button", { name: "Save draft" }));
    expect(toast).toHaveBeenCalledWith("Give the newsletter a title.", "error");
    expect(adminPost).not.toHaveBeenCalledWith("/admin/newsletter/campaigns", expect.anything());

    await user.type(within(editor).getByPlaceholderText("November update"), "Launch notes");
    await user.type(within(editor).getByPlaceholderText("What I built this month"), "Hello");
    await user.click(within(editor).getByRole("button", { name: "Save draft" }));
    await waitFor(() => expect(adminPost).toHaveBeenCalledWith("/admin/newsletter/campaigns", expect.objectContaining({ title: "Launch notes", subject: "Hello" })));
    await waitFor(() => expect(toast).toHaveBeenCalledWith("Draft saved.", "success"));

    await user.click(screen.getByRole("button", { name: /Send test to me/ }));
    await waitFor(() => expect(adminPost).toHaveBeenCalledWith("/admin/newsletter/campaigns/21/test"));
    expect(toast).toHaveBeenCalledWith(expect.stringContaining("admin@example.org only"), "success", 7000);

    await user.click(screen.getByRole("button", { name: /Review & send/ }));
    const review = await screen.findByRole("dialog", { name: "Review and send" });
    const send = await within(review).findByRole("button", { name: /Send now to 7 subscribers/ });
    expect(send).toBeDisabled(); // the confirmation box is not ticked
    expect(within(review).getByText("Up to date")).toBeInTheDocument();
    await user.click(within(review).getByRole("radio", { name: "Schedule for later" }));
    expect(within(review).getByLabelText("Send date and time")).toBeInTheDocument();
    await user.click(within(review).getByRole("button", { name: "Cancel" }));

    const sendCalls = adminPost.mock.calls.filter(([url]) => /\/(send|schedule)$/.test(url));
    expect(sendCalls).toEqual([]);
  });
});

describe("settings", () => {
  it("shows configuration status and URLs but no secret values", async () => {
    renderAt("#settings");
    await heading("Newsletter Settings");
    expect(await screen.findByText("https://api.example.org/webhooks/resend")).toBeInTheDocument();
    for (const label of ["Resend API key", "Sender email", "Newsletter segment", "Resend webhook", "Last webhook received", "Double opt-in", "Confirmation email", "Website URL", "Backend API URL", "Contact synchronisation", "Postal address in footer"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(document.body.textContent).not.toMatch(/re_[A-Za-z0-9]{8,}|whsec_/);
  });
});
