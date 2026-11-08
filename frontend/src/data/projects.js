/**
 * Projects.
 *
 * Every entry uses facts from the CV or the GitHub repository README only.
 * Empty fields are hidden or shown as "coming soon" in the UI, so nothing has
 * to be invented — fill them in as details become available.
 *
 * Field reference
 * ---------------
 * id            unique slug
 * title         project name
 * category      one of PROJECT_CATEGORIES (drives the filter tabs)
 * featured      true → shown in the first screen before "Show all"
 * icon          lucide icon used on the card artwork
 * tone          accent colour token
 * overview      1–2 sentence summary (card + case study)
 * problem       problem statement
 * solution      how the project solves it
 * tech          ["Python", "FastAPI", ...]
 * aiFeatures    ["Lead scoring with an LLM", ...]  (also used for "Key features")
 * architecture  ordered workflow steps for the diagram: ["Client", "API", "Agent", "Database"]
 * screenshots   [{ src: "/projects/doctor-1.png", alt: "Dashboard" }]  (files in public/projects/)
 * github        repository URL or null
 * demo          live demo URL or null
 */
import {
  Stethoscope,
  Dumbbell,
  Building2,
  KanbanSquare,
  Boxes,
  Globe2,
  Bot,
  BarChart3,
  UserRound,
} from "lucide-react";

export const PROJECT_CATEGORIES = ["AI & Agents", "Data & Analytics", "Business Software", "Web & Frontend"];

const GH = "https://github.com/meetchetanpura9-oss";

const empty = {
  category: null,
  featured: false,
  overview: null,
  problem: null,
  solution: null,
  tech: [],
  aiFeatures: [],
  architecture: [],
  screenshots: [],
  github: null,
  demo: null,
};

export const PROJECTS = [
  /* ───────────── AI & Agents ───────────── */
  {
    ...empty,
    id: "b2b-lead-intelligence",
    title: "Global B2B Lead Intelligence & Campaign Automation Engine",
    category: "AI & Agents",
    featured: true,
    icon: Globe2,
    tone: "var(--brand-blue)",
    overview:
      "End-to-end B2B lead discovery, AI qualification, geographic mapping and automated multi-channel outreach for tile and sanitaryware exporters.",
    problem:
      "Exporters entering markets such as Russia and the UAE waste hundreds of hours sifting distributor lists, most scraped companies are not real B2B buyers, and scraping, qualification and outreach live in separate tools.",
    solution:
      "One Streamlit platform that crawls websites for contacts, scores each lead 0–100 with LLMs, plots leads on an interactive map and schedules AI-personalised outreach across email and messaging channels.",
    tech: ["Python", "Streamlit", "Gemini API", "Groq", "SQLite", "BeautifulSoup", "Folium", "Pandas", "Plotly"],
    aiFeatures: [
      "LLM lead qualification on a 0–100 scale to prioritise direct importers and distributors",
      "AI-personalised outreach drafts generated on the fly",
      "robots.txt-aware crawler that extracts emails, phones and social profiles",
      "Geocoded, colour-coded lead map for regional targeting",
      "Multi-channel drip scheduler (Email, Telegram, VK, LinkedIn) and CRM CSV export",
    ],
    architecture: ["Search query", "Web crawler", "AI qualification", "SQLite", "Map dashboard", "Outreach scheduler"],
    github: `${GH}/B2B_Russian_Lead_Scraper`,
    demo: "https://b2brussianleadscraper-khxg8pfsldsua3nixx46xn.streamlit.app/",
  },
  {
    ...empty,
    id: "computing-history-agent",
    title: "Computing History AI Agent",
    category: "AI & Agents",
    featured: true,
    icon: Bot,
    tone: "var(--brand-violet)",
    overview:
      "An AI chatbot that answers questions about the history of computing, famous computer scientists and technological milestones.",
    solution:
      "Built the agent in Microsoft Foundry Agent Builder and integrated it into a Flask web app through the OpenAI Responses API, with Azure Entra ID authentication.",
    tech: ["Python", "Flask", "Microsoft Foundry", "Azure AI Projects SDK", "OpenAI Responses API", "JavaScript"],
    aiFeatures: [
      "Microsoft Foundry AI agent integration",
      "Context-aware conversation handling",
      "Real-time AI responses in a responsive chat UI",
      "Azure Entra ID authentication",
    ],
    architecture: ["Chat UI", "Flask API", "Foundry agent", "OpenAI Responses API"],
    github: `${GH}/computing-history-agent`,
  },

  /* ───────────── Data & Analytics ───────────── */
  {
    ...empty,
    id: "digital-marketing-analysis",
    title: "Digital Marketing Campaign Analysis",
    category: "Data & Analytics",
    featured: true,
    icon: BarChart3,
    tone: "var(--brand-amber)",
    overview:
      "Analysed 10,000+ rows of campaign data across Google Ads, Meta and YouTube and turned it into interactive KPI dashboards.",
    problem: "Campaign performance was reported by hand across three ad platforms, which took hours and hid weak campaigns.",
    solution:
      "Calculated six KPIs and built three interactive dashboards with dynamic charts and slicers, cutting reporting from 4 hours to under 30 minutes.",
    tech: ["Advanced Excel", "Pivot Tables", "Data Visualisation"],
    aiFeatures: [
      "6 KPIs: CTR, ROAS, CAC, CPC, conversion rate and revenue",
      "3 interactive dashboards with slicers",
      "Identified 2 underperforming campaigns — an estimated 18% ROAS improvement",
    ],
    architecture: ["Raw ad data", "Cleaning", "KPI formulas", "Pivot tables", "Dashboards"],
  },
  {
    ...empty,
    id: "inventory-management",
    title: "AI Inventory Intelligence Platform",
    category: "Data & Analytics",
    featured: true,
    icon: Boxes,
    tone: "var(--brand-emerald)",
    overview: "Inventory management software with a separate frontend and backend, packaged with Docker Compose.",
    tech: ["TypeScript", "Docker"],
    github: `${GH}/AI-Inventory-Intelligence-Platform`,
  },

  /* ───────────── Business Software ───────────── */
  {
    ...empty,
    id: "gym-management",
    title: "Gym Management System",
    category: "Business Software",
    featured: true,
    icon: Dumbbell,
    tone: "var(--brand-violet)",
    overview:
      "Flask and MySQL system for member registration, attendance tracking and payments, with role-based access for admins and members.",
    problem: "Gyms tracking members, attendance and payments by hand lose time and get slow, unreliable reports.",
    solution:
      "15+ REST API endpoints on a scalable MVC backend, with optimised SQL that cut report generation time by 60%.",
    tech: ["Python", "Flask", "MySQL", "REST API", "HTML", "CSS", "JavaScript"],
    aiFeatures: [
      "15+ REST endpoints for members, attendance and payments",
      "Attendance, revenue and member-trend dashboards — 60% faster reports",
      "Role-based access control with session authentication on 100% of data routes",
      "MVC architecture ready for a planned AI workout-recommendation engine",
    ],
    architecture: ["Web UI", "Flask REST API", "Auth & roles", "MySQL"],
  },
  {
    ...empty,
    id: "doctor-management",
    title: "Doctor Management Website & Application",
    category: "Business Software",
    icon: Stethoscope,
    tone: "var(--brand-cyan)",
  },
  {
    ...empty,
    id: "product-management",
    title: "Product Management Software",
    category: "Business Software",
    icon: KanbanSquare,
    tone: "var(--brand-emerald)",
  },
  {
    ...empty,
    id: "custom-business-software",
    title: "Custom Software for Different Types of Companies",
    category: "Business Software",
    icon: Building2,
    tone: "var(--brand-blue)",
  },

  /* ───────────── Web & Frontend ───────────── */
  {
    ...empty,
    id: "ai-portfolio",
    title: "AI Portfolio & Admin Dashboard",
    category: "Web & Frontend",
    icon: UserRound,
    tone: "var(--brand-blue)",
    overview:
      "This website — a React portfolio with a FastAPI backend, PostgreSQL storage, contact notifications and a protected admin dashboard.",
    tech: ["React", "Vite", "Framer Motion", "FastAPI", "SQLAlchemy", "PostgreSQL", "JWT"],
    architecture: ["React SPA", "FastAPI", "PostgreSQL", "Email notifications"],
    github: `${GH}/ai-portfolio`,
    demo: "https://ai-portfolio-dusky-zeta.vercel.app",
  },
];
