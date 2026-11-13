/** Sections of the admin console, shared by the sidebar and the dashboard. */
import { BarChart3, BookOpen, Inbox, LayoutDashboard, LineChart, Send, Settings, SquarePen, Users } from "lucide-react";

export const NEWSLETTER_ITEMS = [
  { id: "newsletter", label: "Newsletter Overview", icon: LayoutDashboard, description: "Subscribers, campaigns and delivery at a glance." },
  { id: "subscribers", label: "Subscribers", icon: Users, description: "Everyone who signed up, with consent and sync status." },
  { id: "campaigns", label: "Campaigns", icon: Send, description: "Drafts, scheduled and sent newsletters." },
  { id: "create-newsletter", label: "Create Newsletter", icon: SquarePen, description: "Write a new newsletter. Nothing is sent without your confirmation." },
  { id: "case-studies", label: "Case Studies", icon: BookOpen, description: "Write and publish case studies, then turn them into newsletter drafts." },
  { id: "email-analytics", label: "Email Analytics", icon: LineChart, description: "Delivery, opens and clicks reported by Resend." },
  { id: "settings", label: "Newsletter Settings", icon: Settings, description: "Resend integration and newsletter configuration status." },
];
export const CONTACT_ITEMS = [
  { id: "submissions", label: "Inquiries", icon: Inbox, description: "Contact form submissions." },
  { id: "analytics", label: "Site Analytics", icon: BarChart3, description: "Visitor traffic for the public site." },
];
export const ALL_SECTIONS = [...CONTACT_ITEMS, ...NEWSLETTER_ITEMS];
export const isNewsletterSection = (id) => NEWSLETTER_ITEMS.some((item) => item.id === id);
