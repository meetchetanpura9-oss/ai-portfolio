/**
 * Single source of truth for personal details shown across the site.
 * Edit here — Navbar, Hero, About, Contact and Footer all read from this file.
 */

// Ignore obvious placeholder values that may still be present in .env files.
const PLACEHOLDER = /yourprofile|your_|example\.com|919876543210/i;
const fromEnv = (value) => (value && !PLACEHOLDER.test(value) ? value.trim() : null);

export const PROFILE = {
  name: "Meet Chetanpura",
  initials: "MC",
  role: "AI/ML & Agentic AI Developer",
  intro:
    "I build intelligent applications, AI-powered systems and autonomous workflows that transform complex problems into practical solutions.",
  location: fromEnv(import.meta.env.VITE_CONTACT_LOCATION) || "Gujarat, India",
  timezone: "IST (UTC+5:30)",
  email: fromEnv(import.meta.env.VITE_CONTACT_EMAIL) || "meetchetanpura9@gmail.com",
  github: fromEnv(import.meta.env.VITE_CONTACT_GITHUB) || "https://github.com/meetchetanpura9-oss",
  linkedin: fromEnv(import.meta.env.VITE_CONTACT_LINKEDIN) || "https://www.linkedin.com/in/meet-chetanpura",
  photo: "/portrait.jpg",
  available: true,
  availability: "Open to AI/ML & Agentic AI opportunities",
  responseTime: "Usually replies within 24–48 hours",
};

/** Strip protocol/www for display: "github.com/meetchetanpura9-oss" */
export const displayUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "agentic", label: "Agentic AI" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];
